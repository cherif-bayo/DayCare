# src/models/age_group.py 
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from src.models.user import db

class AgeGroup(db.Model):
    """
    Age groups that can be either standard (system-wide) or custom (daycare-specific)
    This allows proper foreign key relationships with children
    """
    __tablename__ = 'age_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    min_age_months = db.Column(db.Integer, nullable=False)  # Minimum age in months
    max_age_months = db.Column(db.Integer)  # Maximum age in months (null = no limit)
    
    # If daycare_id is NULL, it's a standard age group
    # If daycare_id has a value, it's a custom age group for that daycare
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=True)
    
    is_active = db.Column(db.Boolean, default=True)
    is_standard = db.Column(db.Boolean, default=False)  # True for system standard groups
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    children = db.relationship('Child', backref='age_group', lazy='dynamic')
    daycare = db.relationship('Daycare', backref='custom_age_groups')
    
    # Ensure unique names per daycare (or globally for standard groups)
    __table_args__ = (
        db.UniqueConstraint('daycare_id', 'name', name='unique_daycare_age_group'),
        db.Index('idx_age_group_daycare_active', 'daycare_id', 'is_active'),
        db.Index('idx_age_group_standard', 'is_standard', 'is_active')
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'min_age_months': self.min_age_months,
            'max_age_months': self.max_age_months,
            'daycare_id': self.daycare_id,
            'is_active': self.is_active,
            'is_standard': self.is_standard,
            'children_count': self.children.count() if self.children else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AgeGroupHelper:
    """Helper class for age group calculations and management"""
    
    @staticmethod
    def ensure_standard_age_groups():
        """Ensure standard age groups exist in the database"""
        standard_groups = [
            {
                'name': 'under_19_months',
                'description': 'Under 19 months of age',
                'min_age_months': 0,
                'max_age_months': 18
            },
            {
                'name': '19_months_to_kindergarten', 
                'description': '19 months old to kindergarten (5 years)',
                'min_age_months': 19,
                'max_age_months': 59  # 5 years = 60 months, so up to 59
            },
            {
                'name': 'kindergarten_to_grade_6',
                'description': 'Kindergarten to Grade 6 (5+ years)',
                'min_age_months': 60,
                'max_age_months': None  # No upper limit
            }
        ]
        
        for group_data in standard_groups:
            existing = AgeGroup.query.filter_by(
                name=group_data['name'],
                is_standard=True,
                daycare_id=None
            ).first()
            
            if not existing:
                age_group = AgeGroup(
                    name=group_data['name'],
                    description=group_data['description'],
                    min_age_months=group_data['min_age_months'],
                    max_age_months=group_data['max_age_months'],
                    daycare_id=None,  # Standard groups have no daycare
                    is_standard=True,
                    is_active=True
                )
                db.session.add(age_group)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error creating standard age groups: {e}")
    
    @staticmethod
    def get_standard_age_groups():
        """Get all standard age groups from database"""
        return AgeGroup.query.filter_by(
            is_standard=True,
            is_active=True,
            daycare_id=None
        ).all()
    
    @staticmethod
    def calculate_age_in_months(birth_date):
        """Calculate age in months from birth date"""
        if not birth_date:
            return None
        
        today = date.today()
        if isinstance(birth_date, str):
            birth_date = datetime.strptime(birth_date, '%Y-%m-%d').date()
        
        # Calculate the difference
        delta = relativedelta(today, birth_date)
        return delta.years * 12 + delta.months
    
    @staticmethod
    def get_all_age_groups_for_daycare(daycare_id):
        """Get both standard and custom age groups for a daycare"""
        # Get standard age groups
        standard_groups = AgeGroup.query.filter_by(
            is_standard=True,
            is_active=True,
            daycare_id=None
        ).all()
        
        # Get custom age groups for this daycare
        custom_groups = AgeGroup.query.filter_by(
            daycare_id=daycare_id,
            is_active=True,
            is_standard=False
        ).all()
        
        # Combine and return
        return standard_groups + custom_groups
    
    @staticmethod
    def get_age_group_for_child(birth_date, daycare_id):
        """
        Determine which age group a child belongs to and return the AgeGroup object
        Returns the most specific match (custom groups take precedence over standard)
        """
        age_months = AgeGroupHelper.calculate_age_in_months(birth_date)
        
        if age_months is None:
            return None
        
        # First check custom age groups for this daycare
        custom_groups = AgeGroup.query.filter_by(
            daycare_id=daycare_id,
            is_active=True,
            is_standard=False
        ).all()
        
        for group in custom_groups:
            if group.min_age_months <= age_months:
                if group.max_age_months is None or age_months <= group.max_age_months:
                    return group
        
        # If no custom group matches, check standard age groups
        standard_groups = AgeGroup.query.filter_by(
            is_standard=True,
            is_active=True,
            daycare_id=None
        ).all()
        
        for group in standard_groups:
            if group.min_age_months <= age_months:
                if group.max_age_months is None or age_months <= group.max_age_months:
                    return group
        
        return None
    
    @staticmethod
    def validate_age_group_range(min_age_months, max_age_months):
        """Validate that age group range is logical"""
        if min_age_months < 0:
            return False, "Minimum age cannot be negative"
        
        if max_age_months is not None:
            if max_age_months < min_age_months:
                return False, "Maximum age cannot be less than minimum age"
            
            if max_age_months > 216:  # 18 years
                return False, "Maximum age cannot exceed 18 years (216 months)"
        
        return True, None
    
    @staticmethod
    def check_age_group_conflicts(daycare_id, min_age_months, max_age_months, exclude_id=None):
        """Check if a new age group would conflict with existing ones"""
        # Get all age groups for this daycare (including standard ones)
        all_groups = AgeGroupHelper.get_all_age_groups_for_daycare(daycare_id)
        
        for group in all_groups:
            if exclude_id and group.id == exclude_id:
                continue
                
            # Check for overlap
            group_min = group.min_age_months
            group_max = group.max_age_months if group.max_age_months is not None else 999
            new_max = max_age_months if max_age_months is not None else 999
            
            # Check if ranges overlap
            if not (new_max < group_min or min_age_months > group_max):
                return True, f"Age range conflicts with existing group '{group.name}'"
        
        return False, None
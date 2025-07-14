# careconnect_backend/src/models/child.py

from src.models.user import db
from datetime import datetime, date
import json
from src.models.user import Parent, DaycareStaff
from src.models.emergency_contact import EmergencyContact
from src.models.access_permission import AccessPermission 


# ---------- association table  (MUST be above class Child) ----------
child_staff = db.Table(
    "child_staff",
    db.Column("child_id",  db.Integer, db.ForeignKey("children.id"),       primary_key=True),
    db.Column("staff_id",  db.Integer, db.ForeignKey("daycare_staff.id"), primary_key=True),
)

class Child(db.Model):
    __tablename__ = 'children'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.Enum('male', 'female', 'other', 'prefer_not_to_say', name='genders'))
    medical_conditions = db.Column(db.Text)
    allergies = db.Column(db.Text)
    dietary_restrictions = db.Column(db.Text)
    emergency_medications = db.Column(db.Text)
    photo_url = db.Column(db.String(500))
    enrollment_date = db.Column(db.Date)
    withdrawal_date = db.Column(db.Date)
    status = db.Column(db.Enum('enrolled', 'waitlist', 'withdrawn', 'graduated', name='child_statuses'), default='enrolled')
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    primary_parent_id = db.Column(db.Integer, db.ForeignKey('parents.id'), nullable=False)
    room_assignment = db.Column(db.String(100))
    pickup_authorization = db.Column(db.Text)  # JSON string
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Age group relationship - PROPER FOREIGN KEY
    age_group_id = db.Column(
        db.Integer,
        db.ForeignKey("age_groups.id", ondelete="SET NULL"),  # ← add ondelete
        nullable=True,
    )
    
    # Relationships
    parent_relationships = db.relationship('ParentChildRelationship', backref='child', cascade='all, delete-orphan')
    incidents = db.relationship('Incident', backref='child', cascade='all, delete-orphan')
    activity_participations = db.relationship('ChildActivityParticipation', backref='child', cascade='all, delete-orphan')
    payment_assignments = db.relationship('ChildPaymentAssignment', backref='child', cascade='all, delete-orphan')

    emergency_contacts = db.relationship(
        "EmergencyContact",
        backref="child",
        cascade="all, delete-orphan",
        lazy="joined",
        order_by="EmergencyContact.id",
    )

    # NEW ✔️  staff ↔ child many-to-many  (indent level = other rels)
    staff = db.relationship(
        "DaycareStaff",
        secondary=child_staff,
        back_populates="children",
        lazy="joined",
    )

    access_permissions = db.relationship(
        "AccessPermission",
        backref   = "child",
        lazy      = "joined",
        cascade   = "all, delete-orphan",
        order_by  = "AccessPermission.id",
    )
    
    def get_pickup_authorization(self):
        return json.loads(self.pickup_authorization) if self.pickup_authorization else []
    
    def set_pickup_authorization(self, authorization):
        self.pickup_authorization = json.dumps(authorization)
    
    def calculate_age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None
    
    def calculate_and_assign_age_group(self):
        """Calculate and assign the appropriate age group for this child"""
        from src.models.age_group import AgeGroupHelper
        
        if self.date_of_birth and self.daycare_id:
            age_group = AgeGroupHelper.get_age_group_for_child(
                self.date_of_birth, 
                self.daycare_id
            )
            if age_group:
                self.age_group_id = age_group.id
                return age_group
        return None
    
    def get_age_in_months(self):
        """Get the child's age in months"""
        from src.models.age_group import AgeGroupHelper
        return AgeGroupHelper.calculate_age_in_months(self.date_of_birth)
    
    def get_age_display(self):
        """Get a human-readable age display"""
        age_months = self.get_age_in_months()
        if age_months is None:
            return "Unknown"
        
        years = age_months // 12
        months = age_months % 12
        
        if years == 0:
            return f"{months} month{'s' if months != 1 else ''}"
        elif months == 0:
            return f"{years} year{'s' if years != 1 else ''}"
        else:
            return f"{years} year{'s' if years != 1 else ''}, {months} month{'s' if months != 1 else ''}"
    
     
        age_group = db.relationship(
            "AgeGroup", lazy="joined",
            primaryjoin="Child.age_group_id==AgeGroup.id",
        )
 
    def get_age_group_info(self):
         ag = self.age_group        
         if ag:
             return {
                 "id":          ag.id,
                 "name":        ag.name,
                "description": ag.description,
                 "is_standard": ag.is_standard,
             }
         return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.calculate_age(),
            'gender': self.gender,
            'medical_conditions': self.medical_conditions,
            'allergies': self.allergies,
            'dietary_restrictions': self.dietary_restrictions,
            'emergency_medications': self.emergency_medications,
            'photo_url': self.photo_url,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'withdrawal_date': self.withdrawal_date.isoformat() if self.withdrawal_date else None,
            'status': self.status,
            'daycare_id': self.daycare_id,
            'primary_parent_id': self.primary_parent_id,
            'age_group_id': self.age_group_id,
            'age_group': self.get_age_group_info(),
            'room_assignment': self.room_assignment,
            'age_in_months': self.get_age_in_months(),
            'age_display': self.get_age_display(),
            'pickup_authorization': self.get_pickup_authorization(),
            'emergency_contacts': [
                {
                    'id'      : ec.id,
                    'name'    : ec.name,
                    'phone'   : ec.phone,
                    'relation': ec.relation,
                }
                for ec in self.emergency_contacts
            ],
            "access_permissions": [
                 {
                     "id": ap.id,
                     "name": ap.name,
                     "relation": ap.relation,
                     "phone": ap.phone,
                     "is_authorized": ap.is_authorized,
                 }
                 for ap in self.access_permissions
            ],
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            "assigned_staff_ids": [s.id for s in self.staff],   # NEW
        }
    # --- NEW ---
    def to_dict_with_parents(self):
        """Return plain child info *plus* an array of parent dicts."""
        base = self.to_dict()

        # every ParentChildRelationship row already has .parent loaded by joinedload
        parent_dicts = []
        for rel in self.parent_relationships:
            if rel.parent:           # safety check
                parent_dicts.append({
                    "id": rel.parent.id,
                    "first_name": rel.parent.first_name,
                    "last_name":  rel.parent.last_name,
                    "email":      rel.parent.user.email if rel.parent.user else None,
                    "phone":      rel.parent.phone,
                    "relation":   rel.relationship_type,
                    "is_primary": rel.is_primary,
                    "can_pick_up": rel.can_pickup,
                })

        base["parents"] = parent_dicts
        return base
    # --- END NEW ---
    # ⬇️  add this block
    __table_args__ = (
        db.Index("idx_children_age_group", "age_group_id"),
    )

class ParentChildRelationship(db.Model):
    __tablename__ = 'parent_child_relationships'
    
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.id'), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    relationship_type = db.Column(db.Enum('mother', 'father', 'guardian', 'grandparent', 'other', name='relationship_types'), nullable=False)
    access_level = db.Column(db.Enum('full', 'limited', 'emergency_only', name='access_levels'), default='full')
    can_pickup = db.Column(db.Boolean, default=True)
    can_authorize_medical = db.Column(db.Boolean, default=False)
    is_primary = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('parent_id', 'child_id', name='unique_parent_child'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'parent_id': self.parent_id,
            'child_id': self.child_id,
            'relationship_type': self.relationship_type,
            'access_level': self.access_level,
            'can_pickup': self.can_pickup,
            'can_authorize_medical': self.can_authorize_medical,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RegistrationRequest(db.Model):
    __tablename__ = 'registration_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    child_first_name = db.Column(db.String(100), nullable=False)
    child_last_name = db.Column(db.String(100), nullable=False)
    child_date_of_birth = db.Column(db.Date, nullable=False)
    parent_first_name = db.Column(db.String(100), nullable=False)
    parent_last_name = db.Column(db.String(100), nullable=False)
    parent_email = db.Column(db.String(255), nullable=False)
    parent_phone = db.Column(db.String(20), nullable=False)
    requested_start_date = db.Column(db.Date)
    status = db.Column(db.Enum('pending', 'approved', 'rejected', 'waitlisted', name='request_statuses'), default='pending')
    # Age group relationship for registration requests
    requested_age_group_id = db.Column(db.Integer, db.ForeignKey('age_groups.id'), nullable=True)
    invitation_token = db.Column(db.String(255), unique=True)
    invitation_sent_at = db.Column(db.DateTime)
    invitation_expires_at = db.Column(db.DateTime)
    approved_by = db.Column(db.Integer, db.ForeignKey('daycare_staff.id'))
    approved_at = db.Column(db.DateTime)
    rejection_reason = db.Column(db.Text)
    additional_info = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    requested_age_group = db.relationship('AgeGroup', foreign_keys=[requested_age_group_id])
    
    # Relationships
    approver = db.relationship('DaycareStaff', backref='approved_registrations', foreign_keys=[approved_by])

    def calculate_age_group_for_request(self):
        """Calculate what age group this child would be in"""
        from src.models.age_group import AgeGroupHelper
        
        if self.child_date_of_birth and self.daycare_id:
            return AgeGroupHelper.get_age_group_for_child(
                self.child_date_of_birth,
                self.daycare_id
            )
        return None
    
    def get_additional_info(self):
        return json.loads(self.additional_info) if self.additional_info else {}
    
    def set_additional_info(self, info):
        self.additional_info = json.dumps(info)
    
    def to_dict(self):
        calculated_age_group = self.calculate_age_group_for_request()
        return {
            'id': self.id,
            'daycare_id': self.daycare_id,
            'child_first_name': self.child_first_name,
            'child_last_name': self.child_last_name,
            'child_date_of_birth': self.child_date_of_birth.isoformat() if self.child_date_of_birth else None,
            'parent_first_name': self.parent_first_name,
            'parent_last_name': self.parent_last_name,
            'parent_email': self.parent_email,
            'parent_phone': self.parent_phone,
            'requested_start_date': self.requested_start_date.isoformat() if self.requested_start_date else None,
            'status': self.status,
            'invitation_token': self.invitation_token,
            'invitation_sent_at': self.invitation_sent_at.isoformat() if self.invitation_sent_at else None,
            'invitation_expires_at': self.invitation_expires_at.isoformat() if self.invitation_expires_at else None,
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'requested_age_group_id': self.requested_age_group_id,
            'requested_age_group': self.requested_age_group.to_dict() if self.requested_age_group else None,
            'calculated_age_group': calculated_age_group.to_dict() if calculated_age_group else None,
            'pickup_authorization': self.get_pickup_authorization(),
            'emergency_contacts'  : [c.to_dict() for c in self.emergency_contacts],
            'rejection_reason': self.rejection_reason,
            'additional_info': self.get_additional_info(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    

from src.models.user import db
from datetime import datetime, date
import json

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
    
    # Relationships
    parent_relationships = db.relationship('ParentChildRelationship', backref='child', cascade='all, delete-orphan')
    incidents = db.relationship('Incident', backref='child', cascade='all, delete-orphan')
    activity_participations = db.relationship('ChildActivityParticipation', backref='child', cascade='all, delete-orphan')
    payment_assignments = db.relationship('ChildPaymentAssignment', backref='child', cascade='all, delete-orphan')
    
    def get_pickup_authorization(self):
        return json.loads(self.pickup_authorization) if self.pickup_authorization else []
    
    def set_pickup_authorization(self, authorization):
        self.pickup_authorization = json.dumps(authorization)
    
    def calculate_age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
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
            'room_assignment': self.room_assignment,
            'pickup_authorization': self.get_pickup_authorization(),
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ParentChildRelationship(db.Model):
    __tablename__ = 'parent_child_relationships'
    
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.id'), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    relationship_type = db.Column(db.Enum('mother', 'father', 'guardian', 'grandparent', 'other', name='relationship_types'), nullable=False)
    access_level = db.Column(db.Enum('full', 'limited', 'emergency_only', name='access_levels'), default='full')
    can_pickup = db.Column(db.Boolean, default=True)
    can_authorize_medical = db.Column(db.Boolean, default=False)
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
    approver = db.relationship('DaycareStaff', backref='approved_registrations', foreign_keys=[approved_by])
    
    def get_additional_info(self):
        return json.loads(self.additional_info) if self.additional_info else {}
    
    def set_additional_info(self, info):
        self.additional_info = json.dumps(info)
    
    def to_dict(self):
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
            'rejection_reason': self.rejection_reason,
            'additional_info': self.get_additional_info(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


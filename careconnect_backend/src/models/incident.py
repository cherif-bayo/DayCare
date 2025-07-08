from src.models.user import db
from datetime import datetime, time
import json

class Incident(db.Model):
    __tablename__ = 'incidents'
    
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    reported_by = db.Column(db.Integer, db.ForeignKey('daycare_staff.id'), nullable=False)
    incident_type = db.Column(db.Enum('accident', 'injury', 'illness', 'behavioral', 'medication', 'other', name='incident_types'), nullable=False)
    severity = db.Column(db.Enum('minor', 'moderate', 'serious', 'emergency', name='severity_levels'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255))
    incident_date = db.Column(db.Date, nullable=False)
    incident_time = db.Column(db.Time, nullable=False)
    immediate_action_taken = db.Column(db.Text)
    medical_attention_required = db.Column(db.Boolean, default=False)
    medical_attention_details = db.Column(db.Text)
    parent_notified = db.Column(db.Boolean, default=False)
    parent_notification_method = db.Column(db.Enum('phone', 'email', 'in_person', 'app', name='notification_methods'), default='app')
    parent_notification_time = db.Column(db.DateTime)
    follow_up_required = db.Column(db.Boolean, default=False)
    follow_up_notes = db.Column(db.Text)
    status = db.Column(db.Enum('open', 'resolved', 'closed', name='incident_statuses'), default='open')
    attachments = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reporter = db.relationship('DaycareStaff', backref='reported_incidents', foreign_keys=[reported_by])
    followups = db.relationship('IncidentFollowup', backref='incident', cascade='all, delete-orphan')
    
    def get_attachments(self):
        return json.loads(self.attachments) if self.attachments else []
    
    def set_attachments(self, attachments):
        self.attachments = json.dumps(attachments)
    
    def to_dict(self):
        return {
            'id': self.id,
            'child_id': self.child_id,
            'daycare_id': self.daycare_id,
            'reported_by': self.reported_by,
            'incident_type': self.incident_type,
            'severity': self.severity,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'incident_date': self.incident_date.isoformat() if self.incident_date else None,
            'incident_time': self.incident_time.isoformat() if self.incident_time else None,
            'immediate_action_taken': self.immediate_action_taken,
            'medical_attention_required': self.medical_attention_required,
            'medical_attention_details': self.medical_attention_details,
            'parent_notified': self.parent_notified,
            'parent_notification_method': self.parent_notification_method,
            'parent_notification_time': self.parent_notification_time.isoformat() if self.parent_notification_time else None,
            'follow_up_required': self.follow_up_required,
            'follow_up_notes': self.follow_up_notes,
            'status': self.status,
            'attachments': self.get_attachments(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class IncidentFollowup(db.Model):
    __tablename__ = 'incident_followups'
    
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('daycare_staff.id'), nullable=False)
    follow_up_date = db.Column(db.Date, nullable=False)
    follow_up_time = db.Column(db.Time)
    action_taken = db.Column(db.Text, nullable=False)
    outcome = db.Column(db.Text)
    next_action_required = db.Column(db.Boolean, default=False)
    next_action_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    staff_member = db.relationship('DaycareStaff', backref='incident_followups', foreign_keys=[staff_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'staff_id': self.staff_id,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'follow_up_time': self.follow_up_time.isoformat() if self.follow_up_time else None,
            'action_taken': self.action_taken,
            'outcome': self.outcome,
            'next_action_required': self.next_action_required,
            'next_action_date': self.next_action_date.isoformat() if self.next_action_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


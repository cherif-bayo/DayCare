from src.models.user import db
from datetime import datetime, time
import json

class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = db.Column(db.Integer, primary_key=True)
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    activity_name = db.Column(db.String(255), nullable=False)
    activity_type = db.Column(db.Enum('learning', 'play', 'meal', 'nap', 'outdoor', 'art', 'music', 'reading', 'other', name='activity_types'), nullable=False)
    description = db.Column(db.Text)
    scheduled_date = db.Column(db.Date, nullable=True)
    age_groups = db.Column(db.Text)  # JSON string
    duration_minutes = db.Column(db.Integer)
    materials_needed = db.Column(db.Text)
    learning_objectives = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    participations = db.relationship('ChildActivityParticipation', backref='activity', cascade='all, delete-orphan')
    
    def get_age_groups(self):
        return json.loads(self.age_groups) if self.age_groups else []
    
    def set_age_groups(self, age_groups):
        self.age_groups = json.dumps(age_groups)
    
    def to_dict(self):
        return {
            'id': self.id,
            'daycare_id': self.daycare_id,
            'activity_name': self.activity_name,
            'activity_type': self.activity_type,
            'description': self.description,
            'age_groups': self.get_age_groups(),
            'duration_minutes': self.duration_minutes,
            'materials_needed': self.materials_needed,
            'learning_objectives': self.learning_objectives,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ChildActivityParticipation(db.Model):
    __tablename__ = 'child_activity_participation'
    
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False)
    participation_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    participation_level = db.Column(db.Enum('full', 'partial', 'observer', 'absent', name='participation_levels'), nullable=False)
    notes = db.Column(db.Text)
    photos = db.Column(db.Text)  # JSON string
    recorded_by = db.Column(db.Integer, db.ForeignKey('daycare_staff.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    recorder = db.relationship('DaycareStaff', backref='recorded_participations', foreign_keys=[recorded_by])
    
    def get_photos(self):
        return json.loads(self.photos) if self.photos else []
    
    def set_photos(self, photos):
        self.photos = json.dumps(photos)
    
    def to_dict(self):
        return {
            'id': self.id,
            'child_id': self.child_id,
            'activity_id': self.activity_id,
            'participation_date': self.participation_date.isoformat() if self.participation_date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'participation_level': self.participation_level,
            'notes': self.notes,
            'photos': self.get_photos(),
            'recorded_by': self.recorded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'))
    subject = db.Column(db.String(255))
    message_body = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.Enum('general', 'incident_notification', 'payment_reminder', 'activity_update', 'announcement', name='message_types'), default='general')
    priority = db.Column(db.Enum('low', 'normal', 'high', 'urgent', name='priority_levels'), default='normal')
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    attachments = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', backref='sent_messages', foreign_keys=[sender_id])
    recipient = db.relationship('User', backref='received_messages', foreign_keys=[recipient_id])
    related_child = db.relationship('Child', backref='related_messages', foreign_keys=[child_id])
    
    def get_attachments(self):
        return json.loads(self.attachments) if self.attachments else []
    
    def set_attachments(self, attachments):
        self.attachments = json.dumps(attachments)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'child_id': self.child_id,
            'subject': self.subject,
            'message_body': self.message_body,
            'message_type': self.message_type,
            'priority': self.priority,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'attachments': self.get_attachments(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(255), nullable=False)
    table_name = db.Column(db.String(100))
    record_id = db.Column(db.Integer)
    old_values = db.Column(db.Text)  # JSON string
    new_values = db.Column(db.Text)  # JSON string
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='audit_logs', foreign_keys=[user_id])
    
    def get_old_values(self):
        return json.loads(self.old_values) if self.old_values else {}
    
    def set_old_values(self, values):
        self.old_values = json.dumps(values)
    
    def get_new_values(self):
        return json.loads(self.new_values) if self.new_values else {}
    
    def set_new_values(self, values):
        self.new_values = json.dumps(values)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'table_name': self.table_name,
            'record_id': self.record_id,
            'old_values': self.get_old_values(),
            'new_values': self.get_new_values(),
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(255), unique=True, nullable=False)
    setting_value = db.Column(db.Text)
    setting_type = db.Column(db.Enum('string', 'integer', 'boolean', 'json', name='setting_types'), nullable=False)
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_typed_value(self):
        if self.setting_type == 'integer':
            return int(self.setting_value) if self.setting_value else 0
        elif self.setting_type == 'boolean':
            return self.setting_value.lower() == 'true' if self.setting_value else False
        elif self.setting_type == 'json':
            return json.loads(self.setting_value) if self.setting_value else {}
        else:
            return self.setting_value
    
    def to_dict(self):
        return {
            'id': self.id,
            'setting_key': self.setting_key,
            'setting_value': self.get_typed_value(),
            'setting_type': self.setting_type,
            'description': self.description,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


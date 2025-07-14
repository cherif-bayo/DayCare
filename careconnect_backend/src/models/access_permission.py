# src/models/access_permission.py
from datetime import datetime
from src.models.user import db

class AccessPermission(db.Model):
    __tablename__ = "access_permissions"

    id         = db.Column(db.Integer, primary_key=True)
    daycare_id = db.Column(db.Integer, db.ForeignKey("daycares.id"), nullable=False)
    child_id   = db.Column(db.Integer, db.ForeignKey("children.id"), nullable=False)
    name       = db.Column(db.String(100), nullable=False)
    relation   = db.Column(db.String(50))
    phone      = db.Column(db.String(30))
    is_authorized = db.Column(db.Boolean, nullable=False, default=True)
    can_pickup    = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)

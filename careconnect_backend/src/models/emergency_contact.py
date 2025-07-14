from datetime import datetime
from src.models.user import db          # already configured elsewhere

class EmergencyContact(db.Model):
    __tablename__ = "emergency_contacts"

    id         = db.Column(db.Integer, primary_key=True)
    daycare_id = db.Column(db.Integer,
                           db.ForeignKey("daycares.id"),
                           nullable=False)
    child_id   = db.Column(db.Integer,
                           db.ForeignKey("children.id"),
                           nullable=False)
    name       = db.Column(db.String(100), nullable=False)
    phone      = db.Column(db.String(30),  nullable=False)
    relation   = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    # helper for JSON responses
    def to_dict(self):
        return {
            "id":       self.id,
            "name":     self.name,
            "phone":    self.phone,
            "relation": self.relation,
        }

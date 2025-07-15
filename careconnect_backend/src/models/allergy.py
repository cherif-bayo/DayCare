# src/models/allergy.py
from datetime import datetime
from src.models.user import db

class Allergy(db.Model):
    __tablename__ = "allergies"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(80), unique=True, nullable=False)
    is_severe  = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Allergy {self.name}>"
    
    def to_dict(self):
         return {
             "id":         self.id,
             "name":       self.name,
             "is_severe":  self.is_severe,
             "created_at": self.created_at.isoformat() if self.created_at else None,
             "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class ChildAllergy(db.Model):
    __tablename__ = "child_allergies"

    id           = db.Column(db.Integer, primary_key=True)
    daycare_id   = db.Column(db.Integer,
                             db.ForeignKey("daycares.id"),
                             nullable=False)
    child_id     = db.Column(db.Integer,
                             db.ForeignKey("children.id",
                                           ondelete="CASCADE"))
    allergy_id   = db.Column(db.Integer,
                             db.ForeignKey("allergies.id"),
                             nullable=False)

    severity     = db.Column(db.String(20))      # mild / moderate / life_threatening
    reaction     = db.Column(db.Text)
    doctor_notes = db.Column(db.Text)
    epipen_expiry= db.Column(db.Date)            # optional
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime,
                             default=datetime.utcnow,
                             onupdate=datetime.utcnow)

    # convenient relationship
    allergy = db.relationship("Allergy", lazy="joined")
    def to_dict(self):
        return {
            "id":            self.id,
            "allergy":       self.allergy.to_dict() if self.allergy else None,
            "severity":      self.severity,
            "reaction":      self.reaction,
            "doctor_notes":  self.doctor_notes,
            "epipen_expiry": self.epipen_expiry.isoformat() if self.epipen_expiry else None,
        }

def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "is_severe":  self.is_severe,
        }

def to_dict(self):
        """Return a tiny JSON-ready blob consumed by the frontend."""
        return {
            "id"       : self.id,
            "allergy_id": self.allergy_id,
            "name"     : self.allergy.name if self.allergy else None,
            "severity" : self.severity,          # ← the bit we need
        }



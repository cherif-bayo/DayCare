# src/seeders/seed_allergies.py (one-off script)
from src.models.allergy import Allergy, db

DEFAULTS = ["Peanuts", "Tree nuts", "Milk", "Eggs", "Shellfish",
            "Fish", "Wheat", "Soy", "Sesame"]

def run():
    for name in DEFAULTS:
        if not Allergy.query.filter_by(name=name).first():
            db.session.add(Allergy(name=name))
    db.session.commit()

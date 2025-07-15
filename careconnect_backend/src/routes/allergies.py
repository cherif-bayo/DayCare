"""Day-care wide allergy catalogue (create / list / edit / delete)"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, DaycareStaff
from src.models.allergy import Allergy

allergies_bp = Blueprint("allergies", __name__)

def _current_daycare_id():
    uid = get_jwt_identity()
    staff = DaycareStaff.query.filter_by(user_id=uid).first()
    return staff.daycare_id if staff else None

# helper: daycare_id of the logged-in staff member
def _daycare_id_of_current_staff():
    from flask_jwt_extended import get_jwt_identity
    staff = DaycareStaff.query.filter_by(user_id=get_jwt_identity()).first()
    return staff.daycare_id if staff else None


# ─────────────────────────────  CRUD  ─────────────────────────────

@allergies_bp.route("/api/allergies", methods=["GET"])                    # GET /api/daycare/allergies
@jwt_required()
def list_allergies():
    # (shared list – not per-daycare, but easy to extend later)
    return jsonify([a.to_dict() for a in Allergy.query.order_by(Allergy.name).all()]), 200


@allergies_bp.route("/api/allergies", methods=["POST"])                     # POST /api/daycare/allergies
@jwt_required()
def create_allergy():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"error": {"message": "name required"}}, 422
    if Allergy.query.filter_by(name=name).first():
        return {"error": {"message": "Allergy already exists"}}, 409
    a = Allergy(name=name, is_severe=data.get("is_severe", False))
    db.session.add(a)
    db.session.commit()
    return a.to_dict(), 201


@allergies_bp.put("/<int:aid>")            # PUT /api/daycare/allergies/<id>
@jwt_required()
def update_allergy(aid):
    row = Allergy.query.get_or_404(aid)
    data = request.get_json() or {}
    row.name       = (data.get("name") or row.name).strip()
    row.is_severe  = data.get("is_severe", row.is_severe)
    db.session.commit()
    return jsonify(row.to_dict()), 200


@allergies_bp.delete("/<int:aid>")         # DELETE /api/daycare/allergies/<id>
@jwt_required()
def delete_allergy(aid):
    row = Allergy.query.get_or_404(aid)
    db.session.delete(row)
    db.session.commit()
    return "", 204

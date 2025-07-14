# src/routes/age_groups.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import DaycareStaff, db
from src.models.age_group import AgeGroup

age_groups_bp = Blueprint("age_groups", __name__)

def _current_daycare_id():
    staff = DaycareStaff.query.filter_by(user_id=get_jwt_identity()).first()
    return staff.daycare_id if staff else None

@age_groups_bp.route("", methods=["GET"])
@jwt_required()
def list_groups():
    dc = _current_daycare_id();  # None check omitted for brevity
    groups = AgeGroup.query.filter(
        (AgeGroup.daycare_id == dc) | (AgeGroup.is_standard == True)
    ).order_by(AgeGroup.min_age_months).all()
    return jsonify([g.to_dict() for g in groups])

@age_groups_bp.route("", methods=["POST"])
@jwt_required()
def create_group():
    dc = _current_daycare_id()
    data = request.get_json()
    g = AgeGroup(
        name=data["name"],
        description=data.get("description"),
        min_age_months=data["min_age_months"],
        max_age_months=data.get("max_age_months"),
        daycare_id=dc,
        is_standard=False,
        is_active=True,
    )
    db.session.add(g); db.session.commit()
    return jsonify(g.to_dict()), 201

@age_groups_bp.route("/<int:gid>", methods=["PUT"])
@jwt_required()
def update_group(gid):
    g = AgeGroup.query.get_or_404(gid)
    data = request.get_json()
    for f in ("name","description","min_age_months","max_age_months","is_active"):
        if f in data: setattr(g, f, data[f])
    db.session.commit()
    return jsonify(g.to_dict())

@age_groups_bp.route("/<int:gid>", methods=["DELETE"])
@jwt_required()
def archive_group(gid):
    g = AgeGroup.query.get_or_404(gid)
    g.is_active = False
    db.session.commit()
    return "", 204

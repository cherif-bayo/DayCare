# src/routes/children.py
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.child import Child
from src.models.child import ParentChildRelationship
from src.models.user import DaycareStaff, Parent
from src.models.user import db

children_bp = Blueprint('children', __name__)


def _get_daycare_id_for_current_user():
    """Helper: only DaycareStaff may CRUD children for their own daycare."""
    user_id = get_jwt_identity()
    staff = DaycareStaff.query.filter_by(user_id=user_id).first()
    if not staff:
        return None
    return staff.daycare_id


@children_bp.route('', methods=['GET'])
@jwt_required()
def list_children():
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    kids = Child.query.filter_by(daycare_id=daycare_id).all()
    return jsonify([c.to_dict() for c in kids]), 200


@children_bp.route('/<int:child_id>', methods=['GET'])
@jwt_required()
def get_child(child_id):
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    c = Child.query.filter_by(id=child_id, daycare_id=daycare_id).first_or_404()
    return jsonify(c.to_dict()), 200


@children_bp.route('', methods=['POST'])
@jwt_required()
def create_child():
    user_id = get_jwt_identity()
    print("[DEBUG] JWT identity:", user_id)  # 👈 Add this line
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    data = request.get_json() or {}
    # required fields
    missing = [f for f in ('first_name','last_name','date_of_birth','primary_parent_id') if not data.get(f)]
    if missing:
        return jsonify({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': f"Missing required fields: {', '.join(missing)}"
            }
        }), 422

    # parse dates
    try:
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        enroll = (datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
                  if data.get('enrollment_date') else None)
    except ValueError:
        return jsonify({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid date format, use YYYY-MM-DD'
            }
        }), 422

    # verify parent exists
    parent = Parent.query.get(data['primary_parent_id'])
    if not parent:
        return jsonify({
            'error': {
                'code': 'INVALID_PARENT',
                'message': 'Primary parent not found'
            }
        }), 422

    child = Child(
        first_name=data['first_name'],
        last_name=data['last_name'],
        date_of_birth=dob,
        gender=data.get('gender'),
        medical_conditions=data.get('medical_conditions'),
        allergies=data.get('allergies'),
        dietary_restrictions=data.get('dietary_restrictions'),
        emergency_medications=data.get('emergency_medications'),
        photo_url=data.get('photo_url'),
        enrollment_date=enroll,
        status=data.get('status', 'enrolled'),
        daycare_id=daycare_id,
        primary_parent_id=parent.id,
        room_assignment=data.get('room_assignment'),
        pickup_authorization=json.dumps(data.get('pickup_authorization', [])),
        notes=data.get('notes')
    )

    db.session.add(child)
    db.session.commit()
    return jsonify(child.to_dict()), 201


@children_bp.route('/<int:child_id>', methods=['PUT'])
@jwt_required()
def update_child(child_id):
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    c = Child.query.filter_by(id=child_id, daycare_id=daycare_id).first_or_404()
    data = request.get_json() or {}

    # Only overwrite the fields that were passed
    for field in (
        'first_name','last_name','gender','medical_conditions','allergies',
        'dietary_restrictions','emergency_medications','photo_url',
        'room_assignment','notes'
    ):
        if field in data:
            setattr(c, field, data[field])

    if 'date_of_birth' in data:
        try:
            c.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            pass

    if 'enrollment_date' in data:
        try:
            c.enrollment_date = datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    if 'status' in data:
        c.status = data['status']

    if 'pickup_authorization' in data:
        c.pickup_authorization = json.dumps(data['pickup_authorization'])

    db.session.commit()
    return jsonify(c.to_dict()), 200


@children_bp.route('/<int:child_id>', methods=['DELETE'])
@jwt_required()
def delete_child(child_id):
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    c = Child.query.filter_by(id=child_id, daycare_id=daycare_id).first_or_404()
    db.session.delete(c)
    db.session.commit()
    return '', 204

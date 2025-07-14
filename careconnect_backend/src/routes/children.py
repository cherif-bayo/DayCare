# src/routes/children.py

import json
import secrets
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.child import Child
from src.models.child import ParentChildRelationship
from src.models.user import DaycareStaff, Parent, User
from src.models.user import db
from flask import current_app
from sqlalchemy.orm import joinedload
from src.models.age_group import AgeGroup, AgeGroupHelper
from src.models.emergency_contact import EmergencyContact
from src.models.access_permission import AccessPermission


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
    # Get query parameters for filtering
    age_group_id = request.args.get('age_group_id', type=int)
    status = request.args.get('status')

    
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    # kids = Child.query.filter_by(daycare_id=daycare_id).all()
    # Build query
    query = Child.query.filter_by(daycare_id=daycare_id)

    if age_group_id:
        query = query.filter_by(age_group_id=age_group_id)
    
    if status:
        query = query.filter_by(status=status)
    
    kids = query.all()
    return jsonify([c.to_dict() for c in kids]), 200


@children_bp.route('/<int:child_id>', methods=['GET'])
@jwt_required()
def get_child(child_id):
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code': 'FORBIDDEN', 'message': 'Not a daycare user' }}), 403

    c = Child.query.filter_by(id=child_id, daycare_id=daycare_id).first_or_404()
    return jsonify(c.to_dict()), 200


# @children_bp.route('/ping', methods=['GET'], strict_slashes=False)
# def ping():
#     current_app.logger.debug("✅ children_bp pinged")
#     return jsonify({"pong": True}), 200

@children_bp.route('', methods=['POST'])
@jwt_required()
def create_child():
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({'error': {'code':'FORBIDDEN','message':'Not a daycare user'}}), 403

    data = request.get_json() or {}

    # 1) Build parent records (and stash join‐table info)
    parent_records = []
    for p in data.get('parents', []):
        email = p.get('email','').strip().lower()
        if User.query.filter_by(email=email).first():
            db.session.rollback()
            return jsonify({
                'error': {
                    'code':'VALIDATION_ERROR',
                    'message':f"Email `{email}` is already registered"
                }
            }), 422

        # a) Create User
        u = User(
            email=email,
            user_type='parent',
            is_active=True,
            email_verified=False
        )
        u.set_password(secrets.token_urlsafe(8))
        db.session.add(u)
        db.session.flush()

        # b) Create Parent
        parent = Parent(
            user_id=u.id,
            first_name = p['first_name'],
            last_name  = p['last_name'],
            phone      = p.get('phone',''),
            address    = p.get('address'),
            city       = p.get('city'),
            province   = p.get('province'),
            postal_code= p.get('postal_code'),
            emergency_contact_name        = p.get('emergency_contact_name'),
            emergency_contact_phone       = p.get('emergency_contact_phone'),
            emergency_contact_relationship= p.get('relation')
        )
        db.session.add(parent)
        db.session.flush()

        # collect for step 5
        parent_records.append({
            'id': parent.id,
            'relationship_type':       p.get('relation').strip().lower(),
            'access_level':            p.get('access_level','full'),
            'can_pickup':              p.get('can_pick_up', True),
            'can_authorize_medical':   p.get('can_authorize_medical', False),
            'is_primary':              p.get('is_primary', False)
        })

    if not parent_records:
        return jsonify({'error':{'code':'VALIDATION_ERROR','message':'At least one parent must be provided'}}), 422

    # 2) Validate child
    child_data = data.get('child',{})
    missing = [f for f in ('first_name','last_name','date_of_birth') if not child_data.get(f)]
    if missing:
        return jsonify({'error':{'code':'VALIDATION_ERROR',
                                 'message':f"Missing required fields: {', '.join(missing)}"}}),422

    # 3) Parse dates
    try:
        dob    = datetime.strptime(child_data['date_of_birth'],'%Y-%m-%d').date()
        enroll = (datetime.strptime(child_data.get('enrollment_date',''), '%Y-%m-%d').date()
                  if child_data.get('enrollment_date') else None)
    except ValueError:
        return jsonify({'error':{'code':'VALIDATION_ERROR','message':'Invalid date format, use YYYY-MM-DD'}}),422

    # 4) Create the child
    child = Child(
        first_name         = child_data['first_name'],
        last_name          = child_data['last_name'],
        date_of_birth      = dob,
        gender             = child_data.get('gender'),
        medical_conditions = child_data.get('medical_conditions'),
        allergies          = child_data.get('allergies'),
        dietary_restrictions   = child_data.get('dietary_restrictions'),
        emergency_medications   = child_data.get('emergency_medications'),
        photo_url          = child_data.get('photo_url'),
        enrollment_date    = enroll,
        status             = child_data.get('status','enrolled'),
        daycare_id         = daycare_id,
        primary_parent_id  = parent_records[0]['id'],
        room_assignment    = child_data.get('room_assignment'),
        pickup_authorization = json.dumps(child_data.get('pickup_authorization', [])),
        notes              = child_data.get('notes'),
        age_group_id = child_data.get("age_group_id")
    )
    db.session.add(child)
    db.session.flush()

    for ec in data.get("emergency_contacts", []):
        db.session.add(
            EmergencyContact(
                daycare_id = daycare_id,    # derived from staff helper
                child_id   = child.id,
                name       = ec["name"],
                phone      = ec["phone"],
                relation   = ec.get("relation"),
            )
        )

    # NEW ▸ access permissions
    for ap in data.get("access_permissions", []):
        db.session.add(
            AccessPermission(
                daycare_id    = daycare_id,
                child_id      = child.id,
                name          = ap["name"],
                phone         = ap.get("phone"),
                relation      = ap.get("relation"),
                is_authorized = ap.get("is_authorized", True),
                can_pickup    = ap.get("can_pickup", False),   # <— new column
            )
        )


    # ▷ Auto-assign only if caller did NOT send an id
    if child.age_group_id is None:
        child.calculate_and_assign_age_group()

    # 5) Link parents with all required fields
    for rec in parent_records:
        rel = ParentChildRelationship(
            parent_id             = rec['id'],
            child_id              = child.id,
            relationship_type     = rec['relationship_type'],
            access_level          = rec['access_level'],
            can_pickup            = rec['can_pickup'],
            can_authorize_medical = rec['can_authorize_medical'],
            is_primary            = rec['is_primary']
        )
        db.session.add(rel)

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
    if "medical_info" in data:
        c.medical_info = json.dumps(data["medical_info"])

    if 'emergency_contacts' in data:
        # a) wipe existing ones that belong to this child
        for ec in list(c.emergency_contacts):
            db.session.delete(ec)

        # b) insert the fresh list
        for ec in data['emergency_contacts']:
            new_ec = EmergencyContact(
                daycare_id = c.daycare_id,  # same daycare as the child
                child_id   = c.id,
                name       = ec['name'],
                phone      = ec['phone'],
                relation   = ec.get('relation')
            )
            db.session.add(new_ec)

    if "access_permissions" in data:
        # a) delete the old links
        for ap in list(c.access_permissions):
            db.session.delete(ap)

        # b) insert the new list from the payload
        for ap in data["access_permissions"]:
            db.session.add(
                AccessPermission(
                    daycare_id    = c.daycare_id,
                    child_id      = c.id,
                    name          = ap["name"],
                    phone         = ap.get("phone"),
                    relation      = ap.get("relation"),
                    is_authorized = ap.get("is_authorized", True),
                    can_pickup    = ap.get("can_pickup", False),
                )
            )

    # # Age group is a simple column; keep what you already had:
    # if "age_group_id" in data:
    #     c.age_group_id = data["age_group_id"]

    print("[DEBUG] Raw request data:", data)
    print("[DEBUG] Child data:", data.get('child'))

    # Only overwrite the fields that were passed
    for field in (
        'first_name','last_name','gender','medical_conditions','allergies',
        'dietary_restrictions','emergency_medications','photo_url',
        'room_assignment','notes',
        'medical_info',
        'assigned_staff_ids', 
    ):
        if field in data:
            setattr(c, field, data[field])


    # 🎯 1. Age-group support  (age_group_id, age_group obj, id, or name all work)
    if "age_group_id" in data:
        c.age_group_id = data["age_group_id"] or None

    elif "age_group" in data:
        payload = data["age_group"]

        # figure out what we actually got
        if isinstance(payload, dict):
            ag_key = payload.get("id") or payload.get("name")
        else:
            ag_key = payload                     # could be int-ish or name string

        if ag_key is None:
            c.age_group_id = None

        else:
            ag = None
            # first try numeric PK
            try:
                ag = AgeGroup.query.get(int(ag_key))
            except (ValueError, TypeError):
                pass

            # if that failed and we got a string, fall back to name
            if ag is None and isinstance(ag_key, str):
                ag = AgeGroup.query.filter_by(name=ag_key).first()

            if ag:
                c.age_group_id = ag.id
            else:
                return (
                    jsonify(
                        {
                            "error": {
                                "code": "NOT_FOUND",
                                "message": f"Age-group “{ag_key}” does not exist",
                            }
                        }
                    ),
                    404,
                )


    #  🎯 2. New medical_info block (array of strings)
    if 'medical_info' in data:
        c.medical_info = json.dumps(data['medical_info'])

    if "date_of_birth" in data:
        try:
            c.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            if "age_group_id" not in data:
                c.calculate_and_assign_age_group()
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
    return jsonify(c.to_dict_with_parents()), 200


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

@children_bp.route('/stats', methods=['GET'])
@jwt_required()
def daycare_stats():
    daycare_id = _get_daycare_id_for_current_user()
    if daycare_id is None:
        return jsonify({ 'error': { 'code':'FORBIDDEN','message':'Not a daycare user' }}), 403

    # grab whatever aggregates you need
    enrolled   = Child.query.filter_by(daycare_id=daycare_id, status='enrolled').count()
    waitlisted = Child.query.filter_by(daycare_id=daycare_id, status='waitlist').count()
    # you can add more: present_today, recent_incidents, etc.

    return jsonify({
        'enrolled_children': enrolled,
        'waitlisted':        waitlisted,
        # …and any other stats…
    }), 200

@children_bp.route("/<int:child_id>/full", methods=["GET"])
@jwt_required()
def get_child_full(child_id):
    child = (
        Child.query
        .options(
            joinedload(Child.parent_relationships)
            .joinedload(ParentChildRelationship.parent)   # <— attribute, not string
        )
        .get_or_404(child_id)
    )

    return jsonify(child.to_dict_with_parents()), 200
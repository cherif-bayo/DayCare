from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
from sqlalchemy import and_, or_

from src.models.user import db, User, DaycareStaff
from src.models.child import Child, RegistrationRequest
from src.models.incident import Incident, IncidentFollowup
from src.models.payment import PaymentPlan, Invoice, Payment
from src.models.activity import Activity, ChildActivityParticipation

daycare_bp = Blueprint('daycare', __name__)

def get_daycare_staff():
    """Get current user's daycare staff record"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.user_type != 'daycare':
        return None
    
    return DaycareStaff.query.filter_by(user_id=user.id, is_active=True).first()

def require_daycare_staff():
    """Decorator to ensure user is daycare staff"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            staff = get_daycare_staff()
            if not staff:
                return jsonify({
                    'error': {
                        'code': 'PERMISSION_DENIED',
                        'message': 'Access denied. Daycare staff privileges required.'
                    }
                }), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@daycare_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@require_daycare_staff()
def dashboard():
    try:
        staff = get_daycare_staff()
        daycare_id = staff.daycare_id
        
        # Get dashboard statistics
        total_children = Child.query.filter_by(daycare_id=daycare_id, status='enrolled').count()
        pending_registrations = RegistrationRequest.query.filter_by(daycare_id=daycare_id, status='pending').count()
        open_incidents = Incident.query.filter_by(daycare_id=daycare_id, status='open').count()
        
        # Get recent incidents
        recent_incidents = Incident.query.filter_by(daycare_id=daycare_id)\
            .order_by(Incident.created_at.desc()).limit(5).all()
        
        # Get recent activities
        recent_activities = ChildActivityParticipation.query\
            .join(Child).filter(Child.daycare_id == daycare_id)\
            .order_by(ChildActivityParticipation.created_at.desc()).limit(5).all()
        
        return jsonify({
            'statistics': {
                'total_children': total_children,
                'pending_registrations': pending_registrations,
                'open_incidents': open_incidents
            },
            'recent_incidents': [incident.to_dict() for incident in recent_incidents],
            'recent_activities': [activity.to_dict() for activity in recent_activities]
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving dashboard data'
            }
        }), 500

@daycare_bp.route('/children', methods=['GET'])
@jwt_required()
@require_daycare_staff()
def list_children():
    try:
        staff = get_daycare_staff()
        daycare_id = staff.daycare_id
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        room = request.args.get('room', '')
        
        query = Child.query.filter_by(daycare_id=daycare_id)
        
        if search:
            query = query.filter(
                or_(
                    Child.first_name.ilike(f'%{search}%'),
                    Child.last_name.ilike(f'%{search}%')
                )
            )
        
        if status:
            query = query.filter(Child.status == status)
        
        if room:
            query = query.filter(Child.room_assignment == room)
        
        total = query.count()
        children = query.offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'children': [child.to_dict() for child in children],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving children'
            }
        }), 500

# @daycare_bp.route('/children', methods=['POST'])
# @jwt_required()
# @require_daycare_staff()
# def create_child():
#     try:
#         staff = get_daycare_staff()
#         data = request.get_json()
        
#         if not data:
#             return jsonify({
#                 'error': {
#                     'code': 'VALIDATION_ERROR',
#                     'message': 'Request data is required'
#                 }
#             }), 422
        
#         # Validate required fields
#         required_fields = ['first_name', 'last_name', 'date_of_birth']
#         for field in required_fields:
#             if not data.get(field):
#                 return jsonify({
#                     'error': {
#                         'code': 'VALIDATION_ERROR',
#                         'message': f'{field} is required'
#                     }
#                 }), 422
        
#         # Parse date of birth
#         try:
#             dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
#         except ValueError:
#             return jsonify({
#                 'error': {
#                     'code': 'VALIDATION_ERROR',
#                     'message': 'Invalid date format. Use YYYY-MM-DD'
#                 }
#             }), 422
        
        # Parse enrollment date if provided
        enrollment_date = None
        if data.get('enrollment_date'):
            try:
                enrollment_date = datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid enrollment date format. Use YYYY-MM-DD'
                    }
                }), 422
        
        # Create new child
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
            enrollment_date=enrollment_date,
            status=data.get('status', 'enrolled'),
            daycare_id=staff.daycare_id,
            primary_parent_id=data.get('primary_parent_id', 1),  # Default for testing
            room_assignment=data.get('room_assignment'),
            notes=data.get('notes')
        )
        
        # Set pickup authorization if provided
        if data.get('pickup_authorization'):
            child.set_pickup_authorization(data['pickup_authorization'])
        
        db.session.add(child)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Child created successfully',
            'child': child.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'CREATION_FAILED',
                'message': f'Failed to create child: {str(e)}'
            }
        }), 400

@daycare_bp.route('/children/<int:child_id>', methods=['GET'])
@jwt_required()
@require_daycare_staff()
def get_child(child_id):
    try:
        staff = get_daycare_staff()
        child = Child.query.filter_by(id=child_id, daycare_id=staff.daycare_id).first()
        
        if not child:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found'
                }
            }), 404
        
        # Get child's recent incidents and activities
        recent_incidents = Incident.query.filter_by(child_id=child_id)\
            .order_by(Incident.created_at.desc()).limit(10).all()
        
        recent_activities = ChildActivityParticipation.query.filter_by(child_id=child_id)\
            .order_by(ChildActivityParticipation.created_at.desc()).limit(10).all()
        
        child_data = child.to_dict()
        child_data['recent_incidents'] = [incident.to_dict() for incident in recent_incidents]
        child_data['recent_activities'] = [activity.to_dict() for activity in recent_activities]
        
        return jsonify(child_data), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving child information'
            }
        }), 500

@daycare_bp.route('/children/<int:child_id>', methods=['PUT'])
@jwt_required()
@require_daycare_staff()
def update_child(child_id):
    try:
        staff = get_daycare_staff()
        child = Child.query.filter_by(id=child_id, daycare_id=staff.daycare_id).first()
        
        if not child:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found'
                }
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Request data is required'
                }
            }), 422
        
        # Update allowed fields
        updatable_fields = ['medical_conditions', 'allergies', 'dietary_restrictions', 
                           'emergency_medications', 'room_assignment', 'notes']
        
        for field in updatable_fields:
            if field in data:
                setattr(child, field, data[field])
        
        if 'pickup_authorization' in data:
            child.set_pickup_authorization(data['pickup_authorization'])
        
        child.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(child.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred updating child information'
            }
        }), 500

@daycare_bp.route('/incidents', methods=['GET'])
@jwt_required()
@require_daycare_staff()
def list_incidents():
    try:
        staff = get_daycare_staff()
        daycare_id = staff.daycare_id
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        child_id = request.args.get('child_id', type=int)
        severity = request.args.get('severity', '')
        status = request.args.get('status', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        query = Incident.query.filter_by(daycare_id=daycare_id)
        
        if child_id:
            query = query.filter(Incident.child_id == child_id)
        
        if severity:
            query = query.filter(Incident.severity == severity)
        
        if status:
            query = query.filter(Incident.status == status)
        
        if date_from:
            query = query.filter(Incident.incident_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        
        if date_to:
            query = query.filter(Incident.incident_date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        
        total = query.count()
        incidents = query.order_by(Incident.created_at.desc())\
            .offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'incidents': [incident.to_dict() for incident in incidents],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving incidents'
            }
        }), 500

@daycare_bp.route('/incidents', methods=['POST'])
@jwt_required()
@require_daycare_staff()
def create_incident():
    try:
        staff = get_daycare_staff()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Request data is required'
                }
            }), 422
        
        # Validate required fields
        required_fields = ['child_id', 'incident_type', 'severity', 'title', 'description', 'incident_date', 'incident_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': f'{field} is required'
                    }
                }), 422
        
        # Verify child belongs to this daycare
        child = Child.query.filter_by(id=data['child_id'], daycare_id=staff.daycare_id).first()
        if not child:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found in this daycare'
                }
            }), 404
        
        incident = Incident(
            child_id=data['child_id'],
            daycare_id=staff.daycare_id,
            reported_by=staff.id,
            incident_type=data['incident_type'],
            severity=data['severity'],
            title=data['title'],
            description=data['description'],
            location=data.get('location'),
            incident_date=datetime.strptime(data['incident_date'], '%Y-%m-%d').date(),
            incident_time=datetime.strptime(data['incident_time'], '%H:%M').time(),
            immediate_action_taken=data.get('immediate_action_taken'),
            medical_attention_required=data.get('medical_attention_required', False),
            medical_attention_details=data.get('medical_attention_details'),
            follow_up_required=data.get('follow_up_required', False),
            follow_up_notes=data.get('follow_up_notes')
        )
        
        if data.get('attachments'):
            incident.set_attachments(data['attachments'])
        
        db.session.add(incident)
        db.session.commit()
        
        return jsonify({
            'incident_id': incident.id,
            'message': 'Incident report created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred creating incident report'
            }
        }), 500

@daycare_bp.route('/registrations', methods=['GET'])
@jwt_required()
@require_daycare_staff()
def list_registrations():
    try:
        staff = get_daycare_staff()
        daycare_id = staff.daycare_id
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        status = request.args.get('status', '')
        
        query = RegistrationRequest.query.filter_by(daycare_id=daycare_id)
        
        if status:
            query = query.filter(RegistrationRequest.status == status)
        
        total = query.count()
        requests = query.order_by(RegistrationRequest.created_at.desc())\
            .offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'requests': [req.to_dict() for req in requests],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving registration requests'
            }
        }), 500

@daycare_bp.route('/registrations/<int:request_id>/approve', methods=['POST'])
@jwt_required()
@require_daycare_staff()
def approve_registration(request_id):
    try:
        staff = get_daycare_staff()
        registration_request = RegistrationRequest.query.filter_by(
            id=request_id, 
            daycare_id=staff.daycare_id
        ).first()
        
        if not registration_request:
            return jsonify({
                'error': {
                    'code': 'REQUEST_NOT_FOUND',
                    'message': 'Registration request not found'
                }
            }), 404
        
        if registration_request.status != 'pending':
            return jsonify({
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': 'Registration request is not pending'
                }
            }), 400
        
        data = request.get_json()
        enrollment_date = data.get('enrollment_date', date.today().isoformat())
        
        # Update registration request
        registration_request.status = 'approved'
        registration_request.approved_by = staff.id
        registration_request.approved_at = datetime.utcnow()
        
        # Generate invitation token
        import secrets
        invitation_token = secrets.token_urlsafe(32)
        registration_request.invitation_token = invitation_token
        registration_request.invitation_sent_at = datetime.utcnow()
        registration_request.invitation_expires_at = datetime.utcnow() + timedelta(days=7)
        
        db.session.commit()
        
        return jsonify({
            'invitation_token': invitation_token,
            'message': 'Registration approved successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred approving registration'
            }
        }), 500

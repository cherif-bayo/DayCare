from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date

from src.models.user import db, User, WebsiteHoster, Daycare, DaycareStaff

admin_bp = Blueprint('admin', __name__)

def require_hoster():
    """Decorator to ensure user is a website hoster"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or user.user_type != 'hoster':
                return jsonify({
                    'error': {
                        'code': 'PERMISSION_DENIED',
                        'message': 'Access denied. Website hoster privileges required.'
                    }
                }), 403
            
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@admin_bp.route('/daycares', methods=['GET'])
@jwt_required()
@require_hoster()
def list_daycares():
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        
        query = Daycare.query
        
        if search:
            query = query.filter(
                db.or_(
                    Daycare.name.ilike(f'%{search}%'),
                    Daycare.email.ilike(f'%{search}%'),
                    Daycare.city.ilike(f'%{search}%')
                )
            )
        
        if status:
            query = query.filter(Daycare.subscription_status == status)
        
        total = query.count()
        daycares = query.offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'daycares': [daycare.to_dict() for daycare in daycares],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving daycares'
            }
        }), 500

@admin_bp.route('/daycares', methods=['POST'])
@jwt_required()
@require_hoster()
def create_daycare():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Request data is required'
                }
            }), 422
        
        # Validate required fields
        required_fields = ['name', 'address', 'city', 'province', 'postal_code', 'phone', 'email', 'capacity']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': f'{field} is required'
                    }
                }), 422
        
        # Check if daycare email already exists
        if Daycare.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': {
                    'code': 'EMAIL_EXISTS',
                    'message': 'A daycare with this email already exists'
                }
            }), 400
        
        # Create daycare
        daycare = Daycare(
            name=data['name'],
            license_number=data.get('license_number'),
            address=data['address'],
            city=data['city'],
            province=data['province'],
            postal_code=data['postal_code'],
            phone=data['phone'],
            email=data['email'],
            capacity=data['capacity'],
            subscription_plan=data.get('subscription_plan', 'basic'),
            subscription_status='active',
            subscription_start_date=date.today()
        )
        
        if data.get('age_groups'):
            daycare.set_age_groups(data['age_groups'])
        
        if data.get('features_enabled'):
            daycare.set_features_enabled(data['features_enabled'])
        
        db.session.add(daycare)
        db.session.commit()
        
        return jsonify({
            'daycare_id': daycare.id,
            'message': 'Daycare created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred creating daycare'
            }
        }), 500

@admin_bp.route('/daycares/<int:daycare_id>', methods=['GET'])
@jwt_required()
@require_hoster()
def get_daycare(daycare_id):
    try:
        daycare = Daycare.query.get(daycare_id)
        
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
                }
            }), 404
        
        return jsonify(daycare.to_dict()), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving daycare'
            }
        }), 500

@admin_bp.route('/daycares/<int:daycare_id>', methods=['PUT'])
@jwt_required()
@require_hoster()
def update_daycare(daycare_id):
    try:
        daycare = Daycare.query.get(daycare_id)
        
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
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
        
        # Update daycare fields
        updatable_fields = ['name', 'license_number', 'address', 'city', 'province', 
                           'postal_code', 'phone', 'email', 'capacity']
        
        for field in updatable_fields:
            if field in data:
                setattr(daycare, field, data[field])
        
        if 'age_groups' in data:
            daycare.set_age_groups(data['age_groups'])
        
        if 'settings' in data:
            daycare.set_settings(data['settings'])
        
        daycare.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(daycare.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred updating daycare'
            }
        }), 500

@admin_bp.route('/daycares/<int:daycare_id>/subscription', methods=['PUT'])
@jwt_required()
@require_hoster()
def update_daycare_subscription(daycare_id):
    try:
        daycare = Daycare.query.get(daycare_id)
        
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
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
        
        if 'plan' in data:
            daycare.subscription_plan = data['plan']
        
        if 'features_enabled' in data:
            daycare.set_features_enabled(data['features_enabled'])
        
        if 'subscription_end_date' in data:
            daycare.subscription_end_date = datetime.strptime(data['subscription_end_date'], '%Y-%m-%d').date()
        
        daycare.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Subscription updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred updating subscription'
            }
        }), 500

@admin_bp.route('/daycares/<int:daycare_id>/status', methods=['PUT'])
@jwt_required()
@require_hoster()
def update_daycare_status(daycare_id):
    try:
        daycare = Daycare.query.get(daycare_id)
        
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
                }
            }), 404
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Status is required'
                }
            }), 422
        
        valid_statuses = ['active', 'suspended', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': f'Status must be one of: {", ".join(valid_statuses)}'
                }
            }), 422
        
        daycare.subscription_status = data['status']
        daycare.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Daycare status updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred updating daycare status'
            }
        }), 500

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@require_hoster()
def admin_dashboard():
    try:
        # Get dashboard statistics
        total_daycares = Daycare.query.count()
        active_daycares = Daycare.query.filter_by(subscription_status='active').count()
        suspended_daycares = Daycare.query.filter_by(subscription_status='suspended').count()
        
        # Get recent daycares
        recent_daycares = Daycare.query.order_by(Daycare.created_at.desc()).limit(5).all()
        
        return jsonify({
            'statistics': {
                'total_daycares': total_daycares,
                'active_daycares': active_daycares,
                'suspended_daycares': suspended_daycares
            },
            'recent_daycares': [daycare.to_dict() for daycare in recent_daycares]
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving dashboard data'
            }
        }), 500


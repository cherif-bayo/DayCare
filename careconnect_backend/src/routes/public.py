from flask import Blueprint, request, jsonify
from datetime import datetime, date

from src.models.user import db, Daycare
from src.models.child import RegistrationRequest
from src.models.activity import SystemSetting

public_bp = Blueprint('public', __name__)

@public_bp.route('/registration-request', methods=['POST'])
def submit_registration_request():
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
        required_fields = [
            'daycare_id', 'child_first_name', 'child_last_name', 'child_date_of_birth',
            'parent_first_name', 'parent_last_name', 'parent_email', 'parent_phone'
        ]
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': f'{field} is required'
                    }
                }), 422
        
        # Verify daycare exists and is active
        daycare = Daycare.query.filter_by(
            id=data['daycare_id'], 
            subscription_status='active'
        ).first()
        
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found or not accepting registrations'
                }
            }), 404
        
        # Create registration request
        registration_request = RegistrationRequest(
            daycare_id=data['daycare_id'],
            child_first_name=data['child_first_name'],
            child_last_name=data['child_last_name'],
            child_date_of_birth=datetime.strptime(data['child_date_of_birth'], '%Y-%m-%d').date(),
            parent_first_name=data['parent_first_name'],
            parent_last_name=data['parent_last_name'],
            parent_email=data['parent_email'].lower().strip(),
            parent_phone=data['parent_phone'],
            requested_start_date=datetime.strptime(data['requested_start_date'], '%Y-%m-%d').date() if data.get('requested_start_date') else None,
            status='pending'
        )
        
        # Add additional information if provided
        if data.get('additional_info'):
            registration_request.set_additional_info(data['additional_info'])
        
        db.session.add(registration_request)
        db.session.commit()
        
        return jsonify({
            'request_id': registration_request.id,
            'message': 'Registration request submitted successfully. The daycare will review your request and contact you soon.'
        }), 201
        
    except ValueError as e:
        return jsonify({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid date format. Please use YYYY-MM-DD format.'
            }
        }), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred submitting your registration request'
            }
        }), 500

@public_bp.route('/daycares', methods=['GET'])
def list_daycares():
    try:
        city = request.args.get('city', '')
        province = request.args.get('province', '')
        postal_code = request.args.get('postal_code', '')
        
        query = Daycare.query.filter_by(subscription_status='active')
        
        if city:
            query = query.filter(Daycare.city.ilike(f'%{city}%'))
        
        if province:
            query = query.filter(Daycare.province.ilike(f'%{province}%'))
        
        if postal_code:
            # Match first 3 characters of postal code for area matching
            query = query.filter(Daycare.postal_code.ilike(f'{postal_code[:3]}%'))
        
        daycares = query.all()
        
        # Return limited public information
        public_daycares = []
        for daycare in daycares:
            public_info = {
                'id': daycare.id,
                'name': daycare.name,
                'address': daycare.address,
                'city': daycare.city,
                'province': daycare.province,
                'postal_code': daycare.postal_code,
                'phone': daycare.phone,
                'email': daycare.email,
                'capacity': daycare.capacity,
                'age_groups': daycare.get_age_groups()
            }
            public_daycares.append(public_info)
        
        return jsonify({
            'daycares': public_daycares
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving daycares'
            }
        }), 500

@public_bp.route('/invitation/<token>', methods=['GET'])
def validate_invitation(token):
    try:
        registration_request = RegistrationRequest.query.filter_by(
            invitation_token=token,
            status='approved'
        ).first()
        
        if not registration_request:
            return jsonify({
                'valid': False,
                'message': 'Invalid invitation token'
            }), 400
        
        if registration_request.invitation_expires_at < datetime.utcnow():
            return jsonify({
                'valid': False,
                'message': 'Invitation token has expired'
            }), 400
        
        daycare = Daycare.query.get(registration_request.daycare_id)
        
        return jsonify({
            'valid': True,
            'daycare_name': daycare.name if daycare else 'Unknown',
            'child_name': f"{registration_request.child_first_name} {registration_request.child_last_name}",
            'expires_at': registration_request.invitation_expires_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred validating invitation'
            }
        }), 500

@public_bp.route('/system/settings', methods=['GET'])
def get_public_settings():
    try:
        public_settings = SystemSetting.query.filter_by(is_public=True).all()
        
        settings = {}
        for setting in public_settings:
            settings[setting.setting_key] = setting.get_typed_value()
        
        return jsonify({
            'settings': settings
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving system settings'
            }
        }), 500

@public_bp.route('/health', methods=['GET'])
def health_check():
    try:
        # Basic health check
        db.session.execute('SELECT 1')
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'database': 'connected'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'database': 'disconnected',
            'error': str(e)
        }), 503

@public_bp.route('/provinces', methods=['GET'])
def get_provinces():
    """Get list of Canadian provinces and territories"""
    provinces = [
        {'code': 'AB', 'name': 'Alberta'},
        {'code': 'BC', 'name': 'British Columbia'},
        {'code': 'MB', 'name': 'Manitoba'},
        {'code': 'NB', 'name': 'New Brunswick'},
        {'code': 'NL', 'name': 'Newfoundland and Labrador'},
        {'code': 'NS', 'name': 'Nova Scotia'},
        {'code': 'ON', 'name': 'Ontario'},
        {'code': 'PE', 'name': 'Prince Edward Island'},
        {'code': 'QC', 'name': 'Quebec'},
        {'code': 'SK', 'name': 'Saskatchewan'},
        {'code': 'NT', 'name': 'Northwest Territories'},
        {'code': 'NU', 'name': 'Nunavut'},
        {'code': 'YT', 'name': 'Yukon'}
    ]
    
    return jsonify({
        'provinces': provinces
    }), 200


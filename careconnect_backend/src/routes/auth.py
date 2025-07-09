from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
from datetime import date
import secrets
import uuid
from src.models.user import Daycare
from src.models.user import DaycareStaff
import json
from flask_cors import cross_origin
import traceback
from sqlalchemy.exc import IntegrityError




from src.models.user import db, User, WebsiteHoster, DaycareStaff, Parent
from src.models.child import RegistrationRequest

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Email and password are required'
                }
            }), 422
        
        user = User.query.filter_by(email=data['email'].lower().strip()).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_CREDENTIALS',
                    'message': 'Invalid email or password'
                }
            }), 401
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'ACCOUNT_DISABLED',
                    'message': 'Account has been disabled'
                }
            }), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))  # ✅ cast to string
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'expires_in': 86400  # 24 hours in seconds
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred during login'
            }
        }), 500

@auth_bp.route('/register', methods=['POST'])
@cross_origin()
def register():
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
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': f'{field} is required'
                    }
                }), 422
        
        email = data['email'].lower().strip()
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({
                'error': {
                    'code': 'EMAIL_EXISTS',
                    'message': 'An account with this email already exists'
                }
            }), 400
        
        # Handle invitation token for parent registration
        invitation_token = data.get('invitation_token')
        registration_request = None
        
        if invitation_token:
            registration_request = RegistrationRequest.query.filter_by(
                invitation_token=invitation_token,
                status='approved'
            ).first()
            
            if not registration_request:
                return jsonify({
                    'error': {
                        'code': 'INVALID_INVITATION',
                        'message': 'Invalid or expired invitation token'
                    }
                }), 400
            
            if registration_request.invitation_expires_at < datetime.utcnow():
                return jsonify({
                    'error': {
                        'code': 'INVITATION_EXPIRED',
                        'message': 'Invitation token has expired'
                    }
                }), 400
        
        # Create user account
        user = User(
            email=email,
            user_type='parent' if invitation_token else 'daycare',  # Default to daycare for direct registration
            is_active=True,
            email_verified=False,
            preferred_language=data.get('preferred_language', 'en')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()
        
        # Create user profile based on type
        if user.user_type == 'parent':
            parent = Parent(
                user_id=user.id,
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data.get('phone', ''),
                address=data.get('address'),
                city=data.get('city'),
                province=data.get('province'),
                postal_code=data.get('postal_code'),
                emergency_contact_name=data.get('emergency_contact_name'),
                emergency_contact_phone=data.get('emergency_contact_phone'),
                emergency_contact_relationship=data.get('emergency_contact_relationship')
            )
            db.session.add(parent)
            
            # If this is from an invitation, create the child and relationships
            if registration_request:
                from src.models.child import Child, ParentChildRelationship
                
                child = Child(
                    first_name=registration_request.child_first_name,
                    last_name=registration_request.child_last_name,
                    date_of_birth=registration_request.child_date_of_birth,
                    daycare_id=registration_request.daycare_id,
                    primary_parent_id=parent.id,
                    enrollment_date=datetime.utcnow().date(),
                    status='enrolled'
                )
                db.session.add(child)
                db.session.flush()
                
                relationship = ParentChildRelationship(
                    parent_id=parent.id,
                    child_id=child.id,
                    relationship_type='parent',
                    access_level='full',
                    can_pickup=True,
                    can_authorize_medical=True
                )
                db.session.add(relationship)
        # …now add this block to handle daycare sign‐ups…
        elif user.user_type == 'daycare':
            info = data['daycare_info']
            # 1) create the Daycare record
            dc = Daycare(
                name=info['name'],
                license_number=info.get('license_number'),
                street=info['address'],      # or use dc.address = {...}
                city=info['city'],
                province=info['province'],
                postal_code=info['postal_code'],
                phone=info.get('phone'),
                email=info.get('email'),
                capacity=info.get('capacity'),
                program_types=info.get('program_types', []),
                age_groups=info.get('age_groups', [])
            )
            db.session.add(dc)
            db.session.flush()  # so dc.id is populated

            # 2) make an “owner” staff record so this user can log in
            owner = DaycareStaff(
                user_id=user.id,
                daycare_id=dc.id,
                role='owner',
                hire_date=datetime.utcnow().date(),
                is_active=True,
                permissions=json.dumps({})  # or whatever default perms you want
            )
            db.session.add(owner)
        db.session.commit()

        # generate tokens
        access_token  = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'token': access_token,
            'refresh_token': refresh_token, 
            'message': 'Account created successfully',
            'user': user.to_dict(),
            'user_id': user.id,
            'expires_in': 86400
        }), 201
    
    except IntegrityError as err:
        db.session.rollback()
        # catch your unique‐constraint on license_number
        if 'daycares_license_number_key' in str(err.orig):
            return jsonify({
                'error': {
                    'code': 'DUPLICATE_LICENSE_NUMBER',
                    'message': 'A daycare with that license number already exists'
                }
            }), 400
        # re-raise other IntegrityErrors
        raise
    
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()      # <-- print full stack to your Flask console
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e),
                'trace': traceback.format_exc()                      # <-- surface the real Python error
            }
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': {
                    'code': 'INVALID_USER',
                    'message': 'User not found or inactive'
                }
            }), 401
        
        access_token = create_access_token(identity=user.id)
        
        
        return jsonify({
            'access_token': access_token,
            'expires_in': 86400
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred during token refresh'
            }
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a production environment, you would add the token to a blacklist
    return jsonify({'message': 'Successfully logged out'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Email is required'
                }
            }), 422
        
        # Always return success for security (don't reveal if email exists)
        return jsonify({
            'message': 'If an account with this email exists, a password reset link has been sent'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred processing your request'
            }
        }), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        if not data or not data.get('token') or not data.get('new_password'):
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Token and new password are required'
                }
            }), 422
        
        # In a real implementation, you would validate the reset token
        # For now, return an error since we haven't implemented token generation
        return jsonify({
            'error': {
                'code': 'INVALID_TOKEN',
                'message': 'Invalid or expired reset token'
            }
        }), 400
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred during password reset'
            }
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'User not found'
                }
            }), 404
        
        profile_data = user.to_dict()
        
        # Add role-specific profile data
        if user.user_type == 'hoster':
            hoster = WebsiteHoster.query.filter_by(user_id=user.id).first()
            if hoster:
                profile_data['profile'] = hoster.to_dict()
        elif user.user_type == 'parent':
            parent = Parent.query.filter_by(user_id=user.id).first()
            if parent:
                profile_data['profile'] = parent.to_dict()
        elif user.user_type == 'daycare':
            staff = DaycareStaff.query.filter_by(user_id=user.id).first()
            if staff:
                profile_data['profile'] = staff.to_dict()
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving profile'
            }
        }), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'User not found'
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
        
        # Update user preferences
        if 'preferred_language' in data:
            user.preferred_language = data['preferred_language']
        
        # Update role-specific profile
        if user.user_type == 'parent':
            parent = Parent.query.filter_by(user_id=user.id).first()
            if parent and 'profile' in data:
                profile_data = data['profile']
                for field in ['first_name', 'last_name', 'phone', 'address', 'city', 'province', 'postal_code']:
                    if field in profile_data:
                        setattr(parent, field, profile_data[field])
        
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred updating profile'
            }
        }), 500


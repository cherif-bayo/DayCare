from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from src.models.user import User, Daycare, db
from src.models.subscription import Subscription, SubscriptionPlan
from datetime import datetime, date
import logging

account_bp = Blueprint('account', __name__)

@account_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile information"""
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
        
        # Get daycare information if user is daycare type
        daycare_info = None
        subscription_info = None
        
        if user.user_type == 'daycare':
            daycare = Daycare.query.filter_by(user_id=user.id).first()
            if daycare:
                daycare_info = {
                    'id': daycare.id,
                    'name': daycare.name,
                    'address': daycare.address,
                    'city': daycare.city,
                    'province': daycare.province,
                    'postal_code': daycare.postal_code,
                    'phone': daycare.phone,
                    'license_number': daycare.license_number,
                    'capacity': daycare.capacity,
                    'age_groups': daycare.age_groups,
                    'program_types': daycare.program_types
                }
                
                # Get subscription information
                subscription = Subscription.query.filter_by(daycare_id=daycare.id, status='active').first()
                if subscription:
                    subscription_info = {
                        'id': subscription.id,
                        'plan_type': subscription.plan_type,
                        'status': subscription.status,
                        'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                        'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                        'trial_end_date': subscription.trial_end_date.isoformat() if subscription.trial_end_date else None,
                        'is_trial': subscription.is_trial,
                        'auto_renew': subscription.auto_renew,
                        'amount': float(subscription.amount) if subscription.amount else 0,
                        'billing_cycle': subscription.billing_cycle,
                        'days_until_expiry': subscription.days_until_expiry(),
                        'is_expiring_soon': subscription.is_expiring_soon()
                    }
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'is_active': user.is_active,
                'email_verified': user.email_verified,
                'preferred_language': user.preferred_language,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'daycare': daycare_info,
            'subscription': subscription_info
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting profile: {str(e)}")
        return jsonify({
            'error': {
                'code': 'PROFILE_ERROR',
                'message': 'Failed to get profile information'
            }
        }), 500

@account_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
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
        
        # Update user fields
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter(User.email == data['email'], User.id != user.id).first()
            if existing_user:
                return jsonify({
                    'error': {
                        'code': 'EMAIL_EXISTS',
                        'message': 'Email already exists'
                    }
                }), 400
            user.email = data['email']
            user.email_verified = False  # Reset verification when email changes
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        if 'preferred_language' in data:
            user.preferred_language = data['preferred_language']
        
        # Update daycare information if user is daycare type
        if user.user_type == 'daycare' and 'daycare' in data:
            daycare = Daycare.query.filter_by(user_id=user.id).first()
            if daycare:
                daycare_data = data['daycare']
                if 'name' in daycare_data:
                    daycare.name = daycare_data['name']
                if 'address' in daycare_data:
                    daycare.address = daycare_data['address']
                if 'city' in daycare_data:
                    daycare.city = daycare_data['city']
                if 'province' in daycare_data:
                    daycare.province = daycare_data['province']
                if 'postal_code' in daycare_data:
                    daycare.postal_code = daycare_data['postal_code']
                if 'phone' in daycare_data:
                    daycare.phone = daycare_data['phone']
                if 'capacity' in daycare_data:
                    daycare.capacity = daycare_data['capacity']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating profile: {str(e)}")
        return jsonify({
            'error': {
                'code': 'UPDATE_ERROR',
                'message': 'Failed to update profile'
            }
        }), 500

@account_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
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
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({
                'error': {
                    'code': 'MISSING_FIELDS',
                    'message': 'Current password and new password are required'
                }
            }), 400
        
        # Verify current password
        if not check_password_hash(user.password_hash, current_password):
            return jsonify({
                'error': {
                    'code': 'INVALID_PASSWORD',
                    'message': 'Current password is incorrect'
                }
            }), 400
        
        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({
                'error': {
                    'code': 'WEAK_PASSWORD',
                    'message': 'Password must be at least 8 characters long'
                }
            }), 400
        
        # Update password
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error changing password: {str(e)}")
        return jsonify({
            'error': {
                'code': 'PASSWORD_CHANGE_ERROR',
                'message': 'Failed to change password'
            }
        }), 500

@account_bp.route('/subscription/renew', methods=['POST'])
@jwt_required()
def renew_subscription():
    """Renew or upgrade subscription"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'daycare':
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Only daycare users can manage subscriptions'
                }
            }), 403
        
        daycare = Daycare.query.filter_by(user_id=user.id).first()
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
                }
            }), 404
        
        data = request.get_json()
        plan_type = data.get('plan_type')
        
        if not plan_type or plan_type not in ['monthly', 'yearly', 'lifetime']:
            return jsonify({
                'error': {
                    'code': 'INVALID_PLAN',
                    'message': 'Invalid plan type'
                }
            }), 400
        
        # Get current subscription
        current_subscription = Subscription.query.filter_by(daycare_id=daycare.id, status='active').first()
        
        # Calculate new subscription details
        today = date.today()
        
        if plan_type == 'monthly':
            amount = 250.00
            billing_cycle = 'monthly'
            # Add 30 days from today or current end date
            if current_subscription and current_subscription.end_date and current_subscription.end_date > today:
                start_date = current_subscription.end_date
            else:
                start_date = today
            end_date = datetime(start_date.year, start_date.month, start_date.day).replace(month=start_date.month + 1).date()
            
        elif plan_type == 'yearly':
            amount = 1500.00
            billing_cycle = 'yearly'
            # Add 1 year from today or current end date
            if current_subscription and current_subscription.end_date and current_subscription.end_date > today:
                start_date = current_subscription.end_date
            else:
                start_date = today
            end_date = datetime(start_date.year + 1, start_date.month, start_date.day).date()
            
        elif plan_type == 'lifetime':
            amount = 3000.00
            billing_cycle = 'lifetime'
            start_date = today
            end_date = None  # Lifetime has no end date
        
        # Deactivate current subscription
        if current_subscription:
            current_subscription.status = 'cancelled'
            current_subscription.cancelled_at = datetime.utcnow()
        
        # Create new subscription
        new_subscription = Subscription(
            daycare_id=daycare.id,
            plan_type=plan_type,
            status='active',
            start_date=start_date,
            end_date=end_date,
            amount=amount,
            billing_cycle=billing_cycle,
            is_trial=False,
            auto_renew=plan_type != 'lifetime',
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_subscription)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Subscription renewed to {plan_type} plan',
            'subscription': {
                'id': new_subscription.id,
                'plan_type': new_subscription.plan_type,
                'status': new_subscription.status,
                'start_date': new_subscription.start_date.isoformat(),
                'end_date': new_subscription.end_date.isoformat() if new_subscription.end_date else None,
                'amount': float(new_subscription.amount),
                'billing_cycle': new_subscription.billing_cycle
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error renewing subscription: {str(e)}")
        return jsonify({
            'error': {
                'code': 'RENEWAL_ERROR',
                'message': 'Failed to renew subscription'
            }
        }), 500

@account_bp.route('/subscription/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancel subscription"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'daycare':
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Only daycare users can manage subscriptions'
                }
            }), 403
        
        daycare = Daycare.query.filter_by(user_id=user.id).first()
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
                }
            }), 404
        
        data = request.get_json()
        reason = data.get('reason', 'User requested cancellation')
        
        # Get current subscription
        subscription = Subscription.query.filter_by(daycare_id=daycare.id, status='active').first()
        
        if not subscription:
            return jsonify({
                'error': {
                    'code': 'NO_ACTIVE_SUBSCRIPTION',
                    'message': 'No active subscription found'
                }
            }), 404
        
        # Cancel subscription
        subscription.status = 'cancelled'
        subscription.cancelled_at = datetime.utcnow()
        subscription.cancellation_reason = reason
        subscription.auto_renew = False
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Subscription cancelled successfully',
            'subscription': {
                'id': subscription.id,
                'status': subscription.status,
                'cancelled_at': subscription.cancelled_at.isoformat(),
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error cancelling subscription: {str(e)}")
        return jsonify({
            'error': {
                'code': 'CANCELLATION_ERROR',
                'message': 'Failed to cancel subscription'
            }
        }), 500

@account_bp.route('/subscription/extend', methods=['POST'])
@jwt_required()
def extend_subscription():
    """Extend current subscription"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'daycare':
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Only daycare users can manage subscriptions'
                }
            }), 403
        
        daycare = Daycare.query.filter_by(user_id=user.id).first()
        if not daycare:
            return jsonify({
                'error': {
                    'code': 'DAYCARE_NOT_FOUND',
                    'message': 'Daycare not found'
                }
            }), 404
        
        data = request.get_json()
        extension_months = data.get('months', 1)
        
        if not isinstance(extension_months, int) or extension_months < 1 or extension_months > 12:
            return jsonify({
                'error': {
                    'code': 'INVALID_EXTENSION',
                    'message': 'Extension must be between 1 and 12 months'
                }
            }), 400
        
        # Get current subscription
        subscription = Subscription.query.filter_by(daycare_id=daycare.id, status='active').first()
        
        if not subscription:
            return jsonify({
                'error': {
                    'code': 'NO_ACTIVE_SUBSCRIPTION',
                    'message': 'No active subscription found'
                }
            }), 404
        
        if subscription.plan_type == 'lifetime':
            return jsonify({
                'error': {
                    'code': 'LIFETIME_SUBSCRIPTION',
                    'message': 'Lifetime subscriptions cannot be extended'
                }
            }), 400
        
        # Extend subscription
        if subscription.end_date:
            current_end = subscription.end_date
            new_end = datetime(current_end.year, current_end.month, current_end.day)
            
            # Add months
            for _ in range(extension_months):
                if new_end.month == 12:
                    new_end = new_end.replace(year=new_end.year + 1, month=1)
                else:
                    new_end = new_end.replace(month=new_end.month + 1)
            
            subscription.end_date = new_end.date()
            
            # Calculate additional cost
            monthly_rate = 250.00 if subscription.plan_type == 'monthly' else 125.00  # Yearly rate per month
            additional_cost = monthly_rate * extension_months
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Subscription extended by {extension_months} month(s)',
                'subscription': {
                    'id': subscription.id,
                    'end_date': subscription.end_date.isoformat(),
                    'additional_cost': additional_cost,
                    'days_until_expiry': subscription.days_until_expiry()
                }
            }), 200
        else:
            return jsonify({
                'error': {
                    'code': 'NO_END_DATE',
                    'message': 'Cannot extend subscription without end date'
                }
            }), 400
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error extending subscription: {str(e)}")
        return jsonify({
            'error': {
                'code': 'EXTENSION_ERROR',
                'message': 'Failed to extend subscription'
            }
        }), 500

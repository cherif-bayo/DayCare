# src/routes/subscriptions.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from src.models.user import User, db
from src.models.subscription import (
    SubscriptionPlan, DaycareSubscription, SubscriptionNotification,
    SubscriptionHelper, SubscriptionPlanType, SubscriptionStatus
)
from src.routes.daycare import get_daycare_staff

subscription_bp = Blueprint('subscription', __name__)

@subscription_bp.route('/plans', methods=['GET'])
def get_subscription_plans():
    """Get all available subscription plans"""
    try:
        plans = SubscriptionPlan.query.filter_by(is_active=True).order_by(SubscriptionPlan.price).all()
        return jsonify({
            'success': True,
            'plans': [plan.to_dict() for plan in plans]
        }), 200
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'FETCH_FAILED',
                'message': f'Failed to fetch subscription plans: {str(e)}'
            }
        }), 500

@subscription_bp.route('/plans/<int:plan_id>', methods=['GET'])
def get_subscription_plan(plan_id):
    """Get a specific subscription plan"""
    try:
        plan = SubscriptionPlan.query.get_or_404(plan_id)
        return jsonify({
            'success': True,
            'plan': plan.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'PLAN_NOT_FOUND',
                'message': 'Subscription plan not found'
            }
        }), 404

@subscription_bp.route('/daycare/current', methods=['GET'])
@jwt_required()
def get_current_subscription():
    """Get current subscription for the authenticated daycare"""
    try:
        staff = get_daycare_staff()
        if not staff:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Access denied. Daycare staff required.'
                }
            }), 403
        
        subscription = DaycareSubscription.query.filter_by(
            daycare_id=staff.daycare_id,
            status=SubscriptionStatus.ACTIVE
        ).first()
        
        if not subscription:
            return jsonify({
                'success': True,
                'subscription': None,
                'message': 'No active subscription found'
            }), 200
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'FETCH_FAILED',
                'message': f'Failed to fetch subscription: {str(e)}'
            }
        }), 500

@subscription_bp.route('/daycare/subscribe', methods=['POST'])
@jwt_required()
def create_subscription():
    """Create a new subscription for the authenticated daycare"""
    try:
        staff = get_daycare_staff()
        if not staff:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Access denied. Daycare staff required.'
                }
            }), 403
        
        data = request.get_json()
        plan_type = data.get('plan_type')
        
        if not plan_type:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Plan type is required'
                }
            }), 400
        
        # Create subscription
        subscription, error = SubscriptionHelper.create_subscription_for_daycare(
            daycare_id=staff.daycare_id,
            plan_type_str=plan_type,
            start_trial=True
        )
        
        if error:
            return jsonify({
                'error': {
                    'code': 'SUBSCRIPTION_FAILED',
                    'message': error
                }
            }), 400
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict(),
            'message': 'Subscription created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'CREATION_FAILED',
                'message': f'Failed to create subscription: {str(e)}'
            }
        }), 500

@subscription_bp.route('/daycare/upgrade', methods=['POST'])
@jwt_required()
def upgrade_subscription():
    """Upgrade current subscription to a different plan"""
    try:
        staff = get_daycare_staff()
        if not staff:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Access denied. Daycare staff required.'
                }
            }), 403
        
        data = request.get_json()
        new_plan_type = data.get('plan_type')
        
        if not new_plan_type:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'New plan type is required'
                }
            }), 400
        
        # Get current subscription
        current_subscription = DaycareSubscription.query.filter_by(
            daycare_id=staff.daycare_id,
            status=SubscriptionStatus.ACTIVE
        ).first()
        
        if not current_subscription:
            return jsonify({
                'error': {
                    'code': 'NO_SUBSCRIPTION',
                    'message': 'No active subscription found to upgrade'
                }
            }), 404
        
        # Get new plan
        try:
            plan_type_enum = SubscriptionPlanType(new_plan_type)
        except ValueError:
            return jsonify({
                'error': {
                    'code': 'INVALID_PLAN',
                    'message': 'Invalid plan type'
                }
            }), 400
        
        new_plan = SubscriptionPlan.query.filter_by(
            plan_type=plan_type_enum,
            is_active=True
        ).first()
        
        if not new_plan:
            return jsonify({
                'error': {
                    'code': 'PLAN_NOT_FOUND',
                    'message': 'New plan not found'
                }
            }), 404
        
        # Cancel current subscription
        current_subscription.status = SubscriptionStatus.CANCELLED
        current_subscription.cancelled_at = datetime.utcnow()
        current_subscription.cancelled_reason = f'Upgraded to {new_plan.name}'
        
        # Create new subscription
        new_subscription, error = SubscriptionHelper.create_subscription_for_daycare(
            daycare_id=staff.daycare_id,
            plan_type_str=new_plan_type,
            start_trial=False  # No trial for upgrades
        )
        
        if error:
            db.session.rollback()
            return jsonify({
                'error': {
                    'code': 'UPGRADE_FAILED',
                    'message': error
                }
            }), 400
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'subscription': new_subscription.to_dict(),
            'message': f'Successfully upgraded to {new_plan.name}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'UPGRADE_FAILED',
                'message': f'Failed to upgrade subscription: {str(e)}'
            }
        }), 500

@subscription_bp.route('/daycare/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancel current subscription"""
    try:
        staff = get_daycare_staff()
        if not staff:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Access denied. Daycare staff required.'
                }
            }), 403
        
        data = request.get_json()
        reason = data.get('reason', 'User requested cancellation')
        
        # Get current subscription
        subscription = DaycareSubscription.query.filter_by(
            daycare_id=staff.daycare_id,
            status=SubscriptionStatus.ACTIVE
        ).first()
        
        if not subscription:
            return jsonify({
                'error': {
                    'code': 'NO_SUBSCRIPTION',
                    'message': 'No active subscription found to cancel'
                }
            }), 404
        
        # Cancel subscription
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.cancelled_at = datetime.utcnow()
        subscription.cancelled_reason = reason
        subscription.auto_renew = False
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Subscription cancelled successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'CANCELLATION_FAILED',
                'message': f'Failed to cancel subscription: {str(e)}'
            }
        }), 500

@subscription_bp.route('/daycare/renew', methods=['POST'])
@jwt_required()
def renew_subscription():
    """Renew current subscription"""
    try:
        staff = get_daycare_staff()
        if not staff:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Access denied. Daycare staff required.'
                }
            }), 403
        
        # Get current subscription
        subscription = DaycareSubscription.query.filter_by(
            daycare_id=staff.daycare_id
        ).order_by(DaycareSubscription.created_at.desc()).first()
        
        if not subscription:
            return jsonify({
                'error': {
                    'code': 'NO_SUBSCRIPTION',
                    'message': 'No subscription found to renew'
                }
            }), 404
        
        # Renew subscription
        subscription.renew_subscription()
        
        # Schedule new notifications
        SubscriptionHelper.schedule_notifications(subscription)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict(),
            'message': 'Subscription renewed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'RENEWAL_FAILED',
                'message': f'Failed to renew subscription: {str(e)}'
            }
        }), 500

@subscription_bp.route('/daycare/notifications', methods=['GET'])
@jwt_required()
def get_subscription_notifications():
    """Get subscription notifications for the authenticated daycare"""
    try:
        staff = get_daycare_staff()
        if not staff:
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Access denied. Daycare staff required.'
                }
            }), 403
        
        # Get current subscription
        subscription = DaycareSubscription.query.filter_by(
            daycare_id=staff.daycare_id,
            status=SubscriptionStatus.ACTIVE
        ).first()
        
        if not subscription:
            return jsonify({
                'success': True,
                'notifications': [],
                'message': 'No active subscription found'
            }), 200
        
        # Get notifications
        notifications = SubscriptionNotification.query.filter_by(
            subscription_id=subscription.id
        ).order_by(SubscriptionNotification.scheduled_date.desc()).all()
        
        return jsonify({
            'success': True,
            'notifications': [notification.to_dict() for notification in notifications]
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'FETCH_FAILED',
                'message': f'Failed to fetch notifications: {str(e)}'
            }
        }), 500

@subscription_bp.route('/admin/notifications/send', methods=['POST'])
@jwt_required()
def send_pending_notifications():
    """Send pending notifications (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'hoster':
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Admin access required'
                }
            }), 403
        
        sent_count = SubscriptionHelper.check_and_send_notifications()
        
        return jsonify({
            'success': True,
            'sent_count': sent_count,
            'message': f'Sent {sent_count} notifications'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'SEND_FAILED',
                'message': f'Failed to send notifications: {str(e)}'
            }
        }), 500

@subscription_bp.route('/admin/expiring', methods=['GET'])
@jwt_required()
def get_expiring_subscriptions():
    """Get subscriptions expiring soon (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'hoster':
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Admin access required'
                }
            }), 403
        
        days_ahead = request.args.get('days', 30, type=int)
        expiring_subscriptions = SubscriptionHelper.get_expiring_subscriptions(days_ahead)
        
        return jsonify({
            'success': True,
            'subscriptions': [sub.to_dict() for sub in expiring_subscriptions],
            'count': len(expiring_subscriptions)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'FETCH_FAILED',
                'message': f'Failed to fetch expiring subscriptions: {str(e)}'
            }
        }), 500

@subscription_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_subscription_stats():
    """Get subscription statistics (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.user_type != 'hoster':
            return jsonify({
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Admin access required'
                }
            }), 403
        
        # Get subscription counts by plan type
        stats = {}
        for plan_type in SubscriptionPlanType:
            count = DaycareSubscription.query.join(SubscriptionPlan).filter(
                SubscriptionPlan.plan_type == plan_type,
                DaycareSubscription.status == SubscriptionStatus.ACTIVE
            ).count()
            stats[plan_type.value] = count
        
        # Get total active subscriptions
        total_active = DaycareSubscription.query.filter_by(status=SubscriptionStatus.ACTIVE).count()
        
        # Get expiring soon
        expiring_30_days = len(SubscriptionHelper.get_expiring_subscriptions(30))
        expiring_7_days = len(SubscriptionHelper.get_expiring_subscriptions(7))
        
        return jsonify({
            'success': True,
            'stats': {
                'by_plan_type': stats,
                'total_active': total_active,
                'expiring_30_days': expiring_30_days,
                'expiring_7_days': expiring_7_days
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'FETCH_FAILED',
                'message': f'Failed to fetch subscription stats: {str(e)}'
            }
        }), 500

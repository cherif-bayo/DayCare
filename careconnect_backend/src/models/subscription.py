# src/models/subscription.py
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
from src.models.user import db
from enum import Enum
from sqlalchemy import Numeric


class SubscriptionPlanType(Enum):
    FREE = 'free'
    MONTHLY = 'monthly'
    YEARLY = 'yearly'
    LIFETIME = 'lifetime'

class SubscriptionStatus(Enum):
    ACTIVE = 'active'
    EXPIRED = 'expired'
    CANCELLED = 'cancelled'
    PENDING = 'pending'

class SubscriptionPlan(db.Model):
    """Subscription plans available in the system"""
    __tablename__ = 'subscription_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    plan_type = db.Column(db.Enum(SubscriptionPlanType), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    currency = db.Column(db.String(3), default='CAD')
    duration_months = db.Column(db.Integer)  # NULL for lifetime
    description = db.Column(db.Text)
    features = db.Column(db.Text)  # JSON string of features
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = db.relationship('DaycareSubscription', backref='plan', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'plan_type': self.plan_type.value,
            'price': float(self.price),
            'currency': self.currency,
            'duration_months': self.duration_months,
            'description': self.description,
            'features': self.features,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DaycareSubscription(db.Model):
    """Subscription records for each daycare"""
    __tablename__ = 'daycare_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plans.id'), nullable=False)
    status = db.Column(db.Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    
    # Subscription dates
    start_date = db.Column(db.Date, nullable=False, default=date.today)
    end_date = db.Column(db.Date)  # NULL for lifetime subscriptions
    trial_end_date = db.Column(db.Date)  # For free trial tracking
    
    # Payment tracking
    last_payment_date = db.Column(db.Date)
    next_payment_date = db.Column(db.Date)
    auto_renew = db.Column(db.Boolean, default=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = db.Column(db.DateTime)
    cancelled_reason = db.Column(db.String(500))
    
    # Relationships
    daycare = db.relationship('Daycare', backref='subscriptions')
    notifications = db.relationship('SubscriptionNotification', backref='subscription', cascade='all, delete-orphan')
    
    def is_active(self):
        """Check if subscription is currently active"""
        if self.status != SubscriptionStatus.ACTIVE:
            return False
        
        if self.end_date and self.end_date < date.today():
            return False
            
        return True
    
    def is_trial(self):
        """Check if subscription is in trial period"""
        if not self.trial_end_date:
            return False
        return date.today() <= self.trial_end_date
    
    def days_until_expiry(self):
        """Get days until subscription expires"""
        if not self.end_date:
            return None  # Lifetime subscription
        
        delta = self.end_date - date.today()
        return delta.days
    
    def days_until_trial_end(self):
        """Get days until trial ends"""
        if not self.trial_end_date:
            return None
        
        delta = self.trial_end_date - date.today()
        return delta.days
    
    def calculate_end_date(self):
        """Calculate end date based on plan duration"""
        if self.plan.plan_type == SubscriptionPlanType.LIFETIME:
            return None
        
        if self.plan.duration_months:
            return self.start_date + relativedelta(months=self.plan.duration_months)
        
        return None
    
    def renew_subscription(self):
        """Renew the subscription for another period"""
        if self.plan.plan_type == SubscriptionPlanType.LIFETIME:
            return  # Lifetime subscriptions don't need renewal
        
        if self.plan.duration_months:
            self.start_date = self.end_date or date.today()
            self.end_date = self.start_date + relativedelta(months=self.plan.duration_months)
            self.last_payment_date = date.today()
            self.next_payment_date = self.end_date
            self.status = SubscriptionStatus.ACTIVE
            self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_plan=True):
        result = {
            'id': self.id,
            'daycare_id': self.daycare_id,
            'plan_id': self.plan_id,
            'status': self.status.value,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'trial_end_date': self.trial_end_date.isoformat() if self.trial_end_date else None,
            'last_payment_date': self.last_payment_date.isoformat() if self.last_payment_date else None,
            'next_payment_date': self.next_payment_date.isoformat() if self.next_payment_date else None,
            'auto_renew': self.auto_renew,
            'is_active': self.is_active(),
            'is_trial': self.is_trial(),
            'days_until_expiry': self.days_until_expiry(),
            'days_until_trial_end': self.days_until_trial_end(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'cancelled_reason': self.cancelled_reason
        }
        
        if include_plan and self.plan:
            result['plan'] = self.plan.to_dict()
        
        return result

class SubscriptionNotification(db.Model):
    """Notifications for subscription events"""
    __tablename__ = 'subscription_notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    subscription_id = db.Column(db.Integer, db.ForeignKey('daycare_subscriptions.id'), nullable=False)
    notification_type = db.Column(db.Enum('trial_ending', 'subscription_ending', 'subscription_expired', 'payment_due', 'renewal_reminder', name='notification_types'), nullable=False)
    
    # Notification content
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    
    # Scheduling
    scheduled_date = db.Column(db.Date, nullable=False)
    sent_at = db.Column(db.DateTime)
    is_sent = db.Column(db.Boolean, default=False)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'subscription_id': self.subscription_id,
            'notification_type': self.notification_type,
            'title': self.title,
            'message': self.message,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'is_sent': self.is_sent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SubscriptionHelper:
    """Helper class for subscription management"""
    
    @staticmethod
    def create_default_plans():
        """Create default subscription plans"""
        plans = [
            {
                'name': 'Free Trial',
                'plan_type': SubscriptionPlanType.FREE,
                'price': 0.00,
                'duration_months': 12,  # 1 year free trial
                'description': 'Free trial for 1 year - perfect for getting started',
                'features': '["Complete daycare management", "Child profiles", "Parent portal", "Basic reporting", "Free support"]'
            },
            {
                'name': 'Monthly Plan',
                'plan_type': SubscriptionPlanType.MONTHLY,
                'price': 250.00,
                'duration_months': 1,
                'description': 'Flexible monthly subscription after free trial',
                'features': '["All features included", "Advanced reporting", "Priority support", "No long-term commitment"]'
            },
            {
                'name': 'Annual Plan',
                'plan_type': SubscriptionPlanType.YEARLY,
                'price': 1500.00,
                'duration_months': 12,
                'description': 'Best value - save $1,500 per year',
                'features': '["All features included", "Advanced reporting", "Priority support", "Annual billing discount"]'
            },
            {
                'name': 'Lifetime Access',
                'plan_type': SubscriptionPlanType.LIFETIME,
                'price': 3000.00,
                'duration_months': None,
                'description': 'Pay once, use forever',
                'features': '["All features forever", "Lifetime support", "No recurring payments", "Future updates included"]'
            }
        ]
        
        for plan_data in plans:
            existing = SubscriptionPlan.query.filter_by(name=plan_data['name']).first()
            if not existing:
                plan = SubscriptionPlan(**plan_data)
                db.session.add(plan)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error creating subscription plans: {e}")
    
    @staticmethod
    def create_subscription_for_daycare(daycare_id, plan_type_str, start_trial=True):
        """Create a subscription for a daycare"""
        try:
            plan_type = SubscriptionPlanType(plan_type_str)
        except ValueError:
            return None, "Invalid plan type"
        
        plan = SubscriptionPlan.query.filter_by(plan_type=plan_type, is_active=True).first()
        if not plan:
            return None, "Plan not found"
        
        # Check if daycare already has an active subscription
        existing = DaycareSubscription.query.filter_by(
            daycare_id=daycare_id,
            status=SubscriptionStatus.ACTIVE
        ).first()
        
        if existing:
            return None, "Daycare already has an active subscription"
        
        # Create subscription
        subscription = DaycareSubscription(
            daycare_id=daycare_id,
            plan_id=plan.id,
            start_date=date.today(),
            status=SubscriptionStatus.ACTIVE
        )
        
        # Set trial period for free plans
        if start_trial and plan.plan_type == SubscriptionPlanType.FREE:
            subscription.trial_end_date = date.today() + relativedelta(months=12)
        
        # Calculate end date
        subscription.end_date = subscription.calculate_end_date()
        
        # Set next payment date for paid plans
        if plan.plan_type != SubscriptionPlanType.FREE and plan.plan_type != SubscriptionPlanType.LIFETIME:
            subscription.next_payment_date = subscription.end_date
        
        db.session.add(subscription)
        
        try:
            db.session.commit()
            
            # Schedule notifications
            SubscriptionHelper.schedule_notifications(subscription)
            
            return subscription, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)
    
    @staticmethod
    def schedule_notifications(subscription):
        """Schedule notifications for a subscription"""
        notifications = []
        
        # Trial ending notifications (for free plans)
        if subscription.trial_end_date:
            # 30 days before trial ends
            notify_30_days = subscription.trial_end_date - timedelta(days=30)
            if notify_30_days >= date.today():
                notifications.append(SubscriptionNotification(
                    subscription_id=subscription.id,
                    notification_type='trial_ending',
                    title='Trial Ending Soon',
                    message=f'Your free trial will end in 30 days on {subscription.trial_end_date.strftime("%B %d, %Y")}. Choose a subscription plan to continue using CareConnect.',
                    scheduled_date=notify_30_days
                ))
            
            # 7 days before trial ends
            notify_7_days = subscription.trial_end_date - timedelta(days=7)
            if notify_7_days >= date.today():
                notifications.append(SubscriptionNotification(
                    subscription_id=subscription.id,
                    notification_type='trial_ending',
                    title='Trial Ending This Week',
                    message=f'Your free trial will end in 7 days on {subscription.trial_end_date.strftime("%B %d, %Y")}. Please select a subscription plan to avoid service interruption.',
                    scheduled_date=notify_7_days
                ))
        
        # Subscription ending notifications (for paid plans)
        if subscription.end_date and subscription.plan.plan_type != SubscriptionPlanType.LIFETIME:
            # 30 days before subscription ends
            notify_30_days = subscription.end_date - timedelta(days=30)
            if notify_30_days >= date.today():
                notifications.append(SubscriptionNotification(
                    subscription_id=subscription.id,
                    notification_type='subscription_ending',
                    title='Subscription Renewal Due Soon',
                    message=f'Your {subscription.plan.name} subscription will expire on {subscription.end_date.strftime("%B %d, %Y")}. Renew now to continue your service.',
                    scheduled_date=notify_30_days
                ))
            
            # 7 days before subscription ends
            notify_7_days = subscription.end_date - timedelta(days=7)
            if notify_7_days >= date.today():
                notifications.append(SubscriptionNotification(
                    subscription_id=subscription.id,
                    notification_type='subscription_ending',
                    title='Subscription Expires This Week',
                    message=f'Your {subscription.plan.name} subscription expires in 7 days on {subscription.end_date.strftime("%B %d, %Y")}. Renew immediately to avoid service interruption.',
                    scheduled_date=notify_7_days
                ))
        
        # Add notifications to database
        for notification in notifications:
            db.session.add(notification)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error scheduling notifications: {e}")
    
    @staticmethod
    def check_and_send_notifications():
        """Check for notifications that need to be sent today"""
        today = date.today()
        
        pending_notifications = SubscriptionNotification.query.filter(
            SubscriptionNotification.scheduled_date <= today,
            SubscriptionNotification.is_sent == False
        ).all()
        
        sent_count = 0
        for notification in pending_notifications:
            # Here you would integrate with your email/SMS service
            # For now, we'll just mark as sent
            notification.is_sent = True
            notification.sent_at = datetime.utcnow()
            sent_count += 1
        
        try:
            db.session.commit()
            return sent_count
        except Exception as e:
            db.session.rollback()
            print(f"Error sending notifications: {e}")
            return 0
    
    @staticmethod
    def get_expiring_subscriptions(days_ahead=30):
        """Get subscriptions expiring within specified days"""
        cutoff_date = date.today() + timedelta(days=days_ahead)
        
        return DaycareSubscription.query.filter(
            DaycareSubscription.status == SubscriptionStatus.ACTIVE,
            DaycareSubscription.end_date <= cutoff_date,
            DaycareSubscription.end_date >= date.today()
        ).all()
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, session, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import check_password_hash
import json
import csv
import io
from datetime import datetime, timedelta
from sqlalchemy import func, desc, asc
from sqlalchemy.orm import joinedload
from src.models.activity import Activity
from src.models.user import Daycare
from sqlalchemy import func

# Import all models
from src.models.user import db, User, WebsiteHoster, Daycare, DaycareStaff, Parent
from src.models.child import Child, ParentChildRelationship, RegistrationRequest
from src.models.incident import Incident, IncidentFollowup
from src.models.payment import PaymentPlan, ChildPaymentAssignment, Invoice, InvoiceLineItem, Payment
from src.models.activity import Activity, ChildActivityParticipation, Message, AuditLog, SystemSetting

admin_web_bp = Blueprint('admin_web', __name__, template_folder='../templates')

# Authentication decorator for admin web interface
def admin_required(f):
    def decorated_function(*args, **kwargs):
        if 'admin_user_id' not in session:
            return redirect(url_for('admin_web.login'))
        
        user = User.query.get(session['admin_user_id'])
        if not user or user.user_type != 'hoster':
            session.pop('admin_user_id', None)
            return redirect(url_for('admin_web.login'))
        
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_web_bp.route('/admin')
@admin_required
def dashboard():
    """Admin Dashboard - Overview of all system data"""
    
    # Get statistics
    stats = {
        'total_users': User.query.count(),
        'total_daycares': Daycare.query.count(),
        'total_parents': Parent.query.count(),
        'total_children': Child.query.count(),
        'total_activities': Activity.query.count(),
        'total_incidents': Incident.query.count(),
        'total_payments': Payment.query.count(),
        'active_daycares': Daycare.query.filter_by(subscription_status='active').count(),
        'pending_registrations': RegistrationRequest.query.filter_by(status='pending').count(),
        'recent_incidents': Incident.query.filter(Incident.severity.in_(['serious', 'emergency'])).count()
    }
    
    # Get recent activities
    recent_activities = (Activity.query
                        .order_by(desc(Activity.created_at))
                        .limit(10)
                        .all())
    
    # Get recent incidents
    recent_incidents = (Incident.query
                       .order_by(desc(Incident.created_at))
                       .limit(5)
                       .all())
    
    # Get monthly registration trends
    monthly_registrations = (db.session.query(
        func.to_char(User.created_at, 'YYYY-MM').label('month'),
        func.count(User.id).label('count')
    ).filter(User.created_at >= datetime.now() - timedelta(days=365))
     .group_by(func.to_char(User.created_at, 'YYYY-MM'))
     .order_by(func.to_char(User.created_at, 'YYYY-MM'))
     .all())
    
    return render_template('admin/dashboard.html', 
                         stats=stats, 
                         recent_activities=recent_activities,
                         recent_incidents=recent_incidents,
                         monthly_registrations=monthly_registrations,
                         current_date=datetime.now().strftime('%B %d, %Y'),
                         current_time=datetime.now().strftime('%I:%M %p'))

@admin_web_bp.route('/admin/login', methods=['GET', 'POST'])
def login():
    """Admin Login Page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email, user_type='hoster').first()
        
        if user and user.check_password(password):
            session['admin_user_id'] = user.id
            flash('Successfully logged in!', 'success')
            return redirect(url_for('admin_web.dashboard'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('admin/login.html')

@admin_web_bp.route('/admin/logout')
def logout():
    """Admin Logout"""
    session.pop('admin_user_id', None)
    flash('Successfully logged out!', 'success')
    return redirect(url_for('admin_web.login'))

# USERS MANAGEMENT
@admin_web_bp.route('/admin/users')
@admin_required
def users():
    """Users Management Page"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    user_type = request.args.get('type', '')
    
    query = User.query
    
    if search:
        query = query.filter(User.email.contains(search))
    
    if user_type:
        query = query.filter(User.user_type == user_type)
    
    users = query.order_by(desc(User.created_at)).paginate(
        page=page, per_page=20, error_out=False)
    
    return render_template('admin/users.html', users=users, search=search, user_type=user_type)

@admin_web_bp.route('/admin/users/<int:user_id>')
@admin_required
def user_detail(user_id):
    """User Detail Page"""
    user = User.query.get_or_404(user_id)
    
    # Get user-specific data based on type
    profile_data = None
    if user.user_type == 'daycare':
        profile_data = Daycare.query.filter_by(user_id=user.id).first()
    elif user.user_type == 'parent':
        profile_data = Parent.query.filter_by(user_id=user.id).first()
    elif user.user_type == 'hoster':
        profile_data = WebsiteHoster.query.filter_by(user_id=user.id).first()
    
    return render_template('admin/user_detail.html', user=user, profile_data=profile_data)

@admin_web_bp.route('/admin/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_user_status(user_id):
    """Toggle User Active Status"""
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    
    status = "activated" if user.is_active else "deactivated"
    flash(f'User {user.email} has been {status}!', 'success')
    return redirect(url_for('admin_web.user_detail', user_id=user_id))

# DAYCARES MANAGEMENT
@admin_web_bp.route('/admin/daycares')
@admin_required
def daycares():
    """Daycares Management Page"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    
    query = Daycare.query
    
    if search:
        query = query.filter(Daycare.name.contains(search))
    
    daycares = query.order_by(desc(Daycare.created_at)).paginate(
        page=page, per_page=20, error_out=False)
    
    return render_template('admin/daycares.html', daycares=daycares, search=search)

@admin_web_bp.route('/admin/daycares/<int:daycare_id>')
@admin_required
def daycare_detail(daycare_id):
    """Daycare Detail Page"""
    daycare = Daycare.query.options(joinedload(Daycare.user)).get_or_404(daycare_id)
    
    # Get daycare statistics
    children_count = Child.query.filter_by(daycare_id=daycare_id).count()
    staff_count = DaycareStaff.query.filter_by(daycare_id=daycare_id).count()
    activities_count = Activity.query.join(Child).filter(Child.daycare_id == daycare_id).count()
    incidents_count = Incident.query.join(Child).filter(Child.daycare_id == daycare_id).count()
    
    stats = {
        'children': children_count,
        'staff': staff_count,
        'activities': activities_count,
        'incidents': incidents_count
    }
    
    # Get recent children
    recent_children = (Child.query
                      .filter_by(daycare_id=daycare_id)
                      .order_by(desc(Child.created_at))
                      .limit(5)
                      .all())
    
    return render_template('admin/daycare_detail.html', 
                         daycare=daycare, 
                         stats=stats, 
                         recent_children=recent_children)

# CHILDREN MANAGEMENT
@admin_web_bp.route('/admin/children')
@admin_required
def children():
    """Children Management Page"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    daycare_filter = request.args.get('daycare', '')
    age_filter = request.args.get('age', '')
    
    query = Child.query
    
    if search:
        query = query.filter(
            (Child.first_name.contains(search)) |
            (Child.last_name.contains(search))
        )
    
    if daycare_filter:
        query = query.filter(Child.daycare_id == daycare_filter)
    
    if age_filter:
        if age_filter == 'infant':
            query = query.filter(Child.age_group == 'Under 19 months of age')
        elif age_filter == 'toddler':
            query = query.filter(Child.age_group == '19 months old to kindergarten')
        elif age_filter == 'school':
            query = query.filter(Child.age_group == 'Kindergarten to Grade 6')
    
    children = query.paginate(
        page=page, per_page=20, error_out=False
    )
    
    daycares = Daycare.query.all()

    stats = {
         'total_children': Child.query.count(),
         'active_today': Child.query.filter(Child.status == 'active').count(),
         'pending_enrollment': Child.query.filter(Child.status == 'pending').count(),
         'medical_alerts': Child.query.filter(
             (Child.allergies.isnot(None)) | (Child.medical_conditions.isnot(None))
         ).count()
     }
    
    return render_template('admin/children.html',
                         stats=stats, 
                         children=children, 
                         daycares=daycares,
                         search=search,
                         daycare_filter=daycare_filter,
                         age_filter=age_filter)

@admin_web_bp.route('/admin/children/<int:child_id>')
@admin_required
def child_detail(child_id):
    """Child Detail Page"""
    child = Child.query.get_or_404(child_id)
    
    # Get child's activities
    activities = (Activity.query
                 .join(ChildActivityParticipation)
                 .filter(ChildActivityParticipation.child_id == child_id)
                 .order_by(desc(Activity.created_at))
                 .limit(10)
                 .all())
    
    # Get child's incidents
    incidents = (Incident.query
                .filter(Incident.child_id == child_id)
                .order_by(desc(Incident.created_at))
                .limit(10)
                .all())
    
    # Get child's payments
    payments = (Payment.query
               .join(Invoice)
               .join(ChildPaymentAssignment)
               .filter(ChildPaymentAssignment.child_id == child_id)
               .order_by(desc(Payment.created_at))
               .limit(10)
               .all())
    
    return render_template('admin/child_detail.html',
                         child=child,
                         activities=activities,
                         incidents=incidents,
                         payments=payments)

# ACTIVITIES MANAGEMENT
@admin_web_bp.route('/admin/activities')
@admin_required
def activities():
    """Activities Management Page"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    activity_type_filter = request.args.get('activity_type', '')
    daycare_filter = request.args.get('daycare', '')
    date_filter = request.args.get('date', '')
    
    query = Activity.query
    
    if search:
        query = query.filter(
            (Activity.title.contains(search)) |
            (Activity.description.contains(search))
        )
    
    if activity_type_filter:
        query = query.filter(Activity.activity_type == activity_type_filter)
    
    if daycare_filter:
        query = query.filter(Activity.daycare_id == daycare_filter)
    
    if date_filter:
        try:
            filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            query = query.filter(func.date(Activity.scheduled_date) == filter_date)
        except ValueError:
            pass
    
    activities = query.order_by(desc(Activity.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    daycares = Daycare.query.all()

    stats = {
        'total_activities': Activity.query.count(),
        'recent_activities': Activity.query.order_by(desc(Activity.created_at)).limit(5).count(),
        'upcoming': Activity.query.filter(Activity.scheduled_date >= datetime.today()).count(),
        'past': Activity.query.filter(Activity.scheduled_date < datetime.today()).count()
    }
    
    return render_template('admin/activities.html',
                         stats=stats,
                         activities=activities,
                         daycares=daycares,
                         search=search,
                         activity_type_filter=activity_type_filter,
                         daycare_filter=daycare_filter,
                         date_filter=date_filter)

@admin_web_bp.route('/admin/activities/<int:activity_id>')
@admin_required
def activity_detail(activity_id):
    """Activity Detail Page"""
    activity = Activity.query.get_or_404(activity_id)
    
    # Get participating children
    participants = (Child.query
                   .join(ChildActivityParticipation)
                   .filter(ChildActivityParticipation.activity_id == activity_id)
                   .all())
    
    return render_template('admin/activity_detail.html',
                         activity=activity,
                         participants=participants)

# INCIDENTS MANAGEMENT
@admin_web_bp.route('/admin/incidents')
@admin_required
def incidents():
    """Incidents Management Page"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    severity_filter = request.args.get('severity', '')
    status_filter = request.args.get('status', '')
    daycare_filter = request.args.get('daycare', '')
    
    query = Incident.query
    
    if search:
        query = query.filter(
            (Incident.title.contains(search)) |
            (Incident.description.contains(search))
        )
    
    if severity_filter:
        query = query.filter(Incident.severity == severity_filter)
    
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    
    if daycare_filter:
        query = query.filter(Incident.daycare_id == daycare_filter)
    
    incidents = query.order_by(desc(Incident.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )

    incidents = query.order_by(desc(Incident.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    daycares = Daycare.query.all()

    stats = {
         'total_incidents': Incident.query.count(),
         'serious_incidents': Incident.query.filter(Incident.severity == 'serious').count(),
         'emergency_incidents': Incident.query.filter(Incident.severity == 'emergency').count(),
         'pending_followups':   IncidentFollowup.query.filter_by(next_action_required=True).count()
     }
    
    return render_template('admin/incidents.html',
                         stats=stats,
                         incidents=incidents,
                         daycares=daycares,
                         search=search,
                         severity_filter=severity_filter,
                         status_filter=status_filter,
                         daycare_filter=daycare_filter)

@admin_web_bp.route('/admin/incidents/<int:incident_id>')
@admin_required
def incident_detail(incident_id):
    """Incident Detail Page"""
    incident = Incident.query.get_or_404(incident_id)
    
    # Get incident followups
    followups = (IncidentFollowup.query
                .filter(IncidentFollowup.incident_id == incident_id)
                .order_by(asc(IncidentFollowup.created_at))
                .all())
    
    return render_template('admin/incident_detail.html',
                         incident=incident,
                         followups=followups)

# PAYMENTS MANAGEMENT
@admin_web_bp.route('/admin/payments')
@admin_required
def payments():
    """Payments Management Page"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    
    query = Payment.query.join(Invoice).join(Child).options(
        joinedload(Payment.invoice).joinedload(Invoice.child).joinedload(Child.daycare)
    )
    
    if search:
        query = query.filter(Payment.payment_reference.contains(search))
    
    if status:
        query = query.filter(Payment.payment_status == status)
    
    payments = query.order_by(desc(Payment.created_at)).paginate(
        page=page, per_page=20, error_out=False)
    
    return render_template('admin/payments.html', 
                         payments=payments, 
                         search=search, 
                         status=status)

# SYSTEM SETTINGS
@admin_web_bp.route('/admin/settings')
@admin_required
def settings():
    """System Settings Page"""
    
    # Get current system settings
    settings_data = {}
    system_settings = SystemSetting.query.all()
    for setting in system_settings:
        settings_data[setting.setting_key] = setting.setting_value
    
    # Default settings if not in database
    default_settings = {
        'app_name': 'CareConnect Canada',
        'app_version': '1.0.0',
        'default_language': 'en',
        'timezone': 'America/Toronto',
        'company_name': 'CareConnect Canada Inc.',
        'support_email': 'support@careconnect.ca',
        'support_phone': '+1 (800) 123-4567',
        'business_hours': 'Monday - Friday, 8:00 AM - 6:00 PM EST',
        'user_registration_enabled': 'true',
        'email_notifications_enabled': 'true',
        'sms_notifications_enabled': 'false',
        'maintenance_mode': 'false',
        'password_min_length': '8',
        'password_expiry_days': '90',
        'require_uppercase': 'true',
        'require_lowercase': 'true',
        'require_numbers': 'true',
        'require_special_chars': 'false',
        'session_timeout_minutes': '30',
        'max_failed_login_attempts': '5',
        'require_2fa_admin': 'true',
        'allow_sms_2fa': 'true',
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': '587',
        'from_email': 'noreply@careconnect.ca',
        'from_name': 'CareConnect Canada',
        'backup_frequency': 'daily',
        'backup_retention_days': '30',
        'api_rate_limit': '100',
        'enable_api_docs': 'true',
        'db_connection_pool_size': '20',
        'db_query_timeout': '30',
        'log_level': 'INFO',
        'enable_audit_logging': 'true'
    }
    
    # Merge with defaults
    for key, default_value in default_settings.items():
        if key not in settings_data:
            settings_data[key] = default_value
    
    return render_template('admin/settings.html',
                         settings=settings_data,
                         current_date=datetime.now().strftime('%B %d, %Y'),
                         current_time=datetime.now().strftime('%I:%M %p'))

@admin_web_bp.route('/admin/settings/save', methods=['POST'])
@admin_required
def save_settings():
    """Save System Settings"""
    try:
        settings_data = request.get_json()
        
        for key, value in settings_data.items():
            setting = SystemSetting.query.filter_by(key=key).first()
            if setting:
                setting.setting_value = str(value)
                setting.updated_at = datetime.utcnow()
            else:
                setting = SystemSetting(
                    setting_key=key,
                    setting_value=str(value),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(setting)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Settings saved successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error saving settings: {str(e)}'
        }), 500

# EXPORT FUNCTIONALITY
@admin_web_bp.route('/admin/export/<entity_type>')
@admin_required
def export_data(entity_type):
    """Export data to CSV"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    if entity_type == 'users':
        writer.writerow(['ID', 'Email', 'Type', 'Active', 'Created At'])
        users = User.query.all()
        for user in users:
            writer.writerow([user.id, user.email, user.user_type, user.is_active, user.created_at])
    
    elif entity_type == 'daycares':
        writer.writerow(['ID', 'Name', 'Email', 'Phone', 'Address', 'Created At'])
        daycares = Daycare.query.options(joinedload(Daycare.user)).all()
        for daycare in daycares:
            writer.writerow([
                daycare.id, daycare.daycare_name, daycare.user.email,
                daycare.phone_number, daycare.address, daycare.created_at
            ])
    
    elif entity_type == 'children':
        writer.writerow(['ID', 'First Name', 'Last Name', 'DOB', 'Daycare', 'Created At'])
        children = Child.query.options(joinedload(Child.daycare)).all()
        for child in children:
            writer.writerow([
                child.id, child.first_name, child.last_name, child.date_of_birth,
                child.daycare.daycare_name if child.daycare else 'N/A', child.created_at
            ])
    
    elif entity_type == 'incidents':
        writer.writerow(['ID', 'Type', 'Severity', 'Child', 'Daycare', 'Date'])
        incidents = Incident.query.options(
            joinedload(Incident.child).joinedload(Child.daycare)
        ).all()
        for incident in incidents:
            writer.writerow([
                incident.id, incident.incident_type, incident.severity,
                f"{incident.child.first_name} {incident.child.last_name}",
                incident.child.daycare.daycare_name if incident.child.daycare else 'N/A',
                incident.incident_date
            ])
    
    output.seek(0)
    
    # Create file-like object
    file_output = io.BytesIO()
    file_output.write(output.getvalue().encode('utf-8'))
    file_output.seek(0)
    
    return send_file(
        file_output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'{entity_type}_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    )

# API ENDPOINTS FOR AJAX CALLS
@admin_web_bp.route('/admin/api/stats')
@admin_required
def api_stats():
    """API endpoint for dashboard statistics"""
    stats = {
        'total_users': User.query.count(),
        'total_daycares': Daycare.query.count(),
        'total_children': Child.query.count(),
        'total_activities': Activity.query.count(),
        'total_incidents': Incident.query.count(),
        'active_daycares': Daycare.query.join(User).filter(User.is_active == True).count(),
    }
    return jsonify(stats)

@admin_web_bp.route('/admin/api/recent-activities')
@admin_required
def api_recent_activities():
    """API endpoint for recent activities"""
    activities = (Activity.query
                 .options(joinedload(Activity.child))
                 .order_by(desc(Activity.created_at))
                 .limit(5)
                 .all())
    
    data = []
    for activity in activities:
        data.append({
            'id': activity.id,
            'title': activity.activity_title,
            'child_name': f"{activity.child.first_name} {activity.child.last_name}",
            'date': activity.activity_date.isoformat() if activity.activity_date else None,
            'type': activity.activity_type
        })
    
    return jsonify(data)


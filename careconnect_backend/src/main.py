# main.py

import os
import sys
from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS
from datetime import timedelta
from flask_migrate import Migrate
load_dotenv()
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

# Import all models
from src.models.user import db, User, WebsiteHoster, Daycare, DaycareStaff, Parent
from src.models.child import Child, ParentChildRelationship, RegistrationRequest
from src.models.incident import Incident, IncidentFollowup
from src.models.payment import PaymentPlan, ChildPaymentAssignment, Invoice, InvoiceLineItem, Payment
from src.models.activity import Activity, ChildActivityParticipation, Message, AuditLog, SystemSetting
from src.routes.children import children_bp
from src.models.age_group import AgeGroup, AgeGroupHelper


# Import routes
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.admin_web import admin_web_bp
from src.routes.daycare import daycare_bp
from src.routes.parent import parent_bp
from src.routes.public import public_bp
from src.routes.age_groups import age_groups_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Enable Flask’s debug logging
app.config['DEBUG'] = True
import logging
app.logger.setLevel(logging.DEBUG)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'careconnect-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
# print("[DEBUG] JWT_SECRET_KEY:", app.config['JWT_SECRET_KEY'])

# Database configuration
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, origins="*")  # Allow all origins for development

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(admin_web_bp)  # Admin web interface (no prefix)

app.register_blueprint(parent_bp, url_prefix='/api/parent')
app.register_blueprint(public_bp, url_prefix='/api/public')
app.register_blueprint(children_bp, url_prefix='/api/daycare/children')
app.register_blueprint(daycare_bp, url_prefix='/api/daycare')
app.register_blueprint(age_groups_bp, url_prefix="/api/daycare/age-groups")

# Create database tables
with app.app_context():
    db.create_all()

    # NEW: Ensure standard age groups exist
    AgeGroupHelper.ensure_standard_age_groups()
    
    # Create default system settings
    if not SystemSetting.query.filter_by(setting_key='app_name').first():
        app_name_setting = SystemSetting(
            setting_key='app_name',
            setting_value='CareConnect Canada',
            setting_type='string',
            description='Application name',
            is_public=True
        )
        db.session.add(app_name_setting)
    
    if not SystemSetting.query.filter_by(setting_key='supported_languages').first():
        languages_setting = SystemSetting(
            setting_key='supported_languages',
            setting_value='["en", "fr"]',
            setting_type='json',
            description='Supported languages',
            is_public=True
        )
        db.session.add(languages_setting)
    
    # Create default admin user if none exists
    if not User.query.filter_by(user_type='hoster').first():
        admin_user = User(
            email='admin@careconnect.ca',
            user_type='hoster',
            is_active=True,
            email_verified=True
        )
        admin_user.set_password('admin123')  # Change this in production
        db.session.add(admin_user)
        db.session.flush()
        
        admin_hoster = WebsiteHoster(
            user_id=admin_user.id,
            first_name='System',
            last_name='Administrator',
            admin_level='super_admin'
        )
        db.session.add(admin_hoster)
    
    db.session.commit()

# JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("[JWT DEBUG] Invalid token:", error)
    return {'error': {'code': 'INVALID_TOKEN', 'message': 'Invalid token'}}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print("[JWT DEBUG] Unauthorized:", error)
    return {'error': {'code': 'AUTHENTICATION_REQUIRED', 'message': 'Authentication token required'}}, 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("[JWT DEBUG] Token expired")
    return {'error': {'code': 'TOKEN_EXPIRED', 'message': 'Token has expired'}}, 401

# Health check endpoint
@app.route('/api/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': db.func.now(),
        'version': '1.0.0'
    }

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


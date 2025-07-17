import os
import sys
from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_migrate import Migrate

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import models
from src.models.user import db, User, WebsiteHoster, Daycare, DaycareStaff, Parent
from src.models.child import Child, ParentChildRelationship, RegistrationRequest
from src.models.incident import Incident, IncidentFollowup
from src.models.payment import PaymentPlan, ChildPaymentAssignment, Invoice, InvoiceLineItem, Payment
from src.models.activity import Activity, ChildActivityParticipation, Message, AuditLog, SystemSetting
from src.models.age_group import AgeGroup, AgeGroupHelper
from src.models.subscription import SubscriptionPlan, DaycareSubscription, SubscriptionNotification, SubscriptionHelper

# Import routes
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.admin_web import admin_web_bp
from src.routes.daycare import daycare_bp
from src.routes.parent import parent_bp
from src.routes.public import public_bp
from src.routes.children import children_bp
from src.routes.age_groups import age_groups_bp
from src.routes.allergies import allergies_bp
from src.routes.subscriptions import subscription_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['DEBUG'] = True

# Core settings
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'careconnect-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Database setup
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
CORS(app, origins="*")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(admin_web_bp)
app.register_blueprint(daycare_bp, url_prefix='/api/daycare')
app.register_blueprint(parent_bp, url_prefix='/api/parent')
app.register_blueprint(public_bp, url_prefix='/api/public')
app.register_blueprint(children_bp, url_prefix='/api/daycare/children')
app.register_blueprint(age_groups_bp, url_prefix="/api/daycare/age-groups")
app.register_blueprint(allergies_bp)
app.register_blueprint(subscription_bp, url_prefix='/api/subscription')

# JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {'error': {'code': 'INVALID_TOKEN', 'message': 'Invalid token'}}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {'error': {'code': 'AUTHENTICATION_REQUIRED', 'message': 'Authentication token required'}}, 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
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
    if path and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    elif os.path.exists(os.path.join(static_folder_path, 'index.html')):
        return send_from_directory(static_folder_path, 'index.html')
    else:
        return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

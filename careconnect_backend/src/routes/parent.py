from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import and_, or_

from src.models.user import db, User, Parent
from src.models.child import Child, ParentChildRelationship
from src.models.incident import Incident
from src.models.payment import Invoice, Payment
from src.models.activity import ChildActivityParticipation

parent_bp = Blueprint('parent', __name__)

def get_parent():
    """Get current user's parent record"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.user_type != 'parent':
        return None
    
    return Parent.query.filter_by(user_id=user.id).first()

def require_parent():
    """Decorator to ensure user is a parent"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            parent = get_parent()
            if not parent:
                return jsonify({
                    'error': {
                        'code': 'PERMISSION_DENIED',
                        'message': 'Access denied. Parent privileges required.'
                    }
                }), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

def get_parent_children(parent_id):
    """Get all children associated with a parent"""
    relationships = ParentChildRelationship.query.filter_by(parent_id=parent_id).all()
    child_ids = [rel.child_id for rel in relationships]
    return Child.query.filter(Child.id.in_(child_ids)).all()

@parent_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@require_parent()
def dashboard():
    try:
        parent = get_parent()
        children = get_parent_children(parent.id)
        
        # Get recent activities for all children
        child_ids = [child.id for child in children]
        recent_activities = []
        if child_ids:
            recent_activities = ChildActivityParticipation.query\
                .filter(ChildActivityParticipation.child_id.in_(child_ids))\
                .order_by(ChildActivityParticipation.created_at.desc()).limit(10).all()
        
        # Get recent incidents for all children
        recent_incidents = []
        if child_ids:
            recent_incidents = Incident.query\
                .filter(Incident.child_id.in_(child_ids))\
                .order_by(Incident.created_at.desc()).limit(5).all()
        
        # Get pending payments
        pending_invoices = Invoice.query.filter_by(parent_id=parent.id, status='sent').all()
        
        return jsonify({
            'children': [child.to_dict() for child in children],
            'recent_activities': [activity.to_dict() for activity in recent_activities],
            'recent_incidents': [incident.to_dict() for incident in recent_incidents],
            'pending_payments': [invoice.to_dict() for invoice in pending_invoices]
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving dashboard data'
            }
        }), 500

@parent_bp.route('/children', methods=['GET'])
@jwt_required()
@require_parent()
def list_children():
    try:
        parent = get_parent()
        children = get_parent_children(parent.id)
        
        return jsonify({
            'children': [child.to_dict() for child in children]
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving children'
            }
        }), 500

@parent_bp.route('/children/<int:child_id>', methods=['GET'])
@jwt_required()
@require_parent()
def get_child(child_id):
    try:
        parent = get_parent()
        
        # Verify parent has access to this child
        relationship = ParentChildRelationship.query.filter_by(
            parent_id=parent.id, 
            child_id=child_id
        ).first()
        
        if not relationship:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found or access denied'
                }
            }), 404
        
        child = Child.query.get(child_id)
        if not child:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found'
                }
            }), 404
        
        # Get child's recent activities and incidents
        recent_activities = ChildActivityParticipation.query.filter_by(child_id=child_id)\
            .order_by(ChildActivityParticipation.created_at.desc()).limit(10).all()
        
        recent_incidents = Incident.query.filter_by(child_id=child_id)\
            .order_by(Incident.created_at.desc()).limit(10).all()
        
        child_data = child.to_dict()
        child_data['recent_activities'] = [activity.to_dict() for activity in recent_activities]
        child_data['recent_incidents'] = [incident.to_dict() for incident in recent_incidents]
        child_data['relationship'] = relationship.to_dict()
        
        return jsonify(child_data), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving child information'
            }
        }), 500

@parent_bp.route('/children/<int:child_id>/incidents', methods=['GET'])
@jwt_required()
@require_parent()
def get_child_incidents(child_id):
    try:
        parent = get_parent()
        
        # Verify parent has access to this child
        relationship = ParentChildRelationship.query.filter_by(
            parent_id=parent.id, 
            child_id=child_id
        ).first()
        
        if not relationship:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found or access denied'
                }
            }), 404
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        query = Incident.query.filter_by(child_id=child_id)
        
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

@parent_bp.route('/children/<int:child_id>/activities', methods=['GET'])
@jwt_required()
@require_parent()
def get_child_activities(child_id):
    try:
        parent = get_parent()
        
        # Verify parent has access to this child
        relationship = ParentChildRelationship.query.filter_by(
            parent_id=parent.id, 
            child_id=child_id
        ).first()
        
        if not relationship:
            return jsonify({
                'error': {
                    'code': 'CHILD_NOT_FOUND',
                    'message': 'Child not found or access denied'
                }
            }), 404
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        query = ChildActivityParticipation.query.filter_by(child_id=child_id)
        
        if date_from:
            query = query.filter(ChildActivityParticipation.participation_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        
        if date_to:
            query = query.filter(ChildActivityParticipation.participation_date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        
        total = query.count()
        activities = query.order_by(ChildActivityParticipation.created_at.desc())\
            .offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'activities': [activity.to_dict() for activity in activities],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving activities'
            }
        }), 500

@parent_bp.route('/invoices', methods=['GET'])
@jwt_required()
@require_parent()
def list_invoices():
    try:
        parent = get_parent()
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        status = request.args.get('status', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        query = Invoice.query.filter_by(parent_id=parent.id)
        
        if status:
            query = query.filter(Invoice.status == status)
        
        if date_from:
            query = query.filter(Invoice.billing_period_start >= datetime.strptime(date_from, '%Y-%m-%d').date())
        
        if date_to:
            query = query.filter(Invoice.billing_period_end <= datetime.strptime(date_to, '%Y-%m-%d').date())
        
        total = query.count()
        invoices = query.order_by(Invoice.created_at.desc())\
            .offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'invoices': [invoice.to_dict() for invoice in invoices],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving invoices'
            }
        }), 500

@parent_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
@require_parent()
def get_invoice(invoice_id):
    try:
        parent = get_parent()
        invoice = Invoice.query.filter_by(id=invoice_id, parent_id=parent.id).first()
        
        if not invoice:
            return jsonify({
                'error': {
                    'code': 'INVOICE_NOT_FOUND',
                    'message': 'Invoice not found'
                }
            }), 404
        
        # Get line items
        invoice_data = invoice.to_dict()
        invoice_data['line_items'] = [item.to_dict() for item in invoice.line_items]
        invoice_data['payments'] = [payment.to_dict() for payment in invoice.payments]
        
        return jsonify(invoice_data), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving invoice'
            }
        }), 500

@parent_bp.route('/payments', methods=['GET'])
@jwt_required()
@require_parent()
def list_payments():
    try:
        parent = get_parent()
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        query = Payment.query.filter_by(parent_id=parent.id)
        
        if date_from:
            query = query.filter(Payment.payment_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        
        if date_to:
            query = query.filter(Payment.payment_date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        
        total = query.count()
        payments = query.order_by(Payment.created_at.desc())\
            .offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments],
            'total': total,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred retrieving payments'
            }
        }), 500

@parent_bp.route('/payments', methods=['POST'])
@jwt_required()
@require_parent()
def process_payment():
    try:
        parent = get_parent()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Request data is required'
                }
            }), 422
        
        # Validate required fields
        required_fields = ['invoice_id', 'payment_method', 'amount']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': f'{field} is required'
                    }
                }), 422
        
        # Verify invoice belongs to parent
        invoice = Invoice.query.filter_by(id=data['invoice_id'], parent_id=parent.id).first()
        if not invoice:
            return jsonify({
                'error': {
                    'code': 'INVOICE_NOT_FOUND',
                    'message': 'Invoice not found'
                }
            }), 404
        
        # Create payment record
        payment = Payment(
            invoice_id=data['invoice_id'],
            parent_id=parent.id,
            payment_method=data['payment_method'],
            amount=data['amount'],
            payment_date=datetime.utcnow().date(),
            status='completed',  # In real implementation, this would be 'pending' until processed
            transaction_id=f"TXN_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            notes=data.get('notes')
        )
        
        db.session.add(payment)
        
        # Update invoice status if fully paid
        if invoice.calculate_balance() <= 0:
            invoice.status = 'paid'
        
        db.session.commit()
        
        return jsonify({
            'payment_id': payment.id,
            'status': payment.status,
            'message': 'Payment processed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An error occurred processing payment'
            }
        }), 500


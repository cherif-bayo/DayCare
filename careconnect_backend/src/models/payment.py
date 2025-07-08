from src.models.user import db
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import relationship
from src.models.child import Child

class PaymentPlan(db.Model):
    __tablename__ = 'payment_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    plan_name = db.Column(db.String(255), nullable=False)
    plan_type = db.Column(db.Enum('monthly', 'weekly', 'daily', 'hourly', name='plan_types'), nullable=False)
    base_amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='CAD')
    age_group = db.Column(db.String(50))
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    child_assignments = db.relationship('ChildPaymentAssignment', backref='payment_plan', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'daycare_id': self.daycare_id,
            'plan_name': self.plan_name,
            'plan_type': self.plan_type,
            'base_amount': float(self.base_amount) if self.base_amount else 0,
            'currency': self.currency,
            'age_group': self.age_group,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ChildPaymentAssignment(db.Model):
    __tablename__ = 'child_payment_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    payment_plan_id = db.Column(db.Integer, db.ForeignKey('payment_plans.id'), nullable=False)
    custom_amount = db.Column(db.Numeric(10, 2))
    discount_percentage = db.Column(db.Numeric(5, 2), default=0.00)
    discount_reason = db.Column(db.String(255))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_effective_amount(self):
        base_amount = self.custom_amount if self.custom_amount else self.payment_plan.base_amount
        if self.discount_percentage:
            discount = base_amount * (self.discount_percentage / 100)
            return base_amount - discount
        return base_amount
    
    def to_dict(self):
        return {
            'id': self.id,
            'child_id': self.child_id,
            'payment_plan_id': self.payment_plan_id,
            'custom_amount': float(self.custom_amount) if self.custom_amount else None,
            'discount_percentage': float(self.discount_percentage) if self.discount_percentage else 0,
            'discount_reason': self.discount_reason,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'effective_amount': float(self.get_effective_amount()),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.id'), nullable=False)
    daycare_id = db.Column(db.Integer, db.ForeignKey('daycares.id'), nullable=False)
    billing_period_start = db.Column(db.Date, nullable=False)
    billing_period_end = db.Column(db.Date, nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    child = relationship('Child', backref='invoices')
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0.00)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='CAD')
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('draft', 'sent', 'paid', 'overdue', 'cancelled', name='invoice_statuses'), default='draft')
    payment_terms = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    line_items = db.relationship('InvoiceLineItem', backref='invoice', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', cascade='all, delete-orphan')
    
    def calculate_balance(self):
        total_paid = sum(payment.amount for payment in self.payments if payment.status == 'completed')
        return self.total_amount - total_paid
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'parent_id': self.parent_id,
            'daycare_id': self.daycare_id,
            'billing_period_start': self.billing_period_start.isoformat() if self.billing_period_start else None,
            'billing_period_end': self.billing_period_end.isoformat() if self.billing_period_end else None,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'balance': float(self.calculate_balance()),
            'currency': self.currency,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'payment_terms': self.payment_terms,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class InvoiceLineItem(db.Model):
    __tablename__ = 'invoice_line_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'))
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), default=1.00)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    line_total = db.Column(db.Numeric(10, 2), nullable=False)
    item_type = db.Column(db.Enum('tuition', 'late_fee', 'supply_fee', 'field_trip', 'meal', 'other', name='line_item_types'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'child_id': self.child_id,
            'description': self.description,
            'quantity': float(self.quantity) if self.quantity else 1,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'line_total': float(self.line_total) if self.line_total else 0,
            'item_type': self.item_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.id'), nullable=False)
    payment_method = db.Column(db.Enum('credit_card', 'debit_card', 'bank_transfer', 'cash', 'cheque', 'other', name='payment_methods'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='CAD')
    transaction_id = db.Column(db.String(255))
    payment_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('pending', 'completed', 'failed', 'refunded', 'cancelled', name='payment_statuses'), nullable=False)
    failure_reason = db.Column(db.Text)
    processing_fee = db.Column(db.Numeric(10, 2), default=0.00)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'parent_id': self.parent_id,
            'payment_method': self.payment_method,
            'amount': float(self.amount) if self.amount else 0,
            'currency': self.currency,
            'transaction_id': self.transaction_id,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'status': self.status,
            'failure_reason': self.failure_reason,
            'processing_fee': float(self.processing_fee) if self.processing_fee else 0,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


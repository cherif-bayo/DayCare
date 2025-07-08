import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const PaymentManagement = () => {
  const { t } = useTranslation();
  const { token, isDaycare, isParent } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    child_id: '',
    amount: '',
    description: '',
    due_date: '',
    invoice_type: 'monthly_fee'
  });

  const invoiceTypes = [
    { value: 'monthly_fee', label: 'Monthly Fee' },
    { value: 'registration_fee', label: 'Registration Fee' },
    { value: 'late_fee', label: 'Late Fee' },
    { value: 'activity_fee', label: 'Activity Fee' },
    { value: 'meal_fee', label: 'Meal Fee' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isDaycare) {
        await Promise.all([
          fetchInvoices(),
          fetchPayments(),
          fetchChildren()
        ]);
      } else if (isParent) {
        await Promise.all([
          fetchInvoices(),
          fetchPayments()
        ]);
      }
    } catch (error) {
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    const endpoint = isDaycare ? '/api/daycare/invoices' : '/api/parent/invoices';
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setInvoices(data.invoices || []);
    }
  };

  const fetchPayments = async () => {
    const endpoint = isDaycare ? '/api/daycare/payments' : '/api/parent/payments';
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setPayments(data.payments || []);
    }
  };

  const fetchChildren = async () => {
    const response = await fetch('http://localhost:5000/api/daycare/children', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setChildren(data.children || []);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/daycare/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newInvoice,
          amount: parseFloat(newInvoice.amount)
        }),
      });

      if (response.ok) {
        setShowCreateInvoice(false);
        setNewInvoice({
          child_id: '',
          amount: '',
          description: '',
          due_date: '',
          invoice_type: 'monthly_fee'
        });
        fetchInvoices();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to create invoice');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoiceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/parent/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          payment_method: 'credit_card' // In a real app, this would come from a payment form
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh all data
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateTotals = () => {
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPending = invoices
      .filter(invoice => invoice.status !== 'paid')
      .reduce((sum, invoice) => sum + invoice.total_amount, 0);

    return { totalInvoiced, totalPaid, totalPending };
  };

  const { totalInvoiced, totalPaid, totalPending } = calculateTotals();

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
          <p className="text-gray-600">
            {isDaycare ? 'Manage invoices and track payments' : 'View invoices and payment history'}
          </p>
        </div>
        {isDaycare && (
          <Button
            onClick={() => setShowCreateInvoice(true)}
            className="gradient-bg text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
                <p className="text-2xl font-bold text-gray-900">${totalInvoiced.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Form */}
      {showCreateInvoice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span>Create New Invoice</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child_id">Child</Label>
                  <select
                    id="child_id"
                    value={newInvoice.child_id}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, child_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Child</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_type">Invoice Type</Label>
                  <select
                    id="invoice_type"
                    value={newInvoice.invoice_type}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, invoice_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {invoiceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Invoice description..."
                  required
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="gradient-bg text-white" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateInvoice(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Invoices</h3>
              <p className="text-gray-600">
                {isDaycare 
                  ? "No invoices have been created yet. Click 'Create Invoice' to get started."
                  : "No invoices have been issued for your account."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(invoice.status)}
                      <h4 className="font-semibold text-gray-800">
                        Invoice #{invoice.invoice_number}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Child:</span> {invoice.child_name}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ${invoice.total_amount}
                      </div>
                      <div>
                        <span className="font-medium">Due:</span> {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {invoice.invoice_type.replace('_', ' ')}
                      </div>
                    </div>
                    
                    {invoice.description && (
                      <p className="text-sm text-gray-600 mt-2">{invoice.description}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {isParent && invoice.status !== 'paid' && (
                      <Button
                        size="sm"
                        className="gradient-bg text-white"
                        onClick={() => handlePayment(invoice.id)}
                      >
                        Pay Now
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      Payment for Invoice #{payment.invoice_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payment.child_name} • {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${payment.amount}</p>
                    <p className="text-xs text-gray-500">{payment.payment_method}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


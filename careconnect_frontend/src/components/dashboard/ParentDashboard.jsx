import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Calendar, 
  AlertTriangle, 
  CreditCard, 
  MessageCircle,
  Baby,
  Activity,
  FileText
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const ParentDashboardHome = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parent/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const stats = [
    {
      title: 'My Children',
      value: dashboardData?.children?.length || 0,
      icon: Baby,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Recent Activities',
      value: dashboardData?.recent_activities?.length || 0,
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Incidents',
      value: dashboardData?.recent_incidents?.length || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Pending Payments',
      value: dashboardData?.pending_payments?.length || 0,
      icon: CreditCard,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-blue-100">
          Stay connected with your child's daycare experience
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Children Cards */}
      {dashboardData?.children && dashboardData.children.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">My Children</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.children.map((child) => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Baby className="h-5 w-5 text-blue-500" />
                    <span>{child.first_name} {child.last_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Age:</strong> {child.age || 'N/A'}</p>
                    <p><strong>Room:</strong> {child.room_assignment || 'Not assigned'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        child.status === 'enrolled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {child.status}
                      </span>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => window.location.href = `/dashboard/parent/children/${child.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recent_activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{activity.activity_name}</p>
                    <p className="text-sm text-gray-600">
                      {activity.child_name} • {new Date(activity.participation_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.duration_minutes ? `${activity.duration_minutes} min` : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payments */}
      {dashboardData?.pending_payments && dashboardData.pending_payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <span>Pending Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.pending_payments.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Invoice #{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${invoice.total_amount}</p>
                    <Button size="sm" className="mt-1">
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!dashboardData?.children || dashboardData.children.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Children Enrolled</h3>
            <p className="text-gray-600 mb-4">
              You don't have any children enrolled in a daycare yet.
            </p>
            <Button>
              Request Registration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const ParentDashboard = () => {
  const navigation = [
    { name: 'Overview', href: '/dashboard/parent', icon: Heart },
    { name: 'My Children', href: '/dashboard/parent/children', icon: Baby },
    { name: 'Activities', href: '/dashboard/parent/activities', icon: Calendar },
    { name: 'Incidents', href: '/dashboard/parent/incidents', icon: AlertTriangle },
    { name: 'Payments', href: '/dashboard/parent/payments', icon: CreditCard },
    { name: 'Messages', href: '/dashboard/parent/messages', icon: MessageCircle },
  ];

  return (
    <DashboardLayout title="Parent Dashboard" navigation={navigation}>
      <Routes>
        <Route path="/" element={<ParentDashboardHome />} />
        {/* Add more routes for other parent features */}
      </Routes>
    </DashboardLayout>
  );
};


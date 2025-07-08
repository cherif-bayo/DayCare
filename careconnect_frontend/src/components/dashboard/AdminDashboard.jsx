import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Settings,
  Shield,
  BarChart3,
  Database
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

const AdminDashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">System Administration</h2>
        <p className="text-purple-100">
          Manage daycares, monitor system health, and control access
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Daycares</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Building className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Daycares</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$12,450</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Daycares */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Added Daycares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Little Stars Daycare</p>
                  <p className="text-sm text-gray-600">Toronto, ON • Capacity: 30</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Active
                </span>
                <p className="text-sm text-gray-600 mt-1">Added 2 days ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Sunshine Kids Centre</p>
                  <p className="text-sm text-gray-600">Vancouver, BC • Capacity: 45</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Pending
                </span>
                <p className="text-sm text-gray-600 mt-1">Added 5 days ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Happy Hearts Daycare</p>
                  <p className="text-sm text-gray-600">Montreal, QC • Capacity: 25</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Active
                </span>
                <p className="text-sm text-gray-600 mt-1">Added 1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Services</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Gateway</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Degraded
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Add New Daycare</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Generate Reports</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-green-500" />
                  <span className="font-medium">System Backup</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const navigation = [
    { name: 'Overview', href: '/dashboard/admin', icon: BarChart3 },
    { name: 'Daycares', href: '/dashboard/admin/daycares', icon: Building },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'System Health', href: '/dashboard/admin/health', icon: Shield },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'System Settings', href: '/dashboard/admin/system-settings', icon: Settings },
  ];

  return (
    <DashboardLayout title="System Administration" navigation={navigation}>
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        {/* Add more routes for other admin features */}
      </Routes>
    </DashboardLayout>
  );
};


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import DaycareDashboard from './DaycareDashboard';
import { ParentDashboard } from './ParentDashboard';
import ChildrenManagement from '../children/ChildrenManagement';
import ChildProfile from '../children/ChildProfile';

export const DashboardRouter = () => {
  const { user, isHoster, isDaycare, isParent, isAdmin } = useAuth();

  // Redirect to appropriate dashboard based on user type
  const getDefaultRoute = () => {
    if (isAdmin || isHoster) return '/dashboard/admin';
    if (isDaycare) return '/dashboard/daycare';
    if (isParent) return '/dashboard/parent';
    // Default to daycare dashboard for testing
    return '/dashboard/daycare';
  };

  return (
    <Routes>
      {/* Default dashboard route */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      
      {/* Admin/Hoster Dashboard */}
      {(isAdmin || isHoster) && (
        <Route path="/admin/*" element={<AdminDashboard />} />
      )}
      
      {/* Daycare Dashboard and Routes - Always available for testing */}
      <Route path="/daycare" element={<DaycareDashboard />} />
      <Route path="/children" element={<ChildrenManagement />} />
      <Route path="/children/:childId" element={<ChildProfile />} />
      <Route path="/children/add" element={<div>Add Child Form (Coming Soon)</div>} />
      <Route path="/children/:childId/edit" element={<div>Edit Child Form (Coming Soon)</div>} />
      <Route path="/activities/add" element={<div>Add Activity Form (Coming Soon)</div>} />
      <Route path="/incidents/add" element={<div>Add Incident Form (Coming Soon)</div>} />
      <Route path="/staff/add" element={<div>Add Staff Form (Coming Soon)</div>} />
      <Route path="/payments/add" element={<div>Add Payment Form (Coming Soon)</div>} />
      <Route path="/attendance" element={<div>Attendance Management (Coming Soon)</div>} />
      
      {/* Parent Dashboard */}
      {isParent && (
        <Route path="/parent/*" element={<ParentDashboard />} />
      )}
      
      {/* Catch all - redirect to appropriate dashboard */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};


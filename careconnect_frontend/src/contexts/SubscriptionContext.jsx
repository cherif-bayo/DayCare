// src/contexts/SubscriptionContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load selected plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('careconnect_selected_plan');
    if (savedPlan) {
      try {
        setSelectedPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error('Error parsing saved plan:', e);
        localStorage.removeItem('careconnect_selected_plan');
      }
    }
  }, []);

  // Fetch available plans from API
  const fetchAvailablePlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/plans');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.plans)) {
        setAvailablePlans(data.plans);
      } else {
        console.warn('Invalid plans data received:', data);
        setAvailablePlans([]);
      }
    } catch (error) {
      console.error('Error fetching available plans:', error);
      setError(error.message);
      setAvailablePlans([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  // Fetch current subscription for authenticated user
  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('careconnect_token');
      if (!token) return;

      const response = await fetch('/api/subscription/daycare/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentSubscription(data.subscription);
        }
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('careconnect_token');
      if (!token) return;

      const response = await fetch('/api/subscription/daycare/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Select a plan and save to localStorage
  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('careconnect_selected_plan', JSON.stringify(plan));
  };

  // Clear selected plan
  const clearSelectedPlan = () => {
    setSelectedPlan(null);
    localStorage.removeItem('careconnect_selected_plan');
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId, daycareId) => {
    try {
      const token = localStorage.getItem('careconnect_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch('/api/subscription/daycare/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          daycare_id: daycareId
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setCurrentSubscription(data.subscription);
        clearSelectedPlan(); // Clear selected plan after successful subscription
        return { success: true, subscription: data.subscription };
      } else {
        throw new Error(data.error?.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      return { success: false, error: error.message };
    }
  };

  // Upgrade subscription
  const upgradeSubscription = async (newPlanId) => {
    try {
      const token = localStorage.getItem('careconnect_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch('/api/subscription/daycare/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_plan_id: newPlanId
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setCurrentSubscription(data.subscription);
        return { success: true, subscription: data.subscription };
      } else {
        throw new Error(data.error?.message || 'Failed to upgrade');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return { success: false, error: error.message };
    }
  };

  // Cancel subscription
  const cancelSubscription = async (reason = '') => {
    try {
      const token = localStorage.getItem('careconnect_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch('/api/subscription/daycare/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setCurrentSubscription(data.subscription);
        return { success: true, subscription: data.subscription };
      } else {
        throw new Error(data.error?.message || 'Failed to cancel');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper functions
  const hasActiveSubscription = () => {
    return currentSubscription && 
           ['active', 'trial'].includes(currentSubscription.status) &&
           new Date(currentSubscription.end_date) > new Date();
  };

  const isInTrial = () => {
    return currentSubscription && 
           currentSubscription.status === 'trial';
  };

  const getDaysUntilExpiry = () => {
    if (!currentSubscription || !currentSubscription.end_date) return 0;
    
    const endDate = new Date(currentSubscription.end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const getDaysUntilTrialEnd = () => {
    if (!isInTrial()) return 0;
    return getDaysUntilExpiry();
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  const value = {
    // State
    selectedPlan,
    availablePlans,
    currentSubscription,
    notifications,
    loading,
    error,

    // Actions
    selectPlan,
    clearSelectedPlan,
    fetchAvailablePlans,
    fetchCurrentSubscription,
    fetchNotifications,
    subscribeToPlan,
    upgradeSubscription,
    cancelSubscription,

    // Helpers
    hasActiveSubscription,
    isInTrial,
    getDaysUntilExpiry,
    getDaysUntilTrialEnd,
    getUnreadNotificationsCount
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

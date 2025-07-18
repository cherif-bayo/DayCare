// src/components/account/ManageAccount.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { apiCall } from '../../lib/mockApi';
import { API_ENDPOINTS } from '../../lib/config';
import { toast } from 'react-hot-toast';

const ManageAccount = ({ onBack }) => {
  const { user, accessToken, updateUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Fetch subscription data
  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await apiCall('/api/subscriptions/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        console.error('Failed to fetch subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiCall('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await apiCall('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (response.ok) {
        toast.success('Password updated successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action, planType = null) => {
    setLoading(true);

    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (action) {
        case 'renew':
          endpoint = '/api/subscriptions/renew';
          body = { plan_type: planType };
          break;
        case 'extend':
          endpoint = '/api/subscriptions/extend';
          body = { months: 12 }; // Extend by 1 year
          break;
        case 'cancel':
          endpoint = '/api/subscriptions/cancel';
          method = 'PUT';
          body = { reason: 'User requested cancellation' };
          break;
        case 'upgrade':
          endpoint = '/api/subscriptions/upgrade';
          body = { new_plan_type: planType };
          break;
        default:
          throw new Error('Invalid action');
      }

      const response = await apiCall(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        toast.success(`Subscription ${action}ed successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} subscription`);
      }
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanPrice = (planType) => {
    switch (planType) {
      case 'free': return 'Free';
      case 'monthly': return '$250/month';
      case 'yearly': return '$1,500/year';
      case 'lifetime': return '$3,000 (one-time)';
      default: return 'N/A';
    }
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-teal-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Manage Account</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          <TabButton
            id="profile"
            label="Profile Information"
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
          <TabButton
            id="password"
            label="Change Password"
            isActive={activeTab === 'password'}
            onClick={setActiveTab}
          />
          <TabButton
            id="subscription"
            label="Subscription Management"
            isActive={activeTab === 'subscription'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Subscription Management</h2>
              
              {subscriptionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <span className="ml-2 text-gray-600">Loading subscription...</span>
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  {/* Current Subscription Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">Plan Type:</span>
                            <p className="font-medium text-gray-900 capitalize">{subscription.plan_type}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ml-2 ${getStatusColor(subscription.status)}`}>
                              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Price:</span>
                            <p className="font-medium text-gray-900">{getPlanPrice(subscription.plan_type)}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-600">Start Date:</span>
                            <p className="font-medium text-gray-900">{formatDate(subscription.start_date)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">End Date:</span>
                            <p className="font-medium text-gray-900">{formatDate(subscription.end_date)}</p>
                          </div>
                          {subscription.trial_end_date && (
                            <div>
                              <span className="text-sm text-gray-600">Trial Ends:</span>
                              <p className="font-medium text-gray-900">{formatDate(subscription.trial_end_date)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Subscription Actions</h3>
                    
                    {/* Renewal Options */}
                    {(subscription.status === 'expired' || subscription.status === 'trial') && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Renew Subscription</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            onClick={() => handleSubscriptionAction('renew', 'monthly')}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            Monthly - $250
                          </button>
                          <button
                            onClick={() => handleSubscriptionAction('renew', 'yearly')}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                          >
                            Yearly - $1,500
                          </button>
                          <button
                            onClick={() => handleSubscriptionAction('renew', 'lifetime')}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            Lifetime - $3,000
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upgrade Options */}
                    {subscription.status === 'active' && subscription.plan_type !== 'lifetime' && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Upgrade Plan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {subscription.plan_type === 'monthly' && (
                            <button
                              onClick={() => handleSubscriptionAction('upgrade', 'yearly')}
                              disabled={loading}
                              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                            >
                              Upgrade to Yearly - $1,500
                            </button>
                          )}
                          <button
                            onClick={() => handleSubscriptionAction('upgrade', 'lifetime')}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            Upgrade to Lifetime - $3,000
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Extend Trial */}
                    {subscription.status === 'trial' && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Extend Trial</h4>
                        <button
                          onClick={() => handleSubscriptionAction('extend')}
                          disabled={loading}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                        >
                          Extend Trial by 1 Year
                        </button>
                      </div>
                    )}

                    {/* Cancel Subscription */}
                    {subscription.status === 'active' && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Cancel Subscription</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Cancelling will end your subscription at the end of the current billing period.
                        </p>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel your subscription?')) {
                              handleSubscriptionAction('cancel');
                            }
                          }}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancel Subscription
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No subscription found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccount;

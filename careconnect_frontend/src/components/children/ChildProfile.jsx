import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const ChildProfile = ({ child, onBack }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'life_threatening':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>←</span>
                <span className="text-sm">{t('backToChildren')}</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">♥</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">LittleSteps</h1>
                  <p className="text-sm text-gray-500">Canada</p>
                </div>
              </div>
            </div>
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <span>✏️</span>
              <span>{t('editChild')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 font-bold text-2xl">
              {getInitials(child.first_name, child.last_name)}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {child.first_name} {child.last_name}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">{t('age')}: {child.age} years</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {child.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-blue-600">👤</span>
                <h3 className="text-lg font-bold text-gray-900">{t('basicInformation')}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('dateOfBirth')}</label>
                  <p className="text-gray-900 mt-1">{child.date_of_birth}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('ageGroup')}</label>
                  <p className="text-gray-900 mt-1">{child.age_group}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('enrollmentDate')}</label>
                  <p className="text-gray-900 mt-1">{child.enrollment_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('status')}</label>
                  <div className="mt-1">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {child.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-purple-600">👥</span>
                <h3 className="text-lg font-bold text-gray-900">{t('parentGuardianInformation')}</h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{child.parent.name}</p>
                    <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>✉️</span>
                        <span>{child.parent.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📞</span>
                        <span>{child.parent.phone}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Relation: {child.parent.relation}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Primary
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Can Pickup
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-red-600">⚠️</span>
                <h3 className="text-lg font-bold text-gray-900">{t('emergencyContacts')}</h3>
              </div>
              <div className="space-y-4">
                {child.emergency_contacts.map((contact, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.relation}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <span>📞</span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Information Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Allergies */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-red-600">♥️</span>
                  <h3 className="text-lg font-bold text-gray-900">{t('allergies')}</h3>
                </div>
                <div className="space-y-3">
                  {child.medical_info.allergies.map((allergy, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-900">{allergy.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
                          {allergy.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{allergy.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-blue-600">💊</span>
                  <h3 className="text-lg font-bold text-gray-900">{t('medications')}</h3>
                </div>
                <div className="space-y-3">
                  {child.medical_info.medications.map((medication, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-900">{medication.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{medication.dosage}</p>
                      <p className="text-xs text-gray-500 mt-1">{medication.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-orange-600">⭕</span>
                  <h3 className="text-lg font-bold text-gray-900">{t('medicalConditions')}</h3>
                </div>
                <div className="space-y-3">
                  {child.medical_info.conditions.map((condition, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-900">{condition.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                          {condition.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Assigned Staff */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-green-600">👥</span>
                <h3 className="text-lg font-bold text-gray-900">{t('assignedStaff')}</h3>
              </div>
              <p className="text-gray-500 text-center py-8">{t('noStaffAssigned')}</p>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-orange-600">⚡</span>
                <h3 className="text-lg font-bold text-gray-900">{t('recentActivities')}</h3>
              </div>
              <p className="text-gray-500 text-center py-8">{t('noRecentActivities')}</p>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-red-600">⚠️</span>
                <h3 className="text-lg font-bold text-gray-900">{t('recentIncidents')}</h3>
              </div>
              <div className="space-y-3">
                {child.recent_incidents.map((incident, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-900">{incident.type}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{incident.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{incident.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.first_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {i18n.language === 'en' ? 'FR' : 'EN'}
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>🚪</span>
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;


import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import ChildProfile from './ChildProfile';

const ChildrenManagement = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([
    {
      id: 1,
      first_name: 'Aissatou',
      last_name: 'Bayo',
      age: 3,
      age_group: 'preschool',
      enrollment_date: '6/28/2025',
      status: 'active',
      date_of_birth: '6/16/2022',
      parent: {
        name: 'Cherif',
        email: 'baymed2007@gmail.com',
        phone: '0778685692',
        relation: 'mother',
        primary: true,
        can_pickup: true
      },
      emergency_contacts: [
        {
          name: 'Djibril Balde',
          relation: 'Uncle',
          phone: '4038037020'
        }
      ],
      medical_info: {
        allergies: [
          {
            name: 'Eggs',
            severity: 'mild',
            description: 'Skin rash, digestive discomfort'
          },
          {
            name: 'Peanuts',
            severity: 'life_threatening',
            description: 'Anaphylaxis, hives, difficulty breathing'
          }
        ],
        medications: [
          {
            name: 'Tylenol',
            dosage: '80mg every 4 hours',
            purpose: 'For fever or pain, maximum 5 doses per day'
          },
          {
            name: 'Ritalin',
            dosage: '5mg twice daily',
            purpose: 'Give with food, monitor for side effects'
          }
        ],
        conditions: [
          {
            name: 'Eczema',
            severity: 'mild',
            description: 'Chronic skin condition causing inflammation'
          }
        ]
      },
      recent_activities: [],
      recent_incidents: [
        {
          id: 1,
          type: 'behavioral',
          description: 'Minor behavioral incident during playtime',
          date: '6/29/2025',
          severity: 'moderate'
        }
      ]
    }
  ]);

  const filteredChildren = children.filter(child =>
    `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleChildClick = (child) => {
    setSelectedChild(child);
  };

  const handleBackToChildren = () => {
    setSelectedChild(null);
  };

  if (selectedChild) {
    return (
      <ChildProfile 
        child={selectedChild} 
        onBack={handleBackToChildren}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">♥</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CareConnect</h1>
                  <p className="text-sm text-gray-500">Canada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('childrenManagement')}
            </h2>
            <p className="text-gray-600">{t('manageAllEnrolledChildren')}</p>
          </div>
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <span>+</span>
            <span>{t('addNewChild')}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder={t('searchChildren')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Children Grid */}
        <div className="grid gap-6">
          {filteredChildren.map((child) => (
            <div
              key={child.id}
              onClick={() => handleChildClick(child)}
              className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                {/* Child Avatar */}
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">
                    {getInitials(child.first_name, child.last_name)}
                  </span>
                </div>

                {/* Child Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {child.first_name} {child.last_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {t('active')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit functionality
                          alert('Edit functionality will be implemented');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>{t('age')}: {child.age} years</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>👥</span>
                      <span>{t('ageGroup')}: {child.age_group}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>{t('enrolled')}: {child.enrollment_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredChildren.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No children found matching your search.</p>
            </div>
          )}
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
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
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

export default ChildrenManagement;


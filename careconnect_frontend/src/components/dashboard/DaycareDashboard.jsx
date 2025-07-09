// DaycareDashboard.jsx - COMPLETE FORM VERSION (Keeps Your Original + Adds Missing Fields)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { apiCall } from '../../lib/mockApi';
import { API_ENDPOINTS } from '../../lib/config';
import ChildrenManagement from '../children/ChildrenManagement';
import { toast } from 'react-hot-toast';

const DaycareDashboard = () => {
  const { user, logout, accessToken } = useAuth();
  console.log('→ sending with token:', accessToken);
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [dashboardData, setDashboardData] = useState({
    enrolled_children: 0,
    active_staff: 0,
    present_today: 0,
    todays_activities: 0,
    recent_incidents: 0,
    waitlisted: 0
  });
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'activity',
      description: 'Story time with Ms. Sarah',
      time: '10:30 AM',
      child: 'Aissatou Bayo'
    },
    {
      id: 2,
      type: 'incident',
      description: 'Minor bump during playtime',
      time: '2:15 PM',
      child: 'Aissatou Bayo',
      severity: 'minor'
    }
  ]);
  const [todaysSchedule, setTodaysSchedule] = useState([
    {
      id: 1,
      time: '9:00 AM',
      activity: 'Morning Circle Time',
      staff: 'Ms. Sarah'
    },
    {
      id: 2,
      time: '10:30 AM',
      activity: 'Outdoor Play',
      staff: 'Mr. John'
    },
    {
      id: 3,
      time: '12:00 PM',
      activity: 'Lunch Time',
      staff: 'Ms. Sarah'
    },
    {
      id: 4,
      time: '2:00 PM',
      activity: 'Nap Time',
      staff: 'Ms. Sarah'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const getCurrentDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString(i18n.language === 'fr' ? 'fr-CA' : 'en-CA', options);
  };

  const handleQuickAction = (action) => {
    setModalType(action);
    setShowModal(true);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickActionButton = ({ title, icon, color, onClick }) => (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-lg p-6 flex flex-col items-center justify-center space-y-2 hover:opacity-90 transition-opacity min-h-[100px]`}
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-sm font-medium text-center">{title}</span>
    </button>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const AddChildForm = ({ onSuccess, onCancel }) => {
    const [parents, setParents] = useState([{
      id: 1,
      name: '',
      email: '',
      phone: '',
      relation: 'Mother',
      isPrimary: true,
      canPickUp: true
    }]);
    
    const [emergencyContacts, setEmergencyContacts] = useState([{
      id: 1,
      name: '',
      phone: '',
      relation: ''
    }]);

    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [selectedMedications, setSelectedMedications] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);

    const allergyOptions = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Shellfish', 'Soy'];
    const medications = ['Ventolin (Salbutamol)', 'EpiPen Jr', 'Benadryl', 'Tylenol', 'Ritalin', 'Flovent'];
    const conditions = ['Asthma', 'Type 1 Diabetes', 'ADHD', 'Epilepsy', 'Eczema', 'Cerebral Palsy'];

    const addParent = () => {
      setParents([...parents, {
        id: Date.now(),
        name: '',
        email: '',
        phone: '',
        relation: 'Father',
        isPrimary: false,
        canPickUp: true
      }]);
    };

    const addEmergencyContact = () => {
      setEmergencyContacts([...emergencyContacts, {
        id: Date.now(),
        name: '',
        phone: '',
        relation: ''
      }]);
    };

    const updateParent = (id, field, value) => {
      setParents(parents.map(parent => 
        parent.id === id ? { ...parent, [field]: value } : parent
      ));
    };

    const updateEmergencyContact = (id, field, value) => {
      setEmergencyContacts(emergencyContacts.map(contact => 
        contact.id === id ? { ...contact, [field]: value } : contact
      ));
    };

    const toggleSelection = (item, selectedList, setSelectedList) => {
      if (selectedList.includes(item)) {
        setSelectedList(selectedList.filter(i => i !== item));
      } else {
        setSelectedList([...selectedList, item]);
      }
    };

    // Basic Information - Connected to your existing form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');

    // ADDED: Missing fields from database that you requested
    const [enrollmentDate, setEnrollmentDate] = useState('');
    const [status, setStatus] = useState('enrolled');
    const [roomAssignment, setRoomAssignment] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [pickupAuthorization, setPickupAuthorization] = useState([]);

    // Medical Information - Connected to your existing form
    const [medicalConditions, setMedicalConditions] = useState('');
    const [allergies, setAllergies] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState('');
    const [emergencyMedications, setEmergencyMedications] = useState('');

    // For backend compatibility
    const [primaryParentId, setPrimaryParentId] = useState('1'); // Default for testing

    const handleSubmit = async e => {
      e.preventDefault();

      // Debug info
      console.log('🔍 Debug Info:');
      console.log('Access Token:', accessToken);
      console.log('User:', user);
      console.log('User Role:', user?.user_type);
      
      if (!accessToken) {
        toast.error('No authentication token found. Please log in again.');
        return;
      }

      if (!firstName || !lastName || !dob) {
        toast.error('Please fill in First Name, Last Name, and Date of Birth');
        return;
      }

      // Prepare payload matching database structure exactly
      const payload = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob,
        gender: gender || null,
        medical_conditions: medicalConditions || null,
        allergies: allergies || null,
        dietary_restrictions: dietaryRestrictions || null,
        emergency_medications: emergencyMedications || null,
        photo_url: photoUrl || null,
        enrollment_date: enrollmentDate || null,
        status: status,
        room_assignment: roomAssignment || null,
        pickup_authorization: pickupAuthorization,
        notes: notes || null,
        primary_parent_id: Number(primaryParentId)
      };

      console.log('📤 Payload being sent:', payload);

      try {
        const res = await apiCall(API_ENDPOINTS.DAYCARE_CHILDREN, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload)
        });
        
        console.log('📥 Response status:', res.status);
        
        if (res.ok) {
          toast.success('Child added successfully!');
          setShowModal(false);
          // Reset form
          setFirstName('');
          setLastName('');
          setDob('');
          setGender('');
          setEnrollmentDate('');
          setStatus('enrolled');
          setRoomAssignment('');
          setPhotoUrl('');
          setNotes('');
          setPickupAuthorization([]);
          setMedicalConditions('');
          setAllergies('');
          setDietaryRestrictions('');
          setEmergencyMedications('');
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          console.error('❌ API Error:', err);
          toast.error(err.error?.message || 'Failed to add child');
        }
      } catch (error) {
        console.error('🚨 Network error:', error);
        toast.error('Network error');
      }
    };

    return (
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* YOUR ORIGINAL Basic Information Section - Only added value and onChange */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* ADDED: Enrollment Information Section (New fields you requested) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="enrolled">Enrolled</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Assignment</label>
                <input
                  type="text"
                  value={roomAssignment}
                  onChange={(e) => setRoomAssignment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Toddler Room A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </div>

          {/* ADDED: Pickup Authorization Section (New field you requested) */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Authorization</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authorized Pickup Persons (Enter names separated by commas)
              </label>
              <input
                type="text"
                value={pickupAuthorization.join(', ')}
                onChange={(e) => setPickupAuthorization(e.target.value.split(',').map(name => name.trim()).filter(name => name))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="John Doe, Jane Smith, Grandma Mary"
              />
              <p className="text-xs text-gray-500">
                List all people authorized to pick up this child
              </p>
            </div>
          </div>

          {/* YOUR ORIGINAL Parent/Guardian Information Section - Kept exactly as you had it */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
              <button
                type="button"
                onClick={addParent}
                className="flex items-center space-x-1 text-teal-600 hover:text-teal-700"
              >
                <span>+</span>
                <span>Add Parent</span>
              </button>
            </div>
            {parents.map((parent, index) => (
              <div key={parent.id} className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Parent {index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={parent.name}
                      onChange={(e) => updateParent(parent.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Parent/Guardian name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={parent.email}
                      onChange={(e) => updateParent(parent.id, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="parent@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={parent.phone}
                      onChange={(e) => updateParent(parent.id, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                    <select
                      value={parent.relation}
                      onChange={(e) => updateParent(parent.id, 'relation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-4 mt-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={parent.isPrimary}
                      onChange={(e) => updateParent(parent.id, 'isPrimary', e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Primary Contact</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={parent.canPickUp}
                      onChange={(e) => updateParent(parent.id, 'canPickUp', e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Can Pick Up</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* YOUR ORIGINAL Emergency Contacts Section - Kept exactly as you had it */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
              <button
                type="button"
                onClick={addEmergencyContact}
                className="flex items-center space-x-1 text-teal-600 hover:text-teal-700"
              >
                <span>+</span>
                <span>Add Contact</span>
              </button>
            </div>
            {emergencyContacts.map((contact, index) => (
              <div key={contact.id} className="mb-4 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Emergency Contact {index + 1}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(contact.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateEmergencyContact(contact.id, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                    <input
                      type="text"
                      value={contact.relation}
                      onChange={(e) => updateEmergencyContact(contact.id, 'relation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* YOUR ORIGINAL Medical Information Section - Connected to state */}
          <div className="grid grid-cols-3 gap-4">
            {/* Allergies */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
              <div className="space-y-2">
                {allergyOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={allergies.includes(option)}
                      onChange={() => {
                        if (allergies.includes(option)) {
                          setAllergies(allergies.replace(option, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim());
                        } else {
                          setAllergies(allergies ? `${allergies}, ${option}` : option);
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Allergies</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="2"
                  placeholder="List any other allergies..."
                />
              </div>
            </div>

            {/* Medications */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Medications</h3>
              <div className="space-y-2">
                {medications.map((medication) => (
                  <label key={medication} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={emergencyMedications.includes(medication)}
                      onChange={() => {
                        if (emergencyMedications.includes(medication)) {
                          setEmergencyMedications(emergencyMedications.replace(medication, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim());
                        } else {
                          setEmergencyMedications(emergencyMedications ? `${emergencyMedications}, ${medication}` : medication);
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{medication}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Medications</label>
                <textarea
                  value={emergencyMedications}
                  onChange={(e) => setEmergencyMedications(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="2"
                  placeholder="List any other emergency medications..."
                />
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h3>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <label key={condition} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={medicalConditions.includes(condition)}
                      onChange={() => {
                        if (medicalConditions.includes(condition)) {
                          setMedicalConditions(medicalConditions.replace(condition, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim());
                        } else {
                          setMedicalConditions(medicalConditions ? `${medicalConditions}, ${condition}` : condition);
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Conditions</label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="2"
                  placeholder="List any other medical conditions..."
                />
              </div>
            </div>
          </div>

          {/* ADDED: Dietary Restrictions Section */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Restrictions</h3>
            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="3"
              placeholder="Describe any dietary restrictions, food preferences, or special meal requirements..."
            />
          </div>

          {/* ADDED: Notes Section (New field you requested) */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="4"
              placeholder="Any additional information about the child, special needs, behavioral notes, or other important details..."
            />
          </div>

          {/* YOUR ORIGINAL Form Actions - Kept exactly as you had it */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Child
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Rest of your original component code remains exactly the same...
  const RecordActivityForm = () => (
    <form className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Child
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select a child</option>
            <option value="1">Aissatou Bayo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select activity type</option>
            <option value="learning">Learning Activity</option>
            <option value="play">Play Time</option>
            <option value="meal">Meal Time</option>
            <option value="nap">Nap Time</option>
            <option value="outdoor">Outdoor Activity</option>
            <option value="art">Art & Crafts</option>
            <option value="music">Music & Movement</option>
            <option value="reading">Reading Time</option>
            <option value="science">Science Exploration</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Staff Member
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select staff</option>
            <option value="sarah">Ms. Sarah</option>
            <option value="john">Mr. John</option>
            <option value="maria">Ms. Maria</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activity Title
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="e.g., Building with blocks, Story reading, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description & Notes
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="4"
          placeholder="Describe the activity, child's participation, achievements, or any observations..."
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Child's Mood
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select mood</option>
            <option value="happy">😊 Happy</option>
            <option value="excited">🤩 Excited</option>
            <option value="calm">😌 Calm</option>
            <option value="tired">😴 Tired</option>
            <option value="upset">😢 Upset</option>
            <option value="frustrated">😤 Frustrated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Participation Level
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select level</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs-encouragement">Needs Encouragement</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Notify parents</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Add to daily report</span>
        </label>
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Record Activity
        </button>
      </div>
    </form>
  );

  const ReportIncidentForm = () => (
    <form className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Child
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select a child</option>
            <option value="1">Aissatou Bayo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incident Type
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select incident type</option>
            <option value="injury">Physical Injury</option>
            <option value="behavioral">Behavioral Issue</option>
            <option value="medical">Medical Emergency</option>
            <option value="accident">Accident</option>
            <option value="allergic">Allergic Reaction</option>
            <option value="fall">Fall/Slip</option>
            <option value="bite">Bite/Scratch</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity Level
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select severity</option>
            <option value="minor">🟢 Minor</option>
            <option value="moderate">🟡 Moderate</option>
            <option value="serious">🔴 Serious</option>
            <option value="emergency">🚨 Emergency</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location of Incident
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select location</option>
          <option value="playground">Playground</option>
          <option value="classroom">Classroom</option>
          <option value="bathroom">Bathroom</option>
          <option value="cafeteria">Cafeteria</option>
          <option value="hallway">Hallway</option>
          <option value="gym">Gymnasium</option>
          <option value="outdoor">Outdoor Area</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Detailed Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="4"
          placeholder="Provide a detailed description of what happened, including circumstances leading to the incident..."
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Witnesses
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Names of staff or children who witnessed the incident"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reporting Staff
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select staff member</option>
            <option value="sarah">Ms. Sarah</option>
            <option value="john">Mr. John</option>
            <option value="maria">Ms. Maria</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Immediate Action Taken
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="3"
          placeholder="Describe what immediate care or action was provided..."
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Follow-up Required
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="2"
          placeholder="Any follow-up care, monitoring, or actions needed..."
        ></textarea>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">Parents notified immediately</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">Medical attention required</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">Supervisor notified</span>
        </label>
      </div>

      <div className="flex space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Report Incident
        </button>
      </div>
    </form>
  );

  const AddStaffForm = () => (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.staffName')}
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder={t('dashboard.forms.staffNamePlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.position')}
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select position</option>
          <option value="teacher">Teacher</option>
          <option value="assistant">Assistant</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Administrator</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.email')}
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder={t('dashboard.forms.emailPlaceholder')}
        />
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          {t('dashboard.forms.addStaff')}
        </button>
      </div>
    </form>
  );

  const CreatePaymentForm = () => (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.selectChild')}
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select a child</option>
          <option value="1">Aissatou Bayo</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.paymentType')}
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select payment type</option>
          <option value="monthly">Monthly Fee</option>
          <option value="registration">Registration Fee</option>
          <option value="activity">Activity Fee</option>
          <option value="late">Late Pickup Fee</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.amount')}
        </label>
        <input
          type="number"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="0.00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.dueDate')}
        </label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          {t('dashboard.forms.createPayment')}
        </button>
      </div>
    </form>
  );

  const MarkAttendanceForm = () => (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.selectChild')}
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select a child</option>
          <option value="1">Aissatou Bayo</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.attendanceStatus')}
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late Arrival</option>
          <option value="early">Early Departure</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('dashboard.forms.notes')}
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="2"
          placeholder={t('dashboard.forms.attendanceNotes')}
        ></textarea>
      </div>
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
        >
          {t('dashboard.forms.markAttendance')}
        </button>
      </div>
    </form>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case 'add-child':
        return <AddChildForm />;
      case 'record-activity':
        return <RecordActivityForm />;
      case 'report-incident':
        return <ReportIncidentForm />;
      case 'add-staff':
        return <AddStaffForm />;
      case 'create-payment':
        return <CreatePaymentForm />;
      case 'mark-attendance':
        return <MarkAttendanceForm />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add-child':
        return t('dashboard.quickActions.addChild');
      case 'record-activity':
        return t('dashboard.quickActions.recordActivity');
      case 'report-incident':
        return t('dashboard.quickActions.reportIncident');
      case 'add-staff':
        return t('dashboard.quickActions.addStaff');
      case 'create-payment':
        return t('dashboard.quickActions.createPayment');
      case 'mark-attendance':
        return t('dashboard.quickActions.markAttendance');
      default:
        return '';
    }
  };

  if (currentView === 'children') {
    return <ChildrenManagement onBack={() => setCurrentView('dashboard')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
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
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('dashboard.todaysDate')}</p>
                <p className="text-sm font-medium text-gray-900">{getCurrentDate()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.goodMorning')} 👋
          </h2>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title={t('dashboard.stats.enrolledChildren')}
            value={dashboardData.enrolled_children}
            icon={<span className="text-blue-600">😊</span>}
            color="bg-blue-50"
          />
          <StatCard
            title={t('dashboard.stats.activeStaff')}
            value={dashboardData.active_staff}
            icon={<span className="text-green-600">👥</span>}
            color="bg-green-50"
          />
          <StatCard
            title={t('dashboard.stats.presentToday')}
            value={dashboardData.present_today}
            icon={<span className="text-purple-600">👋</span>}
            color="bg-purple-50"
          />
          <StatCard
            title={t('dashboard.stats.todaysActivities')}
            value={dashboardData.todays_activities}
            icon={<span className="text-orange-600">📅</span>}
            color="bg-orange-50"
          />
          <StatCard
            title={t('dashboard.stats.recentIncidents')}
            value={dashboardData.recent_incidents}
            icon={<span className="text-red-600">⚠️</span>}
            color="bg-red-50"
          />
          <StatCard
            title={t('dashboard.stats.waitlisted')}
            value={dashboardData.waitlisted}
            icon={<span className="text-yellow-600">⏳</span>}
            color="bg-yellow-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickActionButton
              title={t('dashboard.quickActions.addChild')}
              icon="👶"
              color="bg-blue-500"
              onClick={() => handleQuickAction('add-child')}
            />
            <QuickActionButton
              title={t('dashboard.quickActions.recordActivity')}
              icon="📝"
              color="bg-green-500"
              onClick={() => handleQuickAction('record-activity')}
            />
            <QuickActionButton
              title={t('dashboard.quickActions.reportIncident')}
              icon="⚠️"
              color="bg-red-500"
              onClick={() => handleQuickAction('report-incident')}
            />
            <QuickActionButton
              title={t('dashboard.quickActions.addStaff')}
              icon="👥"
              color="bg-purple-500"
              onClick={() => handleQuickAction('add-staff')}
            />
            <QuickActionButton
              title={t('dashboard.quickActions.createPayment')}
              icon="💳"
              color="bg-orange-500"
              onClick={() => handleQuickAction('create-payment')}
            />
            <QuickActionButton
              title={t('dashboard.quickActions.markAttendance')}
              icon="✅"
              color="bg-teal-500"
              onClick={() => handleQuickAction('mark-attendance')}
            />
          </div>
        </div>

        {/* Recent Activity and Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-orange-600">📅</span>
              <h3 className="text-lg font-bold text-gray-900">{t('dashboard.recentActivity.title')}</h3>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'incident' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.child} • {activity.time}</p>
                      {activity.severity && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          activity.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' : 
                          activity.severity === 'moderate' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.severity}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('dashboard.recentActivity.noData')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-purple-600">👥</span>
                <h3 className="text-lg font-bold text-gray-900">{t('dashboard.todaysSchedule.title')}</h3>
              </div>
              <button
                onClick={() => setCurrentView('children')}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {t('dashboard.viewChildren')}
              </button>
            </div>
            <div className="space-y-4">
              {todaysSchedule.length > 0 ? (
                todaysSchedule.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 w-16">{item.time}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.activity}</p>
                      <p className="text-xs text-gray-500">{item.staff}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('dashboard.todaysSchedule.noData')}</p>
                </div>
              )}
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default DaycareDashboard;

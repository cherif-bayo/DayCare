import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Plus, 
  Eye, 
  Edit, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const IncidentManagement = () => {
  const { t } = useTranslation();
  const { token, isDaycare } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  const [newIncident, setNewIncident] = useState({
    child_id: '',
    incident_type: '',
    description: '',
    severity: 'low',
    location: '',
    witnesses: '',
    immediate_action: '',
    parent_notified: false
  });

  const incidentTypes = [
    'injury',
    'illness',
    'behavioral',
    'accident',
    'allergic_reaction',
    'other'
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-50' }
  ];

  useEffect(() => {
    fetchIncidents();
    if (isDaycare) {
      fetchChildren();
    }
  }, []);

  const fetchIncidents = async () => {
    try {
      const endpoint = isDaycare ? '/api/daycare/incidents' : '/api/parent/incidents';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
      } else {
        setError('Failed to load incidents');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
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
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/daycare/incidents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncident),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewIncident({
          child_id: '',
          incident_type: '',
          description: '',
          severity: 'low',
          location: '',
          witnesses: '',
          immediate_action: '',
          parent_notified: false
        });
        fetchIncidents();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to create incident');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/daycare/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchIncidents();
      } else {
        setError('Failed to update incident status');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const getSeverityStyle = (severity) => {
    const level = severityLevels.find(s => s.value === severity);
    return level ? level.color : 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  if (loading && incidents.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-800">Incident Management</h2>
          <p className="text-gray-600">Track and manage safety incidents</p>
        </div>
        {isDaycare && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="gradient-bg text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Incident Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Report New Incident</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child_id">Child</Label>
                  <select
                    id="child_id"
                    value={newIncident.child_id}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, child_id: e.target.value }))}
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
                  <Label htmlFor="incident_type">Incident Type</Label>
                  <select
                    id="incident_type"
                    value={newIncident.incident_type}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, incident_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {incidentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <select
                    id="severity"
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Playground, Classroom A"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of what happened..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="immediate_action">Immediate Action Taken</Label>
                <Textarea
                  id="immediate_action"
                  value={newIncident.immediate_action}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, immediate_action: e.target.value }))}
                  placeholder="What actions were taken immediately..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="witnesses">Witnesses</Label>
                <Input
                  id="witnesses"
                  value={newIncident.witnesses}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, witnesses: e.target.value }))}
                  placeholder="Names of staff or others who witnessed the incident"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="parent_notified"
                  type="checkbox"
                  checked={newIncident.parent_notified}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, parent_notified: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="parent_notified">Parent has been notified</Label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="gradient-bg text-white" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Incident Report'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Incidents Reported</h3>
              <p className="text-gray-600">
                {isDaycare 
                  ? "No incidents have been reported yet. Click 'Report Incident' to create a new report."
                  : "No incidents have been reported for your children."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          incidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(incident.status)}
                      <h3 className="text-lg font-semibold text-gray-800">
                        {incident.incident_type.charAt(0).toUpperCase() + incident.incident_type.slice(1).replace('_', ' ')}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(incident.severity)}`}>
                        {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span><strong>Child:</strong> {incident.child_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span><strong>Date:</strong> {new Date(incident.incident_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{incident.description}</p>

                    {incident.immediate_action && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-blue-800 mb-1">Immediate Action Taken:</p>
                        <p className="text-sm text-blue-700">{incident.immediate_action}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span><strong>Location:</strong> {incident.location}</span>
                        <span><strong>Status:</strong> {incident.status}</span>
                      </div>

                      {isDaycare && incident.status === 'open' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateIncidentStatus(incident.id, 'closed')}
                          >
                            Close
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};


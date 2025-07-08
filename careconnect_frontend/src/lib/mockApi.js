// Mock API service for production use when backend is not available
import { API_ENDPOINTS } from './config.js';

// Mock data
const mockUsers = [
  {
    id: 1,
    email: 'admin@careconnect.ca',
    password: 'admin123',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User'
  },
  {
    id: 2,
    email: 'daycare@example.com',
    password: 'daycare123',
    role: 'daycare',
    first_name: 'Daycare',
    last_name: 'Manager'
  },
  {
    id: 3,
    email: 'parent@example.com',
    password: 'parent123',
    role: 'parent',
    first_name: 'Parent',
    last_name: 'User'
  }
];

const mockChildren = [
  {
    id: 1,
    first_name: 'Aissatou',
    last_name: 'Bayo',
    date_of_birth: '2022-06-16',
    age: 3,
    age_group: 'preschool',
    enrollment_date: '2025-06-28',
    status: 'active',
    parent_id: 3
  }
];

const mockIncidents = [
  {
    id: 1,
    child_id: 1,
    child_name: 'Aissatou Bayo',
    incident_type: 'behavioral',
    description: 'Minor behavioral incident during playtime',
    severity: 'moderate',
    status: 'open',
    incident_date: '2025-06-29',
    location: 'Playground',
    immediate_action: 'Spoke with child about appropriate behavior'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApiCall = async (url, options = {}) => {
  await delay(500); // Simulate network delay
  
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  
  console.log('Mock API Call:', { url, method, body });
  
  // Authentication endpoints
  if (url.includes('/api/auth/login')) {
    const { email, password } = body;
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const token = `mock-jwt-token-${user.id}`;
      localStorage.setItem('careconnect_token', token);
      localStorage.setItem('careconnect_user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }));
      
      return {
        ok: true,
        json: async () => ({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
          }
        })
      };
    } else {
      return {
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Invalid credentials' }
        })
      };
    }
  }
  
  if (url.includes('/api/auth/register')) {
    const { email, password, role, first_name, last_name } = body;
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return {
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'User already exists' }
        })
      };
    }
    
    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email,
      password,
      role,
      first_name,
      last_name
    };
    mockUsers.push(newUser);
    
    const token = `mock-jwt-token-${newUser.id}`;
    localStorage.setItem('careconnect_token', token);
    localStorage.setItem('careconnect_user', JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    }));
    
    return {
      ok: true,
      json: async () => ({
        success: true,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          first_name: newUser.first_name,
          last_name: newUser.last_name
        }
      })
    };
  }
  
  // Daycare endpoints
  if (url.includes('/api/daycare/dashboard')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          enrolled_children: 1,
          active_staff: 1,
          present_today: 0,
          todays_activities: 0,
          recent_incidents: 1,
          waitlisted: 0
        }
      })
    };
  }
  
  if (url.includes('/api/daycare/children')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        children: mockChildren
      })
    };
  }
  
  if (url.includes('/api/daycare/incidents')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        incidents: mockIncidents
      })
    };
  }
  
  // Default response for unhandled endpoints
  return {
    ok: true,
    json: async () => ({
      success: true,
      message: 'Mock API response',
      data: {}
    })
  };
};

// Enhanced fetch function that uses mock API in production
export const apiCall = async (url, options = {}) => {
  try {
    // In production, use mock API
    if (import.meta.env.PROD) {
      return await mockApiCall(url, options);
    }
    
    // In development, try real API first, fallback to mock
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.warn('Real API failed, using mock API:', error);
      return await mockApiCall(url, options);
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};


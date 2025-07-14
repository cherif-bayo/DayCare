// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URL configuration
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001'  // Local development
  : import.meta.env.VITE_API_URL || 'https://your-backend-url.com'; // Production

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  REGISTER_WITH_INVITATION: `${API_BASE_URL}/api/auth/register-with-invitation`,
  VALIDATE_TOKEN: `${API_BASE_URL}/api/auth/validate`,
  
  // Admin endpoints
  ADMIN_DAYCARES: `${API_BASE_URL}/api/admin/daycares`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  
  // Daycare endpoints
  DAYCARE_DASHBOARD: `${API_BASE_URL}/api/daycare/dashboard`,
  DAYCARE_CHILDREN: `${API_BASE_URL}/api/daycare/children`,
  DAYCARE_INCIDENTS: `${API_BASE_URL}/api/daycare/incidents`,
  DAYCARE_INVOICES: `${API_BASE_URL}/api/daycare/invoices`,
  DAYCARE_PAYMENTS: `${API_BASE_URL}/api/daycare/payments`,
  DAYCARE_STAFF:      "/api/daycare/staff",
  DAYCARE_CHILDREN:   "/api/daycare/children",
  
  // Parent endpoints
  PARENT_DASHBOARD: `${API_BASE_URL}/api/parent/dashboard`,
  PARENT_CHILDREN: `${API_BASE_URL}/api/parent/children`,
  PARENT_INCIDENTS: `${API_BASE_URL}/api/parent/incidents`,
  PARENT_INVOICES: `${API_BASE_URL}/api/parent/invoices`,
  PARENT_PAYMENTS: `${API_BASE_URL}/api/parent/payments`,
  
  // Public endpoints
  PUBLIC_HEALTH: `${API_BASE_URL}/api/public/health`,
  PUBLIC_INVITATION: `${API_BASE_URL}/api/public/invitation`,

  // GET Children Stats API
  DAYCARE_CHILDREN: '/api/daycare/children',
  DAYCARE_STATS:    '/api/daycare/children/stats',
  AGE_GROUPS: '/api/daycare/age-groups',
};

// HTTP client configuration
export const HTTP_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// For development, we'll use a mock API when backend is not available
export const USE_MOCK_API = isProduction; // Use mock API in production until backend is deployed

console.log('API Configuration:', {
  isDevelopment,
  isProduction,
  API_BASE_URL,
  USE_MOCK_API
});


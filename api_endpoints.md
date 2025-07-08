# CareConnect Canada - API Endpoints Documentation

## Authentication Endpoints

### POST /api/auth/login
Authenticate user and return JWT token
- **Request Body**: `{email, password}`
- **Response**: `{token, user: {id, email, user_type, preferred_language}, expires_in}`
- **Status Codes**: 200 (success), 401 (invalid credentials), 422 (validation error)

### POST /api/auth/register
Register new user account (used with invitation tokens)
- **Request Body**: `{email, password, first_name, last_name, invitation_token?}`
- **Response**: `{message, user_id}`
- **Status Codes**: 201 (created), 400 (invalid token), 422 (validation error)

### POST /api/auth/logout
Invalidate current session
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 401 (unauthorized)

### POST /api/auth/refresh
Refresh JWT token
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{token, expires_in}`
- **Status Codes**: 200 (success), 401 (unauthorized)

### POST /api/auth/forgot-password
Request password reset
- **Request Body**: `{email}`
- **Response**: `{message}`
- **Status Codes**: 200 (always returns success for security)

### POST /api/auth/reset-password
Reset password with token
- **Request Body**: `{token, new_password}`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 400 (invalid token)

## User Management Endpoints

### GET /api/users/profile
Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile data based on user type
- **Status Codes**: 200 (success), 401 (unauthorized)

### PUT /api/users/profile
Update current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Profile data (varies by user type)
- **Response**: Updated profile data
- **Status Codes**: 200 (success), 401 (unauthorized), 422 (validation error)

### PUT /api/users/language
Update user's preferred language
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{language: "en" | "fr"}`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 401 (unauthorized)

## Website Hoster Endpoints

### GET /api/admin/daycares
List all daycares (hoster only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page, limit, search, status`
- **Response**: `{daycares: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/admin/daycares
Create new daycare account
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Daycare registration data
- **Response**: `{daycare_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### PUT /api/admin/daycares/{daycare_id}
Update daycare information
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Daycare update data
- **Response**: Updated daycare data
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### PUT /api/admin/daycares/{daycare_id}/subscription
Update daycare subscription
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{plan, features_enabled}`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### PUT /api/admin/daycares/{daycare_id}/status
Update daycare status (active/suspended)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{status: "active" | "suspended" | "cancelled"}`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

## Daycare Management Endpoints

### GET /api/daycare/dashboard
Get daycare dashboard data
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Dashboard statistics and recent activity
- **Status Codes**: 200 (success), 403 (forbidden)

### GET /api/daycare/children
List children in daycare
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page, limit, search, status, room`
- **Response**: `{children: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

### GET /api/daycare/children/{child_id}
Get detailed child information
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Complete child profile with incidents, activities
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### PUT /api/daycare/children/{child_id}
Update child information
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Child update data
- **Response**: Updated child data
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### GET /api/daycare/staff
List daycare staff
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{staff: []}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/daycare/staff
Add new staff member
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Staff member data
- **Response**: `{staff_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### PUT /api/daycare/staff/{staff_id}
Update staff member
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Staff update data
- **Response**: Updated staff data
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

## Registration Management Endpoints

### GET /api/daycare/registrations
List registration requests
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `status, page, limit`
- **Response**: `{requests: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/daycare/registrations/{request_id}/approve
Approve registration request
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{enrollment_date, room_assignment?, payment_plan_id}`
- **Response**: `{child_id, invitation_token, message}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### POST /api/daycare/registrations/{request_id}/reject
Reject registration request
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{reason}`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### POST /api/daycare/registrations/invite-parent
Send invitation to existing parent for new child
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{parent_email, child_data}`
- **Response**: `{invitation_token, message}`
- **Status Codes**: 200 (success), 403 (forbidden)

## Incident Management Endpoints

### GET /api/daycare/incidents
List incidents
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `child_id, date_from, date_to, severity, status, page, limit`
- **Response**: `{incidents: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/daycare/incidents
Create new incident report
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Incident data
- **Response**: `{incident_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### GET /api/daycare/incidents/{incident_id}
Get detailed incident information
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Complete incident data with follow-ups
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### PUT /api/daycare/incidents/{incident_id}
Update incident report
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Incident update data
- **Response**: Updated incident data
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### POST /api/daycare/incidents/{incident_id}/followup
Add follow-up to incident
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Follow-up data
- **Response**: `{followup_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 404 (not found)

## Payment Management Endpoints

### GET /api/daycare/payment-plans
List payment plans
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{plans: []}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/daycare/payment-plans
Create new payment plan
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Payment plan data
- **Response**: `{plan_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### GET /api/daycare/invoices
List invoices
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `status, parent_id, date_from, date_to, page, limit`
- **Response**: `{invoices: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/daycare/invoices
Generate new invoice
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Invoice generation parameters
- **Response**: `{invoice_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### GET /api/daycare/payments
List payments
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `status, parent_id, date_from, date_to, page, limit`
- **Response**: `{payments: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

## Parent Endpoints

### GET /api/parent/dashboard
Get parent dashboard data
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Dashboard with children info, recent activities, pending payments
- **Status Codes**: 200 (success), 403 (forbidden)

### GET /api/parent/children
List parent's children
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{children: []}`
- **Status Codes**: 200 (success), 403 (forbidden)

### GET /api/parent/children/{child_id}
Get detailed child information
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Child profile with recent activities and incidents
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### GET /api/parent/children/{child_id}/incidents
List child's incidents
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `date_from, date_to, page, limit`
- **Response**: `{incidents: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### GET /api/parent/children/{child_id}/activities
List child's activities
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `date_from, date_to, page, limit`
- **Response**: `{activities: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### GET /api/parent/invoices
List parent's invoices
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `status, date_from, date_to, page, limit`
- **Response**: `{invoices: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

### GET /api/parent/invoices/{invoice_id}
Get detailed invoice
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Complete invoice with line items
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

### POST /api/parent/payments
Process payment for invoice
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{invoice_id, payment_method, payment_details}`
- **Response**: `{payment_id, status, message}`
- **Status Codes**: 200 (success), 403 (forbidden), 422 (validation error)

### GET /api/parent/payments
List payment history
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `date_from, date_to, page, limit`
- **Response**: `{payments: [], total, page, limit}`
- **Status Codes**: 200 (success), 403 (forbidden)

## Registration Request Endpoints (Public)

### POST /api/public/registration-request
Submit new child registration request
- **Request Body**: Registration request data
- **Response**: `{request_id, message}`
- **Status Codes**: 201 (created), 422 (validation error)

### GET /api/public/daycares
List available daycares for registration
- **Query Params**: `city, province, postal_code`
- **Response**: `{daycares: []}`
- **Status Codes**: 200 (success)

### GET /api/public/invitation/{token}
Validate invitation token and get registration info
- **Response**: `{valid, daycare_name, child_name, expires_at}`
- **Status Codes**: 200 (success), 400 (invalid token)

## Activity Management Endpoints

### GET /api/daycare/activities
List daycare activities
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `type, age_group, active`
- **Response**: `{activities: []}`
- **Status Codes**: 200 (success), 403 (forbidden)

### POST /api/daycare/activities
Create new activity
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Activity data
- **Response**: `{activity_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### POST /api/daycare/activities/{activity_id}/participation
Record child participation in activity
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Participation data
- **Response**: `{participation_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

## Messaging Endpoints

### GET /api/messages
List messages for current user
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `type, child_id, unread_only, page, limit`
- **Response**: `{messages: [], total, page, limit}`
- **Status Codes**: 200 (success), 401 (unauthorized)

### POST /api/messages
Send new message
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Message data
- **Response**: `{message_id, message}`
- **Status Codes**: 201 (created), 403 (forbidden), 422 (validation error)

### PUT /api/messages/{message_id}/read
Mark message as read
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{message}`
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

## File Upload Endpoints

### POST /api/upload/child-photo
Upload child photo
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Multipart form with image file
- **Response**: `{photo_url, message}`
- **Status Codes**: 200 (success), 403 (forbidden), 422 (validation error)

### POST /api/upload/incident-attachment
Upload incident attachment
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Multipart form with file
- **Response**: `{file_url, message}`
- **Status Codes**: 200 (success), 403 (forbidden), 422 (validation error)

## System Information Endpoints

### GET /api/system/health
System health check
- **Response**: `{status: "healthy", timestamp, version}`
- **Status Codes**: 200 (success)

### GET /api/system/settings
Get public system settings
- **Response**: `{settings: {}}`
- **Status Codes**: 200 (success)

## Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": ["Error message for field"]
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_REQUIRED`: Valid authentication token required
- `PERMISSION_DENIED`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error occurred


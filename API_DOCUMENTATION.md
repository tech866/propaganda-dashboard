# Propaganda Dashboard - API Documentation

## 🔗 Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## 🔐 Authentication

All API endpoints require authentication via Clerk JWT tokens. The application automatically handles token management.

### Headers
```http
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

## 📊 API Endpoints

### Database Connection

#### `GET /api/test-db`
Test database connection and configuration.

**Response:**
```json
{
  "success": true,
  "message": "Supabase connection test",
  "connected": true,
  "database": "supabase",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": null
}
```

---

### Users Management

#### `GET /api/users`
Get all users (admin/CEO only).

**Query Parameters:**
- `limit` (optional): Number of users to return
- `offset` (optional): Number of users to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin|ceo|sales",
      "clientId": "uuid",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "clientName": "Client Name"
    }
  ],
  "user": {
    "id": "uuid",
    "role": "admin",
    "clientId": "uuid"
  },
  "rls_enabled": true
}
```

#### `POST /api/users`
Create a new user (admin/CEO only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "sales",
  "clientId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "sales",
    "clientId": "uuid",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "rls_enabled": true
}
```

---

### Clients Management

#### `GET /api/clients`
Get all clients.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Client Name",
      "email": "client@example.com",
      "phone": "555-0123",
      "address": "123 Client St, City, State 12345",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/clients`
Create a new client (admin/CEO only).

**Request Body:**
```json
{
  "name": "New Client",
  "email": "client@example.com",
  "phone": "555-0123",
  "address": "123 Client St, City, State 12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": "uuid",
    "name": "New Client",
    "email": "client@example.com",
    "phone": "555-0123",
    "address": "123 Client St, City, State 12345",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `PUT /api/clients/[id]`
Update a client (admin/CEO only).

**Request Body:**
```json
{
  "name": "Updated Client Name",
  "email": "updated@example.com",
  "phone": "555-0456",
  "address": "456 Updated St, City, State 12345"
}
```

#### `DELETE /api/clients/[id]`
Delete a client (CEO only).

**Response:**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

---

### Calls Management

#### `GET /api/calls`
Get all calls with filtering options.

**Query Parameters:**
- `clientId` (optional): Filter by client ID
- `userId` (optional): Filter by user ID
- `outcome` (optional): Filter by outcome (won|lost|pending)
- `dateFrom` (optional): Filter calls from date (ISO string)
- `dateTo` (optional): Filter calls to date (ISO string)
- `limit` (optional): Number of calls to return
- `offset` (optional): Number of calls to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "prospectName": "Prospect Name",
      "outcome": "won|lost|pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "completedAt": "2024-01-01T01:00:00.000Z",
      "clientId": "uuid",
      "userId": "uuid",
      "notes": "Call notes",
      "clientName": "Client Name",
      "userName": "User Name"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### `POST /api/calls`
Create a new call.

**Request Body:**
```json
{
  "prospectName": "New Prospect",
  "outcome": "pending",
  "clientId": "uuid",
  "userId": "uuid",
  "notes": "Initial call notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call created successfully",
  "data": {
    "id": "uuid",
    "prospectName": "New Prospect",
    "outcome": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "clientId": "uuid",
    "userId": "uuid",
    "notes": "Initial call notes"
  }
}
```

#### `PUT /api/calls/[id]`
Update a call.

**Request Body:**
```json
{
  "prospectName": "Updated Prospect",
  "outcome": "won",
  "notes": "Updated call notes",
  "completedAt": "2024-01-01T01:00:00.000Z"
}
```

#### `DELETE /api/calls/[id]`
Delete a call (admin/CEO only).

**Response:**
```json
{
  "success": true,
  "message": "Call deleted successfully"
}
```

---

### Analytics & Metrics

#### `GET /api/analytics/overview`
Get dashboard overview metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCalls": 150,
    "wonCalls": 45,
    "lostCalls": 80,
    "pendingCalls": 25,
    "conversionRate": 30.0,
    "totalRevenue": 125000,
    "averageDealSize": 2777.78,
    "callsThisMonth": 45,
    "callsLastMonth": 38,
    "growthRate": 18.4
  }
}
```

#### `GET /api/analytics/calls`
Get call analytics with date range.

**Query Parameters:**
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)
- `clientId` (optional): Filter by client ID
- `userId` (optional): Filter by user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCalls": 150,
    "wonCalls": 45,
    "lostCalls": 80,
    "pendingCalls": 25,
    "conversionRate": 30.0,
    "callsByDay": [
      {
        "date": "2024-01-01",
        "calls": 5,
        "won": 2,
        "lost": 2,
        "pending": 1
      }
    ],
    "callsByOutcome": [
      {
        "outcome": "won",
        "count": 45,
        "percentage": 30.0
      }
    ]
  }
}
```

#### `GET /api/analytics/performance`
Get performance metrics by user/client.

**Query Parameters:**
- `clientId` (optional): Filter by client ID
- `userId` (optional): Filter by user ID
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": {
    "userPerformance": [
      {
        "userId": "uuid",
        "userName": "User Name",
        "totalCalls": 50,
        "wonCalls": 15,
        "conversionRate": 30.0,
        "totalRevenue": 45000
      }
    ],
    "clientPerformance": [
      {
        "clientId": "uuid",
        "clientName": "Client Name",
        "totalCalls": 75,
        "wonCalls": 25,
        "conversionRate": 33.3,
        "totalRevenue": 75000
      }
    ]
  }
}
```

---

### Enhanced Call Tracking

#### `GET /api/calls/enhanced`
Get calls with enhanced tracking data.

**Query Parameters:**
- `clientId` (optional): Filter by client ID
- `userId` (optional): Filter by user ID
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "prospectName": "Prospect Name",
      "outcome": "won",
      "enhancedCallOutcome": "sale_completed",
      "closerFirstName": "John",
      "closerLastName": "Doe",
      "sourceOfSetAppointment": "cold_call",
      "initialPaymentCollectedOn": "2024-01-01T01:00:00.000Z",
      "customerFullName": "Customer Name",
      "customerEmail": "customer@example.com",
      "callsTaken": 3,
      "setterFirstName": "Jane",
      "setterLastName": "Smith",
      "cashCollectedUpfront": 5000,
      "totalAmountOwed": 15000,
      "prospectNotes": "Detailed prospect notes",
      "leadSource": "website"
    }
  ]
}
```

#### `POST /api/calls/enhanced`
Create a call with enhanced tracking data.

**Request Body:**
```json
{
  "prospectName": "New Prospect",
  "outcome": "pending",
  "clientId": "uuid",
  "userId": "uuid",
  "closerFirstName": "John",
  "closerLastName": "Doe",
  "sourceOfSetAppointment": "cold_call",
  "customerFullName": "Customer Name",
  "customerEmail": "customer@example.com",
  "callsTaken": 1,
  "setterFirstName": "Jane",
  "setterLastName": "Smith",
  "prospectNotes": "Initial prospect notes",
  "leadSource": "website"
}
```

---

## 📱 Meta Marketing API Integration

### Meta Authentication

#### `GET /api/meta/auth`
Handle Meta OAuth callback and store access token.

**Query Parameters:**
- `code` (required): Authorization code from Meta
- `state` (optional): State parameter for security

**Response:**
```json
{
  "success": true,
  "message": "Meta account connected successfully"
}
```

#### `POST /api/meta/auth`
Generate Meta OAuth URL for authentication.

**Response:**
```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?client_id=...",
  "message": "Redirect user to authUrl to complete Meta authentication"
}
```

### Meta Data Access

#### `GET /api/meta/status`
Check Meta account connection status.

**Response:**
```json
{
  "success": true,
  "connected": true,
  "user_id": "clerk_user_id",
  "expires_at": "2024-12-31T23:59:59.000Z",
  "scope": "ads_read,ads_management,business_management"
}
```

#### `GET /api/meta/ad-spend`
Get ad spend data from Meta Marketing API.

**Query Parameters:**
- `adAccountId` (required): Meta ad account ID
- `dateStart` (required): Start date (YYYY-MM-DD)
- `dateStop` (required): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "adAccountId": "act_123456789",
    "dateStart": "2024-01-01",
    "dateStop": "2024-01-31",
    "totalSpend": 15000.50,
    "currency": "USD",
    "campaigns": [
      {
        "id": "campaign_123",
        "name": "Campaign Name",
        "spend": 5000.25,
        "impressions": 100000,
        "clicks": 2500
      }
    ]
  }
}
```

#### `POST /api/meta/disconnect`
Disconnect Meta account and remove stored tokens.

**Response:**
```json
{
  "success": true,
  "message": "Meta account disconnected successfully"
}
```

---

## 🔒 Security & Access Control

### Row Level Security (RLS)
All API endpoints automatically apply Row Level Security based on user roles:

- **CEO**: Full access to all data
- **Admin**: Access to their client's data only
- **Sales**: Access to their client's data only

### Authentication Flow
1. User signs in via Clerk
2. Clerk provides JWT token with user metadata
3. API endpoints verify JWT and extract user role/client_id
4. Supabase RLS automatically filters data based on user permissions

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No valid token provided"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "The requested resource does not exist"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "An unexpected error occurred"
}
```

---

## 📝 Request/Response Examples

### Creating a New Call
```bash
curl -X POST http://localhost:3000/api/calls \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prospectName": "John Smith",
    "outcome": "pending",
    "clientId": "uuid",
    "userId": "uuid",
    "notes": "Initial call with prospect"
  }'
```

### Getting Calls with Filters
```bash
curl -X GET "http://localhost:3000/api/calls?clientId=uuid&outcome=won&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

### Updating a Call
```bash
curl -X PUT http://localhost:3000/api/calls/uuid \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "won",
    "completedAt": "2024-01-01T01:00:00.000Z",
    "notes": "Call completed successfully"
  }'
```

---

## 🧪 Testing

### Test Scripts
```bash
# Test all API endpoints
npm run test-api-routes

# Test specific endpoint
curl -X GET http://localhost:3000/api/test-db
```

### Test Data
The API includes comprehensive test data for development and testing purposes.

---

## 📊 Rate Limiting

Currently, the API does not implement rate limiting. For production deployment, consider implementing rate limiting based on your requirements.

---

## 🔄 Webhooks

The application supports webhooks for real-time updates:

- **Clerk Webhooks**: User authentication events
- **Supabase Webhooks**: Database change events

Configure webhooks in your respective service dashboards.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Row Level Security Guide](scripts/clerk-jwt-configuration-guide.md)

---

**API Version**: 1.0  
**Last Updated**: 2024-01-01  
**Authentication**: Clerk JWT  
**Database**: Supabase PostgreSQL with RLS

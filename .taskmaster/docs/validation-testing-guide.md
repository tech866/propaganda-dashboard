# Validation Testing Guide

This document provides comprehensive testing procedures for the Propaganda Dashboard validation system, covering both client-side and server-side validation scenarios.

## Overview

The validation system implements comprehensive data validation using Yup schemas for:
- **Login Form**: Email and password validation
- **Registration Form**: Email, password, name, and client ID validation
- **Call Logging Form**: Comprehensive call data validation
- **User Management Form**: Admin user creation with role validation
- **Filter Validation**: Call and metrics filter validation

## Test Categories

### 1. Server-Side Validation Tests

#### API Endpoint Testing
- **Health Check**: `/api/health`
- **Login**: `/api/auth/login`
- **Registration**: `/api/auth/register`
- **Call Management**: `/api/calls`
- **User Management**: `/api/users`
- **Metrics**: `/api/metrics`
- **Validation Testing**: `/api/test-validation`
- **Error Testing**: `/api/test-errors`

#### Validation Scenarios
Each endpoint is tested with:
- ✅ **Valid Data**: Should return 200/201 status
- ❌ **Invalid Data**: Should return 400 status with detailed error messages
- 🔒 **Authentication**: Should return 401/403 for unauthorized access
- 🚨 **Error Handling**: Should return appropriate error codes

### 2. Client-Side Validation Tests

#### Form Validation Testing
- **Real-time Validation**: Field-level validation as user types
- **Form Submission**: Prevents submission with invalid data
- **Error Display**: Clear, actionable error messages
- **Success States**: Proper feedback for successful submissions

#### Validation Scenarios
Each form is tested with:
- ✅ **Valid Input**: Should pass validation
- ❌ **Invalid Input**: Should show appropriate error messages
- 🔄 **Edge Cases**: Empty values, null values, extra fields
- 📱 **User Experience**: Loading states, success feedback

## Running Tests

### 1. Server-Side Validation Tests

```bash
# Run comprehensive API validation tests
node scripts/test-validation.js
```

**Expected Output:**
```
🚀 Starting Comprehensive Validation Tests...
============================================================

🏥 Testing Health Endpoint...
✅ Health endpoint working

🔐 Testing Login Validation...
  Testing valid login...
  ✅ Valid login accepted
  Testing invalid login...
  ✅ Invalid login properly rejected with 400 status
  📝 Validation errors: { email: 'Invalid email format', password: 'Password must be at least 6 characters' }

[... additional test results ...]

============================================================
📊 Test Results Summary:
============================================================
✅ HEALTH: PASSED
✅ LOGIN: PASSED
✅ REGISTER: PASSED
✅ CALLS: PASSED
✅ USERS: PASSED
✅ METRICS: PASSED
✅ VALIDATION: PASSED
✅ ERRORS: PASSED
============================================================
🎯 Overall Result: 8/8 tests passed (100%)
🎉 All validation tests passed! The validation system is working correctly.
```

### 2. Client-Side Validation Tests

```bash
# Run client-side validation tests
node scripts/test-client-validation.js
```

**Expected Output:**
```
🚀 Starting Client-Side Validation Tests...
============================================================

🔐 Testing Login Form Validation...
  ✅ login validation correctly accepted valid data
  ✅ login validation correctly rejected invalid email
    📝 Error message: "Invalid email format"
  ✅ login validation correctly rejected invalid password
    📝 Error message: "Password must be at least 6 characters"

[... additional test results ...]

============================================================
📊 Client-Side Validation Test Results:
============================================================
✅ LOGIN: PASSED
✅ REGISTER: PASSED
✅ CALLS: PASSED
✅ USERS: PASSED
✅ FILTERS: PASSED
✅ EDGECASES: PASSED
============================================================
🎯 Overall Result: 6/6 tests passed (100%)
🎉 All client-side validation tests passed! The validation system is working correctly.
```

### 3. Unit Tests (Jest)

```bash
# Run unit tests for validation schemas
npm test src/lib/validation/__tests__/validation.test.ts
```

## Test Data

### Valid Test Data

#### Login
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Registration
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe",
  "clientId": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### Call Creation
```json
{
  "client_id": "550e8400-e29b-41d4-a716-446655440001",
  "prospect_name": "Jane Smith",
  "prospect_email": "jane@example.com",
  "call_type": "outbound",
  "status": "completed",
  "outcome": "won"
}
```

#### User Creation
```json
{
  "email": "admin@example.com",
  "password": "adminpassword",
  "name": "Admin User",
  "role": "admin",
  "clientId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Invalid Test Data Scenarios

#### Email Validation
- ❌ `"invalid-email"` → "Invalid email format"
- ❌ `""` → "Email is required"

#### Password Validation
- ❌ `"123"` → "Password must be at least 6 characters"
- ❌ `""` → "Password is required"

#### Name Validation
- ❌ `"J"` → "Name must be at least 2 characters"
- ❌ `""` → "Name is required"

#### UUID Validation
- ❌ `"invalid-uuid"` → "Client ID must be a valid UUID"
- ❌ `""` → "Client ID is required"

#### Enum Validation
- ❌ `"invalid-type"` → "Call type must be either inbound or outbound"
- ❌ `"invalid-status"` → "Status must be completed, no-show, or rescheduled"
- ❌ `"invalid-role"` → "Invalid role. Must be one of: sales, admin, ceo"

#### Numeric Validation
- ❌ `-10` → "Call duration cannot be negative"
- ❌ `-5` → "Limit must be at least 1"
- ❌ `-1` → "Offset cannot be negative"

## Error Response Format

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "type": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 6 characters"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication Error Response
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "type": "AUTHENTICATION_ERROR",
    "statusCode": 401
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Manual Testing Checklist

### Login Form (`/auth/signin`)
- [ ] Valid email and password → Success
- [ ] Invalid email format → Error message
- [ ] Short password → Error message
- [ ] Empty fields → Error messages
- [ ] Real-time validation feedback

### Registration Form (`/auth/register`)
- [ ] Valid data → Success and redirect
- [ ] Invalid email → Error message
- [ ] Short password → Error message
- [ ] Short name → Error message
- [ ] Invalid UUID → Error message
- [ ] Real-time validation feedback

### Call Logging Form (`/calls/new`)
- [ ] Valid call data → Success
- [ ] Invalid prospect name → Error message
- [ ] Invalid call type → Error message
- [ ] Invalid status → Error message
- [ ] Invalid outcome → Error message
- [ ] Negative duration → Error message
- [ ] Real-time validation feedback

### User Management Form (`/admin/users/new`)
- [ ] Valid user data → Success
- [ ] Invalid email → Error message
- [ ] Invalid role → Error message
- [ ] Invalid client ID → Error message
- [ ] Role-based access control
- [ ] Real-time validation feedback

## Performance Testing

### Response Time Expectations
- **Health Check**: < 100ms
- **Login**: < 500ms
- **Registration**: < 500ms
- **Call Creation**: < 1000ms
- **User Creation**: < 1000ms
- **Validation**: < 200ms

### Load Testing
- **Concurrent Users**: 100+ simultaneous validations
- **Error Rate**: < 1% under normal load
- **Memory Usage**: Stable under extended testing

## Troubleshooting

### Common Issues

#### 1. Validation Not Working
- Check if Yup schemas are properly imported
- Verify validation functions are called correctly
- Ensure error handling middleware is active

#### 2. Error Messages Not Displaying
- Check if error state is properly managed
- Verify error display components are rendered
- Ensure error messages are properly formatted

#### 3. Form Submission Issues
- Check if validation is preventing submission
- Verify API endpoints are responding correctly
- Ensure proper error handling in form handlers

#### 4. Real-time Validation Not Working
- Check if validation hooks are properly implemented
- Verify field change handlers are calling validation
- Ensure error state is properly updated

### Debug Commands

```bash
# Check server logs
npm run dev

# Test specific endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"123"}'

# Test validation endpoint
curl -X POST http://localhost:3001/api/test-validation \
  -H "Content-Type: application/json" \
  -d '{"schema":"login","data":{"email":"invalid","password":"123"}}'
```

## Success Criteria

### ✅ Validation System is Working Correctly When:

1. **All API endpoints** return appropriate status codes
2. **Error messages** are clear and actionable
3. **Client-side validation** provides real-time feedback
4. **Form submission** is prevented with invalid data
5. **Success states** provide proper user feedback
6. **Edge cases** are handled gracefully
7. **Performance** meets expected benchmarks
8. **Error handling** is comprehensive and consistent

### 📊 Test Coverage Targets

- **API Endpoints**: 100% coverage
- **Validation Scenarios**: 100% coverage
- **Error Cases**: 100% coverage
- **Edge Cases**: 95% coverage
- **User Experience**: 100% coverage

## Conclusion

This comprehensive testing guide ensures that the validation system is robust, user-friendly, and maintains high quality standards. Regular testing using these procedures will help maintain the integrity and reliability of the validation system.

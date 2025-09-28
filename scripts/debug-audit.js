#!/usr/bin/env node

/**
 * Debug script for audit endpoint issues
 */

const BASE_URL = 'http://localhost:3002';

async function testAuditEndpoint() {
  console.log('🔍 Testing audit endpoint...');
  
  // First login to get a token
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'adminpassword'
    })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login response:', loginData);
  
  if (!loginData.success) {
    console.log('❌ Login failed');
    return;
  }
  
  const token = loginData.token;
  console.log('✅ Login successful, token received');
  
  // Test audit endpoint
  const auditResponse = await fetch(`${BASE_URL}/api/audit`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Audit response status:', auditResponse.status);
  
  const auditData = await auditResponse.json();
  console.log('Audit response data:', JSON.stringify(auditData, null, 2));
}

testAuditEndpoint().catch(console.error);

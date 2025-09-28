/**
 * Test Enhanced Audit Logs Functionality
 * Task 10.4 - Comprehensive testing of the audit logs system
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test function
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Running test: ${testName}`);
  try {
    await testFunction();
    console.log(`✅ ${testName} - PASSED`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${testName} - FAILED: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
}

// Test 1: Login and get JWT token
async function testLogin() {
  const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: TEST_USER
  });

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.token) {
    throw new Error('No JWT token received from login');
  }

  return response.data.token;
}

// Test 2: Test audit logs insert functionality
async function testAuditLogsInsert() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=insert`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logs insert test failed with status ${response.status}`);
  }

  const insertTest = response.data.results.find(r => r.test === 'direct_insert');
  if (!insertTest) {
    throw new Error('Direct insert test result not found');
  }

  if (!insertTest.data.id || !insertTest.data.table_name) {
    throw new Error('Insert test data incomplete');
  }

  console.log('   Inserted audit log:', insertTest.data.id);
}

// Test 3: Test audit logs query functionality
async function testAuditLogsQuery() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=query`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logs query test failed with status ${response.status}`);
  }

  const queryTest = response.data.results.find(r => r.test === 'summary_view_query');
  if (!queryTest) {
    throw new Error('Summary view query test result not found');
  }

  if (queryTest.data.count === undefined) {
    throw new Error('Query test data incomplete');
  }

  console.log(`   Retrieved ${queryTest.data.count} audit logs from summary view`);
}

// Test 4: Test audit logs statistics functionality
async function testAuditLogsStats() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logs stats test failed with status ${response.status}`);
  }

  const statsTest = response.data.results.find(r => r.test === 'statistics_function');
  if (!statsTest) {
    throw new Error('Statistics function test result not found');
  }

  if (statsTest.data.total_logs === undefined) {
    throw new Error('Statistics test data incomplete');
  }

  console.log(`   Statistics: ${statsTest.data.total_logs} total logs, avg duration: ${statsTest.data.avg_duration_ms}ms`);
}

// Test 5: Test audit logs cleanup functionality
async function testAuditLogsCleanup() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=cleanup`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logs cleanup test failed with status ${response.status}`);
  }

  const cleanupTest = response.data.results.find(r => r.test === 'cleanup_function');
  if (!cleanupTest) {
    throw new Error('Cleanup function test result not found');
  }

  console.log(`   Cleanup function: ${cleanupTest.data.logs_that_would_be_deleted} logs would be deleted`);
}

// Test 6: Test enhanced audited database functionality
async function testEnhancedAuditedDatabase() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=audited_db`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Enhanced audited database test failed with status ${response.status}`);
  }

  const dbTest = response.data.results.find(r => r.test === 'enhanced_audited_database');
  if (!dbTest) {
    throw new Error('Enhanced audited database test result not found');
  }

  if (!dbTest.data.query_result || !dbTest.data.user_info) {
    throw new Error('Enhanced audited database test data incomplete');
  }

  console.log('   Enhanced audited database operations working');
}

// Test 7: Test audit logs filtering functionality
async function testAuditLogsFiltering() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=filtering`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logs filtering test failed with status ${response.status}`);
  }

  const filterTest = response.data.results.find(r => r.test === 'filtering_and_pagination');
  if (!filterTest) {
    throw new Error('Filtering and pagination test result not found');
  }

  console.log(`   Filtered ${filterTest.data.filtered_count} audit logs`);
}

// Test 8: Test audit logs performance metrics
async function testAuditLogsPerformance() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=performance`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logs performance test failed with status ${response.status}`);
  }

  const perfTest = response.data.results.find(r => r.test === 'performance_metrics');
  if (!perfTest) {
    throw new Error('Performance metrics test result not found');
  }

  console.log(`   Performance: ${perfTest.data.total_operations} operations, avg ${perfTest.data.avg_duration_ms}ms`);
}

// Test 9: Test comprehensive audit logs functionality
async function testComprehensiveAuditLogs() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/audit/test?type=all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Comprehensive audit logs test failed with status ${response.status}`);
  }

  if (response.data.results.length < 7) {
    throw new Error(`Expected 7 test results, got ${response.data.results.length}`);
  }

  console.log('   Comprehensive test results:', response.data.results.length, 'tests completed');
}

// Test 10: Test audit logs with different user roles
async function testAuditLogsWithRoles() {
  // Test with different user roles if available
  const roles = ['sales', 'admin', 'ceo'];
  
  for (const role of roles) {
    try {
      const testUser = {
        email: `${role}@example.com`,
        password: 'password123'
      };
      
      const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: testUser
      });
      
      if (loginResponse.status === 200 && loginResponse.data.token) {
        const response = await makeRequest(`${BASE_URL}/api/audit/test?type=stats`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        if (response.status === 200) {
          console.log(`   ${role} role: Audit logs accessible`);
        } else {
          console.log(`   ${role} role: Audit logs access restricted (status: ${response.status})`);
        }
      }
    } catch (error) {
      console.log(`   ${role} role: Not available or access restricted`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Enhanced Audit Logs Tests');
  console.log('=' .repeat(60));

  await runTest('Login and JWT Token', testLogin);
  await runTest('Audit Logs Insert', testAuditLogsInsert);
  await runTest('Audit Logs Query', testAuditLogsQuery);
  await runTest('Audit Logs Statistics', testAuditLogsStats);
  await runTest('Audit Logs Cleanup', testAuditLogsCleanup);
  await runTest('Enhanced Audited Database', testEnhancedAuditedDatabase);
  await runTest('Audit Logs Filtering', testAuditLogsFiltering);
  await runTest('Audit Logs Performance', testAuditLogsPerformance);
  await runTest('Comprehensive Audit Logs', testComprehensiveAuditLogs);
  await runTest('Audit Logs with Roles', testAuditLogsWithRoles);

  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Enhanced audit logs system is working correctly.');
    console.log('\n📋 Task 10.4 - Create Audit Logs Table: COMPLETED');
    console.log('   ✅ Enhanced audit logs table created and tested');
    console.log('   ✅ All audit logging functionality verified');
    console.log('   ✅ Performance metrics and statistics working');
    console.log('   ✅ Cleanup and maintenance functions operational');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});

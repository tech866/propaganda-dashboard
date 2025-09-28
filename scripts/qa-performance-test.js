#!/usr/bin/env node

/**
 * Performance Testing Script for Propaganda Dashboard
 * Tests application performance under load and measures response times
 */

const BASE_URL = 'http://localhost:3002';

// Test configuration
const CONFIG = {
  concurrentUsers: 10,
  requestsPerUser: 5,
  timeout: 10000, // 10 seconds
  endpoints: [
    { path: '/api/health', method: 'GET', weight: 1 },
    { path: '/api/metrics', method: 'GET', weight: 3 },
    { path: '/api/calls', method: 'GET', weight: 3 },
    { path: '/api/clients', method: 'GET', weight: 1 },
    { path: '/api/users', method: 'GET', weight: 2 },
    { path: '/api/audit', method: 'GET', weight: 1 }
  ]
};

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null
};

// Test user credentials
const testUser = {
  email: 'admin@example.com',
  password: 'adminpassword'
};

let authToken = null;

async function makeRequest(url, options = {}) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      timeout: CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: response.ok,
      status: response.status,
      responseTime,
      error: null
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      status: 0,
      responseTime,
      error: error.message
    };
  }
}

async function loginUser() {
  console.log('🔐 Logging in test user...');
  
  const result = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (result.success) {
    // Parse the response to get the token
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    authToken = data.token;
    console.log('✅ Test user logged in successfully');
    return true;
  } else {
    console.log('❌ Test user login failed');
    return false;
  }
}

async function simulateUser(userId) {
  const userMetrics = {
    requests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: []
  };
  
  console.log(`👤 User ${userId} starting...`);
  
  for (let i = 0; i < CONFIG.requestsPerUser; i++) {
    // Select endpoint based on weight
    const endpoint = selectWeightedEndpoint();
    
    const options = {
      method: endpoint.method,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    };
    
    const result = await makeRequest(`${BASE_URL}${endpoint.path}`, options);
    
    userMetrics.requests++;
    userMetrics.responseTimes.push(result.responseTime);
    
    if (result.success) {
      userMetrics.successfulRequests++;
    } else {
      userMetrics.failedRequests++;
      metrics.errors.push({
        userId,
        request: i + 1,
        endpoint: endpoint.path,
        error: result.error,
        status: result.status
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`👤 User ${userId} completed: ${userMetrics.successfulRequests}/${userMetrics.requests} successful`);
  return userMetrics;
}

function selectWeightedEndpoint() {
  const totalWeight = CONFIG.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of CONFIG.endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return CONFIG.endpoints[0]; // Fallback
}

function calculateStatistics() {
  const responseTimes = metrics.responseTimes;
  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  
  const stats = {
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    successRate: (metrics.successfulRequests / metrics.totalRequests) * 100,
    totalTime: metrics.endTime - metrics.startTime,
    averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
    p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
    p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
    requestsPerSecond: metrics.totalRequests / ((metrics.endTime - metrics.startTime) / 1000)
  };
  
  return stats;
}

function printResults(stats) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n🎯 Test Configuration:`);
  console.log(`   Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log(`   Requests per User: ${CONFIG.requestsPerUser}`);
  console.log(`   Total Requests: ${CONFIG.concurrentUsers * CONFIG.requestsPerUser}`);
  console.log(`   Test Duration: ${(stats.totalTime / 1000).toFixed(2)}s`);
  
  console.log(`\n📈 Request Statistics:`);
  console.log(`   Total Requests: ${stats.totalRequests}`);
  console.log(`   Successful: ${stats.successfulRequests} (${stats.successRate.toFixed(2)}%)`);
  console.log(`   Failed: ${stats.failedRequests}`);
  console.log(`   Requests/Second: ${stats.requestsPerSecond.toFixed(2)}`);
  
  console.log(`\n⏱️  Response Time Statistics:`);
  console.log(`   Average: ${stats.averageResponseTime.toFixed(2)}ms`);
  console.log(`   Minimum: ${stats.minResponseTime}ms`);
  console.log(`   Maximum: ${stats.maxResponseTime}ms`);
  console.log(`   Median: ${stats.medianResponseTime}ms`);
  console.log(`   95th Percentile: ${stats.p95ResponseTime}ms`);
  console.log(`   99th Percentile: ${stats.p99ResponseTime}ms`);
  
  if (metrics.errors.length > 0) {
    console.log(`\n❌ Errors (${metrics.errors.length}):`);
    metrics.errors.slice(0, 5).forEach((error, index) => {
      console.log(`   ${index + 1}. User ${error.userId} - ${error.endpoint}: ${error.error || `Status ${error.status}`}`);
    });
    if (metrics.errors.length > 5) {
      console.log(`   ... and ${metrics.errors.length - 5} more errors`);
    }
  }
  
  console.log(`\n🎯 Performance Assessment:`);
  
  // Performance criteria
  const criteria = {
    successRate: stats.successRate >= 95,
    averageResponseTime: stats.averageResponseTime <= 1000, // 1 second
    p95ResponseTime: stats.p95ResponseTime <= 2000, // 2 seconds
    requestsPerSecond: stats.requestsPerSecond >= 10
  };
  
  console.log(`   Success Rate ≥ 95%: ${criteria.successRate ? '✅ PASS' : '❌ FAIL'} (${stats.successRate.toFixed(2)}%)`);
  console.log(`   Avg Response Time ≤ 1s: ${criteria.averageResponseTime ? '✅ PASS' : '❌ FAIL'} (${stats.averageResponseTime.toFixed(2)}ms)`);
  console.log(`   95th Percentile ≤ 2s: ${criteria.p95ResponseTime ? '✅ PASS' : '❌ FAIL'} (${stats.p95ResponseTime}ms)`);
  console.log(`   Throughput ≥ 10 req/s: ${criteria.requestsPerSecond ? '✅ PASS' : '❌ FAIL'} (${stats.requestsPerSecond.toFixed(2)} req/s)`);
  
  const passedCriteria = Object.values(criteria).filter(Boolean).length;
  const totalCriteria = Object.keys(criteria).length;
  
  console.log(`\n🏆 Overall Performance: ${passedCriteria}/${totalCriteria} criteria passed`);
  
  if (passedCriteria === totalCriteria) {
    console.log('🎉 Performance test PASSED! Application is ready for production.');
    return true;
  } else {
    console.log('⚠️  Performance test FAILED. Consider optimization before deployment.');
    return false;
  }
}

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Testing for Propaganda Dashboard\n');
  console.log('='.repeat(60));
  
  // Login first
  const loginSuccess = await loginUser();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return false;
  }
  
  console.log(`\n📊 Starting load test with ${CONFIG.concurrentUsers} concurrent users...`);
  console.log(`   Each user will make ${CONFIG.requestsPerUser} requests`);
  console.log(`   Total requests: ${CONFIG.concurrentUsers * CONFIG.requestsPerUser}\n`);
  
  metrics.startTime = Date.now();
  
  // Create concurrent user simulations
  const userPromises = [];
  for (let i = 1; i <= CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Wait for all users to complete
  const userResults = await Promise.all(userPromises);
  
  metrics.endTime = Date.now();
  
  // Aggregate results
  userResults.forEach(userResult => {
    metrics.totalRequests += userResult.requests;
    metrics.successfulRequests += userResult.successfulRequests;
    metrics.failedRequests += userResult.failedRequests;
    metrics.responseTimes.push(...userResult.responseTimes);
  });
  
  // Calculate and print results
  const stats = calculateStatistics();
  const passed = printResults(stats);
  
  return passed;
}

// Run the performance test
runPerformanceTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Performance test execution failed:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Audit Logging Performance Test Script
 * Task 10.6 - Performance Analysis and Optimization
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'adminpassword'
};

// Performance metrics
const metrics = {
  loginTime: [],
  auditInsertTime: [],
  auditQueryTime: [],
  auditStatsTime: [],
  memoryUsage: [],
  errorCount: 0,
  totalRequests: 0
};

/**
 * Login and get JWT token
 */
async function login() {
  const startTime = performance.now();
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    const endTime = performance.now();
    
    metrics.loginTime.push(endTime - startTime);
    metrics.totalRequests++;
    
    return response.data.token;
  } catch (error) {
    metrics.errorCount++;
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test audit log insertion performance
 */
async function testAuditInsert(token, iterations = 10) {
  console.log(`\n🧪 Testing audit log insertion performance (${iterations} iterations)...`);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/api/audit/test?type=insert`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const endTime = performance.now();
      metrics.auditInsertTime.push(endTime - startTime);
      metrics.totalRequests++;
      
      if (i % 5 === 0) {
        console.log(`  ✓ Insert ${i + 1}/${iterations}: ${(endTime - startTime).toFixed(2)}ms`);
      }
    } catch (error) {
      metrics.errorCount++;
      console.error(`  ❌ Insert ${i + 1} failed:`, error.response?.data || error.message);
    }
    
    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Test audit log query performance
 */
async function testAuditQuery(token, iterations = 5) {
  console.log(`\n🧪 Testing audit log query performance (${iterations} iterations)...`);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/api/audit?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const endTime = performance.now();
      metrics.auditQueryTime.push(endTime - startTime);
      metrics.totalRequests++;
      
      console.log(`  ✓ Query ${i + 1}/${iterations}: ${(endTime - startTime).toFixed(2)}ms (${response.data.data?.length || 0} records)`);
    } catch (error) {
      metrics.errorCount++;
      console.error(`  ❌ Query ${i + 1} failed:`, error.response?.data || error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

/**
 * Test audit statistics performance
 */
async function testAuditStats(token, iterations = 3) {
  console.log(`\n🧪 Testing audit statistics performance (${iterations} iterations)...`);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/api/audit/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const endTime = performance.now();
      metrics.auditStatsTime.push(endTime - startTime);
      metrics.totalRequests++;
      
      console.log(`  ✓ Stats ${i + 1}/${iterations}: ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      metrics.errorCount++;
      console.error(`  ❌ Stats ${i + 1} failed:`, error.response?.data || error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Monitor memory usage
 */
function monitorMemory() {
  const memUsage = process.memoryUsage();
  metrics.memoryUsage.push({
    timestamp: Date.now(),
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external
  });
}

/**
 * Calculate performance statistics
 */
function calculateStats(times) {
  if (times.length === 0) return null;
  
  const sorted = [...times].sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  
  return {
    count: times.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / times.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

/**
 * Generate performance report
 */
function generateReport() {
  console.log('\n📊 Performance Analysis Report');
  console.log('============================================================');
  
  // Overall metrics
  console.log(`\n📈 Overall Metrics:`);
  console.log(`  Total Requests: ${metrics.totalRequests}`);
  console.log(`  Errors: ${metrics.errorCount}`);
  console.log(`  Success Rate: ${((metrics.totalRequests - metrics.errorCount) / metrics.totalRequests * 100).toFixed(1)}%`);
  
  // Login performance
  const loginStats = calculateStats(metrics.loginTime);
  if (loginStats) {
    console.log(`\n🔐 Login Performance:`);
    console.log(`  Average: ${loginStats.avg.toFixed(2)}ms`);
    console.log(`  Min: ${loginStats.min.toFixed(2)}ms`);
    console.log(`  Max: ${loginStats.max.toFixed(2)}ms`);
    console.log(`  P95: ${loginStats.p95.toFixed(2)}ms`);
  }
  
  // Audit insert performance
  const insertStats = calculateStats(metrics.auditInsertTime);
  if (insertStats) {
    console.log(`\n📝 Audit Insert Performance:`);
    console.log(`  Average: ${insertStats.avg.toFixed(2)}ms`);
    console.log(`  Min: ${insertStats.min.toFixed(2)}ms`);
    console.log(`  Max: ${insertStats.max.toFixed(2)}ms`);
    console.log(`  P95: ${insertStats.p95.toFixed(2)}ms`);
    console.log(`  P99: ${insertStats.p99.toFixed(2)}ms`);
  }
  
  // Audit query performance
  const queryStats = calculateStats(metrics.auditQueryTime);
  if (queryStats) {
    console.log(`\n🔍 Audit Query Performance:`);
    console.log(`  Average: ${queryStats.avg.toFixed(2)}ms`);
    console.log(`  Min: ${queryStats.min.toFixed(2)}ms`);
    console.log(`  Max: ${queryStats.max.toFixed(2)}ms`);
    console.log(`  P95: ${queryStats.p95.toFixed(2)}ms`);
  }
  
  // Audit stats performance
  const statsStats = calculateStats(metrics.auditStatsTime);
  if (statsStats) {
    console.log(`\n📊 Audit Statistics Performance:`);
    console.log(`  Average: ${statsStats.avg.toFixed(2)}ms`);
    console.log(`  Min: ${statsStats.min.toFixed(2)}ms`);
    console.log(`  Max: ${statsStats.max.toFixed(2)}ms`);
    console.log(`  P95: ${statsStats.p95.toFixed(2)}ms`);
  }
  
  // Memory usage
  if (metrics.memoryUsage.length > 0) {
    const latest = metrics.memoryUsage[metrics.memoryUsage.length - 1];
    console.log(`\n💾 Memory Usage:`);
    console.log(`  RSS: ${(latest.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(latest.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(latest.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  }
  
  // Performance recommendations
  console.log(`\n💡 Performance Recommendations:`);
  
  if (insertStats && insertStats.avg > 100) {
    console.log(`  ⚠️  Audit insert average (${insertStats.avg.toFixed(2)}ms) is above 100ms - consider batch optimization`);
  } else if (insertStats) {
    console.log(`  ✅ Audit insert performance is good (${insertStats.avg.toFixed(2)}ms)`);
  }
  
  if (queryStats && queryStats.avg > 200) {
    console.log(`  ⚠️  Audit query average (${queryStats.avg.toFixed(2)}ms) is above 200ms - consider indexing optimization`);
  } else if (queryStats) {
    console.log(`  ✅ Audit query performance is good (${queryStats.avg.toFixed(2)}ms)`);
  }
  
  if (metrics.errorCount > 0) {
    console.log(`  ⚠️  ${metrics.errorCount} errors detected - investigate error handling`);
  } else {
    console.log(`  ✅ No errors detected - system is stable`);
  }
  
  console.log('\n============================================================');
}

/**
 * Main performance test function
 */
async function runPerformanceTest() {
  console.log('🚀 Starting Audit Logging Performance Test');
  console.log('============================================================');
  
  try {
    // Monitor initial memory
    monitorMemory();
    
    // Login
    console.log('\n🔐 Logging in...');
    const token = await login();
    console.log('✅ Login successful');
    
    // Run performance tests
    await testAuditInsert(token, 20);
    await testAuditQuery(token, 10);
    await testAuditStats(token, 5);
    
    // Monitor final memory
    monitorMemory();
    
    // Generate report
    generateReport();
    
    console.log('\n🎉 Performance test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Performance test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runPerformanceTest();
}

module.exports = { runPerformanceTest, metrics };

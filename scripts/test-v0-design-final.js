#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      data = { message: 'Non-JSON response', raw: await response.text() };
    }
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function testV0Design() {
  console.log('🎨 Testing V0.dev Design Implementation - Final Verification');
  console.log('============================================================');

  // Test 1: Dashboard loads successfully
  console.log('\n📊 Testing Dashboard Load...');
  const dashboardResponse = await makeRequest(`${BASE_URL}/dashboard`);
  if (dashboardResponse.status === 200) {
    console.log('✅ Dashboard loads successfully');
  } else {
    console.log('❌ Dashboard failed to load:', dashboardResponse.status);
    return;
  }

  // Test 2: Check for v0.dev design elements
  console.log('\n🎯 Testing V0.dev Design Elements...');
  
  const htmlContent = dashboardResponse.data.raw || '';
  
  const designElements = [
    { name: 'Agency Dashboard Header', pattern: 'Agency Dashboard' },
    { name: 'Version Dropdown (v35)', pattern: 'v35' },
    { name: 'User Profile (Sarah J.)', pattern: 'Sarah J.' },
    { name: 'Search Input', pattern: 'Search...' },
    { name: 'Monitor Icon', pattern: 'lucide-monitor' },
    { name: 'Bell Icon', pattern: 'lucide-bell' },
    { name: 'Dark Theme', pattern: 'bg-black text-white' },
    { name: 'Sidebar Navigation', pattern: 'OVERVIEW' },
    { name: 'KPI Cards', pattern: 'Ad Spend' },
    { name: 'Cash Collected KPI', pattern: 'Cash Collected' },
    { name: 'Average Order Value', pattern: 'Average Order Value' },
    { name: 'ROAS KPI', pattern: 'ROAS' },
    { name: 'Line Chart', pattern: 'Spend, and Profit Trends' },
    { name: 'Client P&L Summary', pattern: 'Client P&L Summary' },
    { name: 'TechCorp Client', pattern: 'TechCorp Inc.' },
    { name: 'StartupXYZ Client', pattern: 'StartupXYZ' },
    { name: 'Export Button', pattern: 'Export' },
    { name: 'Filters Button', pattern: 'Filters' },
    { name: 'Date Range Selector', pattern: 'Last 30 days' }
  ];

  let passedTests = 0;
  let totalTests = designElements.length;

  designElements.forEach(element => {
    if (htmlContent.includes(element.pattern)) {
      console.log(`✅ ${element.name}`);
      passedTests++;
    } else {
      console.log(`❌ ${element.name} - Missing: ${element.pattern}`);
    }
  });

  // Test 3: Check for exact KPI values
  console.log('\n💰 Testing Exact KPI Values...');
  const kpiValues = [
    { name: 'Ad Spend Value', pattern: '$847,293' },
    { name: 'Cash Collected Value', pattern: '$2,234,891' },
    { name: 'Average Order Value', pattern: '$4,892' },
    { name: 'ROAS Value', pattern: '3.36x' }
  ];

  kpiValues.forEach(kpi => {
    if (htmlContent.includes(kpi.pattern)) {
      console.log(`✅ ${kpi.name}: ${kpi.pattern}`);
      passedTests++;
      totalTests++;
    } else {
      console.log(`❌ ${kpi.name} - Missing: ${kpi.pattern}`);
      totalTests++;
    }
  });

  // Test 4: Check for exact client data
  console.log('\n🏢 Testing Client P&L Data...');
  const clientData = [
    { name: 'TechCorp Revenue', pattern: '$892k' },
    { name: 'TechCorp Ad Spend', pattern: '$268k' },
    { name: 'TechCorp Total', pattern: '$624,400' },
    { name: 'StartupXYZ Revenue', pattern: '$650k' },
    { name: 'StartupXYZ Ad Spend', pattern: '$195k' },
    { name: 'StartupXYZ Total', pattern: '$457,800' }
  ];

  clientData.forEach(data => {
    if (htmlContent.includes(data.pattern)) {
      console.log(`✅ ${data.name}: ${data.pattern}`);
      passedTests++;
      totalTests++;
    } else {
      console.log(`❌ ${data.name} - Missing: ${data.pattern}`);
      totalTests++;
    }
  });

  // Final Results
  console.log('\n📈 Final Results:');
  console.log('==================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 SUCCESS! V0.dev design implementation is PERFECT!');
    console.log('✨ All design elements, colors, and data match exactly!');
  } else {
    console.log('\n⚠️  Some elements may need adjustment');
    console.log('🔧 Check the failed tests above for details');
  }

  console.log('\n🌐 Access your dashboard at: http://localhost:3000/dashboard');
}

// Run the test
testV0Design().catch(console.error);
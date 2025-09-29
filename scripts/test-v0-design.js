#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

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
  console.log('🎨 Testing V0 Design Implementation');
  console.log('=====================================');

  // Test 1: Dashboard loads successfully
  console.log('\n📊 Testing Dashboard Load...');
  const dashboardResponse = await makeRequest(`${BASE_URL}/dashboard`);
  if (dashboardResponse.status === 200) {
    console.log('✅ Dashboard loads successfully (200)');
  } else {
    console.log(`❌ Dashboard failed to load (${dashboardResponse.status})`);
    return;
  }

  // Test 2: Check for dark theme elements
  console.log('\n🌙 Testing Dark Theme Elements...');
  const htmlContent = await fetch(`${BASE_URL}/dashboard`).then(r => r.text());
  
  const darkThemeChecks = [
    { name: 'Dark class on html', pattern: 'class="dark"' },
    { name: 'Dashboard dark class on body', pattern: 'dashboard-dark' },
    { name: 'Black background', pattern: 'bg-black' },
    { name: 'White text', pattern: 'text-white' },
    { name: 'Gray borders', pattern: 'border-gray-800' }
  ];

  let darkThemePassed = 0;
  darkThemeChecks.forEach(check => {
    if (htmlContent.includes(check.pattern)) {
      console.log(`✅ ${check.name} - Found`);
      darkThemePassed++;
    } else {
      console.log(`❌ ${check.name} - Missing`);
    }
  });

  // Test 3: Check for V0 specific elements
  console.log('\n🎯 Testing V0 Design Elements...');
  const v0Elements = [
    { name: 'Agency Dashboard title', pattern: 'Agency Dashboard' },
    { name: 'Client Tracking System subtitle', pattern: 'Client Tracking System' },
    { name: 'v35 version indicator', pattern: 'v35' },
    { name: 'CEO role indicator', pattern: 'CEO' },
    { name: 'OVERVIEW navigation', pattern: 'OVERVIEW' },
    { name: 'PERFORMANCE navigation', pattern: 'PERFORMANCE' },
    { name: 'CLIENT MANA navigation', pattern: 'CLIENT MANA' },
    { name: 'SETTINGS navigation', pattern: 'SETTINGS' },
    { name: 'Sarah J. user profile', pattern: 'Sarah J.' },
    { name: 'Insights and financial performance title', pattern: 'insights and financial performance' },
    { name: 'Last 30 days dropdown', pattern: 'Last 30 days' },
    { name: 'FILTERS button', pattern: 'FILTERS' },
    { name: 'EXPORT button', pattern: 'EXPORT' }
  ];

  let v0ElementsPassed = 0;
  v0Elements.forEach(element => {
    if (htmlContent.includes(element.pattern)) {
      console.log(`✅ ${element.name} - Found`);
      v0ElementsPassed++;
    } else {
      console.log(`❌ ${element.name} - Missing`);
    }
  });

  // Test 4: Check for KPI Cards
  console.log('\n📈 Testing KPI Cards...');
  const kpiCards = [
    { name: 'Ad Spend card', pattern: 'Ad Spend' },
    { name: 'Cash Collected card', pattern: 'Cash Collected' },
    { name: 'Average Order Value card', pattern: 'Average Order Value' },
    { name: 'ROAS card', pattern: 'ROAS (Return on Ad Spend)' },
    { name: 'Ad Spend value $847,293', pattern: '$847,293' },
    { name: 'Cash Collected value $2,234,891', pattern: '$2,234,891' },
    { name: 'Average Order Value $4,892', pattern: '$4,892' },
    { name: 'ROAS value 3.36x', pattern: '3.36x' }
  ];

  let kpiCardsPassed = 0;
  kpiCards.forEach(card => {
    if (htmlContent.includes(card.pattern)) {
      console.log(`✅ ${card.name} - Found`);
      kpiCardsPassed++;
    } else {
      console.log(`❌ ${card.name} - Missing`);
    }
  });

  // Test 5: Check for Chart Elements
  console.log('\n📊 Testing Chart Elements...');
  const chartElements = [
    { name: 'Chart title', pattern: 'end, and profit trends over the past year' },
    { name: 'Chart container', pattern: 'chart-container' },
    { name: 'Grid lines', pattern: 'border-gray-700' },
    { name: 'Blue line color', pattern: '#3b82f6' },
    { name: 'Orange line color', pattern: '#f97316' },
    { name: 'Green line color', pattern: '#10b981' }
  ];

  let chartElementsPassed = 0;
  chartElements.forEach(element => {
    if (htmlContent.includes(element.pattern)) {
      console.log(`✅ ${element.name} - Found`);
      chartElementsPassed++;
    } else {
      console.log(`❌ ${element.name} - Missing`);
    }
  });

  // Test 6: Check for Client P&L Summary
  console.log('\n💰 Testing Client P&L Summary...');
  const clientPLElements = [
    { name: 'Client P&L Summary title', pattern: 'Client P&L Summary' },
    { name: 'TechCorp Inc.', pattern: 'TechCorp Inc.' },
    { name: 'StartupXYZ', pattern: 'StartupXYZ' },
    { name: 'Excellent badge', pattern: 'excellent' },
    { name: 'Revenue $892k', pattern: '$892k' },
    { name: 'Ad Spend $268k', pattern: '$268k' },
    { name: 'Margin 70.0%', pattern: '70.0%' },
    { name: 'Total $624,400', pattern: '$624,400' },
    { name: 'Total $457,800', pattern: '$457,800' }
  ];

  let clientPLElementsPassed = 0;
  clientPLElements.forEach(element => {
    if (htmlContent.includes(element.pattern)) {
      console.log(`✅ ${element.name} - Found`);
      clientPLElementsPassed++;
    } else {
      console.log(`❌ ${element.name} - Missing`);
    }
  });

  // Test 7: Check for Icons
  console.log('\n🎨 Testing Icons...');
  const iconElements = [
    { name: 'Bar chart icon', pattern: 'lucide-chart-column' },
    { name: 'Trending up icon', pattern: 'lucide-trending-up' },
    { name: 'File text icon', pattern: 'lucide-file-text' },
    { name: 'Settings icon', pattern: 'lucide-settings' },
    { name: 'Dollar sign icon', pattern: 'lucide-dollar-sign' },
    { name: 'Credit card icon', pattern: 'lucide-credit-card' },
    { name: 'User icon', pattern: 'lucide-user' },
    { name: 'Target icon', pattern: 'lucide-target' },
    { name: 'Monitor icon', pattern: 'lucide-monitor' },
    { name: 'Refresh icon', pattern: 'lucide-refresh-cw' },
    { name: 'Chevron down icon', pattern: 'lucide-chevron-down' },
    { name: 'Filter icon', pattern: 'lucide-funnel' },
    { name: 'Download icon', pattern: 'lucide-download' }
  ];

  let iconElementsPassed = 0;
  iconElements.forEach(element => {
    if (htmlContent.includes(element.pattern)) {
      console.log(`✅ ${element.name} - Found`);
      iconElementsPassed++;
    } else {
      console.log(`❌ ${element.name} - Missing`);
    }
  });

  // Summary
  console.log('\n=====================================');
  console.log('🎯 V0 Design Implementation Summary');
  console.log('=====================================');
  console.log(`🌙 Dark Theme Elements: ${darkThemePassed}/${darkThemeChecks.length} (${Math.round(darkThemePassed/darkThemeChecks.length*100)}%)`);
  console.log(`🎯 V0 Design Elements: ${v0ElementsPassed}/${v0Elements.length} (${Math.round(v0ElementsPassed/v0Elements.length*100)}%)`);
  console.log(`📈 KPI Cards: ${kpiCardsPassed}/${kpiCards.length} (${Math.round(kpiCardsPassed/kpiCards.length*100)}%)`);
  console.log(`📊 Chart Elements: ${chartElementsPassed}/${chartElements.length} (${Math.round(chartElementsPassed/chartElements.length*100)}%)`);
  console.log(`💰 Client P&L Elements: ${clientPLElementsPassed}/${clientPLElements.length} (${Math.round(clientPLElementsPassed/clientPLElements.length*100)}%)`);
  console.log(`🎨 Icons: ${iconElementsPassed}/${iconElements.length} (${Math.round(iconElementsPassed/iconElements.length*100)}%)`);

  const totalElements = darkThemeChecks.length + v0Elements.length + kpiCards.length + chartElements.length + clientPLElements.length + iconElements.length;
  const totalPassed = darkThemePassed + v0ElementsPassed + kpiCardsPassed + chartElementsPassed + clientPLElementsPassed + iconElementsPassed;
  const overallPercentage = Math.round(totalPassed/totalElements*100);

  console.log(`\n🏆 Overall V0 Design Match: ${totalPassed}/${totalElements} (${overallPercentage}%)`);

  if (overallPercentage >= 90) {
    console.log('🎉 EXCELLENT! V0 design implementation is nearly perfect!');
  } else if (overallPercentage >= 80) {
    console.log('✅ GOOD! V0 design implementation is very close to the original.');
  } else if (overallPercentage >= 70) {
    console.log('⚠️  FAIR! V0 design implementation needs some improvements.');
  } else {
    console.log('❌ POOR! V0 design implementation needs significant work.');
  }

  return {
    overallPercentage,
    totalPassed,
    totalElements,
    details: {
      darkTheme: { passed: darkThemePassed, total: darkThemeChecks.length },
      v0Elements: { passed: v0ElementsPassed, total: v0Elements.length },
      kpiCards: { passed: kpiCardsPassed, total: kpiCards.length },
      chartElements: { passed: chartElementsPassed, total: chartElements.length },
      clientPLElements: { passed: clientPLElementsPassed, total: clientPLElements.length },
      iconElements: { passed: iconElementsPassed, total: iconElements.length }
    }
  };
}

// Run the test
testV0Design().then(result => {
  if (result.overallPercentage >= 80) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Needs improvement
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

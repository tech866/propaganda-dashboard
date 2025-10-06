#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  // Test suites to run
  suites: [
    'validation',
    'api',
    'compliance',
    'integration'
  ],
  
  // Test file patterns
  patterns: {
    validation: 'src/tests/validation/**/*.test.ts',
    api: 'src/tests/api/**/*.test.ts',
    compliance: 'src/tests/compliance/**/*.test.ts',
    integration: 'src/tests/integration/**/*.test.ts'
  },
  
  // Jest configuration
  jestConfig: {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/tests/**',
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup/testConfig.ts'],
    testTimeout: 10000,
    verbose: true
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Check if test files exist
function checkTestFiles() {
  logSection('Checking Test Files');
  
  const testFiles = [];
  const missingFiles = [];
  
  // Check for test files in each suite
  testConfig.suites.forEach(suite => {
    const pattern = testConfig.patterns[suite];
    const testDir = path.join(process.cwd(), 'src', 'tests', suite);
    
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir, { recursive: true })
        .filter(file => file.endsWith('.test.ts') || file.endsWith('.spec.ts'));
      
      if (files.length > 0) {
        logSuccess(`Found ${files.length} test files in ${suite} suite`);
        testFiles.push(...files.map(file => path.join(testDir, file)));
      } else {
        logWarning(`No test files found in ${suite} suite`);
        missingFiles.push(suite);
      }
    } else {
      logWarning(`Test directory not found: ${testDir}`);
      missingFiles.push(suite);
    }
  });
  
  if (testFiles.length === 0) {
    logError('No test files found!');
    return false;
  }
  
  logInfo(`Total test files found: ${testFiles.length}`);
  return true;
}

// Run specific test suite
function runTestSuite(suite) {
  logSection(`Running ${suite.toUpperCase()} Tests`);
  
  try {
    const testDir = path.join(process.cwd(), 'src', 'tests', suite);
    const pattern = path.join(testDir, '**/*.test.ts');
    
    logInfo(`Running tests in: ${pattern}`);
    
    const command = `npx jest "${pattern}" --config='${JSON.stringify(testConfig.jestConfig)}'`;
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    logSuccess(`${suite} tests passed!`);
    return true;
  } catch (error) {
    logError(`${suite} tests failed!`);
    return false;
  }
}

// Run all tests
function runAllTests() {
  logSection('Running All Tests');
  
  let passedSuites = 0;
  let totalSuites = 0;
  
  testConfig.suites.forEach(suite => {
    totalSuites++;
    if (runTestSuite(suite)) {
      passedSuites++;
    }
  });
  
  logSection('Test Results Summary');
  logInfo(`Suites passed: ${passedSuites}/${totalSuites}`);
  
  if (passedSuites === totalSuites) {
    logSuccess('All test suites passed! 🎉');
    return true;
  } else {
    logError(`${totalSuites - passedSuites} test suite(s) failed!`);
    return false;
  }
}

// Run tests with coverage
function runTestsWithCoverage() {
  logSection('Running Tests with Coverage');
  
  try {
    const command = `npx jest --coverage --config='${JSON.stringify(testConfig.jestConfig)}'`;
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    logSuccess('Tests with coverage completed!');
    return true;
  } catch (error) {
    logError('Tests with coverage failed!');
    return false;
  }
}

// Validate test environment
function validateTestEnvironment() {
  logSection('Validating Test Environment');
  
  // Check if Jest is installed
  try {
    execSync('npx jest --version', { stdio: 'pipe' });
    logSuccess('Jest is installed');
  } catch (error) {
    logError('Jest is not installed. Please run: npm install --save-dev jest @types/jest ts-jest');
    return false;
  }
  
  // Check if TypeScript is configured
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    logSuccess('TypeScript configuration found');
  } else {
    logWarning('TypeScript configuration not found');
  }
  
  // Check if test directories exist
  const testDir = path.join(process.cwd(), 'src', 'tests');
  if (fs.existsSync(testDir)) {
    logSuccess('Test directory exists');
  } else {
    logWarning('Test directory does not exist');
  }
  
  return true;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  logSection('Enhanced Call Logging System - Test Runner');
  logInfo(`Running command: ${command}`);
  
  // Validate environment first
  if (!validateTestEnvironment()) {
    process.exit(1);
  }
  
  // Check test files
  if (!checkTestFiles()) {
    process.exit(1);
  }
  
  let success = false;
  
  switch (command) {
    case 'validation':
      success = runTestSuite('validation');
      break;
    case 'api':
      success = runTestSuite('api');
      break;
    case 'compliance':
      success = runTestSuite('compliance');
      break;
    case 'integration':
      success = runTestSuite('integration');
      break;
    case 'coverage':
      success = runTestsWithCoverage();
      break;
    case 'all':
    default:
      success = runAllTests();
      break;
  }
  
  if (success) {
    logSection('Test Execution Complete');
    logSuccess('All tests completed successfully! 🎉');
    process.exit(0);
  } else {
    logSection('Test Execution Failed');
    logError('Some tests failed. Please check the output above.');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the main function
main();

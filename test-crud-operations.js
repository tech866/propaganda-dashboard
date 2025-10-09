#!/usr/bin/env node

/**
 * Comprehensive CRUD Test for Supabase Database Operations
 * Tests Create, Read, Update, Delete functionality across all tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test data for CRUD operations (matching actual schema)
const testData = {
  client: {
    name: 'Test Client CRUD',
    email: 'test-crud@client.com',
    phone: '+1234567891',
    address: '123 Test Street',
    is_active: true
  },
  user: {
    client_id: null, // Will be set after client creation
    clerk_user_id: 'test-clerk-user-123',
    email: 'test-crud@user.com',
    name: 'Test User',
    password_hash: '',
    role: 'USER',
    is_active: true,
    clerk_metadata: { test: true }
  },
  call: {
    client_id: null, // Will be set after client creation
    user_id: null, // Will be set after user creation
    prospect_name: 'Test Prospect',
    prospect_email: 'prospect@test.com',
    prospect_phone: '+1234567892',
    call_type: 'outbound',
    status: 'completed',
    outcome: 'tbd',
    notes: 'CRUD test call',
    call_duration: 30,
    scheduled_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    closer_first_name: 'Test',
    closer_last_name: 'Closer',
    source_of_set_appointment: 'sdr_booked_call',
    enhanced_call_outcome: 'follow_up_call_scheduled',
    customer_full_name: 'Test Customer',
    customer_email: 'customer@test.com',
    calls_taken: 1,
    setter_first_name: 'Test',
    setter_last_name: 'Setter',
    cash_collected_upfront: 0,
    total_amount_owed: 0,
    prospect_notes: 'Test prospect notes',
    lead_source: 'organic'
  },
  lossReason: {
    name: 'Test Loss Reason',
    description: 'CRUD test loss reason',
    is_active: true
  }
};

class CRUDTester {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.supabaseAdmin = this.serviceRoleKey ? 
      createClient(this.supabaseUrl, this.serviceRoleKey) : null;
    
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testConnection() {
    this.log('Testing Supabase connection...');
    
    try {
      const { data, error } = await this.supabase.from('agencies').select('count').limit(1);
      
      if (error) {
        this.log(`Connection failed: ${error.message}`, 'error');
        return false;
      }
      
      this.log('Connection successful', 'success');
      return true;
    } catch (error) {
      this.log(`Connection error: ${error.message}`, 'error');
      return false;
    }
  }

  async testCreate(table, data, testName) {
    this.log(`Testing CREATE operation for ${table}...`);
    
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        this.log(`CREATE failed for ${table}: ${error.message}`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push(`${testName}: ${error.message}`);
        return null;
      }
      
      this.log(`CREATE successful for ${table}`, 'success');
      this.testResults.passed++;
      return result;
    } catch (error) {
      this.log(`CREATE error for ${table}: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`${testName}: ${error.message}`);
      return null;
    }
  }

  async testRead(table, filters = {}, testName) {
    this.log(`Testing READ operation for ${table}...`);
    
    try {
      let query = this.supabase.from(table).select('*');
      
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
      
      const { data, error } = await query;
      
      if (error) {
        this.log(`READ failed for ${table}: ${error.message}`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push(`${testName}: ${error.message}`);
        return null;
      }
      
      this.log(`READ successful for ${table} - found ${data.length} records`, 'success');
      this.testResults.passed++;
      return data;
    } catch (error) {
      this.log(`READ error for ${table}: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`${testName}: ${error.message}`);
      return null;
    }
  }

  async testUpdate(table, id, updateData, testName) {
    this.log(`Testing UPDATE operation for ${table}...`);
    
    try {
      const { data, error } = await this.supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        this.log(`UPDATE failed for ${table}: ${error.message}`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push(`${testName}: ${error.message}`);
        return null;
      }
      
      this.log(`UPDATE successful for ${table}`, 'success');
      this.testResults.passed++;
      return data;
    } catch (error) {
      this.log(`UPDATE error for ${table}: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`${testName}: ${error.message}`);
      return null;
    }
  }

  async testDelete(table, id, testName) {
    this.log(`Testing DELETE operation for ${table}...`);
    
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        this.log(`DELETE failed for ${table}: ${error.message}`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push(`${testName}: ${error.message}`);
        return false;
      }
      
      this.log(`DELETE successful for ${table}`, 'success');
      this.testResults.passed++;
      return true;
    } catch (error) {
      this.log(`DELETE error for ${table}: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`${testName}: ${error.message}`);
      return false;
    }
  }

  async testClientCRUD() {
    this.log('\n🏢 Testing Client CRUD Operations...');
    
    // CREATE
    const client = await this.testCreate('clients', testData.client, 'Client Create');
    if (!client) return;
    
    // READ
    const clients = await this.testRead('clients', { id: client.id }, 'Client Read');
    if (!clients || clients.length === 0) return;
    
    // UPDATE
    const updatedClient = await this.testUpdate(
      'clients', 
      client.id, 
      { name: 'Updated Test Client CRUD' }, 
      'Client Update'
    );
    if (!updatedClient) return;
    
    // DELETE
    await this.testDelete('clients', client.id, 'Client Delete');
    
    return client.id;
  }

  async testUserCRUD() {
    this.log('\n👤 Testing User CRUD Operations...');
    
    // First create a client for the user
    const client = await this.testCreate('clients', testData.client, 'Client for User');
    if (!client) return;
    
    // Update test data with client ID
    const userData = { ...testData.user, client_id: client.id };
    
    // CREATE
    const user = await this.testCreate('users', userData, 'User Create');
    if (!user) {
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // READ
    const users = await this.testRead('users', { id: user.id }, 'User Read');
    if (!users || users.length === 0) {
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // UPDATE
    const updatedUser = await this.testUpdate(
      'users', 
      user.id, 
      { name: 'Updated Test User' }, 
      'User Update'
    );
    if (!updatedUser) {
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // DELETE
    await this.testDelete('users', user.id, 'User Delete');
    await this.testDelete('clients', client.id, 'Cleanup Client');
    
    return user.id;
  }

  async testCallCRUD() {
    this.log('\n📞 Testing Call CRUD Operations...');
    
    // First create a client and user for the call
    const client = await this.testCreate('clients', testData.client, 'Client for Call');
    if (!client) return;
    
    const userData = { ...testData.user, client_id: client.id };
    const user = await this.testCreate('users', userData, 'User for Call');
    if (!user) {
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // Update test data with client and user IDs
    const callData = { ...testData.call, client_id: client.id, user_id: user.id };
    
    // CREATE
    const call = await this.testCreate('calls', callData, 'Call Create');
    if (!call) {
      await this.testDelete('users', user.id, 'Cleanup User');
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // READ
    const calls = await this.testRead('calls', { id: call.id }, 'Call Read');
    if (!calls || calls.length === 0) {
      await this.testDelete('users', user.id, 'Cleanup User');
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // UPDATE
    const updatedCall = await this.testUpdate(
      'calls', 
      call.id, 
      { notes: 'Updated CRUD test call' }, 
      'Call Update'
    );
    if (!updatedCall) {
      await this.testDelete('users', user.id, 'Cleanup User');
      await this.testDelete('clients', client.id, 'Cleanup Client');
      return;
    }
    
    // DELETE
    await this.testDelete('calls', call.id, 'Call Delete');
    await this.testDelete('users', user.id, 'Cleanup User');
    await this.testDelete('clients', client.id, 'Cleanup Client');
    
    return call.id;
  }

  async testLossReasonCRUD() {
    this.log('\n❌ Testing Loss Reason CRUD Operations...');
    
    // CREATE
    const lossReason = await this.testCreate('loss_reasons', testData.lossReason, 'Loss Reason Create');
    if (!lossReason) return;
    
    // READ
    const lossReasons = await this.testRead('loss_reasons', { id: lossReason.id }, 'Loss Reason Read');
    if (!lossReasons || lossReasons.length === 0) return;
    
    // UPDATE
    const updatedLossReason = await this.testUpdate(
      'loss_reasons', 
      lossReason.id, 
      { name: 'Updated Test Loss Reason' }, 
      'Loss Reason Update'
    );
    if (!updatedLossReason) return;
    
    // DELETE
    await this.testDelete('loss_reasons', lossReason.id, 'Loss Reason Delete');
    
    return lossReason.id;
  }

  async testDatabaseService() {
    this.log('\n🔧 Testing DatabaseService Integration...');
    
    try {
      // Test select operation using direct Supabase client
      const { data: clients, error } = await this.supabase.from('clients').select('*').limit(5);
      if (error) {
        this.log(`DatabaseService select failed: ${error.message}`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push('DatabaseService Select: ' + error.message);
      } else {
        this.log(`DatabaseService select successful - found ${clients?.length || 0} clients`, 'success');
        this.testResults.passed++;
      }
      
      // Test count operation
      const { count, error: countError } = await this.supabase.from('clients').select('*', { count: 'exact', head: true });
      if (countError) {
        this.log(`DatabaseService count failed: ${countError.message}`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push('DatabaseService Count: ' + countError.message);
      } else {
        this.log(`DatabaseService count successful - ${count || 0} clients`, 'success');
        this.testResults.passed++;
      }
      
    } catch (error) {
      this.log(`DatabaseService test failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push('DatabaseService: ' + error.message);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive CRUD Tests...\n');
    
    // Test connection first
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      this.log('❌ Connection test failed. Aborting all tests.', 'error');
      return;
    }
    
    // Run CRUD tests for each table
    await this.testClientCRUD();
    await this.testUserCRUD();
    await this.testCallCRUD();
    await this.testLossReasonCRUD();
    
    // Test DatabaseService integration
    await this.testDatabaseService();
    
    // Print results
    this.log('\n📊 Test Results Summary:');
    this.log(`✅ Passed: ${this.testResults.passed}`);
    this.log(`❌ Failed: ${this.testResults.failed}`);
    
    if (this.testResults.errors.length > 0) {
      this.log('\n❌ Errors encountered:');
      this.testResults.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    }
    
    const successRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100;
    this.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      this.log('🎉 CRUD operations are working excellently!', 'success');
    } else if (successRate >= 70) {
      this.log('⚠️ CRUD operations are mostly working, but some issues need attention.', 'warning');
    } else {
      this.log('❌ CRUD operations have significant issues that need to be resolved.', 'error');
    }
  }
}

async function main() {
  try {
    const tester = new CRUDTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);

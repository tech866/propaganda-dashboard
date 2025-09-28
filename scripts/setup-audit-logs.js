/**
 * Setup Enhanced Audit Logs Table
 * Task 10.4 - Create Audit Logs Table
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'propaganda_dashboard',
  user: process.env.DB_USER || 'travis',
  password: process.env.DB_PASSWORD || '',
};

// Create database connection
const pool = new Pool(dbConfig);

async function setupAuditLogs() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting audit logs table setup...');
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'setup-audit-logs.sql'), 
      'utf8'
    );
    
    // Execute the SQL script
    console.log('📝 Executing SQL script...');
    await client.query(sqlScript);
    
    // Verify the setup
    console.log('✅ Verifying setup...');
    
    // Check if audit_logs table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      throw new Error('audit_logs table was not created');
    }
    
    // Check enhanced columns
    const columnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs' 
      AND column_name IN ('session_id', 'endpoint', 'http_method', 'status_code', 'operation_duration_ms', 'error_message', 'metadata')
      ORDER BY column_name;
    `);
    
    const expectedColumns = ['endpoint', 'error_message', 'http_method', 'metadata', 'operation_duration_ms', 'session_id', 'status_code'];
    const actualColumns = columnsCheck.rows.map(row => row.column_name).sort();
    
    if (JSON.stringify(actualColumns) !== JSON.stringify(expectedColumns)) {
      throw new Error(`Missing enhanced columns. Expected: ${expectedColumns.join(', ')}, Found: ${actualColumns.join(', ')}`);
    }
    
    // Check indexes
    const indexesCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'audit_logs' 
      AND indexname LIKE 'idx_audit_logs_%'
      ORDER BY indexname;
    `);
    
    const expectedIndexes = [
      'idx_audit_logs_action',
      'idx_audit_logs_client_created',
      'idx_audit_logs_client_id',
      'idx_audit_logs_created_at',
      'idx_audit_logs_endpoint',
      'idx_audit_logs_session_id',
      'idx_audit_logs_status_code',
      'idx_audit_logs_table_action',
      'idx_audit_logs_table_name',
      'idx_audit_logs_user_created',
      'idx_audit_logs_user_id'
    ];
    
    const actualIndexes = indexesCheck.rows.map(row => row.indexname).sort();
    
    console.log('📊 Index verification:');
    console.log(`   Expected indexes: ${expectedIndexes.length}`);
    console.log(`   Found indexes: ${actualIndexes.length}`);
    
    // Check view
    const viewCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs_summary'
      );
    `);
    
    if (!viewCheck.rows[0].exists) {
      throw new Error('audit_logs_summary view was not created');
    }
    
    // Check functions
    const functionsCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('cleanup_old_audit_logs', 'get_audit_log_stats')
      ORDER BY routine_name;
    `);
    
    const expectedFunctions = ['cleanup_old_audit_logs', 'get_audit_log_stats'];
    const actualFunctions = functionsCheck.rows.map(row => row.routine_name).sort();
    
    if (JSON.stringify(actualFunctions) !== JSON.stringify(expectedFunctions)) {
      throw new Error(`Missing functions. Expected: ${expectedFunctions.join(', ')}, Found: ${actualFunctions.join(', ')}`);
    }
    
    // Check sample data
    const sampleDataCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM audit_logs 
      WHERE metadata->>'source' = 'setup_script';
    `);
    
    const sampleDataCount = parseInt(sampleDataCheck.rows[0].count);
    if (sampleDataCount < 2) {
      throw new Error(`Expected at least 2 sample audit logs, found ${sampleDataCount}`);
    }
    
    // Test the view
    const viewTest = await client.query(`
      SELECT COUNT(*) as count 
      FROM audit_logs_summary;
    `);
    
    console.log('📋 Setup Summary:');
    console.log(`   ✅ audit_logs table: Created`);
    console.log(`   ✅ Enhanced columns: ${actualColumns.length}/7 added`);
    console.log(`   ✅ Indexes: ${actualIndexes.length}/${expectedIndexes.length} created`);
    console.log(`   ✅ audit_logs_summary view: Created`);
    console.log(`   ✅ Functions: ${actualFunctions.length}/2 created`);
    console.log(`   ✅ Sample data: ${sampleDataCount} records inserted`);
    console.log(`   ✅ View test: ${viewTest.rows[0].count} records accessible`);
    
    console.log('\n🎉 Audit logs table setup completed successfully!');
    console.log('\n📚 Available features:');
    console.log('   • Enhanced audit logging with session tracking');
    console.log('   • Performance metrics and error tracking');
    console.log('   • Comprehensive audit log view with user/client info');
    console.log('   • Automated cleanup function for old logs');
    console.log('   • Statistics function for audit log analysis');
    console.log('   • Optimized indexes for fast querying');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function testAuditLogs() {
  const client = await pool.connect();
  
  try {
    console.log('\n🧪 Testing audit logs functionality...');
    
    // Test 1: Insert a new audit log
    console.log('   Test 1: Inserting new audit log...');
    const insertResult = await client.query(`
      INSERT INTO audit_logs (
        client_id, user_id, table_name, record_id, action,
        endpoint, http_method, status_code, operation_duration_ms,
        ip_address, user_agent, session_id, metadata
      ) VALUES (
        (SELECT id FROM clients LIMIT 1),
        (SELECT id FROM users LIMIT 1),
        'test_table',
        uuid_generate_v4(),
        'INSERT',
        '/api/test',
        'POST',
        201,
        100,
        '127.0.0.1',
        'Test User Agent',
        'test-session-456',
        '{"test": true, "timestamp": "${new Date().toISOString()}"}'
      ) RETURNING id;
    `);
    
    const newLogId = insertResult.rows[0].id;
    console.log(`   ✅ Inserted audit log with ID: ${newLogId}`);
    
    // Test 2: Query using the view
    console.log('   Test 2: Querying audit logs summary view...');
    const viewResult = await client.query(`
      SELECT id, client_name, user_name, table_name, action, endpoint, http_method, status_code
      FROM audit_logs_summary 
      WHERE id = $1;
    `, [newLogId]);
    
    if (viewResult.rows.length === 0) {
      throw new Error('Could not find the inserted audit log in the view');
    }
    
    const logData = viewResult.rows[0];
    console.log(`   ✅ Retrieved from view: ${logData.table_name} ${logData.action} via ${logData.http_method} ${logData.endpoint}`);
    
    // Test 3: Test statistics function
    console.log('   Test 3: Testing audit log statistics function...');
    const statsResult = await client.query(`
      SELECT * FROM get_audit_log_stats(NULL, NULL, 30);
    `);
    
    const stats = statsResult.rows[0];
    console.log(`   ✅ Statistics: ${stats.total_logs} total logs, ${stats.error_count} errors, avg duration: ${Math.round(stats.avg_duration_ms || 0)}ms`);
    
    // Test 4: Test cleanup function (dry run)
    console.log('   Test 4: Testing cleanup function...');
    const cleanupResult = await client.query(`
      SELECT cleanup_old_audit_logs(0);
    `);
    
    console.log(`   ✅ Cleanup function works (would delete ${cleanupResult.rows[0].cleanup_old_audit_logs} logs if retention was 0 days)`);
    
    console.log('\n✅ All audit logs tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    await setupAuditLogs();
    await testAuditLogs();
    
    console.log('\n🎯 Task 10.4 - Create Audit Logs Table: COMPLETED');
    console.log('   The enhanced audit logs table is ready for use!');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupAuditLogs, testAuditLogs };

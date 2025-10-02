#!/usr/bin/env node

/**
 * Data Export Script for PostgreSQL to Supabase Migration
 * 
 * This script exports data from the local PostgreSQL database
 * and formats it for import into Supabase.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'propaganda_dashboard',
  user: process.env.DB_USER || 'travis',
  password: process.env.DB_PASSWORD || '',
};

// Create database connection
const pool = new Pool(dbConfig);

// Tables to export (in dependency order)
const TABLES_TO_EXPORT = [
  'users',
  'clients', 
  'calls',
  'call_analytics'
];

// Helper function to escape SQL values
function escapeValue(value) {
  if (value === null) return 'NULL';
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return value;
}

// Export table data to SQL INSERT statements
async function exportTableData(tableName) {
  try {
    console.log(`Exporting data from table: ${tableName}`);
    
    // Get table structure
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `;
    
    const columnsResult = await pool.query(columnsQuery, [tableName]);
    const columns = columnsResult.rows;
    
    if (columns.length === 0) {
      console.log(`  No columns found for table ${tableName}`);
      return '';
    }
    
    // Get all data from table
    const dataQuery = `SELECT * FROM ${tableName} ORDER BY id`;
    const dataResult = await pool.query(dataQuery);
    
    if (dataResult.rows.length === 0) {
      console.log(`  No data found in table ${tableName}`);
      return '';
    }
    
    // Generate INSERT statements
    const columnNames = columns.map(col => col.column_name).join(', ');
    let insertStatements = [];
    
    for (const row of dataResult.rows) {
      const values = columns.map(col => escapeValue(row[col.column_name])).join(', ');
      insertStatements.push(`INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`);
    }
    
    console.log(`  Exported ${dataResult.rows.length} rows from ${tableName}`);
    return insertStatements.join('\n') + '\n';
    
  } catch (error) {
    console.error(`Error exporting table ${tableName}:`, error.message);
    return '';
  }
}

// Export all data
async function exportAllData() {
  try {
    console.log('Starting data export from PostgreSQL...');
    console.log(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
    
    // Test connection
    const client = await pool.connect();
    console.log('✓ Database connection established');
    client.release();
    
    let exportSQL = '-- Data Export from PostgreSQL\n';
    exportSQL += '-- Generated on: ' + new Date().toISOString() + '\n\n';
    exportSQL += '-- Disable triggers during import\n';
    exportSQL += 'SET session_replication_role = replica;\n\n';
    
    // Export each table
    for (const tableName of TABLES_TO_EXPORT) {
      const tableData = await exportTableData(tableName);
      if (tableData) {
        exportSQL += `-- Data for table: ${tableName}\n`;
        exportSQL += tableData + '\n';
      }
    }
    
    exportSQL += '-- Re-enable triggers\n';
    exportSQL += 'SET session_replication_role = DEFAULT;\n';
    
    // Write to file
    const outputPath = path.join(__dirname, '..', 'supabase_data_export.sql');
    fs.writeFileSync(outputPath, exportSQL);
    
    console.log(`\n✓ Data export completed successfully!`);
    console.log(`✓ Export saved to: ${outputPath}`);
    console.log(`✓ Total tables exported: ${TABLES_TO_EXPORT.length}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('Error during data export:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Export specific table data as JSON (for complex data types)
async function exportTableAsJSON(tableName) {
  try {
    console.log(`Exporting ${tableName} as JSON...`);
    
    const query = `SELECT * FROM ${tableName} ORDER BY id`;
    const result = await pool.query(query);
    
    const outputPath = path.join(__dirname, '..', `data_${tableName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result.rows, null, 2));
    
    console.log(`✓ JSON export saved to: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    console.error(`Error exporting ${tableName} as JSON:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    if (command === 'json') {
      // Export all tables as JSON
      for (const tableName of TABLES_TO_EXPORT) {
        await exportTableAsJSON(tableName);
      }
    } else {
      // Default: Export as SQL
      await exportAllData();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  exportAllData,
  exportTableAsJSON,
  TABLES_TO_EXPORT
};

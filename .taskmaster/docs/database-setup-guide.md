# Database Setup Guide - Propaganda Dashboard

## 🚀 **Quick Setup Instructions**

### **Prerequisites:**
- macOS with Homebrew installed
- PostgreSQL 15+ (will be installed automatically)

---

## 📦 **Installation Steps**

### **1. Install PostgreSQL**
```bash
# Install PostgreSQL 15
brew install postgresql@15

# Add to PATH
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile

# Start PostgreSQL service
brew services start postgresql@15
```

### **2. Create Database**
```bash
# Create the database
createdb propaganda_dashboard

# Verify creation
psql -l | grep propaganda_dashboard
```

### **3. Run Setup Scripts**
```bash
# Navigate to project directory
cd /Users/travis/propaganda-dashboard

# Create tables and relationships
psql -d propaganda_dashboard -f .taskmaster/docs/sql-scripts/01-create-tables.sql

# Create indexes
psql -d propaganda_dashboard -f .taskmaster/docs/sql-scripts/02-create-indexes.sql

# Insert sample data
psql -d propaganda_dashboard -f .taskmaster/docs/sql-scripts/03-seed-data.sql
```

---

## ✅ **Verification**

### **Check Tables:**
```bash
psql -d propaganda_dashboard -c "\dt"
```

**Expected Output:**
```
           List of relations
 Schema |     Name     | Type  | Owner  
--------+--------------+-------+--------
 public | audit_logs   | table | travis
 public | calls        | table | travis
 public | clients      | table | travis
 public | loss_reasons | table | travis
 public | users        | table | travis
```

### **Check Data:**
```bash
psql -d propaganda_dashboard -c "SELECT c.name, COUNT(u.id) as users, COUNT(cl.id) as calls FROM clients c LEFT JOIN users u ON c.id = u.client_id LEFT JOIN calls cl ON c.id = cl.client_id GROUP BY c.id, c.name;"
```

**Expected Output:**
```
    client_name     | users | calls 
--------------------+-------+-------
 Marketing Pro      |     2 |     2
 Propaganda Inc     |     4 |     6
 Tech Solutions LLC |     2 |     2
```

---

## 🔧 **Connection Details**

### **For Application Use:**
```javascript
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'propaganda_dashboard',
  user: 'travis', // or your system username
  password: '', // no password for local development
  ssl: false
};
```

### **Environment Variables:**
```bash
# Add to .env file
DATABASE_URL=postgresql://travis@localhost:5432/propaganda_dashboard
DB_HOST=localhost
DB_PORT=5432
DB_NAME=propaganda_dashboard
DB_USER=travis
DB_PASSWORD=
```

---

## 🛠️ **Management Commands**

### **Start/Stop PostgreSQL:**
```bash
# Start service
brew services start postgresql@15

# Stop service
brew services stop postgresql@15

# Restart service
brew services restart postgresql@15
```

### **Connect to Database:**
```bash
# Connect to database
psql -d propaganda_dashboard

# Connect as specific user
psql -U travis -d propaganda_dashboard
```

### **Backup/Restore:**
```bash
# Backup database
pg_dump propaganda_dashboard > backup.sql

# Restore database
psql -d propaganda_dashboard < backup.sql
```

---

## 🧪 **Test Queries**

### **Multi-tenant Test:**
```sql
-- Test client isolation
SELECT 'Propaganda Inc' as client, COUNT(*) as calls 
FROM calls 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';
```

### **Role-based Access Test:**
```sql
-- Test sales user access
SELECT u.name, COUNT(c.id) as own_calls
FROM users u
LEFT JOIN calls c ON u.id = c.user_id AND u.client_id = c.client_id
WHERE u.role = 'sales'
GROUP BY u.id, u.name;
```

### **Performance Metrics Test:**
```sql
-- Test Show Rate calculation
SELECT 
    COUNT(*) as total_calls,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2) as show_rate_percentage
FROM calls 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. PostgreSQL not found:**
```bash
# Add to PATH
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
```

**2. Service not running:**
```bash
# Start service
brew services start postgresql@15

# Check status
brew services list | grep postgresql
```

**3. Permission denied:**
```bash
# Check if user exists
psql -l

# Create user if needed
createuser -s travis
```

**4. Database already exists:**
```bash
# Drop and recreate
dropdb propaganda_dashboard
createdb propaganda_dashboard
```

---

## 📚 **Additional Resources**

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Homebrew PostgreSQL:** https://formulae.brew.sh/formula/postgresql@15
- **Schema Documentation:** `.taskmaster/docs/database-schema-design.md`
- **Implementation Summary:** `.taskmaster/docs/database-implementation-summary.md`

---

*Setup guide created on September 28, 2024*  
*Database ready for application development* ✅

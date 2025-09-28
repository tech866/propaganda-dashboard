# Database Schema Design - Propaganda Dashboard

## 🗄️ Multi-Tenant PostgreSQL Schema Design

**Date:** September 28, 2024  
**Database:** PostgreSQL  
**Architecture:** Multi-tenant with client-level data segregation  

---

## 📋 Schema Overview

The database schema supports a multi-tenant agency dashboard with the following core entities:

1. **Clients** - Agency clients (tenants)
2. **Users** - System users with role-based access
3. **Calls** - Call logging records
4. **Loss Reasons** - Categorized reasons for unsuccessful conversions
5. **Audit Logs** - Track all data changes and access events

---

## 🏗️ Table Structures

### 1. Clients Table
**Purpose:** Store agency client information (tenant data)

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Primary key (UUID)
- `name` - Client company name
- `email` - Client contact email
- `phone` - Client phone number
- `address` - Client address
- `is_active` - Whether client is active
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

### 2. Users Table
**Purpose:** Store system users with role-based access

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ceo', 'admin', 'sales')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, email)
);
```

**Fields:**
- `id` - Primary key (UUID)
- `client_id` - Foreign key to clients table
- `email` - User email (unique within client)
- `password_hash` - Hashed password
- `name` - User full name
- `role` - User role (ceo, admin, sales)
- `is_active` - Whether user is active
- `last_login` - Last login timestamp
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

### 3. Loss Reasons Table
**Purpose:** Store categorized loss reasons for calls

```sql
CREATE TABLE loss_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, name)
);
```

**Fields:**
- `id` - Primary key (UUID)
- `client_id` - Foreign key to clients table
- `name` - Loss reason name (unique within client)
- `description` - Loss reason description
- `is_active` - Whether loss reason is active
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

### 4. Calls Table
**Purpose:** Store call logging records

```sql
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prospect_name VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(50),
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('inbound', 'outbound')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'no-show', 'rescheduled')),
    outcome VARCHAR(20) CHECK (outcome IN ('won', 'lost', 'tbd')),
    loss_reason_id UUID REFERENCES loss_reasons(id) ON DELETE SET NULL,
    notes TEXT,
    call_duration INTEGER, -- in seconds
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Primary key (UUID)
- `client_id` - Foreign key to clients table
- `user_id` - Foreign key to users table (call owner)
- `prospect_name` - Prospect's name
- `prospect_email` - Prospect's email
- `prospect_phone` - Prospect's phone
- `call_type` - Type of call (inbound/outbound)
- `status` - Call status (completed/no-show/rescheduled)
- `outcome` - Call outcome (won/lost/tbd)
- `loss_reason_id` - Foreign key to loss_reasons table
- `notes` - Call notes
- `call_duration` - Call duration in seconds
- `scheduled_at` - When call was scheduled
- `completed_at` - When call was completed
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

### 5. Audit Logs Table
**Purpose:** Track all data changes and access events

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Primary key (UUID)
- `client_id` - Foreign key to clients table
- `user_id` - Foreign key to users table
- `table_name` - Name of the table being audited
- `record_id` - ID of the record being audited
- `action` - Type of action performed
- `old_values` - Previous values (for UPDATE/DELETE)
- `new_values` - New values (for INSERT/UPDATE)
- `ip_address` - IP address of the user
- `user_agent` - User agent string
- `created_at` - Record creation timestamp

---

## 🔗 Relationships

### Primary Relationships
1. **Clients → Users** (1:many)
   - One client can have many users
   - Users belong to exactly one client

2. **Clients → Loss Reasons** (1:many)
   - One client can have many loss reasons
   - Loss reasons belong to exactly one client

3. **Clients → Calls** (1:many)
   - One client can have many calls
   - Calls belong to exactly one client

4. **Users → Calls** (1:many)
   - One user can have many calls
   - Calls belong to exactly one user

5. **Loss Reasons → Calls** (1:many)
   - One loss reason can be used in many calls
   - Calls can optionally reference one loss reason

6. **Clients → Audit Logs** (1:many)
   - One client can have many audit logs
   - Audit logs belong to exactly one client

7. **Users → Audit Logs** (1:many)
   - One user can have many audit logs
   - Audit logs belong to exactly one user

---

## 🏢 Multi-Tenant Strategy

### Data Segregation Approach
1. **Client-Level Isolation:** All tables include `client_id` foreign key
2. **Row-Level Security:** Data is segregated by client_id
3. **Application-Level Filtering:** All queries filter by client_id
4. **Database-Level Constraints:** Foreign key constraints ensure data integrity

### Security Considerations
1. **Tenant Isolation:** Users can only access data from their assigned client
2. **Role-Based Access:** Different roles have different access levels within their client
3. **Audit Trail:** All data changes are logged with user and client context
4. **Data Integrity:** Foreign key constraints prevent orphaned records

---

## 📊 Indexes for Performance

### Primary Indexes
```sql
-- Clients table
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_active ON clients(is_active);

-- Users table
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_email ON users(client_id, email);
CREATE INDEX idx_users_role ON users(client_id, role);
CREATE INDEX idx_users_active ON users(client_id, is_active);

-- Loss Reasons table
CREATE INDEX idx_loss_reasons_client_id ON loss_reasons(client_id);
CREATE INDEX idx_loss_reasons_active ON loss_reasons(client_id, is_active);

-- Calls table
CREATE INDEX idx_calls_client_id ON calls(client_id);
CREATE INDEX idx_calls_user_id ON calls(client_id, user_id);
CREATE INDEX idx_calls_status ON calls(client_id, status);
CREATE INDEX idx_calls_outcome ON calls(client_id, outcome);
CREATE INDEX idx_calls_created_at ON calls(client_id, created_at);
CREATE INDEX idx_calls_completed_at ON calls(client_id, completed_at);

-- Audit Logs table
CREATE INDEX idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(client_id, user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(client_id, table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(client_id, created_at);
```

---

## 🎯 Performance Considerations

### Query Optimization
1. **Client-First Filtering:** All queries start with client_id filter
2. **Composite Indexes:** Indexes include client_id for tenant isolation
3. **Selective Indexes:** Indexes on frequently queried fields
4. **Partitioning:** Consider partitioning audit_logs by date for large datasets

### Scalability
1. **Horizontal Scaling:** Schema supports sharding by client_id
2. **Read Replicas:** Can be used for reporting queries
3. **Connection Pooling:** Recommended for high-concurrency scenarios
4. **Caching:** Application-level caching for frequently accessed data

---

## 🔧 Implementation Notes

### Database Setup
1. **PostgreSQL Version:** 13+ recommended
2. **Extensions:** UUID extension for UUID generation
3. **Timezone:** Use UTC for all timestamps
4. **Character Set:** UTF-8 for international support

### Migration Strategy
1. **Version Control:** Use migration scripts for schema changes
2. **Backward Compatibility:** Maintain compatibility during updates
3. **Data Migration:** Plan for data migration between schema versions
4. **Rollback Strategy:** Ability to rollback schema changes

---

## 📋 Next Steps

1. **Create SQL Scripts:** Generate CREATE TABLE statements
2. **Set Up Database:** Create PostgreSQL database instance
3. **Run Migrations:** Execute schema creation scripts
4. **Test Relationships:** Verify foreign key constraints
5. **Insert Sample Data:** Add test data for development

---

*Schema design completed on September 28, 2024*  
*Ready for implementation in PostgreSQL*

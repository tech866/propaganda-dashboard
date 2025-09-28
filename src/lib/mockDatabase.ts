/**
 * Mock Database Service for QA Testing and Development
 * Provides in-memory database functionality without requiring PostgreSQL
 */

// Mock data storage
const mockData = {
  users: [
    {
      id: '650e8400-e29b-41d4-a716-446655440001',
      email: 'ceo@example.com',
      name: 'CEO User',
      role: 'ceo',
      clientId: '550e8400-e29b-41d4-a716-446655440001',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440002',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      clientId: '550e8400-e29b-41d4-a716-446655440001',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440003',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'sales',
      clientId: '550e8400-e29b-41d4-a716-446655440001',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Propaganda Corp',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  calls: [
    {
      id: '750e8400-e29b-41d4-a716-446655440001',
      clientId: '550e8400-e29b-41d4-a716-446655440001',
      callName: 'Initial Client Meeting',
      callPurpose: 'Discuss project requirements',
      callDate: new Date().toISOString(),
      callDuration: 60,
      callType: 'outbound',
      status: 'completed',
      outcome: 'successful',
      createdAt: new Date().toISOString()
    }
  ],
  auditLogs: []
};

// Mock query function
export async function query(text: string, params: any[] = []): Promise<any> {
  console.log('Mock DB Query:', text, params);
  
  // Parse the query to determine the operation
  const queryLower = text.toLowerCase().trim();
  
  if (queryLower.startsWith('select')) {
    return handleSelect(text, params);
  } else if (queryLower.startsWith('insert')) {
    return handleInsert(text, params);
  } else if (queryLower.startsWith('update')) {
    return handleUpdate(text, params);
  } else if (queryLower.startsWith('delete')) {
    return handleDelete(text, params);
  }
  
  // Default response for other queries
  return { rows: [], rowCount: 0 };
}

function handleSelect(text: string, params: any[]): any {
  const queryLower = text.toLowerCase();
  
  if (queryLower.includes('from users')) {
    return { rows: mockData.users, rowCount: mockData.users.length };
  } else if (queryLower.includes('from clients')) {
    return { rows: mockData.clients, rowCount: mockData.clients.length };
  } else if (queryLower.includes('from calls')) {
    return { rows: mockData.calls, rowCount: mockData.calls.length };
  } else if (queryLower.includes('from audit_logs')) {
    // Handle audit logs queries with proper structure
    if (queryLower.includes('count(*)')) {
      // This is a count query
      return { rows: [{ total: mockData.auditLogs.length }], rowCount: 1 };
    } else {
      // This is a data query
      return { rows: mockData.auditLogs, rowCount: mockData.auditLogs.length };
    }
  } else if (queryLower.includes('select now()')) {
    return { rows: [{ current_time: new Date() }], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function handleInsert(text: string, params: any[]): any {
  const queryLower = text.toLowerCase();
  
  if (queryLower.includes('into users')) {
    const newUser = {
      id: generateId(),
      email: params[0],
      name: params[1],
      role: params[2],
      clientId: params[3],
      isActive: true,
      createdAt: new Date().toISOString()
    };
    mockData.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  } else if (queryLower.includes('into calls')) {
    const newCall = {
      id: generateId(),
      clientId: params[0],
      callName: params[1],
      callPurpose: params[2],
      callDate: params[3],
      callDuration: params[4],
      callType: params[5],
      status: params[6] || 'pending',
      outcome: params[7] || null,
      createdAt: new Date().toISOString()
    };
    mockData.calls.push(newCall);
    return { rows: [newCall], rowCount: 1 };
  } else if (queryLower.includes('into audit_logs')) {
    const newLog = {
      id: generateId(),
      clientId: params[0],
      userId: params[1],
      tableName: params[2],
      recordId: params[3],
      action: params[4],
      oldValues: params[5],
      newValues: params[6],
      ipAddress: params[7],
      userAgent: params[8],
      sessionId: params[9],
      endpoint: params[10],
      httpMethod: params[11],
      statusCode: params[12],
      operationDurationMs: params[13],
      errorMessage: params[14],
      metadata: params[15],
      createdAt: new Date().toISOString()
    };
    mockData.auditLogs.push(newLog);
    return { rows: [newLog], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function handleUpdate(text: string, params: any[]): any {
  // Mock update operations
  return { rows: [], rowCount: 1 };
}

function handleDelete(text: string, params: any[]): any {
  // Mock delete operations
  return { rows: [], rowCount: 1 };
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock client interface
export class MockClient {
  async query(text: string, params?: any[]): Promise<any> {
    return query(text, params);
  }
  
  release(): void {
    // Mock release - no-op
  }
}

// Mock getClient function
export async function getClient(): Promise<MockClient> {
  return new MockClient();
}

// Mock testConnection function
export async function testConnection(): Promise<boolean> {
  console.log('Mock database connection test - always successful');
  return true;
}

// Mock withTransaction function
export async function withTransaction<T>(
  callback: (client: MockClient) => Promise<T>
): Promise<T> {
  const client = new MockClient();
  try {
    return await callback(client);
  } catch (error) {
    throw error;
  }
}

// Mock closePool function
export async function closePool(): Promise<void> {
  console.log('Mock database pool closed');
}

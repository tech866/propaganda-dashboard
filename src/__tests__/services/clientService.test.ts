import { 
  ClientService, 
  formatCurrency, 
  formatDate, 
  getClientStatusColor, 
  getClientStatusIcon,
  getIndustryIcon,
  type Client,
  type ClientFormData
} from '@/lib/services/clientService';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: Promise.resolve([]),
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: Promise.resolve(mockClient),
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: Promise.resolve(mockClient),
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: Promise.resolve(null),
          error: null
        }))
      }))
    }))
  }
}));

const mockClient: Client = {
  id: '1',
  name: 'Test Client',
  email: 'test@example.com',
  phone: '+1234567890',
  company: 'Test Company',
  industry: 'Technology',
  status: 'active',
  monthly_budget: 10000,
  contact_person: 'John Doe',
  billing_address: '123 Test St',
  billing_city: 'Test City',
  billing_state: 'TS',
  billing_zip: '12345',
  billing_country: 'USA',
  contract_start_date: '2024-01-01',
  contract_end_date: '2024-12-31',
  notes: 'Test notes',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('ClientService', () => {
  let clientService: ClientService;

  beforeEach(() => {
    clientService = new ClientService('test-agency-id');
  });

  describe('getClients', () => {
    it('should return an array of clients', async () => {
      const clients = await clientService.getClients();
      expect(Array.isArray(clients)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Mock error response
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: Promise.resolve(null),
              error: { message: 'Database error' }
            }))
          }))
        }))
      });

      const clients = await clientService.getClients();
      expect(clients).toEqual([]);
    });
  });

  describe('createClient', () => {
    const clientData: ClientFormData = {
      name: 'New Client',
      email: 'new@example.com',
      phone: '+1234567890',
      company: 'New Company',
      industry: 'Technology',
      status: 'active',
      monthly_budget: 5000,
      contact_person: 'Jane Doe',
      billing_address: '456 New St',
      billing_city: 'New City',
      billing_state: 'NS',
      billing_zip: '54321',
      billing_country: 'USA',
      contract_start_date: '2024-01-01',
      contract_end_date: '2024-12-31',
      notes: 'New client notes'
    };

    it('should create a new client', async () => {
      const result = await clientService.createClient(clientData);
      expect(result).toBeDefined();
      expect(result?.name).toBe(clientData.name);
    });

    it('should handle creation errors', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: Promise.resolve(null),
              error: { message: 'Creation failed' }
            }))
          }))
        }))
      });

      const result = await clientService.createClient(clientData);
      expect(result).toBeNull();
    });
  });

  describe('updateClient', () => {
    const updateData: Partial<ClientFormData> = {
      name: 'Updated Client',
      monthly_budget: 15000
    };

    it('should update a client', async () => {
      const result = await clientService.updateClient('1', updateData);
      expect(result).toBeDefined();
    });

    it('should handle update errors', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: Promise.resolve(null),
                error: { message: 'Update failed' }
              }))
            }))
          }))
        }))
      });

      const result = await clientService.updateClient('1', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      const result = await clientService.deleteClient('1');
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: Promise.resolve(null),
            error: { message: 'Deletion failed' }
          }))
        }))
      });

      const result = await clientService.deleteClient('1');
      expect(result).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formatted = formatDate(dateString);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });
  });

  describe('getClientStatusColor', () => {
    it('should return correct colors for different statuses', () => {
      expect(getClientStatusColor('active')).toContain('green');
      expect(getClientStatusColor('inactive')).toContain('gray');
      expect(getClientStatusColor('prospect')).toContain('blue');
      expect(getClientStatusColor('churned')).toContain('red');
    });
  });

  describe('getClientStatusIcon', () => {
    it('should return correct icons for different statuses', () => {
      expect(getClientStatusIcon('active')).toBe('✅');
      expect(getClientStatusIcon('inactive')).toBe('⏸️');
      expect(getClientStatusIcon('prospect')).toBe('🔍');
      expect(getClientStatusIcon('churned')).toBe('❌');
    });
  });

  describe('getIndustryIcon', () => {
    it('should return correct icons for different industries', () => {
      expect(getIndustryIcon('Technology')).toBe('💻');
      expect(getIndustryIcon('Healthcare')).toBe('🏥');
      expect(getIndustryIcon('Finance')).toBe('💰');
      expect(getIndustryIcon('Retail')).toBe('🛍️');
      expect(getIndustryIcon('Other')).toBe('🏢');
    });
  });
});

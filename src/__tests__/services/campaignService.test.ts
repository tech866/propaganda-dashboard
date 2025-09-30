import { 
  CampaignService, 
  formatCurrency, 
  formatDate, 
  formatNumber,
  formatPercentage,
  getStatusColor, 
  getStatusIcon,
  type Campaign,
  type CampaignFormData,
  type CampaignMetrics
} from '@/lib/services/campaignService';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: Promise.resolve([{
              id: '1',
              name: 'Test Campaign',
              client_id: 'client-1',
              status: 'active',
              start_date: '2024-01-01',
              end_date: '2024-12-31',
              budget: 10000,
              spent_amount: 5000,
              target_audience: 'Adults 25-45',
              objectives: 'Increase brand awareness',
              platform: 'Facebook',
              campaign_type: 'Social Media',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              active_status: true,
              clients: { name: 'Test Client' }
            }]),
              error: null
            }))
          })),
          order: jest.fn(() => ({
            data: Promise.resolve([{
              id: '1',
              campaign_id: '1',
              impressions: 100000,
              clicks: 5000,
              conversions: 100,
              cost: 1000,
              revenue: 5000,
              roas: 5.0,
              ctr: 5.0,
              cpc: 0.20,
              cpm: 10.0,
              conversion_rate: 2.0,
              date: '2024-01-01'
            }]),
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: Promise.resolve({ 
              id: '1',
              name: 'Test Campaign',
              client_id: 'client-1',
              status: 'active',
              start_date: '2024-01-01',
              end_date: '2024-12-31',
              budget: 10000,
              spent_amount: 5000,
              target_audience: 'Adults 25-45',
              objectives: 'Increase brand awareness',
              platform: 'Facebook',
              campaign_type: 'Social Media',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              active_status: true,
              clients: { name: 'Test Client' }
            }),
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: Promise.resolve({ 
                id: '1',
                name: 'Test Campaign',
                client_id: 'client-1',
                status: 'active',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                budget: 10000,
                spent_amount: 5000,
                target_audience: 'Adults 25-45',
                objectives: 'Increase brand awareness',
                platform: 'Facebook',
                campaign_type: 'Social Media',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                active_status: true,
                clients: { name: 'Test Client' }
              }),
              error: null
            }))
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: Promise.resolve({ 
                id: '1',
                name: 'Test Campaign',
                client_id: 'client-1',
                status: 'active',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                budget: 10000,
                spent_amount: 5000,
                target_audience: 'Adults 25-45',
                objectives: 'Increase brand awareness',
                platform: 'Facebook',
                campaign_type: 'Social Media',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                active_status: true,
                clients: { name: 'Test Client' }
              }),
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

const mockCampaign: Campaign = {
  id: '1',
  name: 'Test Campaign',
  client_id: 'client-1',
  client_name: 'Test Client',
  status: 'active',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  budget: 10000,
  spent_amount: 5000,
  target_audience: 'Adults 25-45',
  objectives: 'Increase brand awareness',
  platform: 'Facebook',
  campaign_type: 'Social Media',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  active_status: true
};

const mockMetrics: CampaignMetrics = {
  id: '1',
  campaign_id: '1',
  impressions: 100000,
  clicks: 5000,
  conversions: 100,
  cost: 1000,
  revenue: 5000,
  roas: 5.0,
  ctr: 5.0,
  cpc: 0.20,
  cpm: 10.0,
  conversion_rate: 2.0,
  date: '2024-01-01'
};

describe('CampaignService', () => {
  let campaignService: CampaignService;

  beforeEach(() => {
    campaignService = new CampaignService('test-agency-id');
  });

  describe('getCampaigns', () => {
    it('should return an array of campaigns', async () => {
      const campaigns = await campaignService.getCampaigns();
      expect(Array.isArray(campaigns)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const mockSupabase = require('@/lib/supabase').supabase;
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: Promise.resolve(null),
                error: { message: 'Database error' }
              }))
            }))
          }))
        }))
      });

      const campaigns = await campaignService.getCampaigns();
      expect(campaigns).toEqual([]);
    });
  });

  describe('createCampaign', () => {
    const campaignData: CampaignFormData = {
      name: 'New Campaign',
      client_id: 'client-1',
      status: 'draft',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      budget: 5000,
      target_audience: 'Adults 18-35',
      objectives: 'Drive sales',
      platform: 'Google',
      campaign_type: 'Search'
    };

    it('should create a new campaign', async () => {
      const result = await campaignService.createCampaign(campaignData);
      expect(result).toBeDefined();
      expect(result?.name).toBe(campaignData.name);
    });

    it('should handle creation errors', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: Promise.resolve(null),
              error: { message: 'Creation failed' }
            }))
          }))
        }))
      });

      const result = await campaignService.createCampaign(campaignData);
      expect(result).toBeNull();
    });
  });

  describe('updateCampaign', () => {
    const updateData: Partial<CampaignFormData> = {
      name: 'Updated Campaign',
      budget: 15000
    };

    it('should update a campaign', async () => {
      const result = await campaignService.updateCampaign('1', updateData);
      expect(result).toBeDefined();
    });

    it('should handle update errors', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValueOnce({
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

      const result = await campaignService.updateCampaign('1', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteCampaign', () => {
    it('should delete a campaign', async () => {
      const result = await campaignService.deleteCampaign('1');
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: Promise.resolve(null),
            error: { message: 'Deletion failed' }
          }))
        }))
      });

      const result = await campaignService.deleteCampaign('1');
      expect(result).toBe(false);
    });
  });

  describe('getCampaignMetrics', () => {
    it('should return campaign metrics', async () => {
      const metrics = await campaignService.getCampaignMetrics('1');
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should handle metrics errors', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: Promise.resolve(null),
              error: { message: 'Metrics error' }
            }))
          }))
        }))
      });

      const metrics = await campaignService.getCampaignMetrics('1');
      expect(metrics).toEqual([]);
    });
  });

  describe('getClients', () => {
    it('should return an array of clients', async () => {
      const clients = await campaignService.getClients();
      expect(Array.isArray(clients)).toBe(true);
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

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(5.25)).toBe('5.25%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(100)).toBe('100.00%');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for different statuses', () => {
      expect(getStatusColor('active')).toContain('green');
      expect(getStatusColor('paused')).toContain('yellow');
      expect(getStatusColor('completed')).toContain('blue');
      expect(getStatusColor('draft')).toContain('gray');
      expect(getStatusColor('cancelled')).toContain('red');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icons for different statuses', () => {
      expect(getStatusIcon('active')).toBe('▶️');
      expect(getStatusIcon('paused')).toBe('⏸️');
      expect(getStatusIcon('completed')).toBe('✅');
      expect(getStatusIcon('draft')).toBe('📝');
      expect(getStatusIcon('cancelled')).toBe('❌');
    });
  });
});

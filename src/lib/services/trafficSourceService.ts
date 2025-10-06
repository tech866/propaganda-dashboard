/**
 * Traffic Source Classification Service
 * 
 * This service provides consistent logic for classifying and processing traffic sources
 * throughout the application, ensuring standardized handling of 'organic' vs 'meta' traffic.
 */

export type TrafficSource = 'organic' | 'meta';
export type SourceOfAppointment = 'sdr_booked_call' | 'non_sdr_booked_call' | 'email' | 'vsl' | 'self_booking';
export type LeadSource = 'organic' | 'ads';

export interface TrafficSourceClassification {
  traffic_source: TrafficSource;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export class TrafficSourceService {
  /**
   * Classify traffic source based on source_of_appointment field
   * This is the primary classification method for new call entries
   */
  static classifyFromSourceOfAppointment(sourceOfAppointment: SourceOfAppointment): TrafficSourceClassification {
    switch (sourceOfAppointment) {
      case 'sdr_booked_call':
        // SDR calls are typically from paid campaigns (Meta ads)
        return {
          traffic_source: 'meta',
          confidence: 'high',
          reasoning: 'SDR calls are typically generated from paid advertising campaigns'
        };
      
      case 'non_sdr_booked_call':
        // Non-SDR calls could be either, but we'll default to organic
        return {
          traffic_source: 'organic',
          confidence: 'medium',
          reasoning: 'Non-SDR calls are typically organic leads, but may require manual verification'
        };
      
      case 'email':
        // Email campaigns could be either, default to organic
        return {
          traffic_source: 'organic',
          confidence: 'medium',
          reasoning: 'Email campaigns are typically organic unless specifically from paid ad campaigns'
        };
      
      case 'vsl':
        // VSL (Video Sales Letter) bookings are typically from paid ads
        return {
          traffic_source: 'meta',
          confidence: 'high',
          reasoning: 'VSL bookings are typically generated from paid advertising campaigns'
        };
      
      case 'self_booking':
        // Self-bookings are typically organic
        return {
          traffic_source: 'organic',
          confidence: 'high',
          reasoning: 'Self-bookings are typically organic leads from direct website visits'
        };
      
      default:
        // Default to organic for unknown sources
        return {
          traffic_source: 'organic',
          confidence: 'low',
          reasoning: 'Unknown source type, defaulting to organic'
        };
    }
  }

  /**
   * Classify traffic source based on legacy lead_source field
   * This handles backward compatibility with existing data
   */
  static classifyFromLeadSource(leadSource: LeadSource): TrafficSourceClassification {
    switch (leadSource) {
      case 'organic':
        return {
          traffic_source: 'organic',
          confidence: 'high',
          reasoning: 'Direct mapping from lead_source field'
        };
      
      case 'ads':
        return {
          traffic_source: 'meta',
          confidence: 'high',
          reasoning: 'Direct mapping from lead_source field (ads = meta)'
        };
      
      default:
        return {
          traffic_source: 'organic',
          confidence: 'low',
          reasoning: 'Unknown lead source, defaulting to organic'
        };
    }
  }

  /**
   * Get the standardized traffic source value
   * This ensures consistent values across the application
   */
  static getStandardizedTrafficSource(input: string | null | undefined): TrafficSource {
    if (!input) return 'organic';
    
    const normalized = input.toLowerCase().trim();
    
    // Handle various possible values
    switch (normalized) {
      case 'organic':
      case 'organic_traffic':
      case 'direct':
      case 'website':
      case 'referral':
        return 'organic';
      
      case 'meta':
      case 'meta_ads':
      case 'facebook':
      case 'instagram':
      case 'paid_ads':
      case 'ads':
      case 'advertising':
      case 'paid':
        return 'meta';
      
      default:
        return 'organic'; // Default fallback
    }
  }

  /**
   * Validate traffic source value
   */
  static isValidTrafficSource(value: string): value is TrafficSource {
    return value === 'organic' || value === 'meta';
  }

  /**
   * Get traffic source display information
   */
  static getTrafficSourceDisplayInfo(trafficSource: TrafficSource) {
    switch (trafficSource) {
      case 'organic':
        return {
          label: 'Organic Traffic',
          description: 'Leads from organic sources (website, referrals, direct)',
          color: 'green',
          icon: '🌱'
        };
      
      case 'meta':
        return {
          label: 'Meta Ads',
          description: 'Leads from Meta advertising campaigns (Facebook, Instagram)',
          color: 'blue',
          icon: '📱'
        };
      
      default:
        return {
          label: 'Unknown',
          description: 'Unknown traffic source',
          color: 'gray',
          icon: '❓'
        };
    }
  }

  /**
   * Get analytics-friendly traffic source label
   */
  static getAnalyticsLabel(trafficSource: TrafficSource): string {
    switch (trafficSource) {
      case 'organic':
        return 'Organic';
      case 'meta':
        return 'Meta Ads';
      default:
        return 'Unknown';
    }
  }

  /**
   * Classify traffic source with fallback logic
   * This is the main method to use when you have multiple data points
   */
  static classifyTrafficSource(data: {
    sourceOfAppointment?: SourceOfAppointment;
    leadSource?: LeadSource;
    trafficSource?: TrafficSource;
    manualOverride?: TrafficSource;
  }): TrafficSourceClassification {
    // Priority 1: Manual override (highest priority)
    if (data.manualOverride) {
      return {
        traffic_source: data.manualOverride,
        confidence: 'high',
        reasoning: 'Manual override provided'
      };
    }

    // Priority 2: Existing traffic_source field
    if (data.trafficSource && this.isValidTrafficSource(data.trafficSource)) {
      return {
        traffic_source: data.trafficSource,
        confidence: 'high',
        reasoning: 'Existing traffic_source field value'
      };
    }

    // Priority 3: Classify from source_of_appointment
    if (data.sourceOfAppointment) {
      return this.classifyFromSourceOfAppointment(data.sourceOfAppointment);
    }

    // Priority 4: Classify from legacy lead_source
    if (data.leadSource) {
      return this.classifyFromLeadSource(data.leadSource);
    }

    // Default fallback
    return {
      traffic_source: 'organic',
      confidence: 'low',
      reasoning: 'No classification data available, defaulting to organic'
    };
  }

  /**
   * Get all possible traffic source values for forms
   */
  static getTrafficSourceOptions(): Array<{ value: TrafficSource; label: string; description: string }> {
    return [
      {
        value: 'organic',
        label: 'Organic Traffic',
        description: 'Leads from organic sources (website, referrals, direct)'
      },
      {
        value: 'meta',
        label: 'Meta Ads',
        description: 'Leads from Meta advertising campaigns (Facebook, Instagram)'
      }
    ];
  }

  /**
   * Get source of appointment options with traffic source hints
   */
  static getSourceOfAppointmentOptions(): Array<{ 
    value: SourceOfAppointment; 
    label: string; 
    description: string;
    typicalTrafficSource: TrafficSource;
  }> {
    return [
      {
        value: 'sdr_booked_call',
        label: 'SDR Booked Call',
        description: 'Call booked by Sales Development Representative',
        typicalTrafficSource: 'meta'
      },
      {
        value: 'non_sdr_booked_call',
        label: 'Non-SDR Booked Call',
        description: 'Call booked through other means',
        typicalTrafficSource: 'organic'
      },
      {
        value: 'email',
        label: 'Email Campaign',
        description: 'Lead from email marketing campaign',
        typicalTrafficSource: 'organic'
      },
      {
        value: 'vsl',
        label: 'VSL Booking',
        description: 'Video Sales Letter booking',
        typicalTrafficSource: 'meta'
      },
      {
        value: 'self_booking',
        label: 'Self Booking',
        description: 'Lead booked themselves through website',
        typicalTrafficSource: 'organic'
      }
    ];
  }
}

export default TrafficSourceService;

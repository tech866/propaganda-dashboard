/**
 * User Identification Service
 * Propaganda Dashboard - Enhanced user identification for audit logging
 */

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { User, UserRole } from '@/middleware/auth';
import { AuditContext } from '@/lib/types/audit';

export interface EnhancedUser extends User {
  sessionId?: string;
  loginTime?: Date;
  lastActivity?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface UserSession {
  sessionId: string;
  userId: string;
  clientId: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

/**
 * Enhanced user identification service
 */
export class UserIdentificationService {
  private static instance: UserIdentificationService;
  private activeSessions: Map<string, UserSession> = new Map();

  private constructor() {}

  public static getInstance(): UserIdentificationService {
    if (!UserIdentificationService.instance) {
      UserIdentificationService.instance = new UserIdentificationService();
    }
    return UserIdentificationService.instance;
  }

  /**
   * Extract comprehensive user information from request
   */
  async extractUserFromRequest(request: NextRequest): Promise<EnhancedUser | null> {
    try {
      // Try to get JWT token from NextAuth first
      let token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      // If no NextAuth token, try to get from Authorization header
      if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const jwtToken = authHeader.substring(7);
          try {
            const jwt = require('jsonwebtoken');
            token = jwt.verify(jwtToken, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET);
            console.log('Successfully verified JWT token from Authorization header:', { id: token.id, email: token.email });
          } catch (error) {
            console.warn('Failed to verify JWT token from Authorization header:', error);
          }
        }
      }

      if (!token) {
        return null;
      }

      // Extract basic user information
      const user: EnhancedUser = {
        id: token.sub || token.id || '',
        email: token.email || '',
        name: token.name || '',
        role: (token.role as UserRole) || 'sales',
        clientId: token.clientId || '',
        permissions: this.getUserPermissions(token.role as UserRole),
        sessionId: token.jti || this.generateSessionId(),
        loginTime: token.iat ? new Date(token.iat * 1000) : new Date(),
        lastActivity: new Date(),
        ipAddress: this.extractIpAddress(request),
        userAgent: request.headers.get('user-agent') || '',
        deviceInfo: this.parseUserAgent(request.headers.get('user-agent') || ''),
        location: await this.getLocationFromIp(this.extractIpAddress(request))
      };

      // Update session tracking
      await this.updateUserSession(user, request);

      return user;
    } catch (error) {
      console.error('Failed to extract user from request:', error);
      return null;
    }
  }

  /**
   * Create audit context with enhanced user information
   */
  async createAuditContext(request: NextRequest, user?: EnhancedUser): Promise<AuditContext> {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const endpoint = request.nextUrl.pathname;
    const httpMethod = request.method as any;

    return {
      clientId: user?.clientId || 'unknown',
      userId: user?.id,
      sessionId: user?.sessionId || this.generateSessionId(),
      ipAddress,
      userAgent,
      endpoint,
      httpMethod,
      metadata: {
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin'),
        timestamp: new Date().toISOString(),
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role,
          loginTime: user.loginTime?.toISOString(),
          lastActivity: user.lastActivity?.toISOString(),
          deviceInfo: user.deviceInfo,
          location: user.location
        } : null
      }
    };
  }

  /**
   * Track user session activity
   */
  async updateUserSession(user: EnhancedUser, request: NextRequest): Promise<void> {
    const sessionId = user.sessionId || this.generateSessionId();
    
    const session: UserSession = {
      sessionId,
      userId: user.id,
      clientId: user.clientId,
      loginTime: user.loginTime || new Date(),
      lastActivity: new Date(),
      ipAddress: user.ipAddress || this.extractIpAddress(request),
      userAgent: user.userAgent || request.headers.get('user-agent') || '',
      isActive: true,
      metadata: {
        endpoint: request.nextUrl.pathname,
        method: request.method,
        deviceInfo: user.deviceInfo,
        location: user.location
      }
    };

    this.activeSessions.set(sessionId, session);
  }

  /**
   * Get user session information
   */
  getUserSession(sessionId: string): UserSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): UserSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.isActive);
  }

  /**
   * Get all active sessions for a client
   */
  getClientSessions(clientId: string): UserSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.clientId === clientId && session.isActive);
  }

  /**
   * End user session
   */
  endUserSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.lastActivity = new Date();
    }
  }

  /**
   * Clean up inactive sessions
   */
  cleanupInactiveSessions(maxInactiveMinutes: number = 30): void {
    const cutoffTime = new Date(Date.now() - (maxInactiveMinutes * 60 * 1000));
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.lastActivity < cutoffTime) {
        session.isActive = false;
      }
    }
  }

  /**
   * Extract IP address from request
   */
  private extractIpAddress(request: NextRequest): string {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    
    const xRealIp = request.headers.get('x-real-ip');
    if (xRealIp) {
      return xRealIp;
    }
    
    return request.ip || 'unknown';
  }

  /**
   * Parse user agent to extract device information
   */
  private parseUserAgent(userAgent: string): EnhancedUser['deviceInfo'] {
    if (!userAgent) {
      return { type: 'unknown', browser: 'unknown', os: 'unknown' };
    }

    const ua = userAgent.toLowerCase();
    
    // Determine device type
    let type: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      type = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      type = 'tablet';
    } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      type = 'desktop';
    }

    // Determine browser
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    // Determine OS
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { type, browser, os };
  }

  /**
   * Get location information from IP address (mock implementation)
   */
  private async getLocationFromIp(ipAddress: string): Promise<EnhancedUser['location']> {
    // In a real implementation, you would use a service like MaxMind or IPinfo
    // For now, we'll return mock data
    if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === 'unknown') {
      return { country: 'Local', region: 'Local', city: 'Local' };
    }
    
    // Mock location data based on IP patterns
    return {
      country: 'United States',
      region: 'California',
      city: 'San Francisco'
    };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user permissions based on role
   */
  private getUserPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      ceo: [
        'read:all',
        'write:all',
        'delete:all',
        'admin:all',
        'audit:all'
      ],
      admin: [
        'read:client',
        'write:client',
        'delete:client',
        'admin:client',
        'audit:client'
      ],
      sales: [
        'read:own',
        'write:own'
      ]
    };

    return permissions[role] || [];
  }

  /**
   * Validate user permissions for an action
   */
  hasPermission(user: EnhancedUser, action: string): boolean {
    return user.permissions.includes(action) || user.permissions.includes('admin:all');
  }

  /**
   * Get user activity summary
   */
  getUserActivitySummary(userId: string): {
    totalSessions: number;
    activeSessions: number;
    lastActivity: Date | null;
    totalRequests: number;
  } {
    const userSessions = this.getUserSessions(userId);
    const activeSessions = userSessions.filter(s => s.isActive);
    const lastActivity = userSessions.length > 0 
      ? new Date(Math.max(...userSessions.map(s => s.lastActivity.getTime())))
      : null;

    return {
      totalSessions: userSessions.length,
      activeSessions: activeSessions.length,
      lastActivity,
      totalRequests: userSessions.reduce((sum, session) => 
        sum + (session.metadata.requestCount || 0), 0
      )
    };
  }
}

// Export singleton instance
export const userIdentificationService = UserIdentificationService.getInstance();

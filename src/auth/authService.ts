/**
 * Authentication Service (FastAPI / Supabase Auth ready)
 */

import { User, UserRole, HelperRoleTitle, VerificationStatus } from '../types';
import { ROLE_PERMISSIONS } from './permissions';

const STORAGE_KEY = 'retinaguard_auth_user';

export interface DemoLoginParams {
  role: UserRole;
  name?: string;
  email?: string;
  organization?: string;
  helperRoleTitle?: HelperRoleTitle;
  location?: string;
  verificationStatus?: VerificationStatus;
}

export const authService = {
  /**
   * Get currently active session user from local storage or default public guest
   */
  getCurrentUser(): User {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore parsing error
    }

    return {
      id: 'guest-patient',
      email: 'guest@community.retinaguard.ai',
      name: 'Guest Visitor',
      role: 'public',
      experience: 'patient',
      verificationStatus: 'pending',
      permissions: ROLE_PERMISSIONS.public,
    };
  },

  /**
   * Authenticate user with credentials or onboarding
   */
  async login(
    email: string,
    role: UserRole = 'helper',
    meta?: Partial<User>
  ): Promise<User> {
    const user: User = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name: meta?.name || email.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
      role,
      experience: role === 'researcher' ? 'researcher' : role === 'public' || role === 'patient' ? 'patient' : 'helper',
      helperRoleTitle: meta?.helperRoleTitle || (role === 'helper' ? 'Community Health Worker' : undefined),
      organization: meta?.organization || (role === 'researcher' ? 'AI Medical Imaging Collaborative' : 'Community Health Mission'),
      location: meta?.location || 'Bengaluru, India',
      verificationStatus: meta?.verificationStatus || 'verified',
      isDemoVerification: meta?.isDemoVerification ?? true,
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.helper,
      clinicId: 'clinic-blr-01',
      clinicName: 'Victoria Hospital Regional Eye Center',
      token: `jwt_mock_${Date.now()}`,
      voiceGuidanceEnabled: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return user;
  },

  /**
   * Quick demo login for Screening Helper
   */
  async loginDemoHelper(): Promise<User> {
    return this.login('ananya.rao@healthmission.org', 'helper', {
      name: 'Ananya Rao',
      helperRoleTitle: 'Community Health Worker',
      organization: 'Bengaluru District Eye Mission',
      location: 'Bengaluru, Karnataka',
      verificationStatus: 'verified',
      isDemoVerification: true,
    });
  },

  /**
   * Quick demo login for Researcher
   */
  async loginDemoResearcher(): Promise<User> {
    return this.login('sai.krishnan@visionai.edu', 'researcher', {
      name: 'Dr. Sai Krishnan',
      organization: 'Medical AI & Retina Imaging Lab',
      location: 'Indian Institute of Science / AIIMS',
      verificationStatus: 'verified',
      isDemoVerification: true,
    });
  },

  /**
   * Update active user profile
   */
  updateCurrentUser(updates: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated: User = {
      ...current,
      ...updates,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  /**
   * Switch active persona
   */
  switchRole(role: UserRole): User {
    const current = this.getCurrentUser();
    const updated: User = {
      ...current,
      role,
      experience: role === 'researcher' ? 'researcher' : role === 'public' || role === 'patient' ? 'patient' : 'helper',
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.public,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  /**
   * Logout - resets to public guest
   */
  logout(): User {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return {
      id: 'guest-patient',
      email: 'guest@community.retinaguard.ai',
      name: 'Guest Visitor',
      role: 'public',
      experience: 'patient',
      verificationStatus: 'pending',
      permissions: ROLE_PERMISSIONS.public,
    };
  },
};

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
        const parsed: User = JSON.parse(saved);
        // Only return authenticated user if they explicitly completed sign in with active token
        if (
          parsed &&
          parsed.isLoggedIn === true &&
          parsed.role !== 'public' &&
          parsed.id !== 'guest-patient' &&
          Boolean(parsed.token) &&
          Boolean(parsed.email)
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore parsing error
    }

    return {
      id: 'guest-patient',
      email: '',
      name: '',
      role: 'public',
      experience: 'patient',
      emailVerified: false,
      phoneVerified: false,
      verificationStatus: 'unverified',
      authorizedRoles: ['patient'],
      permissions: ROLE_PERMISSIONS.public,
      isLoggedIn: false,
    };
  },

  /**
   * Check if the current session is an authenticated user (not guest)
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return (
      Boolean(user.isLoggedIn) &&
      user.role !== 'public' &&
      Boolean(user.token) &&
      user.id !== 'guest-patient' &&
      Boolean(user.email)
    );
  },

  /**
   * Authenticate user with credentials or onboarding
   * STRICT MODE ISOLATION: For that signed profile, ONLY that mode is enabled.
   */
  async login(
    email: string,
    role: UserRole = 'helper',
    meta?: Partial<User>
  ): Promise<User> {
    const normalizedRole: UserRole = role === 'public' ? 'patient' : role;

    const user: User = {
      id: meta?.id || `usr-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name: meta?.name || email.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
      role: normalizedRole,
      experience: normalizedRole === 'researcher' ? 'researcher' : normalizedRole === 'helper' ? 'helper' : 'patient',
      helperRoleTitle: meta?.helperRoleTitle || (normalizedRole === 'helper' ? 'Community Health Worker' : undefined),
      organization: meta?.organization || (normalizedRole === 'researcher' ? 'AI Medical Imaging Collaborative' : 'Community Health Mission'),
      location: meta?.location || 'Bengaluru, India',
      phone: meta?.phone || (normalizedRole === 'helper' ? '+91 98450 67890' : undefined),
      dateOfBirth: meta?.dateOfBirth,
      emailVerified: meta?.emailVerified ?? true,
      phoneVerified: meta?.phoneVerified ?? true,
      verificationStatus: meta?.verificationStatus || (normalizedRole === 'helper' ? 'Verified' : 'verified'),
      isDemoVerification: meta?.isDemoVerification ?? true,
      permissions: ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.patient,
      // ONLY the signed profile's role is enabled:
      authorizedRoles: [normalizedRole],
      clinicId: 'clinic-blr-01',
      clinicName: meta?.organization || 'Victoria Hospital Regional Eye Center',
      token: `jwt_${normalizedRole}_${Date.now()}`,
      voiceGuidanceEnabled: true,
      isLoggedIn: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return user;
  },

  /**
   * Quick demo login for Patient Mode
   */
  async loginDemoPatient(): Promise<User> {
    return this.login('meenakshi.amma@gmail.com', 'patient', {
      name: 'K. Meenakshi Amma',
      phone: '+91 98451 22334',
      dateOfBirth: '1963-04-12',
      emailVerified: true,
      phoneVerified: true,
      verificationStatus: 'verified',
      preferredLanguage: 'en',
    });
  },

  /**
   * Register or sign in a verified patient
   */
  async registerPatient(data: {
    name: string;
    email: string;
    phone: string;
    preferredLanguage?: string;
    dateOfBirth?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  }): Promise<User> {
    const user: User = {
      id: `pt-${Math.random().toString(36).substring(2, 9)}`,
      email: data.email,
      name: data.name,
      role: 'patient',
      experience: 'patient',
      phone: data.phone,
      emailVerified: data.emailVerified ?? true,
      phoneVerified: data.phoneVerified ?? true,
      preferredLanguage: data.preferredLanguage || 'en',
      dateOfBirth: data.dateOfBirth,
      registeredAt: new Date().toISOString(),
      verificationStatus: 'verified',
      isDemoVerification: true,
      permissions: ROLE_PERMISSIONS.patient,
      authorizedRoles: ['patient'],
      token: `jwt_patient_${Date.now()}`,
      isLoggedIn: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return user;
  },

  /**
   * Register a new Screening Helper (Medical Worker)
   */
  async registerHelper(data: {
    name: string;
    role: HelperRoleTitle;
    organization: string;
    email: string;
    phone: string;
    location: string;
    verificationStatus?: VerificationStatus;
    isDemoVerification?: boolean;
  }): Promise<User> {
    const isVerified = data.verificationStatus === 'Verified' || data.verificationStatus === 'verified';
    const user: User = {
      id: `hlp-${Math.random().toString(36).substring(2, 9)}`,
      email: data.email,
      name: data.name,
      role: 'helper',
      experience: 'helper',
      helperRoleTitle: data.role,
      organization: data.organization,
      location: data.location,
      phone: data.phone,
      verificationStatus: data.verificationStatus || 'Pending Verification',
      isDemoVerification: data.isDemoVerification ?? isVerified,
      permissions: ROLE_PERMISSIONS.helper,
      authorizedRoles: ['helper'],
      clinicId: 'clinic-blr-01',
      clinicName: data.organization,
      token: `jwt_helper_${Date.now()}`,
      voiceGuidanceEnabled: true,
      registeredAt: new Date().toISOString(),
      isLoggedIn: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return user;
  },

  /**
   * Quick demo login for Medical Worker (Screening Helper)
   */
  async loginDemoHelper(preset?: {
    name?: string;
    email?: string;
    role?: HelperRoleTitle;
    organization?: string;
    phone?: string;
    location?: string;
    verificationStatus?: VerificationStatus;
  }): Promise<User> {
    const status = preset?.verificationStatus || 'Verified';
    const isVerified = status === 'Verified' || status === 'verified';
    return this.login(preset?.email || 'ananya.rao@healthmission.org', 'helper', {
      name: preset?.name || 'Ananya Rao',
      helperRoleTitle: preset?.role || 'Community Health Worker',
      organization: preset?.organization || 'Bengaluru District Eye Mission',
      location: preset?.location || 'Bengaluru, Karnataka',
      phone: preset?.phone || '+91 98450 67890',
      verificationStatus: status,
      isDemoVerification: isVerified,
    });
  },

  /**
   * Switch or simulate verification status for testing
   */
  setVerificationStatus(status: VerificationStatus): User {
    const current = this.getCurrentUser();
    const isVerified = status === 'Verified' || status === 'verified';
    const updated: User = {
      ...current,
      verificationStatus: status,
      isDemoVerification: isVerified,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  /**
   * Quick demo login for Researcher Mode
   */
  async loginDemoResearcher(): Promise<User> {
    return this.login('sai.krishnan@visionai.edu', 'researcher', {
      name: 'Dr. Sai Krishnan',
      organization: 'Medical AI & Retina Imaging Lab',
      location: 'Bengaluru, Karnataka',
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
   * Switch active persona (Mode selection)
   */
  switchRole(role: UserRole): User {
    const current = this.getCurrentUser();
    const normalizedRole: UserRole = role === 'public' ? 'patient' : role;
    const updated: User = {
      ...current,
      role: normalizedRole,
      experience: normalizedRole === 'researcher' ? 'researcher' : normalizedRole === 'helper' ? 'helper' : 'patient',
      authorizedRoles: [normalizedRole],
      permissions: ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.public,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  /**
   * Logout - resets to public unauthenticated guest
   */
  logout(): User {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return {
      id: 'guest-patient',
      email: '',
      name: '',
      role: 'public',
      experience: 'patient',
      emailVerified: false,
      phoneVerified: false,
      verificationStatus: 'unverified',
      authorizedRoles: ['patient'],
      permissions: ROLE_PERMISSIONS.public,
      isLoggedIn: false,
    };
  },
};

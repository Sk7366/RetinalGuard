/**
 * Authentication Service (FastAPI / Supabase Auth ready)
 */

import { User, UserRole } from '../types';
import { ROLE_PERMISSIONS } from './permissions';

const STORAGE_KEY = 'retinaguard_auth_user';

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
      id: 'guest-public',
      email: 'guest@community.retinaguard.ai',
      name: 'Community Visitor',
      role: 'public',
      permissions: ROLE_PERMISSIONS.public,
    };
  },

  /**
   * Authenticate user with credentials or demo switch
   */
  async login(email: string, role: UserRole = 'provider'): Promise<User> {
    const user: User = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role,
      permissions: ROLE_PERMISSIONS[role],
      clinicId: 'clinic-blr-01',
      clinicName: 'Victoria Hospital Regional Eye Center',
      token: `jwt_mock_${Date.now()}`,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return user;
  },

  /**
   * Switch active persona
   */
  switchRole(role: UserRole): User {
    const current = this.getCurrentUser();
    const updated: User = {
      ...current,
      role,
      permissions: ROLE_PERMISSIONS[role],
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  /**
   * Logout
   */
  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

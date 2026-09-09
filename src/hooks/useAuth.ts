/**
 * Custom Hook: Authentication & Permissions
 */

import { useCallback, useState } from 'react';
import { authService, hasPermission } from '../auth';
import { Permission, User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User>(() => authService.getCurrentUser());

  const login = useCallback(async (email: string, role?: UserRole) => {
    const loggedIn = await authService.login(email, role);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const updated = authService.switchRole(role);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(authService.getCurrentUser());
  }, []);

  const can = useCallback(
    (permission: Permission) => {
      return hasPermission(user.role, permission);
    },
    [user.role]
  );

  return {
    user,
    currentRole: user.role,
    isAuthenticated: Boolean(user.token),
    login,
    switchRole,
    logout,
    can,
  };
}

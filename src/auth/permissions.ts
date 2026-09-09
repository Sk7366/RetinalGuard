/**
 * Role-Based Access Control (RBAC) & Permissions
 */

import { Permission, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  public: [
    'SCREENING_CREATE',
    'SCREENING_READ',
  ],
  technician: [
    'SCREENING_CREATE',
    'SCREENING_READ',
    'SCREENING_BATCH',
    'REFERRAL_READ',
  ],
  provider: [
    'SCREENING_CREATE',
    'SCREENING_READ',
    'SCREENING_BATCH',
    'REFERRAL_READ',
    'REFERRAL_UPDATE',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW',
    'RESEARCH_ABLATION_VIEW',
  ],
  admin: [
    'SCREENING_CREATE',
    'SCREENING_READ',
    'SCREENING_BATCH',
    'REFERRAL_READ',
    'REFERRAL_UPDATE',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW',
    'SETTINGS_MANAGE',
    'RESEARCH_ABLATION_VIEW',
  ],
  researcher: [
    'SCREENING_READ',
    'ANALYTICS_VIEW',
    'AUDIT_LOG_VIEW',
    'RESEARCH_ABLATION_VIEW',
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

export const ROLE_METADATA: Record<
  UserRole,
  { name: string; description: string; badge: string; defaultRoute: string }
> = {
  public: {
    name: 'Patient & Public',
    description: 'Community members seeking diabetic retinopathy screening and eye health education.',
    badge: 'Public Portal',
    defaultRoute: 'public/overview',
  },
  technician: {
    name: 'Screening Technician',
    description: 'Camp workers and primary health staff conducting non-mydriatic fundus captures.',
    badge: 'Field Screening',
    defaultRoute: 'provider/camp-mode',
  },
  provider: {
    name: 'Healthcare Provider',
    description: 'Ophthalmologists and retina specialists managing clinical reviews and referrals.',
    badge: 'Clinical Workspace',
    defaultRoute: 'provider/dashboard',
  },
  admin: {
    name: 'Clinic Administrator',
    description: 'Health system managers overseeing screening queues, camp logistics, and telemetry.',
    badge: 'Administration',
    defaultRoute: 'provider/dashboard',
  },
  researcher: {
    name: 'Medical AI Researcher',
    description: 'Scientists evaluating multimodal ablation experiments, Grad-CAM, and SHAP interpretability.',
    badge: 'Research Lab',
    defaultRoute: 'provider/research',
  },
};

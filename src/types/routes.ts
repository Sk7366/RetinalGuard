/**
 * Application Navigation Route Types
 */

export type AppExperience = 'patient' | 'helper' | 'researcher';

export type AppMode = 'public' | 'provider' | 'helper' | 'researcher';

export type PublicRoute =
  | 'overview'
  | 'why-screening'
  | 'how-it-works'
  | 'find-screening'
  | 'learn'
  | 'help'
  | 'my-screening'
  | 'my-reports'
  | 'profile'
  | 'explore-demo'
  | 'get-screened'
  | 'how-it-helps'
  | 'research';

export type ProviderRoute =
  | 'dashboard'
  | 'camp-mode'
  | 'start-screening'
  | 'review-queue'
  | 'batch-screening'
  | 'referrals'
  | 'appointments'
  | 'analytics'
  | 'screenings'
  | 'cases'
  | 'research'
  | 'models'
  | 'datasets'
  | 'experiments'
  | 'evaluation'
  | 'explainability'
  | 'model-versions'
  | 'technology'
  | 'settings'
  | 'help';

export type HelperRoute = ProviderRoute;

export type ResearcherRoute =
  | 'research'
  | 'models'
  | 'datasets'
  | 'experiments'
  | 'evaluation'
  | 'explainability'
  | 'model-versions'
  | 'architecture'
  | 'help';

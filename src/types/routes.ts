/**
 * Application Navigation Route Types
 */

export type AppExperience = 'patient' | 'helper' | 'researcher';

export type AppMode = 'public' | 'provider' | 'helper' | 'researcher';

export type PublicRoute =
  | 'overview'
  | 'why-screening'
  | 'find-screening'
  | 'learn'
  | 'help'
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
  | 'analytics'
  | 'screenings'
  | 'cases'
  | 'research'
  | 'technology'
  | 'settings'
  | 'help';

export type HelperRoute = ProviderRoute;

export type ResearcherRoute =
  | 'research'
  | 'experiments'
  | 'datasets'
  | 'models'
  | 'explainability'
  | 'architecture'
  | 'help';

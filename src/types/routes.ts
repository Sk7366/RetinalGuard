/**
 * Application Navigation Route Types
 */

export type AppMode = 'public' | 'provider';

export type PublicRoute =
  | 'get-screened'
  | 'find-screening'
  | 'learn'
  | 'explore-demo'
  | 'overview'
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
  | 'settings';

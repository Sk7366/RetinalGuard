/**
 * Custom Hook: Closed-Loop Referral Queue Management
 */

import { useCallback, useEffect, useState } from 'react';
import { screeningApi } from '../api';
import { Referral, ReferralStatus, Screening } from '../types';

export function useReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await screeningApi.getReferrals();
      setReferrals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load referral queue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const updateStatus = useCallback(
    async (id: string, status: ReferralStatus, notes?: string) => {
      try {
        const updated = await screeningApi.updateReferralStatus(id, status, notes);
        if (updated) {
          setReferrals((prev) => prev.map((r) => (r.id === id ? updated : r)));
        }
        return updated;
      } catch (err: any) {
        setError(err.message || 'Failed to update referral status');
        throw err;
      }
    },
    []
  );

  const createReferral = useCallback(
    async (result: Screening, clinic: string, notes: string) => {
      try {
        const created = await screeningApi.createReferral(result, clinic, notes);
        setReferrals((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        setError(err.message || 'Failed to create referral');
        throw err;
      }
    },
    []
  );

  return {
    referrals,
    isLoading,
    error,
    refresh: fetchReferrals,
    updateStatus,
    createReferral,
  };
}

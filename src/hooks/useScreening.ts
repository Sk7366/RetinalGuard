/**
 * Custom Hook: Screening Encounter Lifecycle
 */

import { useCallback, useState } from 'react';
import { PRESET_CASES, PresetPatientCase } from '../data/sampleCases';
import { Screening } from '../types';

export function useScreening(initialCases: Screening[] = []) {
  const [history, setHistory] = useState<Screening[]>(() =>
    initialCases.length > 0 ? initialCases : PRESET_CASES.map((c) => c.expectedTriage)
  );

  const [activeResult, setActiveResult] = useState<Screening | null>(() =>
    PRESET_CASES[2]?.expectedTriage || null
  );

  const [activePreset, setActivePreset] = useState<PresetPatientCase | null>(null);

  const selectPreset = useCallback((caseId: string) => {
    const found = PRESET_CASES.find((c) => c.id === caseId);
    if (found) {
      setActivePreset(found);
      setActiveResult(found.expectedTriage);
      return found;
    }
    return null;
  }, []);

  const addScreeningResult = useCallback((result: Screening) => {
    setActiveResult(result);
    setHistory((prev) => [result, ...prev]);
  }, []);

  const clearActiveResult = useCallback(() => {
    setActivePreset(null);
  }, []);

  return {
    history,
    activeResult,
    activePreset,
    setActiveResult,
    selectPreset,
    addScreeningResult,
    clearActiveResult,
  };
}

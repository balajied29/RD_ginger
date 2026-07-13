'use client';

import { useEffect, useRef } from 'react';

/**
 * Smart-form autosave: persists the form state to this phone on every
 * change and restores it when the screen reopens — a distracted staff
 * member never loses half-entered bags. Draft is cleared on successful
 * save (call clearDraft) and survives app close / phone restart.
 */
export function useDraft(key, state, restore) {
  const hydrated = useRef(false);

  // Restore once on mount, before any persist.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) restore(JSON.parse(raw));
    } catch { /* corrupt draft — start fresh */ }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch { /* storage full/blocked — autosave is best-effort */ }
  }, [key, state]);

  function clearDraft() {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  }

  return { clearDraft };
}

import { useState, useMemo, useCallback } from 'react';
import type { MatchRecord } from '../types';

export function useMatchSelection(tabFiltered: MatchRecord[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickReviewOpen, setQuickReviewOpen] = useState(false);

  const quickReviewRecords = useMemo(() => {
    return tabFiltered.filter((r) => selectedIds.has(r.match.ExternalPatientId));
  }, [tabFiltered, selectedIds]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = tabFiltered.map((r) => r.match.ExternalPatientId);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  }, [tabFiltered]);

  const selectByRange = useCallback((min: number | null, max: number | null) => {
    if (min === null && max === null) {
      setSelectedIds(new Set(tabFiltered.map((r) => r.match.ExternalPatientId)));
    } else {
      setSelectedIds(
        new Set(
          tabFiltered
            .filter((r) => {
              const s = r.match.ConfidenceScore;
              if (min !== null && s < min) return false;
              if (max !== null && s > max) return false;
              return true;
            })
            .map((r) => r.match.ExternalPatientId),
        ),
      );
    }
  }, [tabFiltered]);

  const openQuickReview = useCallback(() => {
    setQuickReviewOpen(true);
  }, []);

  const closeQuickReview = useCallback(() => {
    setQuickReviewOpen(false);
    setSelectedIds(new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    quickReviewOpen,
    quickReviewRecords,
    toggleSelectRow,
    toggleSelectAll,
    selectByRange,
    openQuickReview,
    closeQuickReview,
    clearSelection,
  };
}

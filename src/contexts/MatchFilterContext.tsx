import { createContext, useContext } from 'react';
import type { MatchRecord, SortConfig } from '../types';
import type { TabKey } from '../constants';
import { useMatchFilters } from '../hooks/useMatchFilters';
import { useMatchSelection } from '../hooks/useMatchSelection';
import { useMatchDataCtx } from './MatchDataContext';

interface MatchFilterContextValue {
  search: string;
  setSearch: (s: string) => void;
  sort: SortConfig;
  toggleSort: (key: string) => void;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  tabFiltered: MatchRecord[];
  selectedIds: Set<string>;
  toggleSelectAll: () => void;
  toggleSelectRow: (id: string) => void;
  selectByRange: (min: number | null, max: number | null) => void;
  clearSelection: () => void;
  quickReviewOpen: boolean;
  quickReviewRecords: MatchRecord[];
  openQuickReview: () => void;
  closeQuickReview: () => void;
}

const MatchFilterContext = createContext<MatchFilterContextValue | null>(null);

export function useMatchFilterCtx(): MatchFilterContextValue {
  const ctx = useContext(MatchFilterContext);
  if (!ctx) throw new Error('useMatchFilterCtx must be used within <MatchFilterProvider>');
  return ctx;
}

export function MatchFilterProvider({ children }: { children: React.ReactNode }) {
  const { matchRecords } = useMatchDataCtx();
  const filters = useMatchFilters(matchRecords);
  const selection = useMatchSelection(filters.tabFiltered);

  const value: MatchFilterContextValue = {
    search: filters.search,
    setSearch: filters.setSearch,
    sort: filters.sort,
    toggleSort: filters.toggleSort,
    activeTab: filters.activeTab,
    setActiveTab: filters.setActiveTab,
    tabFiltered: filters.tabFiltered,
    selectedIds: selection.selectedIds,
    toggleSelectAll: selection.toggleSelectAll,
    toggleSelectRow: selection.toggleSelectRow,
    selectByRange: selection.selectByRange,
    clearSelection: selection.clearSelection,
    quickReviewOpen: selection.quickReviewOpen,
    quickReviewRecords: selection.quickReviewRecords,
    openQuickReview: selection.openQuickReview,
    closeQuickReview: selection.closeQuickReview,
  };

  return (
    <MatchFilterContext.Provider value={value}>
      {children}
    </MatchFilterContext.Provider>
  );
}

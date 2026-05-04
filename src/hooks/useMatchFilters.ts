import { useState, useMemo, useCallback } from 'react';
import type { MatchRecord, SortConfig } from '../types';
import type { TabKey } from '../constants';
import { SORTABLE_KEYS, REJECTION_CONFIG, COL, SORT_DIR, STATUS } from '../constants';
import { patientMatchesQuery } from '../utils/patients';

const { CONFIDENCE, INTERNAL, EXTERNAL, REJECTION } = COL;
const { ASC, DESC } = SORT_DIR;
const { UNREVIEWED } = STATUS;

export function useMatchFilters(matchRecords: MatchRecord[]) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: CONFIDENCE, direction: DESC });
  const [activeTab, setActiveTab] = useState<TabKey>(UNREVIEWED);

  const toggleSort = useCallback((key: string) => {
    if (!SORTABLE_KEYS.includes(key as (typeof SORTABLE_KEYS)[number])) return;
    setSort((prev) =>
      prev.key === key
        ? { key: key as SortConfig['key'], direction: prev.direction === ASC ? DESC : ASC }
        : { key: key as SortConfig['key'], direction: DESC },
    );
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return matchRecords;
    const q = search.toLowerCase();
    return matchRecords.filter(
      (r) => patientMatchesQuery(r.internalPatient, q) || patientMatchesQuery(r.externalPatient, q),
    );
  }, [matchRecords, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.direction === ASC ? 1 : -1;
    arr.sort((a, b) => {
      switch (sort.key) {
        case CONFIDENCE:
          return (a.match.ConfidenceScore - b.match.ConfidenceScore) * dir;
        case REJECTION: {
          const aR = a.rejectionReason ? (REJECTION_CONFIG[a.rejectionReason]?.sortOrder ?? 2) : 2;
          const bR = b.rejectionReason ? (REJECTION_CONFIG[b.rejectionReason]?.sortOrder ?? 2) : 2;
          return (aR - bR) * dir;
        }
        case INTERNAL:
          return a.internalPatient.LastName.localeCompare(b.internalPatient.LastName) * dir;
        case EXTERNAL:
          return a.externalPatient.LastName.localeCompare(b.externalPatient.LastName) * dir;
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sort]);

  const tabFiltered = useMemo(() => {
    return sorted.filter((r) => r.status === activeTab);
  }, [sorted, activeTab]);

  return {
    search,
    setSearch,
    sort,
    toggleSort,
    activeTab,
    setActiveTab,
    tabFiltered,
  };
}

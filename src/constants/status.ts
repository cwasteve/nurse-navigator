import type { TabDef } from '../types';

export const STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  FOLLOW_UP: 'follow_up',
} as const;

export type MatchStatus = (typeof STATUS)[keyof typeof STATUS];

interface StatusMeta {
  label: string;
  borderColor: string;
}

export const STATUS_CONFIG: Record<MatchStatus, StatusMeta> = {
  [STATUS.PENDING]: { label: 'Unreviewed', borderColor: 'border-l-transparent' },
  [STATUS.CONFIRMED]: { label: 'Confirmed', borderColor: 'border-l-success' },
  [STATUS.REJECTED]: { label: 'Rejected', borderColor: 'border-l-danger' },
  [STATUS.FOLLOW_UP]: { label: 'Needs Follow Up', borderColor: 'border-l-warning' },
};

// Derived
export const TABS: TabDef[] = (Object.entries(STATUS_CONFIG) as [MatchStatus, StatusMeta][]).map(
  ([key, meta]) => ({ key, label: meta.label }),
);

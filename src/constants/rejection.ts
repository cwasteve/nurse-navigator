export const REJECTION = {
  FALSE_POSITIVE: 'false_positive',
  CHANGED_PCP: 'changed_pcp',
} as const;

export type RejectionReason = (typeof REJECTION)[keyof typeof REJECTION];

interface RejectionMeta {
  shortLabel: string;
  fullLabel: string;
  sortOrder: number;
}

export const REJECTION_CONFIG: Record<RejectionReason, RejectionMeta> = {
  [REJECTION.FALSE_POSITIVE]: {
    shortLabel: 'False positive',
    fullLabel: 'False positive — not the same patient',
    sortOrder: 0,
  },
  [REJECTION.CHANGED_PCP]: {
    shortLabel: 'Changed PCP/Clinic',
    fullLabel: 'Changed PCP/Clinic — patient reports switching providers',
    sortOrder: 1,
  },
};

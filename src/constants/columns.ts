import type { Column } from '../types';

/** Configurable facility name — used in column headers and comparison views. */
export const FACILITY_NAME = 'Our Facility';

export const COL = {
  CONFIDENCE: 'confidence',
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  DIFFERENCES: 'differences',
  NOTES: 'notes',
  REJECTION: 'rejection',
} as const;

export type ColumnKey = (typeof COL)[keyof typeof COL];

export const COLUMNS: Record<ColumnKey, Column> = {
  [COL.CONFIDENCE]: {
    label: 'Confidence',
    tooltip: 'How likely the algorithm thinks these are the same patient',
    sortable: true,
  },
  [COL.INTERNAL]: { label: `${FACILITY_NAME} Patient`, tooltip: null, sortable: true },
  [COL.EXTERNAL]: { label: 'External Record', tooltip: null, sortable: true },
  [COL.DIFFERENCES]: {
    label: 'Differences',
    tooltip: 'Fields that do not match between the two records',
    sortable: false,
  },
  [COL.NOTES]: { label: 'Notes', tooltip: null, sortable: false },
  [COL.REJECTION]: { label: 'Reason', tooltip: 'Why the match was rejected', sortable: true },
};

// Columns shown by default (all except rejection)
export const BASE_COLUMN_KEYS: ColumnKey[] = [COL.CONFIDENCE, COL.INTERNAL, COL.EXTERNAL, COL.DIFFERENCES, COL.NOTES];

// Derived — keys that support sorting
export const SORTABLE_KEYS: ColumnKey[] = (Object.entries(COLUMNS) as [ColumnKey, Column][])
  .filter(([, col]) => col.sortable)
  .map(([key]) => key);

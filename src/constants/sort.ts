export const SORT_DIR = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = (typeof SORT_DIR)[keyof typeof SORT_DIR];

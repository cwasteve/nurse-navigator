import { describe, it, expect } from 'vitest';
import { COLUMNS, COL, BASE_COLUMN_KEYS, SORTABLE_KEYS, FACILITY_NAME } from './columns';
import { STATUS, STATUS_CONFIG, TABS } from './status';
import { REJECTION, REJECTION_CONFIG } from './rejection';

describe('COLUMNS config', () => {
  it('has an entry for every COL key', () => {
    for (const key of Object.values(COL)) {
      expect(COLUMNS[key]).toBeDefined();
      expect(COLUMNS[key].label).toBeTruthy();
    }
  });

  it('BASE_COLUMN_KEYS does not include rejection', () => {
    expect(BASE_COLUMN_KEYS).not.toContain(COL.REJECTION);
  });

  it('BASE_COLUMN_KEYS contains all non-rejection columns', () => {
    const nonRejection = Object.values(COL).filter((k) => k !== COL.REJECTION);
    for (const key of nonRejection) {
      expect(BASE_COLUMN_KEYS).toContain(key);
    }
  });

  it('SORTABLE_KEYS only includes columns marked sortable', () => {
    for (const key of SORTABLE_KEYS) {
      expect(COLUMNS[key].sortable).toBe(true);
    }
  });

  it('SORTABLE_KEYS includes all sortable columns', () => {
    for (const [key, col] of Object.entries(COLUMNS)) {
      if (col.sortable) {
        expect(SORTABLE_KEYS).toContain(key);
      }
    }
  });

  it('internal column label includes the facility name', () => {
    expect(COLUMNS[COL.INTERNAL].label).toContain(FACILITY_NAME);
  });
});

describe('STATUS_CONFIG', () => {
  it('has an entry for every STATUS value', () => {
    for (const status of Object.values(STATUS)) {
      expect(STATUS_CONFIG[status]).toBeDefined();
      expect(STATUS_CONFIG[status].label).toBeTruthy();
      expect(STATUS_CONFIG[status].borderColor).toBeTruthy();
    }
  });

  it('all borderColor values start with "border-l-"', () => {
    for (const meta of Object.values(STATUS_CONFIG)) {
      expect(meta.borderColor).toMatch(/^border-l-/);
    }
  });
});

describe('TABS', () => {
  it('has one tab per status', () => {
    expect(TABS).toHaveLength(Object.keys(STATUS).length);
  });

  it('tab keys match status values', () => {
    const tabKeys = TABS.map((t) => t.key);
    for (const status of Object.values(STATUS)) {
      expect(tabKeys).toContain(status);
    }
  });

  it('tab labels match STATUS_CONFIG labels', () => {
    for (const tab of TABS) {
      expect(tab.label).toBe(STATUS_CONFIG[tab.key].label);
    }
  });
});

describe('REJECTION_CONFIG', () => {
  it('has an entry for every REJECTION value', () => {
    for (const reason of Object.values(REJECTION)) {
      expect(REJECTION_CONFIG[reason]).toBeDefined();
      expect(REJECTION_CONFIG[reason].shortLabel).toBeTruthy();
      expect(REJECTION_CONFIG[reason].fullLabel).toBeTruthy();
    }
  });

  it('fullLabel contains shortLabel', () => {
    for (const meta of Object.values(REJECTION_CONFIG)) {
      expect(meta.fullLabel.toLowerCase()).toContain(meta.shortLabel.toLowerCase());
    }
  });

  it('sortOrder values are unique', () => {
    const orders = Object.values(REJECTION_CONFIG).map((m) => m.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

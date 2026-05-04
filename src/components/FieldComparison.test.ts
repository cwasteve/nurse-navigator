import { describe, it, expect } from 'vitest';
import type { InternalPatient, ExternalPatient } from '../types';
import { buildFieldRows } from './FieldComparison';

const ip: InternalPatient = {
  InternalPatientId: 'INT001',
  FirstName: 'Jane',
  LastName: 'Smith',
  DOB: '1990-03-15',
  Sex: 'Female',
  PhoneNumber: '555-1234',
  Address: '123 Main St',
  City: 'Springfield',
  ZipCode: 62701,
};

const ep: ExternalPatient = {
  ExternalPatientId: 'EXT001',
  FirstName: 'Jane',
  LastName: 'Smith',
  DOB: '15-Mar-1990',
  Sex: 'Female',
  PhoneNumber: '555-1234',
  Address: '123 Main St',
  City: 'Springfield',
  ZipCode: 62701,
};

describe('buildFieldRows', () => {
  it('returns 8 rows', () => {
    const rows = buildFieldRows(ip, ep);
    expect(rows).toHaveLength(8);
  });

  it('has the correct labels in order', () => {
    const rows = buildFieldRows(ip, ep);
    const labels = rows.map((r) => r.label);
    expect(labels).toEqual([
      'First Name',
      'Last Name',
      'Date of Birth',
      'Sex',
      'Phone',
      'Address',
      'City',
      'Zip Code',
    ]);
  });

  it('normalizes DOB values', () => {
    const rows = buildFieldRows(ip, ep);
    const dobRow = rows.find((r) => r.label === 'Date of Birth')!;
    expect(dobRow.internalValue).toBe('03/15/1990');
    expect(dobRow.externalValue).toBe('03/15/1990');
  });

  it('stringifies ZipCode', () => {
    const rows = buildFieldRows(ip, ep);
    const zipRow = rows.find((r) => r.label === 'Zip Code')!;
    expect(zipRow.internalValue).toBe('62701');
    expect(zipRow.externalValue).toBe('62701');
  });

  it('sets all externalValues to null when ep is null', () => {
    const rows = buildFieldRows(ip, null);
    for (const row of rows) {
      expect(row.externalValue).toBeNull();
    }
  });
});

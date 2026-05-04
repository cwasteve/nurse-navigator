import { describe, it, expect } from 'vitest';
import type { InternalPatient, ExternalPatient } from '../types';
import {
  formatDOB,
  searchableDOB,
  fullName,
  getPatientId,
  buildPatientMap,
  fieldsMatch,
  getDifferences,
  patientMatchesQuery,
  formatTimestamp,
} from './patients';

const internalPatient: InternalPatient = {
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

const externalPatient: ExternalPatient = {
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

describe('formatDOB', () => {
  it('converts external DD-Mon-YYYY to MM/DD/YYYY', () => {
    expect(formatDOB('15-Mar-1990')).toBe('03/15/1990');
  });

  it('converts internal YYYY-MM-DD to MM/DD/YYYY', () => {
    expect(formatDOB('1990-03-15')).toBe('03/15/1990');
  });

  it('returns empty string for empty input', () => {
    expect(formatDOB('')).toBe('');
  });

  it('passes through unrecognized formats', () => {
    expect(formatDOB('March 15, 1990')).toBe('March 15, 1990');
  });
});

describe('searchableDOB', () => {
  it('includes the formatted date', () => {
    const result = searchableDOB('1990-03-15');
    expect(result).toContain('03/15/1990');
  });

  it('includes the full month name', () => {
    const result = searchableDOB('1990-03-15');
    expect(result).toContain('march');
  });

  it('includes month + day with leading zero', () => {
    const result = searchableDOB('1990-03-15');
    expect(result).toContain('march 15');
  });

  it('includes month + day without leading zero', () => {
    const result = searchableDOB('1990-3-15');
    expect(result).toContain('march 15');
  });

  it('includes ordinal day', () => {
    const result = searchableDOB('1990-03-15');
    expect(result).toContain('march 15th');
  });

  it('includes month + day + year', () => {
    const result = searchableDOB('1990-03-15');
    expect(result).toContain('march 15 1990');
  });

  it('handles external format', () => {
    const result = searchableDOB('15-Mar-1990');
    expect(result).toContain('march 15');
  });

  it('returns empty string for empty input', () => {
    expect(searchableDOB('')).toBe('');
  });

  it('uses correct ordinal for 1st', () => {
    const result = searchableDOB('1990-03-01');
    expect(result).toContain('march 1st');
  });

  it('uses correct ordinal for 2nd', () => {
    const result = searchableDOB('1990-03-02');
    expect(result).toContain('march 2nd');
  });

  it('uses correct ordinal for 3rd', () => {
    const result = searchableDOB('1990-03-03');
    expect(result).toContain('march 3rd');
  });

  it('uses th for 11th, 12th, 13th', () => {
    expect(searchableDOB('1990-03-11')).toContain('march 11th');
    expect(searchableDOB('1990-03-12')).toContain('march 12th');
    expect(searchableDOB('1990-03-13')).toContain('march 13th');
  });
});

describe('fullName', () => {
  it('formats internal patient as LastName, FirstName', () => {
    expect(fullName(internalPatient)).toBe('Smith, Jane');
  });

  it('formats external patient as LastName, FirstName', () => {
    expect(fullName(externalPatient)).toBe('Smith, Jane');
  });
});

describe('getPatientId', () => {
  it('returns InternalPatientId for internal patients', () => {
    expect(getPatientId(internalPatient)).toBe('INT001');
  });

  it('returns ExternalPatientId for external patients', () => {
    expect(getPatientId(externalPatient)).toBe('EXT001');
  });
});

describe('buildPatientMap', () => {
  it('builds map with correct keys and size', () => {
    const map = buildPatientMap([internalPatient]);
    expect(map.size).toBe(1);
    expect(map.get('INT001')).toBe(internalPatient);
  });

  it('returns empty map for empty array', () => {
    const map = buildPatientMap([]);
    expect(map.size).toBe(0);
  });
});

describe('fieldsMatch', () => {
  it('matches case-insensitively', () => {
    expect(fieldsMatch('Jane', 'jane')).toBe(true);
  });

  it('coerces numbers to strings', () => {
    expect(fieldsMatch(12345, '12345')).toBe(true);
  });

  it('returns false for different values', () => {
    expect(fieldsMatch('Jane', 'John')).toBe(false);
  });
});

describe('getDifferences', () => {
  it('returns empty array when all fields match', () => {
    expect(getDifferences(internalPatient, externalPatient)).toEqual([]);
  });

  it('detects a single difference', () => {
    const modified: ExternalPatient = { ...externalPatient, FirstName: 'Janet' };
    expect(getDifferences(internalPatient, modified)).toEqual(['First Name']);
  });

  it('normalizes DOB across formats before comparing', () => {
    // Same date, different formats — should not show as a diff
    const ip: InternalPatient = { ...internalPatient, DOB: '1990-03-15' };
    const ep: ExternalPatient = { ...externalPatient, DOB: '15-Mar-1990' };
    expect(getDifferences(ip, ep)).toEqual([]);
  });

  it('detects multiple differences', () => {
    const modified: ExternalPatient = {
      ...externalPatient,
      FirstName: 'Janet',
      City: 'Shelbyville',
      PhoneNumber: '555-9999',
    };
    const diffs = getDifferences(internalPatient, modified);
    expect(diffs).toContain('First Name');
    expect(diffs).toContain('City');
    expect(diffs).toContain('Phone');
    expect(diffs).toHaveLength(3);
  });

  it('compares ZipCode as string (number coercion)', () => {
    const modified: ExternalPatient = { ...externalPatient, ZipCode: 99999 };
    expect(getDifferences(internalPatient, modified)).toContain('Zip');
  });
});

describe('patientMatchesQuery', () => {
  it('matches partial first name case-insensitively', () => {
    expect(patientMatchesQuery(internalPatient, 'jan')).toBe(true);
  });

  it('matches by patient ID', () => {
    expect(patientMatchesQuery(internalPatient, 'INT001')).toBe(true);
  });

  it('matches by last name', () => {
    expect(patientMatchesQuery(internalPatient, 'smith')).toBe(true);
  });

  it('matches by DOB month name', () => {
    expect(patientMatchesQuery(internalPatient, 'march')).toBe(true);
  });

  it('matches by DOB formatted string', () => {
    expect(patientMatchesQuery(internalPatient, '03/15')).toBe(true);
  });

  it('returns false for non-matching query', () => {
    expect(patientMatchesQuery(internalPatient, 'zzzzz')).toBe(false);
  });
});

// We only use this for notes, but it could be relevant in other cases
describe('formatTimestamp', () => {
  it('contains the year', () => {
    const result = formatTimestamp('2026-05-02T15:45:00.000Z');
    expect(result).toContain('2026');
  });

  it('contains AM or PM', () => {
    const result = formatTimestamp('2026-05-02T15:45:00.000Z');
    expect(result).toMatch(/AM|PM/);
  });
});

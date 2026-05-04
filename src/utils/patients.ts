import type { InternalPatient, ExternalPatient } from '../types';

const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

const MONTH_NUM_TO_FULL: Record<string, string> = {
  '01': 'january',
  '02': 'february',
  '03': 'march',
  '04': 'april',
  '05': 'may',
  '06': 'june',
  '07': 'july',
  '08': 'august',
  '09': 'september',
  '10': 'october',
  '11': 'november',
  '12': 'december',
};

/**
 * Parses a DOB string in either "DD-Mon-YYYY" or "YYYY-MM-DD" format
 * and returns a normalized "MM/DD/YYYY" display string.
 */
export function formatDOB(dob: string): string {
  if (!dob) return '';

  // DD-Mon-YYYY (external format)
  const extMatch = dob.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (extMatch) {
    const [, day, mon, year] = extMatch;
    return `${MONTH_MAP[mon]}/${day}/${year}`;
  }

  // YYYY-MM-DD (internal format)
  const intMatch = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (intMatch) {
    const [, year, month, day] = intMatch;
    return `${month}/${day}/${year}`;
  }

  return dob;
}

/**
 * Returns a searchable DOB string with multiple representations.
 * e.g. for DOB "1990-03-15" → "03/15/1990 march 15 march 15th march 15 1990"
 * Supports queries like "march", "march 15", "march 15th", "march 15 1990", "03/15".
 */
export function searchableDOB(dob: string): string {
  const formatted = formatDOB(dob);
  if (!formatted) return '';
  const monthNum = formatted.slice(0, 2);
  const fullMonth = MONTH_NUM_TO_FULL[monthNum] ?? '';
  const day = formatted.slice(3, 5);
  const year = formatted.slice(6, 10);
  const dayNum = String(parseInt(day, 10)); // "03" → "3"

  // 1st, 2nd, 3rd, 4th, etc. so the dates are human-readable
  const n = parseInt(day, 10);
  const suffix =
    n === 11 || n === 12 || n === 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
  const dayOrd = `${dayNum}${suffix}`;

  return [
    formatted, // 03/15/1990
    fullMonth, // march
    `${fullMonth} ${dayNum}`, // march 15
    `${fullMonth} ${dayOrd}`, // march 15th
    `${fullMonth} ${dayNum} ${year}`, // march 15 1990
    `${fullMonth} ${dayNum}, ${year}`, // march 15, 1990
    `${fullMonth} ${dayOrd} ${year}`, // march 15th 1990
    `${fullMonth} ${dayOrd}, ${year}`, // march 15th, 1990
  ].join(' ');
}

/**
 * Returns the full name as "LastName, FirstName".
 */
export function fullName(patient: InternalPatient | ExternalPatient): string {
  return `${patient.LastName}, ${patient.FirstName}`;
}

/**
 * Returns the patient ID regardless of which roster type it is.
 */
export function getPatientId(patient: InternalPatient | ExternalPatient): string {
  if ('InternalPatientId' in patient) return patient.InternalPatientId;
  return patient.ExternalPatientId;
}

/**
 * Builds a lookup map keyed by patient ID.
 */
export function buildPatientMap<T extends InternalPatient | ExternalPatient>(patients: T[]): Map<string, T> {
  return new Map(patients.map((p) => [getPatientId(p), p]));
}

/**
 * Case-insensitive comparison of two field values.
 */
export function fieldsMatch(a: string | number, b: string | number): boolean {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

/**
 * Obviously, we can't compare IDs since they're inherently different
 */
const COMPARED_FIELDS: { key: keyof InternalPatient & keyof ExternalPatient; label: string }[] = [
  { key: 'FirstName', label: 'First Name' },
  { key: 'LastName', label: 'Last Name' },
  { key: 'DOB', label: 'DOB' },
  { key: 'Sex', label: 'Sex' },
  { key: 'PhoneNumber', label: 'Phone' },
  { key: 'Address', label: 'Address' },
  { key: 'City', label: 'City' },
  { key: 'ZipCode', label: 'Zip' },
];

/**
 * Returns a list of human-readable field names that differ between two patients.
 */
export function getDifferences(ip: InternalPatient, ep: ExternalPatient): string[] {
  return COMPARED_FIELDS.reduce<string[]>((diffs, { key, label }) => {
    const a = key === 'DOB' ? formatDOB(ip[key]) : ip[key];
    const b = key === 'DOB' ? formatDOB(ep[key]) : ep[key];
    if (!fieldsMatch(a, b)) diffs.push(label);
    return diffs;
  }, []);
}

/**
 * Checks if a patient matches a search query against name, DOB, or ID.
 */
/**
 * Formats an ISO timestamp to a human-friendly string like "May 2, 2026 at 3:45 PM".
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return (
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' at ' +
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  );
}

/**
 * Checks if a patient matches a search query against name, DOB, or ID.
 */
export function patientMatchesQuery(patient: InternalPatient | ExternalPatient, query: string): boolean {
  const q = query.toLowerCase();
  return (
    patient.FirstName.toLowerCase().includes(q) ||
    patient.LastName.toLowerCase().includes(q) ||
    patient.DOB.toLowerCase().includes(q) ||
    searchableDOB(patient.DOB).includes(q) ||
    getPatientId(patient).toLowerCase().includes(q)
  );
}

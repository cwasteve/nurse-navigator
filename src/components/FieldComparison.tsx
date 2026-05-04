/* eslint-disable react-refresh/only-export-components */
import { Check, AlertCircle } from 'lucide-react';
import type { InternalPatient, ExternalPatient } from '../types';
import { formatDOB, fieldsMatch } from '../utils/patients';

export interface FieldRow {
  label: string;
  internalValue: string;
  externalValue: string | null;
}

export function FieldComparisonRow({ label, internalValue, externalValue }: FieldRow) {
  const match = externalValue !== null && fieldsMatch(internalValue, externalValue);
  const mismatch = externalValue !== null && !match;

  return (
    <div className={`grid grid-cols-[140px_1fr_1fr_28px] gap-4 py-2.5 px-2 -mx-2 rounded border-b border-neutral-100 last:border-b-0 items-start ${mismatch ? 'bg-danger/5' : ''}`}>
      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className={`text-sm ${mismatch ? 'text-danger font-medium' : 'text-neutral-800'}`}>
        {internalValue || <span className="text-neutral-300 italic">Empty</span>}
      </span>
      {externalValue !== null ? (
        <span className={`text-sm ${mismatch ? 'text-danger font-medium' : 'text-neutral-800'}`}>
          {externalValue || <span className="text-neutral-300 italic">Empty</span>}
        </span>
      ) : (
        <span className="text-sm text-neutral-300 italic">No match</span>
      )}
      <span className="flex items-center justify-center pt-0.5">
        {match && internalValue && (
          <Check className="w-4 h-4 text-success" strokeWidth={2.5} />
        )}
        {mismatch && (
          <AlertCircle className="w-4 h-4 text-danger" strokeWidth={2.5} />
        )}
      </span>
    </div>
  );
}

export function buildFieldRows(
  ip: InternalPatient,
  ep: ExternalPatient | null,
): FieldRow[] {
  return [
    { label: 'First Name', internalValue: ip.FirstName, externalValue: ep?.FirstName ?? null },
    { label: 'Last Name', internalValue: ip.LastName, externalValue: ep?.LastName ?? null },
    { label: 'Date of Birth', internalValue: formatDOB(ip.DOB), externalValue: ep ? formatDOB(ep.DOB) : null },
    { label: 'Sex', internalValue: ip.Sex, externalValue: ep?.Sex ?? null },
    { label: 'Phone', internalValue: ip.PhoneNumber, externalValue: ep?.PhoneNumber ?? null },
    { label: 'Address', internalValue: ip.Address, externalValue: ep?.Address ?? null },
    { label: 'City', internalValue: ip.City, externalValue: ep?.City ?? null },
    { label: 'Zip Code', internalValue: String(ip.ZipCode), externalValue: ep ? String(ep.ZipCode) : null },
  ];
}

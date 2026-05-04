import { useMemo } from 'react';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import type { MatchStatus, MatchRecord } from '../types';
import { COLUMNS, BASE_COLUMN_KEYS, COL, STATUS_CONFIG, REJECTION_CONFIG, STATUS } from '../constants';
import type { ColumnKey } from '../constants';
import type { TabKey } from '../constants';
import { fullName, formatDOB, getDifferences } from '../utils/patients';
import { useMatchFilterCtx, useAppCtx } from '../contexts';

const { UNREVIEWED, CONFIRMED, FOLLOW_UP, REJECTED } = STATUS;
const { EXTERNAL, REJECTION } = COL;
import Button from './Button';
import Checkbox from './Checkbox';
import { ConfidenceBadge } from './Badge';
import Tooltip from './Tooltip';

// --- Sub-components ---

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span className="inline-flex flex-col ml-1 -space-y-1">
      <ChevronUp
        className="w-3 h-3"
        strokeWidth={2.5}
        opacity={direction === 'asc' ? 1 : 0.25}
      />
      <ChevronDown
        className="w-3 h-3"
        strokeWidth={2.5}
        opacity={direction === 'desc' ? 1 : 0.25}
      />
    </span>
  );
}

// --- Row ---

interface MatchRowProps {
  record: MatchRecord;
  activeTab: TabKey;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onCompare: (record: MatchRecord) => void;
  onRequestReject: (id: string) => void;
  onStatusChange: (externalId: string, status: MatchStatus) => void;
  onOpenNotes: (externalId: string) => void;
}

function MatchRow({
  record,
  activeTab,
  isSelected,
  onToggleSelect,
  onCompare,
  onRequestReject,
  onStatusChange,
  onOpenNotes,
}: MatchRowProps) {
  const ip = record.internalPatient;
  const ep = record.externalPatient;
  const noteCount = record.notes.length;
  const externalId = record.match.ExternalPatientId;

  const statusBorderClass = `border-l-[3px] ${STATUS_CONFIG[record.status].borderColor}`;

  const diffs = getDifferences(ip, ep);

  return (
    <tr
      onClick={() => onCompare(record)}
      className={`hover:bg-neutral-50/70 transition-colors cursor-pointer ${statusBorderClass} ${activeTab === UNREVIEWED && isSelected ? 'bg-primary/7' : ''}`}>
      {activeTab === UNREVIEWED && (
        <td
          className="px-4 py-3 cursor-default"
          onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(externalId)}
            aria-label={`Select ${fullName(ep)}`}
          />
        </td>
      )}
      <td className="px-4 py-3">
        <ConfidenceBadge score={record.match.ConfidenceScore} />
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-neutral-800">{fullName(ip)}</span>
        <span className="block text-xs text-neutral-400">{formatDOB(ip.DOB)}</span>
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-neutral-800">{fullName(ep)}</span>
        <span className="block text-xs text-neutral-400">{formatDOB(ep.DOB)}</span>
      </td>
      {activeTab === REJECTED && (
        <td className="px-4 py-3">
          {record.rejectionReason && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded bg-danger-bg text-danger">
              {REJECTION_CONFIG[record.rejectionReason].shortLabel}
            </span>
          )}
        </td>
      )}
      <td className="px-4 py-3">
        {diffs.length === 0 ? (
          <span className="text-xs text-success font-medium">All match</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {diffs.map((d) => (
              <span
                key={d}
                className="inline-block px-1.5 py-0.5 text-[11px] font-medium rounded bg-danger-bg text-danger">
                {d}
              </span>
            ))}
          </div>
        )}
      </td>
      <td
        className="px-4 py-3 cursor-default"
        onClick={(e) => e.stopPropagation()}>
        {noteCount > 0 || record.status === FOLLOW_UP ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenNotes(externalId)}
            className="text-neutral-500 hover:text-primary !px-1.5 !py-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {noteCount > 0 ? noteCount : 'Add'}
          </Button>
        ) : (
          <span className="text-xs text-neutral-300">—</span>
        )}
      </td>
      <td
        className="px-4 py-3 text-right cursor-default"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCompare(record)}>
            Compare
          </Button>
          {record.status === UNREVIEWED ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusChange(externalId, CONFIRMED)}>
                Confirm
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => onStatusChange(externalId, FOLLOW_UP)}>
                Follow Up
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRequestReject(externalId)}>
                Reject
              </Button>
            </>
          ) : record.status === FOLLOW_UP ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange(externalId, UNREVIEWED)}>
                Undo
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusChange(externalId, CONFIRMED)}>
                Confirm
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRequestReject(externalId)}>
                Reject
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(externalId, UNREVIEWED)}>
              Undo
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// --- Table ---

export default function MatchTable() {
  const {
    tabFiltered: records,
    activeTab,
    sort,
    toggleSort,
    selectedIds,
    toggleSelectAll,
    toggleSelectRow,
  } = useMatchFilterCtx();
  const { openCompare, requestReject, handleStatusChange, openNoteDialog } = useAppCtx();

  const sortDir = (key: string) => (sort.key === key ? sort.direction : null);

  const columnKeys: ColumnKey[] = useMemo(() => {
    if (activeTab === REJECTED) {
      const keys = [...BASE_COLUMN_KEYS];
      const externalIdx = keys.indexOf(EXTERNAL);
      keys.splice(externalIdx + 1, 0, REJECTION);
      return keys;
    }
    return [...BASE_COLUMN_KEYS];
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {activeTab === UNREVIEWED && (
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={records.length > 0 && records.every((r) => selectedIds.has(r.match.ExternalPatientId))}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columnKeys.map((key) => {
                const col = COLUMNS[key];
                return (
                  <th
                    key={key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider select-none transition-colors
                      ${col.sortable ? 'cursor-pointer hover:text-neutral-700' : ''}`}
                    onClick={() => toggleSort(key)}>
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon direction={sortDir(key)} />}
                      {col.tooltip && <Tooltip content={col.tooltip} />}
                    </span>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {records.map((record) => (
              <MatchRow
                key={record.match.ExternalPatientId}
                record={record}
                activeTab={activeTab}
                isSelected={selectedIds.has(record.match.ExternalPatientId)}
                onToggleSelect={toggleSelectRow}
                onCompare={openCompare}
                onRequestReject={requestReject}
                onStatusChange={handleStatusChange}
                onOpenNotes={openNoteDialog}
              />
            ))}
            {records.length === 0 && (
              <tr>
                <td
                  colSpan={columnKeys.length + (activeTab === UNREVIEWED ? 2 : 1)}
                  className="px-4 py-12 text-center text-neutral-400 text-sm">
                  No matches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

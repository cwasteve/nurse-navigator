import { useMemo } from 'react';
import type { InternalPatient, ExternalPatient, Match, MatchRecord } from '../types';
import { STATUS_CONFIG, STATUS } from '../constants';
import type { MatchStatus } from '../types';
import type { UseMatchReviewStoreReturn } from './useMatchReviewStore';
import { buildPatientMap } from '../utils/patients';

const { UNREVIEWED } = STATUS;

import internalData from '../data/internal.json';
import externalData from '../data/external.json';
import matchesData from '../data/matches.json';

const internalPatients: InternalPatient[] = internalData as InternalPatient[];
const externalPatients: ExternalPatient[] = externalData as ExternalPatient[];
const matches: Match[] = matchesData;

/** All ExternalPatientIds from static match data — stable reference for hook deps. */
export const allMatchIds: string[] = matches.map((m) => m.ExternalPatientId);

export function useMatchData(reviewStore: UseMatchReviewStoreReturn) {
  const internalMap = useMemo(() => buildPatientMap(internalPatients), []);
  const externalMap = useMemo(() => buildPatientMap(externalPatients), []);

  const matchRecords: MatchRecord[] = useMemo(() => {
    return matches.reduce<MatchRecord[]>((acc, m) => {
      const ip = internalMap.get(m.InternalPatientId);
      const ep = externalMap.get(m.ExternalPatientId);
      if (ip && ep) {
        acc.push({
          match: m,
          internalPatient: ip,
          externalPatient: ep,
          status: reviewStore.statuses[m.ExternalPatientId] ?? UNREVIEWED,
          rejectionReason: reviewStore.rejectionReasons[m.ExternalPatientId],
          notes: reviewStore.notes[m.ExternalPatientId] ?? [],
        });
      }
      return acc;
    }, []);
  }, [internalMap, externalMap, reviewStore.statuses, reviewStore.rejectionReasons, reviewStore.notes]);

  const stats = useMemo(() => {
    const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map((k) => [k, 0])) as Record<MatchStatus, number>;
    for (const r of matchRecords) counts[r.status]++;
    return counts;
  }, [matchRecords]);

  return { matchRecords, stats };
}

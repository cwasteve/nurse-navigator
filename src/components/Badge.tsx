import type { MatchStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

type BadgeVariant = 'high' | 'medium' | 'low' | 'pending' | 'confirmed' | 'rejected' | 'follow_up';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  high: 'bg-success-bg text-success',
  medium: 'bg-warning-bg text-warning',
  low: 'bg-danger-bg text-danger',
  pending: 'bg-neutral-100 text-neutral-500',
  confirmed: 'bg-success-bg text-success',
  rejected: 'bg-danger-bg text-danger',
  follow_up: 'bg-warning-bg text-warning',
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

export function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const variant: BadgeVariant = score >= 0.85 ? 'high' : score >= 0.6 ? 'medium' : 'low';
  return <Badge variant={variant}>{pct}%</Badge>;
}

export function StatusBadge({ status }: { status: MatchStatus }) {
  return <Badge variant={status}>{STATUS_CONFIG[status].label}</Badge>;
}

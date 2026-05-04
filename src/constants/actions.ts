export const ACTION = {
  CONFIRM: 'confirm',
  FOLLOW_UP: 'follow_up',
  REJECT: 'reject',
  REVERT: 'revert',
} as const;

export type ActionIntent = (typeof ACTION)[keyof typeof ACTION];

export const PollStatus = {
  FINISHED: 'FINISHED',
  IN_PROGRESS: 'IN_PROGRESS',
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
} as const;

export type PollStatus = (typeof PollStatus)[keyof typeof PollStatus];

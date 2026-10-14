import { PollStatus } from '@/domain/poll';

export interface PollOutput {
  endDate: string;
  id: string;
  options: { id: string; text: string; votes: number }[];
  question: string;
  startDate: string;
  status: PollStatus;
  totalVotes: number;
}

import type { PaginatedResult, PaginationParams } from '../../shared';
import type { Poll } from '../entities/poll.entity';
import type { PollStatus } from '../values_objects/poll-status.vo';

export interface IPollRepository {
  delete(id: string): Promise<void>;
  findAll(filter: SearchPollsFilter): Promise<PaginatedResult<Poll>>;
  findById(id: string): Promise<null | Poll>;
  incrementVote(optionId: string): Promise<number>;
  save(poll: Poll): Promise<void>;
}

export interface SearchPollsFilter extends PaginationParams {
  status?: PollStatus;
}

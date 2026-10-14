import { type IPollRepository } from '@/domain/poll';
import { mapPaginated, type PaginatedResult } from '@/domain/shared';

import { type ListPollsInput } from '../dtos/list-polls.dto';
import { type PollOutput } from '../dtos/poll-output.dto';
import { toPollOutput } from '../mappers/poll.mapper';

export class ListPollsUseCase {
  constructor(private readonly polls: IPollRepository) {}

  async execute({
    page,
    perPage,
    status,
  }: ListPollsInput): Promise<PaginatedResult<PollOutput>> {
    const result = await this.polls.findAll({ page, perPage, status });
    const now = new Date();
    return mapPaginated(result, (poll) => toPollOutput(poll, now));
  }
}

import {
  type IPollRepository,
  Poll,
  type ReconstitutePollProps,
  type SearchPollsFilter,
} from '@/domain/poll';
import {
  buildPaginatedResult,
  type PaginatedResult,
  toSkipTake,
} from '@/domain/shared';

export class InMemoryPollRepository implements IPollRepository {
  private readonly records = new Map<string, ReconstitutePollProps>();

  async save(poll: Poll): Promise<void> {
    const existing = this.records.get(poll.id);
    const votesById = new Map(existing?.options.map((o) => [o.id, o.votes]));

    this.records.set(poll.id, {
      endDate: poll.endDate,
      id: poll.id,
      options: poll.options.map((o) => ({
        id: o.id,
        text: o.text,
        votes: votesById.get(o.id) ?? o.votes,
      })),
      question: poll.question,
      startDate: poll.startDate,
    });
  }

  async findById(id: string): Promise<null | Poll> {
    const record = this.records.get(id);
    return record ? Poll.reconstitute(structuredClone(record)) : null;
  }

  async findAll({
    status,
    ...pagination
  }: SearchPollsFilter): Promise<PaginatedResult<Poll>> {
    const now = new Date();
    const polls = [...this.records.values()]
      .map((r) => Poll.reconstitute(structuredClone(r)))
      .filter((p) => !status || p.status(now) === status)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    const { skip, take } = toSkipTake(pagination);
    return buildPaginatedResult(
      polls.slice(skip, skip + take),
      polls.length,
      pagination,
    );
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  async incrementVote(optionId: string): Promise<number> {
    for (const record of this.records.values()) {
      const option = record.options.find((o) => o.id === optionId);
      if (option) {
        option.votes += 1;
        return option.votes;
      }
    }
    throw new Error(`Option ${optionId} not found`);
  }
}

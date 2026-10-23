import type { IPollRepository, Poll, SearchPollsFilter } from '@/domain/poll';

import { PollStatus } from '@/domain/poll';
import {
  buildPaginatedResult,
  type PaginatedResult,
  toSkipTake,
} from '@/domain/shared';

import type { Prisma, PrismaClient } from '../generated/client';

import { PrismaPollMapper } from '../mappers/prisma-poll.mapper';

export class PrismaPollRepository implements IPollRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(poll: Poll): Promise<void> {
    const { options, poll: data } = PrismaPollMapper.toPersistence(poll);
    const optionIds = options.map((o) => o.id);

    await this.prisma.$transaction([
      this.prisma.poll.upsert({
        create: data,
        update: data,
        where: { id: data.id },
      }),
      this.prisma.option.deleteMany({
        where: { id: { notIn: optionIds }, pollId: data.id },
      }),
      ...options.map((o) =>
        this.prisma.option.upsert({
          create: { ...o, pollId: data.id },
          update: { text: o.text },
          where: { id: o.id },
        }),
      ),
    ]);
  }

  async findById(id: string): Promise<null | Poll> {
    const raw = await this.prisma.poll.findUnique({
      include: { options: true },
      where: { id },
    });
    return raw ? PrismaPollMapper.toDomain(raw) : null;
  }

  async findAll(filter: SearchPollsFilter): Promise<PaginatedResult<Poll>> {
    const where = buildStatusWhere(filter.status);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.poll.findMany({
        include: { options: true },
        orderBy: { startDate: 'desc' },
        where,
        ...toSkipTake({ page: filter.page, perPage: filter.perPage }),
      }),
      this.prisma.poll.count({ where }),
    ]);

    return buildPaginatedResult(
      rows.map((r) => PrismaPollMapper.toDomain(r)),
      total,
      {
        page: filter.page,
        perPage: filter.perPage,
      },
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.poll.delete({ where: { id } });
  }

  async incrementVote(optionId: string): Promise<number> {
    const option = await this.prisma.option.update({
      data: { votes: { increment: 1 } },
      select: { votes: true },
      where: { id: optionId },
    });
    return option.votes;
  }
}

function buildStatusWhere(
  status?: PollStatus,
  now = new Date(),
): Prisma.PollWhereInput {
  const open = { endDate: { gt: now }, startDate: { lte: now } };

  switch (status) {
    case PollStatus.FINISHED:
      return { endDate: { lte: now } };
    case PollStatus.IN_PROGRESS:
      return { ...open, options: { some: { votes: { gt: 0 } } } };
    case PollStatus.NOT_STARTED:
      return { startDate: { gt: now } };
    case PollStatus.STARTED:
      return { ...open, options: { every: { votes: 0 } } };
    default:
      return {};
  }
}

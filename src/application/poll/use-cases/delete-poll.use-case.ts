import { type IPollRepository, PollNotFoundError } from '@/domain/poll';

export class DeletePollUseCase {
  constructor(private readonly polls: IPollRepository) {}

  async execute(id: string): Promise<void> {
    const poll = await this.polls.findById(id);

    if (!poll) {
      throw new PollNotFoundError(id);
    }

    await this.polls.delete(id);
  }
}

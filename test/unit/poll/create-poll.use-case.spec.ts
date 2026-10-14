import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type CreatePollInput, CreatePollUseCase } from '@/application/poll';
import { InvalidPollError, type IPollRepository } from '@/domain/poll';

import { createMockPollRepository } from '../../mocks';

describe('CreatePollUseCase', () => {
  let pollRepositoryMock: IPollRepository;
  let sut: CreatePollUseCase;

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const tomorrow = () => addDays(new Date(), 1);
  const nextWeek = () => addDays(new Date(), 7);

  beforeEach(() => {
    pollRepositoryMock = createMockPollRepository();
    sut = new CreatePollUseCase(pollRepositoryMock);
  });

  describe('Success Flow', () => {
    it('should create and save a poll successfully', async () => {
      const tomorrowDate = tomorrow();
      const nextWeekDate = nextWeek();
      const input: CreatePollInput = {
        endDate: nextWeekDate,
        options: ['NestJS', 'Fastify', 'Express'],
        question: 'Qual o seu framework Node preferido?',
        startDate: tomorrowDate,
      };

      const result = await sut.execute(input);

      expect(result).toEqual({
        endDate: nextWeekDate.toISOString(),
        id: expect.any(String) as string,
        options: [
          { id: expect.any(String) as string, text: 'NestJS', votes: 0 },
          { id: expect.any(String) as string, text: 'Fastify', votes: 0 },
          { id: expect.any(String) as string, text: 'Express', votes: 0 },
        ],
        question: input.question,
        startDate: tomorrowDate.toISOString(),
        status: expect.any(String) as string,
        totalVotes: 0,
      });

      expect(pollRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(pollRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: input.endDate,
          question: input.question,
          startDate: input.startDate,
        }),
      );
    });
  });

  describe('Failure Flow', () => {
    it('should propagate the error if the entity throws a domain validation exception', async () => {
      const input = {
        endDate: nextWeek(),
        options: ['Opção 1', 'Opção 2'],
        question: 'Pergunta Válida com tamanho correto',
        startDate: tomorrow(),
      } as unknown as CreatePollInput;

      await expect(sut.execute(input)).rejects.toThrow(InvalidPollError);

      expect(pollRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('must propagate any exception thrown by the persistence/repository layer', async () => {
      const input: CreatePollInput = {
        endDate: nextWeek(),
        options: ['PostgreSQL', 'MySQL', 'SQLite'],
        question: 'Qual o melhor banco de dados relacional?',
        startDate: tomorrow(),
      };

      vi.mocked(pollRepositoryMock.save).mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      await expect(sut.execute(input)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});

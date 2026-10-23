import type { Express } from 'express';

import request from 'supertest';

import type { PollOutput } from '@/application/poll';

const DAY = 86_400_000;

export interface PollInputBody {
  endDate: string;
  options: string[];
  question: string;
  startDate: string;
}

export const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * DAY).toISOString();

export const pollInput = (
  overrides: Partial<PollInputBody> = {},
): PollInputBody => ({
  endDate: daysFromNow(10),
  options: ['TypeScript', 'Golang', 'Rust'],
  question: 'Melhor linguagem?',
  startDate: daysFromNow(1),
  ...overrides,
});

export const openPollInput = (
  overrides: Partial<PollInputBody> = {},
): PollInputBody => pollInput({ startDate: daysFromNow(-1), ...overrides });

export const finishedPollInput = (
  overrides: Partial<PollInputBody> = {},
): PollInputBody =>
  pollInput({
    endDate: daysFromNow(-1),
    startDate: daysFromNow(-10),
    ...overrides,
  });

export async function createPoll(
  app: Express,
  input = pollInput(),
): Promise<PollOutput> {
  const res = await request(app).post('/polls').send(input).expect(201);
  return res.body as PollOutput;
}

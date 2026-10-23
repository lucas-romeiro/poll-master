import type { Express } from 'express';

import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import type { IPollRepository } from '@/domain/poll';

import {
  createPoll,
  daysFromNow,
  finishedPeriod,
  openPeriod,
  pollInput,
  seedPoll,
} from '../../factories';
import { makeTestApp } from '../../helpers';

describe('PollController', () => {
  let app: Express;
  let polls: IPollRepository;

  beforeEach(() => {
    ({ app, polls } = makeTestApp());
  });

  describe('POST /polls', () => {
    it('cria uma enquete', async () => {
      const res = await request(app)
        .post('/polls')
        .send(pollInput())
        .expect(201);

      expect(res.body).toMatchObject({
        question: 'Melhor linguagem?',
        status: 'NOT_STARTED',
        totalVotes: 0,
      });
      expect(res.body.options).toHaveLength(3);
    });

    it('aceita opções ilimitadas', async () => {
      const options = Array.from(
        { length: 20 },
        (_, i) => `Opção ${String(i)}`,
      );

      const res = await request(app)
        .post('/polls')
        .send(pollInput({ options }))
        .expect(201);

      expect(res.body.options).toHaveLength(20);
    });

    it('retorna 400 com menos de 3 opções', async () => {
      const res = await request(app)
        .post('/polls')
        .send(pollInput({ options: ['A', 'B'] }))
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('retorna 400 sem pergunta', async () => {
      const res = await request(app)
        .post('/polls')
        .send(pollInput({ question: '   ' }))
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('retorna 422 quando o término é antes do início', async () => {
      const res = await request(app)
        .post('/polls')
        .send(pollInput({ endDate: daysFromNow(1), startDate: daysFromNow(5) }))
        .expect(422);

      expect(res.body.code).toBe('INVALID_POLL');
    });

    it('retorna 422 quando o início está no passado', async () => {
      const res = await request(app)
        .post('/polls')
        .send(pollInput({ startDate: daysFromNow(-1) }))
        .expect(422);

      expect(res.body.code).toBe('INVALID_POLL');
    });

    it('retorna 400 com body em formato inválido', async () => {
      const res = await request(app)
        .post('/polls')
        .send({ options: 'x' })
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /polls', () => {
    it('lista todas as enquetes com paginação', async () => {
      await createPoll(app);
      await createPoll(app);

      const res = await request(app).get('/polls').expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.meta).toMatchObject({ page: 1, total: 2, totalPages: 1 });
    });

    it('respeita page e perPage', async () => {
      await createPoll(app);
      await createPoll(app);
      await createPoll(app);

      const res = await request(app).get('/polls?page=2&perPage=2').expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.meta).toMatchObject({
        hasNext: false,
        page: 2,
        totalPages: 2,
      });
    });

    it.each(['NOT_STARTED', 'STARTED', 'FINISHED'])(
      'filtra por status %s',
      async (status) => {
        await seedPoll(polls); // padrão do makePoll: começa amanhã
        await seedPoll(polls, openPeriod());
        await seedPoll(polls, finishedPeriod());

        const res = await request(app)
          .get(`/polls?status=${status}`)
          .expect(200);

        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].status).toBe(status);
      },
    );

    it('filtra por status IN_PROGRESS (iniciada com votos)', async () => {
      const voted = await seedPoll(polls, {
        ...openPeriod(),
        options: [
          { id: randomUUID(), text: 'A', votes: 3 },
          { id: randomUUID(), text: 'B', votes: 0 },
          { id: randomUUID(), text: 'C', votes: 0 },
        ],
      });
      await seedPoll(polls, openPeriod()); // aberta, sem votos

      const res = await request(app)
        .get('/polls?status=IN_PROGRESS')
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(voted.id);
    });

    it('retorna 400 com status inválido', async () => {
      const res = await request(app).get('/polls?status=WHATEVER').expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /polls/:id', () => {
    it('retorna a enquete', async () => {
      const poll = await createPoll(app);

      const res = await request(app).get(`/polls/${poll.id}`).expect(200);

      expect(res.body.id).toBe(poll.id);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).get(`/polls/${randomUUID()}`).expect(404);

      expect(res.body.code).toBe('POLL_NOT_FOUND');
    });

    it('retorna 400 com id inválido', async () => {
      const res = await request(app).get('/polls/abc').expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /polls/:id', () => {
    it('edita uma enquete não iniciada', async () => {
      const poll = await createPoll(app);

      const res = await request(app)
        .patch(`/polls/${poll.id}`)
        .send({
          options: ['TypeScript', 'JavaScript', 'Python', 'Kotlin'],
          question: 'Nova pergunta?',
        })
        .expect(200);

      expect(res.body.question).toBe('Nova pergunta?');
      expect(res.body.options).toHaveLength(4);
    });

    it('retorna 409 quando a enquete já iniciou', async () => {
      const poll = await seedPoll(polls, openPeriod());

      const res = await request(app)
        .patch(`/polls/${poll.id}`)
        .send({ question: 'Nova pergunta?' })
        .expect(409);

      expect(res.body.code).toBe('POLL_NOT_EDITABLE');
    });

    it('retorna 400 ao editar para menos de 3 opções', async () => {
      const poll = await createPoll(app);

      const res = await request(app)
        .patch(`/polls/${poll.id}`)
        .send({ options: ['A'] })
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('retorna 400 com body vazio', async () => {
      const poll = await createPoll(app);

      const res = await request(app)
        .patch(`/polls/${poll.id}`)
        .send({})
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app)
        .patch(`/polls/${randomUUID()}`)
        .send({ question: 'Nova pergunta?' })
        .expect(404);

      expect(res.body.code).toBe('POLL_NOT_FOUND');
    });
  });

  describe('DELETE /polls/:id', () => {
    it('exclui a enquete', async () => {
      const poll = await createPoll(app);

      const res = await request(app).delete(`/polls/${poll.id}`).expect(204);
      const after = await request(app).get(`/polls/${poll.id}`).expect(404);

      expect(res.body).toEqual({});
      expect(after.body.code).toBe('POLL_NOT_FOUND');
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app)
        .delete(`/polls/${randomUUID()}`)
        .expect(404);

      expect(res.body.code).toBe('POLL_NOT_FOUND');
    });
  });

  describe('POST /polls/:id/options/:optionId/votes', () => {
    it('registra o voto e retorna o total da opção', async () => {
      const poll = await seedPoll(polls, openPeriod());
      const optionId = poll.options[0].id;

      await request(app)
        .post(`/polls/${poll.id}/options/${optionId}/votes`)
        .expect(200);
      const res = await request(app)
        .post(`/polls/${poll.id}/options/${optionId}/votes`)
        .expect(200);

      expect(res.body).toEqual({ optionId, pollId: poll.id, votes: 2 });
    });

    it('retorna 409 em enquete não iniciada', async () => {
      const poll = await createPoll(app);

      const res = await request(app)
        .post(`/polls/${poll.id}/options/${poll.options[0].id}/votes`)
        .expect(409);

      expect(res.body.code).toBe('POLL_NOT_OPEN');
    });

    it('retorna 409 em enquete finalizada', async () => {
      const poll = await seedPoll(polls, finishedPeriod());

      const res = await request(app)
        .post(`/polls/${poll.id}/options/${poll.options[0].id}/votes`)
        .expect(409);

      expect(res.body.code).toBe('POLL_NOT_OPEN');
    });

    it('retorna 404 com opção inexistente', async () => {
      const poll = await seedPoll(polls, openPeriod());

      const res = await request(app)
        .post(`/polls/${poll.id}/options/${randomUUID()}/votes`)
        .expect(404);

      expect(res.body.code).toBe('OPTION_NOT_FOUND');
    });
  });

  it('retorna 404 para rota inexistente', async () => {
    const res = await request(app).get('/nao-existe').expect(404);

    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
  });
});

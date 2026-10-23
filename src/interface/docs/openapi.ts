import type { ZodType } from 'zod';

import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';

import {
  createPollSchema,
  listPollsQuerySchema,
  pollIdParamSchema,
  updatePollSchema,
  voteParamsSchema,
} from '@/application/poll';

import {
  errorSchema,
  paginatedPollsSchema,
  pollOutputSchema,
  voteResultSchema,
} from './response.schemas';

const registry = new OpenAPIRegistry();

const json = (schema: ZodType) => ({
  content: { 'application/json': { schema } },
});
const error = (description: string) => ({ description, ...json(errorSchema) });

const body = (schema: ZodType) => ({
  body: { required: true, ...json(schema) },
});

const tags = ['Polls'];

registry.registerPath({
  method: 'post',
  path: '/polls',
  request: body(createPollSchema),
  responses: {
    201: { description: 'Enquete criada', ...json(pollOutputSchema) },
    400: error('Formato inválido'),
    422: error('Regra de negócio violada (ex.: menos de 3 opções'),
  },
  summary: 'Cria uma enquente',
  tags,
});

registry.registerPath({
  method: 'get',
  path: '/polls',
  request: { query: listPollsQuerySchema },
  responses: {
    200: { description: 'Lista paginada', ...json(paginatedPollsSchema) },
    400: error('Query inválida'),
  },
  summary: 'Lista enquetes (com filtro opcional por status)',
  tags,
});

registry.registerPath({
  method: 'get',
  path: '/polls/{id}',
  request: { params: pollIdParamSchema },
  responses: {
    200: { description: 'Enquete encontrada', ...json(pollOutputSchema) },
    404: error('Enquete não encontrada'),
  },
  summary: 'Busca uma enquete',
  tags,
});

registry.registerPath({
  method: 'patch',
  path: '/polls/{id}',
  request: { params: pollIdParamSchema, ...body(updatePollSchema) },
  responses: {
    200: { description: 'Enquete atualizada', ...json(pollOutputSchema) },
    400: error('Formato inválido'),
    404: error('Enquete não encontrada'),
    409: error('Enquete já iniciada, não pode ser editada'),
    422: error('Regra de negócio violada'),
  },
  summary: 'Edita uma enquete (somente antes de iniciar)',
});

registry.registerPath({
  method: 'delete',
  path: '/polls/{id}',
  request: { params: pollIdParamSchema },
  responses: {
    204: { description: 'Enquete excluída' },
    404: error('Enquete não encontrada'),
  },
  summary: 'Exclui uma enquete',
  tags,
});

registry.registerPath({
  method: 'post',
  path: '/polls/{id}/options/{optionId}/votes',
  request: { params: voteParamsSchema },
  responses: {
    200: { description: 'Voto registrado', ...json(voteResultSchema) },
    404: error('Enquete ou opção não encontrada'),
    409: error('Enquete não está aberta para votação'),
  },
  summary: 'Vota em uma opção',
  tags,
});

registry.registerPath({
  description: [
    'Stream Server-Sent Events. Eventos emitidos:',
    '- `snapashot`: estado atual da enquete, enviado ao conectar',
    '- `vote`: `{ pollId, optionId, votes, ocurredAt }` a cada voto',
    '',
    'Exemplo no navegador: `new EventSource("/polls/{id}/events")',
  ].join('\n'),
  method: 'get',
  path: '/polls/{id}/events',
  request: { params: pollIdParamSchema },
  responses: {
    200: {
      content: { 'text/event-stream': { schema: { type: 'string' } } },
      description: 'Stream SSE',
    },
    404: error('Enquete não encontrada'),
  },
  summary: 'Acompanha os votos em tempo real (SSE)',
  tags: ['Realtime'],
});

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  info: {
    description: 'Sistema de enquetes em tempo real',
    title: 'Poll Master API',
    version: '1.0.0',
  },
  openapi: '3.0.0',
  servers: [{ url: '/' }],
});

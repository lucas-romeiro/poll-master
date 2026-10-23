export interface SseMessage {
  data: unknown;
  event: string;
}

export function sseReader(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return {
    cancel: () => reader.cancel(),

    async next(): Promise<SseMessage> {
      for (;;) {
        const end = buffer.indexOf('\n\n');
        if (end !== -1) {
          const raw = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);

          if (raw.startsWith(':')) {
            continue;
          }

          const event = /^event: (.*)$/m.exec(raw)?.[1] ?? 'message';
          const data = /^data: (.*)$/m.exec(raw)?.[1];

          return { data: data ? JSON.parse(data) : null, event };
        }

        const { done, value } = await reader.read();

        if (done) {
          throw new Error('Stream encerrado antes do evento esperado');
        }

        buffer += decoder.decode(value, { stream: true });
      }
    },
  };
}

import { describe, expect, it } from 'vitest';

import { InvalidPollError, Option } from '@/domain/poll';

describe('Option Entity', () => {
  describe('Creation Flow (create)', () => {
    it('should create an option successfully with default votes and a generated id', () => {
      const option = Option.create('TypeScript');

      expect(option.id).toBeDefined();
      expect(typeof option.id).toBe('string');
      expect(option.text).toBe('TypeScript');
      expect(option.votes).toBe(0);
    });

    it('should trim whitespace from the option text', () => {
      const option = Option.create('   JavaScript   ');

      expect(option.text).toBe('JavaScript');
    });

    it('should throw an error if the option text is empty', () => {
      expect(() => Option.create('')).toThrow(InvalidPollError);
      expect(() => Option.create('')).toThrow('O texto da opção é obrigatório');
    });

    it('should throw an error if the option text contains only whitespace', () => {
      expect(() => Option.create('   ')).toThrow(InvalidPollError);
      expect(() => Option.create('   ')).toThrow(
        'O texto da opção é obrigatório',
      );
    });
  });

  describe('Reconstitution Flow (reconstitute)', () => {
    it('should reconstitute an existing option with specific id, text and votes', () => {
      const customId = 'custom-uuid-123';
      const option = Option.reconstitute({
        id: customId,
        text: 'Python',
        votes: 15,
      });

      expect(option.id).toBe(customId);
      expect(option.text).toBe('Python');
      expect(option.votes).toBe(15);
    });
  });
});

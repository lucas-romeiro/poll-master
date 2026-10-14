import { describe, expect, it } from 'vitest';

import { InvalidPollError, Question } from '@/domain/poll';

describe('Question Value Object', () => {
  describe('Creation Flow', () => {
    it('should create successfully a question', () => {
      const result = Question.create('What is unit test?');

      expect(result.value).toBe('What is unit test?');
    });

    it('should trim whitespace when creating a question', () => {
      const result = Question.create('   What is unit test?       ');

      expect(result.value).toBe('What is unit test?');
    });
  });

  describe('Validation Errors', () => {
    it('should throw an error if the question is empty', () => {
      expect(() => Question.create('')).toThrow(InvalidPollError);
      expect(() => Question.create('')).toThrow(
        'A enquete deve ter uma pergunta',
      );
    });

    it('should throw an error if the question has less than 10 characters', () => {
      expect(() => Question.create('Short')).toThrow(InvalidPollError);
      expect(() => Question.create('Short')).toThrow(
        'A pergunta deve ter no mínimo 10 caracteres',
      );
    });

    it('should throw an error if the question has more than 255 characters', () => {
      const longQuestion = 'a'.repeat(256);

      expect(() => Question.create(longQuestion)).toThrow(InvalidPollError);
      expect(() => Question.create(longQuestion)).toThrow(
        'A pergunta deve ter no máximo 255 caracteres',
      );
    });
  });
});

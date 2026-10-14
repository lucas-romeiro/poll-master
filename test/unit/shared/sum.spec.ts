import { describe, expect, it } from 'vitest';

import { sum } from '@/shared/utils';

describe('sum function', () => {
  it('should add two positive numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

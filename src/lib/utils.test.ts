import { describe, it, expect } from 'vitest';
import { formatPrice, cn } from './utils';

describe('formatPrice', () => {
  it('should format price with Korean currency symbol', () => {
    expect(formatPrice(29000)).toBe('29,000원');
  });

  it('should add comma separator for thousands', () => {
    expect(formatPrice(199000)).toBe('199,000원');
  });

  it('should handle zero price', () => {
    expect(formatPrice(0)).toBe('0원');
  });

  it('should handle large prices', () => {
    expect(formatPrice(1000000)).toBe('1,000,000원');
  });

  it('should handle decimal prices by rounding down', () => {
    expect(formatPrice(29999.99)).toBe('29,999원');
  });
});

describe('cn', () => {
  it('should combine class names', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
  });

  it('should handle undefined and null values', () => {
    expect(cn('px-2', undefined, 'py-2', null)).toBe('px-2 py-2');
  });

  it('should handle empty strings', () => {
    expect(cn('px-2', '', 'py-2')).toBe('px-2 py-2');
  });

  it('should handle boolean false values', () => {
    expect(cn('px-2', false && 'py-2')).toBe('px-2');
  });

  it('should handle object notation for conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });
});

import { validators } from '@/lib/utils/validation';

describe('Validation Utilities', () => {
  describe('email', () => {
    it('validates correct emails', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(validators.email('invalid')).toBe(false);
      expect(validators.email('missing@domain')).toBe(false);
      expect(validators.email('@domain.com')).toBe(false);
    });
  });

  describe('password', () => {
    it('validates strong passwords', () => {
      const result = validators.password('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects weak passwords', () => {
      const result = validators.password('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('required', () => {
    it('validates non-empty strings', () => {
      expect(validators.required('test')).toBe(true);
    });

    it('rejects empty or whitespace strings', () => {
      expect(validators.required('')).toBe(false);
      expect(validators.required('   ')).toBe(false);
      expect(validators.required(null)).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });
  });

  describe('url', () => {
    it('validates correct URLs', () => {
      expect(validators.url('https://example.com')).toBe(true);
      expect(validators.url('http://localhost:3000')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(validators.url('not a url')).toBe(false);
      expect(validators.url('example.com')).toBe(false);
    });
  });
});

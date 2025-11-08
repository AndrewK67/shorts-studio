import { formatters } from '@/lib/utils/formatting';

describe('Formatting Utilities', () => {
  describe('number', () => {
    it('formats numbers with commas', () => {
      expect(formatters.number(1000)).toBe('1,000');
      expect(formatters.number(1000000)).toBe('1,000,000');
    });
  });

  describe('percentage', () => {
    it('formats percentage correctly', () => {
      expect(formatters.percentage(45.67)).toBe('45.7%');
      expect(formatters.percentage(100, 0)).toBe('100%');
    });
  });

  describe('duration', () => {
    it('formats seconds to mm:ss', () => {
      expect(formatters.duration(65)).toBe('1:05');
      expect(formatters.duration(3661)).toBe('61:01');
    });
  });

  describe('truncate', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that needs truncation';
      expect(formatters.truncate(text, 20)).toBe('This is a very lo...');
    });

    it('does not truncate short text', () => {
      const text = 'Short text';
      expect(formatters.truncate(text, 20)).toBe('Short text');
    });
  });

  describe('slug', () => {
    it('converts text to URL-friendly slug', () => {
      expect(formatters.slug('Hello World!')).toBe('hello-world');
      expect(formatters.slug('This is a TEST')).toBe('this-is-a-test');
    });
  });
});

import {
  calculateReadingTime,
  getWordCount,
  getCharCount,
  generateSlug,
  formatFileSize,
  isValidImageType,
  isValidFileSize,
  debounce,
} from '../utils';

describe('Utility Functions', () => {
  describe('getWordCount', () => {
    it('should return 0 for empty string', () => {
      expect(getWordCount('')).toBe(0);
    });

    it('should return 0 for whitespace only', () => {
      expect(getWordCount('   ')).toBe(0);
    });

    it('should count words correctly', () => {
      expect(getWordCount('Hello world')).toBe(2);
      expect(getWordCount('This is a test')).toBe(4);
      expect(getWordCount('One')).toBe(1);
    });

    it('should handle multiple spaces between words', () => {
      expect(getWordCount('Hello   world')).toBe(2);
    });
  });

  describe('getCharCount', () => {
    it('should return 0 for empty string', () => {
      expect(getCharCount('')).toBe(0);
    });

    it('should count characters including spaces by default', () => {
      expect(getCharCount('Hello world')).toBe(11);
    });

    it('should count characters excluding spaces when specified', () => {
      expect(getCharCount('Hello world', false)).toBe(10);
    });
  });

  describe('calculateReadingTime', () => {
    it('should return 0 for empty text', () => {
      expect(calculateReadingTime('')).toBe(0);
    });

    it('should return at least 1 minute for short text', () => {
      expect(calculateReadingTime('Hello world')).toBe(1);
    });

    it('should calculate reading time based on word count', () => {
      // 450 words at 225 wpm = 2 minutes
      const text = 'word '.repeat(450);
      expect(calculateReadingTime(text)).toBe(2);
    });
  });

  describe('generateSlug', () => {
    it('should convert to lowercase', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('This is a test')).toBe('this-is-a-test');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Hello! World?')).toBe('hello-world');
    });

    it('should handle multiple consecutive spaces or hyphens', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
      expect(generateSlug('Hello---World')).toBe('hello-world');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('isValidImageType', () => {
    it('should return true for valid image types', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const gifFile = new File([''], 'test.gif', { type: 'image/gif' });
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' });
      const svgFile = new File([''], 'test.svg', { type: 'image/svg+xml' });

      expect(isValidImageType(jpegFile)).toBe(true);
      expect(isValidImageType(pngFile)).toBe(true);
      expect(isValidImageType(gifFile)).toBe(true);
      expect(isValidImageType(webpFile)).toBe(true);
      expect(isValidImageType(svgFile)).toBe(true);
    });

    it('should return false for invalid image types', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });

      expect(isValidImageType(pdfFile)).toBe(false);
      expect(isValidImageType(textFile)).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should return true for files under the limit', () => {
      const smallFile = new File(['x'.repeat(1000)], 'small.txt');
      expect(isValidFileSize(smallFile)).toBe(true);
    });

    it('should return false for files over the limit', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt');
      expect(isValidFileSize(largeFile)).toBe(false);
    });

    it('should respect custom max size', () => {
      const file = new File(['x'.repeat(1000)], 'test.txt');
      expect(isValidFileSize(file, 500)).toBe(false);
      expect(isValidFileSize(file, 2000)).toBe(true);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should delay function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should only call function once for multiple rapid calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

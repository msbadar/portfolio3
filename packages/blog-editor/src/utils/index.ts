/**
 * Calculate estimated reading time based on word count
 * Average reading speed is ~200-250 words per minute
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 225;
  const wordCount = getWordCount(text);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Count words in a text string
 */
export function getWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters in a text string (excluding whitespace)
 */
export function getCharCount(text: string, includeSpaces = true): number {
  if (!text) return 0;
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return validTypes.includes(file.type);
}

/**
 * Validate file size (default max: 10MB)
 */
export function isValidFileSize(file: File, maxSizeBytes = 10 * 1024 * 1024): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Read file as Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Debounce function for auto-save
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Sanitize HTML to prevent XSS (basic sanitization)
 */
export function sanitizeHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
}

/**
 * Extract text content from HTML
 */
export function extractTextFromHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || '';
}

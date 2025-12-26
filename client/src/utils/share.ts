export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Share content using the Web Share API or fallback to copying to clipboard
 * @returns Promise<boolean> - true if shared successfully, false otherwise
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  // Build the URL if not provided - use the current page URL
  const shareUrl = data.url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const shareData: ShareData = {
    ...data,
    url: shareUrl,
  };

  // Check if Web Share API is available
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name === 'AbortError') {
        return false;
      }
      // Fall through to clipboard copy on other errors
    }
  }

  // Fallback: Copy to clipboard with proper formatting
  const parts: string[] = [];
  if (data.title) parts.push(data.title);
  if (data.text) parts.push(data.text);
  if (shareUrl) parts.push(shareUrl);
  const shareText = parts.join(' - ');

  return copyToClipboard(shareText);
}

/**
 * Copy text to clipboard
 * @returns Promise<boolean> - true if copied successfully, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers using deprecated execCommand
    // This is intentionally kept as a last resort for browsers that don't support
    // the modern Clipboard API (e.g., older Safari, IE)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

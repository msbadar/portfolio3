import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, XCircle } from 'lucide-react';
import type { BlogMetadata, MetadataPopupProps } from '../types';
import { readFileAsDataURL, isValidImageType } from '../utils';

export function MetadataPopup({
  isOpen,
  onClose,
  metadata,
  onMetadataChange,
  onImageUpload,
}: MetadataPopupProps): React.JSX.Element | null {
  const [keywordInput, setKeywordInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (field: keyof BlogMetadata, value: string | string[] | boolean) => {
      onMetadataChange({
        ...metadata,
        [field]: value,
      });
    },
    [metadata, onMetadataChange]
  );

  const handleAddKeyword = useCallback(() => {
    const keyword = keywordInput.trim();
    if (keyword && !metadata.keywords.includes(keyword)) {
      handleChange('keywords', [...metadata.keywords, keyword]);
      setKeywordInput('');
    }
  }, [keywordInput, metadata.keywords, handleChange]);

  const handleRemoveKeyword = useCallback(
    (keyword: string) => {
      handleChange(
        'keywords',
        metadata.keywords.filter((k) => k !== keyword)
      );
    },
    [metadata.keywords, handleChange]
  );

  const handleKeywordKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddKeyword();
      }
    },
    [handleAddKeyword]
  );

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!isValidImageType(file)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl: string;
      if (onImageUpload) {
        const result = await onImageUpload(file);
        imageUrl = result.url;
      } else {
        imageUrl = await readFileAsDataURL(file);
      }
      handleChange('coverImage', imageUrl);
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCoverImage = useCallback(() => {
    handleChange('coverImage', '');
  }, [handleChange]);

  if (!isOpen) return null;

  return (
    <div className="blog-editor-metadata-overlay" onClick={onClose}>
      <div
        className="blog-editor-metadata-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="blog-editor-metadata-header">
          <h2 className="blog-editor-metadata-title">Blog Settings</h2>
          <button
            className="blog-editor-metadata-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="blog-editor-metadata-content">
          {/* Title */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Title</label>
            <input
              type="text"
              className="blog-editor-metadata-input"
              value={metadata.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter blog title..."
            />
          </div>

          {/* Description */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Description</label>
            <textarea
              className="blog-editor-metadata-input blog-editor-metadata-textarea"
              value={metadata.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter a brief description..."
            />
          </div>

          {/* Keywords */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Keywords</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="blog-editor-metadata-input"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Add a keyword and press Enter..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--accent, #4a4a4a)',
                  color: 'var(--background, #ffffff)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: keywordInput.trim() ? 'pointer' : 'not-allowed',
                  opacity: keywordInput.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
            </div>
            {metadata.keywords.length > 0 && (
              <div className="blog-editor-metadata-keywords">
                {metadata.keywords.map((keyword) => (
                  <span key={keyword} className="blog-editor-metadata-keyword">
                    {keyword}
                    <button
                      type="button"
                      className="blog-editor-metadata-keyword-remove"
                      onClick={() => handleRemoveKeyword(keyword)}
                      aria-label={`Remove ${keyword}`}
                    >
                      <XCircle size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Author</label>
            <input
              type="text"
              className="blog-editor-metadata-input"
              value={metadata.author || ''}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="Author name..."
            />
          </div>

          {/* Category */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Category</label>
            <input
              type="text"
              className="blog-editor-metadata-input"
              value={metadata.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Technology, Lifestyle..."
            />
          </div>

          {/* Slug */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">URL Slug</label>
            <input
              type="text"
              className="blog-editor-metadata-input"
              value={metadata.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="my-blog-post-url"
            />
          </div>

          {/* Excerpt */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Excerpt</label>
            <textarea
              className="blog-editor-metadata-input blog-editor-metadata-textarea"
              value={metadata.excerpt || ''}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="A short excerpt for previews..."
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Cover Image */}
          <div className="blog-editor-metadata-field">
            <label className="blog-editor-metadata-label">Cover Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverImageUpload}
            />
            {metadata.coverImage ? (
              <div className="blog-editor-image-upload has-image">
                <img
                  src={metadata.coverImage}
                  alt="Cover"
                  className="blog-editor-image-preview"
                />
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--surface, #f8f8f8)',
                    border: '1px solid var(--border, #e0e0e0)',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'block',
                    width: '100%',
                  }}
                >
                  Remove Cover Image
                </button>
              </div>
            ) : (
              <div
                className="blog-editor-image-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload
                  size={32}
                  style={{ marginBottom: '0.5rem', color: 'var(--muted, #737373)' }}
                />
                <p style={{ margin: 0, color: 'var(--muted, #737373)' }}>
                  {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                </p>
              </div>
            )}
          </div>

          {/* Published Status */}
          <div className="blog-editor-metadata-field">
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={metadata.isPublished || false}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span className="blog-editor-metadata-label" style={{ marginBottom: 0 }}>
                Publish immediately
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

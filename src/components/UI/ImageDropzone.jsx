import { useEffect, useRef, useState } from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageDropzone({
  label,
  required = false,
  help,
  error,
  multiple = false,
  maxFiles = multiple ? 10 : 1,
  maxSizeMB = 8,
  accept = 'image/*',
  files = [],
  onFilesChange,
  existingImages = [],
  onRemoveExisting,
  disabled = false,
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const urls = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(urls);
    return () => {
      urls.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const validateAndStage = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const accepted = [];
    let rejection = '';

    incoming.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        rejection = `"${file.name}" is not an image file.`;
        return;
      }
      if (file.size > maxBytes) {
        rejection = `"${file.name}" is ${formatSize(file.size)}, which exceeds the ${maxSizeMB}MB limit.`;
        return;
      }
      accepted.push(file);
    });

    let nextFiles = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    if (nextFiles.length > maxFiles) {
      rejection = `You can only upload up to ${maxFiles} image${maxFiles > 1 ? 's' : ''}.`;
      nextFiles = nextFiles.slice(0, maxFiles);
    }

    setLocalError(rejection);
    onFilesChange(nextFiles);
  };

  const handleInputChange = (e) => {
    validateAndStage(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndStage(e.dataTransfer.files);
  };

  const removeStaged = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const displayedError = error || localError;
  const hasAnyImage = previews.length > 0 || existingImages.length > 0;

  return (
    <div className="field">
      {label && (
        <span className="field-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </span>
      )}

      <div
        className={[
          'dropzone',
          compact ? 'dropzone-compact' : '',
          isDragging ? 'is-dragging' : '',
          displayedError ? 'has-error' : '',
          disabled ? 'is-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label={label ? `Upload ${label}` : 'Upload image'}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="dropzone-input"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          tabIndex={-1}
        />
        <div className="dropzone-content">
          <i className={`bi bi-cloud-arrow-up dropzone-icon`} aria-hidden="true" />
          {!compact && <span className="dropzone-title">Drag & drop or click to upload</span>}
          <span className="dropzone-hint">
            {accept === 'image/*' ? 'PNG, JPG or WEBP' : accept} up to {maxSizeMB}MB
            {multiple ? ` · up to ${maxFiles} files` : ''}
          </span>
        </div>
      </div>

      {hasAnyImage && (
        <div className="image-preview-grid">
          {existingImages.map((url, idx) => (
            <div key={`existing-${idx}`} className={`image-preview-tile ${compact ? 'image-preview-tile-compact' : ''}`}>
              <img src={url} alt="Current upload" />
              <span className="image-preview-tag">Current</span>
              {onRemoveExisting && (
                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(url, idx);
                  }}
                  aria-label="Remove current image"
                >
                  <i className="bi bi-x" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          {previews.map((p, idx) => (
            <div key={`staged-${idx}`} className={`image-preview-tile ${compact ? 'image-preview-tile-compact' : ''}`}>
              <img src={p.url} alt={p.file.name} />
              <span className="image-preview-tag">{formatSize(p.file.size)}</span>
              <button
                type="button"
                className="image-preview-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeStaged(idx);
                }}
                aria-label={`Remove ${p.file.name}`}
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {displayedError ? (
        <span className="field-error">
          <i className="bi bi-exclamation-circle" aria-hidden="true" /> {displayedError}
        </span>
      ) : (
        help && <span className="field-help">{help}</span>
      )}
    </div>
  );
}

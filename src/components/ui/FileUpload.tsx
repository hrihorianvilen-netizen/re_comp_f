'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  value?: string | File | null;
  onChange: (file: File | null, dataUrl?: string) => void;
  preview?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  aspectRatio?: string;
  maxWidth?: string;
}

export default function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  value,
  onChange,
  preview = true,
  className = '',
  placeholder = 'Choose file or drag and drop',
  label,
  required = false,
  disabled = false,
  aspectRatio,
  maxWidth = 'max-w-sm'
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof value === 'string' ? value : null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    // Create preview URL
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onChange(file, result);
      };
      reader.readAsDataURL(file);
    } else {
      onChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* File Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-[#A96B11] bg-[#FFF8F0]' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400 flex items-center justify-center text-3xl">
            {accept.includes('image') ? '🖼️' : '📁'}
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {placeholder}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept.includes('image') ? 'PNG, JPG, GIF up to' : 'Files up to'} {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Preview */}
      {preview && previewUrl && (
        <div className="relative">
          <div className={`${maxWidth} mx-auto`}>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className={`w-full h-auto rounded border border-gray-200 ${aspectRatio ? '' : 'max-h-48 object-cover'}`}
                style={aspectRatio ? { aspectRatio } : undefined}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-bold"
                disabled={disabled}
              >
                ×
              </button>
            </div>
          </div>
          {aspectRatio && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              Preview ({aspectRatio} aspect ratio)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
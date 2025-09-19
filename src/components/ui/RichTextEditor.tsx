'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { validateContent, sanitizeHtml, countCharacters } from '@/lib/sanitize';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  maxLinks?: number;
  maxImages?: number;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  className?: string;
  height?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showPreview?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  maxLength = 3000,
  minLength = 10,
  maxLinks = 20,
  maxImages = 10,
  disabled = false,
  required = false,
  label,
  error,
  className = '',
  height = 'min-h-[200px] max-h-[300px]',
  autoSave = true,
  autoSaveInterval = 10000,
  showPreview = true
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3, 4]
        },
        blockquote: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitized = sanitizeHtml(html);

      // Update character count
      const count = countCharacters(sanitized);
      setCharCount(count);

      // Validate content
      const validation = validateContent(sanitized, {
        maxLength,
        minLength,
        maxLinks,
        maxImages
      });
      setValidationErrors(validation.errors);

      // Call onChange
      onChange(sanitized);

      // Reset autosave timer
      if (autoSave) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          handleAutoSave(sanitized);
        }, autoSaveInterval);
      }
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setCharCount(countCharacters(value));
    }
  }, [value, editor]);

  // Cleanup autosave timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleAutoSave = useCallback((content: string) => {
    if (content !== lastSavedValueRef.current) {
      setIsSaving(true);
      // Save to localStorage as draft
      const draftKey = `draft_${window.location.pathname}`;
      localStorage.setItem(draftKey, content);
      lastSavedValueRef.current = content;

      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  }, []);

  // No additional toolbar actions needed for basic formatting

  if (!editor) {
    return null;
  }

  const charPercentage = (charCount / maxLength) * 100;
  const isNearLimit = charPercentage >= 90;
  const isAtLimit = charPercentage >= 100;

  return (
    <div className={`rich-text-editor ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 bg-gray-50">
          {/* Text formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
              title="Bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
              title="Italic"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4l-4 16m-4 0h4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={disabled}
              className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
              title="Underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v7a5 5 0 0010 0V4M5 20h14" />
              </svg>
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={disabled}
              className={`px-2 py-1.5 rounded hover:bg-gray-200 text-xs font-semibold ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              disabled={disabled}
              className={`px-2 py-1.5 rounded hover:bg-gray-200 text-xs font-semibold ${editor.isActive('heading', { level: 4 }) ? 'bg-gray-300' : ''}`}
              title="Heading 4"
            >
              H4
            </button>
          </div>

{/* View toggle */}
          {showPreview && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                disabled={disabled}
                className="px-3 py-1 rounded hover:bg-gray-200 text-xs font-medium"
              >
                {isPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          )}
        </div>

        {/* Editor content */}
        <div className={`relative ${height} overflow-y-auto`}>
          {isPreview ? (
            <div
              className="prose prose-sm max-w-none p-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor.getHTML()) }}
            />
          ) : (
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none p-4 min-h-[150px] focus:outline-none"
            />
          )}
        </div>

        {/* Footer with character count */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50 text-xs">
          <div className="flex items-center gap-4">
            <span className={`${isAtLimit ? 'text-red-600 font-semibold' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'}`}>
              {charCount} / {maxLength} characters
            </span>
            {isSaving && (
              <span className="text-gray-500 italic">Saving draft...</span>
            )}
          </div>
          {autoSave && (
            <span className="text-gray-400">Auto-save enabled</span>
          )}
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mt-2 space-y-1">
          {validationErrors.map((err, idx) => (
            <p key={idx} className="text-sm text-red-600">{err}</p>
          ))}
        </div>
      )}

      {/* External error */}
      {error && !validationErrors.length && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Style for editor */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td,
        .ProseMirror th {
          min-width: 1em;
          border: 1px solid #ddd;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f5;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
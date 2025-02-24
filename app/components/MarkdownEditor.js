'use client';

import { useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

// Debug logging function
const debugLog = (message, data = null) => {
  const logMessage = data ? `${message} ${JSON.stringify(data)}` : message;
  console.log(`[MarkdownEditor Debug] ${logMessage}`);
};

const MarkdownEditor = ({ initialValue, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    debugLog('Component mounted with initial value', { hasInitialValue: !!initialValue });
    return () => debugLog('Component unmounted');
  }, [initialValue]);

  const options = {
    spellChecker: false,
    autofocus: false, // Changed to false to prevent hydration mismatch
    placeholder: 'Write your markdown here...',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      {
        name: 'save',
        action: (editor) => {
          const content = editor.value();
          const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
          saveAs(blob, 'document.md');
        },
        className: 'fa fa-save',
        title: 'Save as Markdown',
      },
    ],
  };

  debugLog('Rendering editor component');
  return (
    <div className="w-full max-w-4xl mx-auto p-4" ref={editorRef}>
      <SimpleMDE
        value={initialValue}
        onChange={(value) => {
          debugLog('Editor content changed', { contentLength: value.length });
          onChange(value);
        }}
        options={options}
      />
    </div>
  );
};

export default MarkdownEditor;
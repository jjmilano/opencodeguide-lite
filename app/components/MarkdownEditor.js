'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';

// Import EasyMDE styles
import 'easymde/dist/easymde.min.css';

const MarkdownEditor = () => {
  const editorRef = useRef();
  const easyMDERef = useRef(null);

  useEffect(() => {
    const initializeEditor = async () => {
      if (!easyMDERef.current) {
        const EasyMDE = (await import('easymde')).default;
        easyMDERef.current = new EasyMDE({
          element: editorRef.current,
          spellChecker: false,
          autofocus: true,
          placeholder: 'Write your markdown here...',
          toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            {
              name: 'save',
              action: () => {
                const content = easyMDERef.current.value();
                const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
                saveAs(blob, 'document.md');
              },
              className: 'fa fa-save',
              title: 'Save as Markdown',
            },
          ],
        });
      }
    };

    initializeEditor();

    return () => {
      if (easyMDERef.current) {
        easyMDERef.current.toTextArea();
        easyMDERef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <textarea ref={editorRef} />
    </div>
  );
};

export default MarkdownEditor;
'use client';

import { useEffect, useRef } from 'react';
import SimpleMDE from 'simplemde';
import { saveAs } from 'file-saver';
import 'simplemde/dist/simplemde.min.css';

export default function MarkdownEditor() {
  const editorRef = useRef();
  const simplemdeRef = useRef(null);

  useEffect(() => {
    if (!simplemdeRef.current) {
      simplemdeRef.current = new SimpleMDE({
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
              const content = simplemdeRef.current.value();
              const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
              saveAs(blob, 'document.md');
            },
            className: 'fa fa-save',
            title: 'Save as Markdown',
          },
        ],
      });
    }

    return () => {
      if (simplemdeRef.current) {
        simplemdeRef.current.toTextArea();
        simplemdeRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <textarea ref={editorRef} />
    </div>
  );
}
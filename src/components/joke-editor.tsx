"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

interface JokeEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function JokeEditor({ content, onChange, placeholder }: JokeEditorProps) {
  const [showSource, setShowSource] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable all formatting except paragraphs and hard breaks
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        heading: false,
        blockquote: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,
        bulletList: false,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[150px] p-4 text-gray-900",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes (for edit mode)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 transition-colors">
      {!showSource ? (
        <EditorContent 
          editor={editor}
          placeholder={placeholder}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[150px] p-4 font-mono text-sm text-gray-900 focus:outline-none"
        />
      )}
      <div className="px-4 pb-3 pt-3 text-xs text-gray-600 border-t border-gray-200 flex justify-between items-center">
        <span>Enter = ny paragraf • Shift+Enter = radbrytning</span>
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {showSource ? "← Tillbaka" : "Visa HTML"}
        </button>
      </div>
    </div>
  );
}

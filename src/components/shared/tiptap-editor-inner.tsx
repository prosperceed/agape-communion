"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface TiptapEditorInnerProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditorInner({
  value,
  onChange,
  placeholder = "Write content here...",
}: TiptapEditorInnerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose-church min-h-[220px] max-w-none px-4 py-3 text-sm text-slate-900 focus:outline-none",
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[260px] rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("bold") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("italic") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("underline") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Underline"
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-slate-200 text-slate-900"
              : ""
          }`}
          title="Heading 2"
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-slate-200 text-slate-900"
              : ""
          }`}
          title="Heading 3"
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("bulletList") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("orderedList") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Numbered List"
          aria-label="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-sm text-slate-700 hover:bg-slate-200 ${
            editor.isActive("blockquote") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Blockquote"
          aria-label="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded-sm text-slate-700 hover:bg-slate-200"
          title="Undo"
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded-sm text-slate-700 hover:bg-slate-200"
          title="Redo"
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}


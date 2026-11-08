"use client";

import dynamic from "next/dynamic";

const LazyTiptapEditor = dynamic(() => import("./tiptap-editor-inner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[260px] rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      Loading rich-text editor...
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor(props: RichTextEditorProps) {
  return <LazyTiptapEditor {...props} />;
}


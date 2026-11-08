"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Archive,
  X,
} from "lucide-react";
import {
  createDevotionalAction,
  deleteDevotionalAction,
  setDevotionalStatusAction,
  updateDevotionalAction,
} from "@/features/devotionals/actions";
import type { DevotionalListItem } from "@/features/devotionals/queries";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function DevotionalsManager({
  initialDevotionals,
  defaultAuthorName,
}: {
  initialDevotionals: Array<
    DevotionalListItem & { content?: string; reflectionPrompt?: string }
  >;
  defaultAuthorName: string;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<DevotionalListItem | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [scriptureReference, setScriptureReference] = useState("Psalm 62:5-8");
  const [biblePassage, setBiblePassage] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [reflectionPrompt, setReflectionPrompt] = useState("");
  const [coverImage, setCoverImage] = useState(
    "/assets/blog/finding-peace-in-the-psalms.jpg"
  );
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [publishedAt, setPublishedAt] = useState("2026-11-08");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = initialDevotionals.filter((d) =>
    statusFilter === "ALL" ? true : d.status === statusFilter
  );

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setScriptureReference("Psalm 23:1-3");
    setBiblePassage(
      "The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures."
    );
    setContent("<p>Write main devotional reflection here...</p>");
    setReflectionPrompt(
      "Lord Jesus, thank You for shepherding my soul in peace today. Amen."
    );
    setCoverImage("/assets/blog/finding-peace-in-the-psalms.jpg");
    setAuthorName(defaultAuthorName);
    setPublishedAt("2026-11-08");
    setShowForm(true);
  }

  function openEdit(
    item: DevotionalListItem & { content?: string; reflectionPrompt?: string }
  ) {
    setEditingId(item.id);
    setTitle(item.title);
    setScriptureReference(item.scriptureReference);
    setBiblePassage(item.biblePassage);
    setContent(item.content || `<p>${item.biblePassage}</p>`);
    setReflectionPrompt(
      item.reflectionPrompt ||
        "Father, help me walk in the truth of Your Word today. Amen."
    );
    setCoverImage(item.coverImage);
    setAuthorName(item.authorName);
    setPublishedAt(new Date(item.publishedAt).toISOString().slice(0, 10));
    setShowForm(true);
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setLoading(true);
    setFeedback(null);

    const payload = {
      title,
      scriptureReference,
      biblePassage,
      content,
      reflectionPrompt,
      coverImage,
      authorName,
      publishedAt,
      status,
    };

    const res = editingId
      ? await updateDevotionalAction(editingId, payload)
      : await createDevotionalAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Devotional saved.");
      setFeedback({ type: "success", text: res.message || "Devotional saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save devotional.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleQuickStatus(
    id: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) {
    setLoading(true);
    const res = await setDevotionalStatusAction(id, status);
    setLoading(false);
    if (res.success) {
      toast.success(res.message || `Status changed to ${status}.`);
      setFeedback({ type: "success", text: res.message || "Status updated." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update status.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    const res = await deleteDevotionalAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Devotional deleted.");
      setFeedback({ type: "success", text: "Devotional deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete devotional.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Daily Devotionals
          </h1>
          <p className="text-xs text-slate-600">
            Create and schedule daily Scripture readings, reflections, and
            guided prayers.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Devotional
        </Button>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-sm p-3.5 text-xs font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-sm border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? "Edit Devotional" : "Create Daily Devotional"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dev-title">Devotional Title</Label>
              <Input
                id="dev-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Waiting Quietly Upon God Alone"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dev-scripture">Scripture Reference</Label>
              <Input
                id="dev-scripture"
                value={scriptureReference}
                onChange={(e) => setScriptureReference(e.target.value)}
                placeholder="Psalm 62:5-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dev-author">Author Name</Label>
              <Input
                id="dev-author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dev-date">Publication Date</Label>
              <Input
                id="dev-date"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dev-passage">Bible Passage Text</Label>
            <Textarea
              id="dev-passage"
              rows={2}
              value={biblePassage}
              onChange={(e) => setBiblePassage(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dev-img">Cover Image</Label>
            <AssetImageSelector
              id="dev-img"
              value={coverImage}
              onChange={setCoverImage}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Main Devotional Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dev-prayer">Reflection or Prayer</Label>
            <Textarea
              id="dev-prayer"
              rows={2}
              value={reflectionPrompt}
              onChange={(e) => setReflectionPrompt(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
            >
              Publish Devotional
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => handleSave("DRAFT")}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSave("ARCHIVED")}
            >
              Archive
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === st
                ? "bg-[#0B1325] text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="rounded-sm border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Devotional</th>
                <th className="py-3 px-4">Scripture</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-slate-500 line-clamp-1 max-w-md">
                      {item.biblePassage}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#EA580C]">
                    {item.scriptureReference}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(item.publishedAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === "PUBLISHED"
                          ? "success"
                          : item.status === "DRAFT"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {item.status !== "PUBLISHED" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(item.id, "PUBLISHED")}
                          className="p-1.5 rounded-sm text-emerald-600 hover:bg-emerald-50"
                          title="Publish"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      {item.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(item.id, "ARCHIVED")}
                          className="p-1.5 rounded-sm text-amber-600 hover:bg-amber-50"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 rounded-sm text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-sm bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Devotional Preview: {previewItem.title}
              </h3>
              <button type="button" onClick={() => setPreviewItem(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#EA580C]">
              {previewItem.scriptureReference}
            </p>
            <blockquote className="border-l-2 border-[#EA580C] pl-3 text-sm italic text-slate-700">
              {previewItem.biblePassage}
            </blockquote>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-sm bg-white p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Devotional Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this devotional entry?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={loading}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


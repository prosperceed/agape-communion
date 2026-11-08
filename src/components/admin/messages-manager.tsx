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
  createMessageAction,
  deleteMessageAction,
  setMessageStatusAction,
  updateMessageAction,
} from "@/features/messages/actions";
import type { MessageListItem } from "@/features/messages/queries";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function MessagesManager({
  initialMessages,
}: {
  initialMessages: MessageListItem[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MessageListItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("Pastor Emmanuel Adeyemi");
  const [seriesName, setSeriesName] = useState("Hope for Tomorrow");
  const [description, setDescription] = useState("");
  const [scriptureReferences, setScriptureReferences] = useState("");
  const [datePreached, setDatePreached] = useState("2026-11-08");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "/assets/messages/renewing-your-mind.jpg"
  );
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [audioUrl, setAudioUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = initialMessages.filter((m) =>
    statusFilter === "ALL" ? true : m.status === statusFilter
  );

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setSpeaker("Pastor Emmanuel Adeyemi");
    setSeriesName("Hope for Tomorrow");
    setDescription("");
    setScriptureReferences("Romans 12:1-2");
    setDatePreached("2026-11-08");
    setThumbnailUrl("/assets/messages/renewing-your-mind.jpg");
    setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    setAudioUrl("");
    setShowForm(true);
  }

  function openEdit(item: MessageListItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setSpeaker(item.speaker);
    setSeriesName(item.seriesName || "");
    setDescription(item.description);
    setScriptureReferences(item.scriptureReferences);
    setDatePreached(new Date(item.datePreached).toISOString().slice(0, 10));
    setThumbnailUrl(item.thumbnailUrl);
    setVideoUrl(item.videoUrl || "");
    setAudioUrl(item.audioUrl || "");
    setShowForm(true);
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setLoading(true);
    setFeedback(null);

    const payload = {
      title,
      speaker,
      seriesName,
      description,
      scriptureReferences,
      datePreached,
      thumbnailUrl,
      videoUrl,
      audioUrl,
      status,
    };

    const res = editingId
      ? await updateMessageAction(editingId, payload)
      : await createMessageAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Message saved.");
      setFeedback({ type: "success", text: res.message || "Message saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save message.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleQuickStatus(
    id: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) {
    setLoading(true);
    const res = await setMessageStatusAction(id, status);
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
    const res = await deleteMessageAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Message deleted.");
      setFeedback({ type: "success", text: "Message deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete message.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sermons & Messages
          </h1>
          <p className="text-xs text-slate-600">
            Manage church messages, sermon series, Scripture references, and
            external video/audio links.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Sermon Message
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
              {editingId ? "Edit Sermon Message" : "Add Sermon Message"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="msg-title">Message Title</Label>
              <Input
                id="msg-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Renewing Your Mind"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-speaker">Speaker</Label>
              <Input
                id="msg-speaker"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="msg-series">Series Name</Label>
              <Input
                id="msg-series"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="Hope for Tomorrow"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-scripture">Scripture References</Label>
              <Input
                id="msg-scripture"
                value={scriptureReferences}
                onChange={(e) => setScriptureReferences(e.target.value)}
                placeholder="Romans 12:1-2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-date">Date Preached</Label>
              <Input
                id="msg-date"
                type="date"
                value={datePreached}
                onChange={(e) => setDatePreached(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="msg-video">External Video URL</Label>
              <Input
                id="msg-video"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-audio">External Audio URL (Optional)</Label>
              <Input
                id="msg-audio"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="msg-thumb">Message Thumbnail</Label>
            <AssetImageSelector
              id="msg-thumb"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="msg-desc">Message Description</Label>
            <Textarea
              id="msg-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
            >
              Publish Message
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
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Speaker</th>
                <th className="py-3 px-4">Scripture</th>
                <th className="py-3 px-4">Date Preached</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-slate-500">
                      {item.seriesName || "Sunday Sermon"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.speaker}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.scriptureReferences}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(item.datePreached)}
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
                Message Preview: {previewItem.title}
              </h3>
              <button type="button" onClick={() => setPreviewItem(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#EA580C]">
              {previewItem.speaker} &middot; {previewItem.scriptureReferences}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {previewItem.description}
            </p>
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
              Confirm Message Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this sermon message?
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


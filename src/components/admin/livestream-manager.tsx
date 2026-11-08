"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit3,
  Trash2,
  Radio,
  Square,
  Calendar,
  X,
} from "lucide-react";
import {
  createLivestreamAction,
  deleteLivestreamAction,
  setLivestreamStateAction,
  updateLivestreamAction,
} from "@/features/livestream/actions";
import type { LivestreamRecord } from "@/features/livestream/queries";
import type { LivestreamPlatform, LivestreamStatus } from "@/types";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function LivestreamManager({
  initialStreams,
}: {
  initialStreams: LivestreamRecord[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<LivestreamPlatform>("YOUTUBE");
  const [streamUrl, setStreamUrl] = useState(
    "https://www.youtube.com/watch?v=jfKfPfyJRdk"
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "/assets/hero/sunday-livestream-banner.jpg"
  );
  const [scheduledFor, setScheduledFor] = useState("2026-11-15T09:00");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setDescription(
      "Join Agape Communion Church online for congregational worship and the preaching of God's Word."
    );
    setPlatform("YOUTUBE");
    setStreamUrl("https://www.youtube.com/watch?v=jfKfPfyJRdk");
    setThumbnailUrl("/assets/hero/sunday-livestream-banner.jpg");
    setScheduledFor("2026-11-15T09:00");
    setShowForm(true);
  }

  function openEdit(item: LivestreamRecord) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setPlatform(item.platform);
    setStreamUrl(item.streamUrl);
    setThumbnailUrl(item.thumbnailUrl);
    setScheduledFor(new Date(item.scheduledFor).toISOString().slice(0, 16));
    setShowForm(true);
  }

  async function handleSave(status: LivestreamStatus) {
    setLoading(true);
    setFeedback(null);

    const payload = {
      title,
      description,
      platform,
      streamUrl,
      thumbnailUrl,
      status,
      scheduledFor,
    };

    const res = editingId
      ? await updateLivestreamAction(editingId, payload)
      : await createLivestreamAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Livestream saved.");
      setFeedback({ type: "success", text: res.message || "Livestream saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save livestream.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleStateChange(id: string, status: LivestreamStatus) {
    setLoading(true);
    const res = await setLivestreamStateAction(id, status);
    setLoading(false);
    if (res.success) {
      toast.success(res.message || `Broadcast state changed to ${status}.`);
      setFeedback({ type: "success", text: res.message || "State updated." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to change state.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    const res = await deleteLivestreamAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Livestream deleted.");
      setFeedback({ type: "success", text: "Livestream deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete livestream.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Livestream Management
          </h1>
          <p className="text-xs text-slate-600">
            Configure YouTube Live and Facebook Live broadcasts, activate live
            streams, and archive completed broadcasts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Livestream
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
              {editingId ? "Edit Livestream" : "Schedule Livestream Broadcast"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="ls-title">Broadcast Title</Label>
              <Input
                id="ls-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sunday Morning Worship & Communion Service"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ls-platform">Platform</Label>
              <select
                id="ls-platform"
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as LivestreamPlatform)
                }
                className="flex h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="YOUTUBE">YouTube Live</option>
                <option value="FACEBOOK">Facebook Live</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ls-url">Stream URL (HTTPS)</Label>
              <Input
                id="ls-url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ls-sched">Scheduled Date & Time</Label>
              <Input
                id="ls-sched"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ls-thumb">Broadcast Thumbnail</Label>
            <AssetImageSelector
              id="ls-thumb"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ls-desc">Description</Label>
            <Textarea
              id="ls-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("SCHEDULED")}
            >
              <Calendar className="h-4 w-4" />
              Save as Scheduled
            </Button>
            <Button
              type="button"
              variant="navy"
              disabled={loading}
              onClick={() => handleSave("LIVE")}
            >
              <Radio className="h-4 w-4" />
              Go Live Immediately
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

      <div className="rounded-sm border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Broadcast</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {initialStreams.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-slate-500 truncate max-w-sm">
                      {item.embedUrl}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {item.platform}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(item.scheduledFor, "MMM d, yyyy 'at' h:mm a")}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === "LIVE"
                          ? "live"
                          : item.status === "SCHEDULED"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {item.status !== "LIVE" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleStateChange(item.id, "LIVE")}
                          disabled={loading}
                        >
                          <Radio className="h-3.5 w-3.5" />
                          Activate
                        </Button>
                      )}
                      {item.status === "LIVE" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleStateChange(item.id, "ENDED")}
                          disabled={loading}
                        >
                          <Square className="h-3.5 w-3.5" />
                          End Stream
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
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

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-sm bg-white p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Livestream Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this livestream announcement?
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


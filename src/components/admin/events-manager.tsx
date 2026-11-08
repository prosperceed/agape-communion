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
  createEventAction,
  deleteEventAction,
  setEventStatusAction,
  updateEventAction,
} from "@/features/events/actions";
import type { EventListItem } from "@/features/events/queries";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function EventsManager({
  initialEvents,
}: {
  initialEvents: Array<EventListItem & { description?: string }>;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<EventListItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [description, setDescription] = useState("<p></p>");
  const [coverImage, setCoverImage] = useState(
    "/assets/events/night-of-worship.jpg"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState(
    "Main Sanctuary, Plot 24 Admiralty Way, Lekki Phase 1"
  );
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = initialEvents.filter((e) =>
    statusFilter === "ALL" ? true : e.status === statusFilter
  );

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setDescription(
      "<p>Join our church family for this special gathering in Lagos.</p>"
    );
    setCoverImage("/assets/events/night-of-worship.jpg");
    setStartDate("2026-12-05T17:00");
    setEndDate("");
    setVenue("Main Sanctuary, Plot 24 Admiralty Way, Lekki Phase 1");
    setRegistrationUrl("");
    setIsFeatured(false);
    setShowForm(true);
  }

  function openEdit(item: EventListItem & { description?: string }) {
    setEditingId(item.id);
    setTitle(item.title);
    setExcerpt(item.excerpt);
    setDescription(item.description || `<p>${item.excerpt}</p>`);
    setCoverImage(item.coverImage);
    setStartDate(new Date(item.startDate).toISOString().slice(0, 16));
    setEndDate(
      item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : ""
    );
    setVenue(item.venue);
    setRegistrationUrl(item.registrationUrl || "");
    setIsFeatured(item.isFeatured);
    setShowForm(true);
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setLoading(true);
    setFeedback(null);

    const payload = {
      title,
      excerpt,
      description,
      coverImage,
      startDate,
      endDate,
      venue,
      registrationUrl,
      isFeatured,
      status,
    };

    const res = editingId
      ? await updateEventAction(editingId, payload)
      : await createEventAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Event saved.");
      setFeedback({ type: "success", text: res.message || "Event saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save event.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleQuickStatus(
    id: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) {
    setLoading(true);
    const res = await setEventStatusAction(id, status);
    setLoading(false);
    if (res.success) {
      toast.success(res.message || `Status changed to ${status}.`);
      setFeedback({ type: "success", text: res.message || "Status updated." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update event status.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    const res = await deleteEventAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Event deleted.");
      setFeedback({ type: "success", text: "Event deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete event.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Events Management
          </h1>
          <p className="text-xs text-slate-600">
            Create, schedule, publish, and archive church conferences and
            gatherings.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Event
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
              {editingId ? "Edit Event" : "Create New Event"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="evt-title">Event Title</Label>
              <Input
                id="evt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lagos Night of Worship & Communion"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="evt-venue">Venue</Label>
              <Input
                id="evt-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="evt-start">Start Date & Time</Label>
              <Input
                id="evt-start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="evt-end">End Date & Time (Optional)</Label>
              <Input
                id="evt-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="evt-reg">Registration URL (Optional)</Label>
              <Input
                id="evt-reg"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evt-img">Cover Image</Label>
            <AssetImageSelector
              id="evt-img"
              value={coverImage}
              onChange={setCoverImage}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evt-excerpt">Short Excerpt</Label>
            <Textarea
              id="evt-excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary displayed on event listing cards..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Full Event Description</Label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
            >
              Publish Event
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
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Venue</th>
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
                      {item.excerpt}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(item.startDate, "MMM d, yyyy 'at' h:mm a")}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {item.venue}
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
                Event Preview: {previewItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#EA580C]">
              {formatDate(previewItem.startDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}{" "}
              &middot; {previewItem.venue}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {previewItem.excerpt}
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
              Confirm Event Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this event?
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


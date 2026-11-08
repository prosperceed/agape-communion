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
  Clock,
  Calendar,
  X,
} from "lucide-react";
import {
  createServiceAction,
  deleteServiceAction,
  setServiceStatusAction,
  updateServiceAction,
} from "@/features/services/actions";
import type { ServiceWithSchedules } from "@/features/services/queries";
import type { ServiceScheduleItemInput } from "@/features/services/schemas";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const DAYS_OF_WEEK = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceWithSchedules[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewItem, setPreviewItem] = useState<ServiceWithSchedules | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "/assets/services/sunday-communion-service.jpg"
  );
  const [isRecurring, setIsRecurring] = useState(true);
  const [eventDate, setEventDate] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [schedules, setSchedules] = useState<ServiceScheduleItemInput[]>([
    {
      dayOfWeek: "SUNDAY",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      frequency: "WEEKLY",
      notes: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = initialServices.filter((s) =>
    statusFilter === "ALL" ? true : s.status === statusFilter
  );

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLocation("Main Sanctuary, Lekki Phase 1");
    setImageUrl("/assets/services/sunday-communion-service.jpg");
    setIsRecurring(true);
    setEventDate("");
    setDisplayOrder(initialServices.length + 1);
    setSchedules([
      {
        dayOfWeek: "SUNDAY",
        startTime: "09:00 AM",
        endTime: "11:00 AM",
        frequency: "WEEKLY",
        notes: "",
      },
    ]);
    setShowForm(true);
  }

  function openEdit(item: ServiceWithSchedules) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setLocation(item.location || "");
    setImageUrl(item.imageUrl || "");
    setIsRecurring(item.isRecurring);
    setEventDate(
      item.eventDate ? new Date(item.eventDate).toISOString().slice(0, 16) : ""
    );
    setDisplayOrder(item.displayOrder);
    setSchedules(
      item.schedules.length > 0
        ? item.schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            frequency: s.frequency,
            notes: s.notes || "",
          }))
        : [
            {
              dayOfWeek: "SUNDAY",
              startTime: "09:00 AM",
              endTime: "11:00 AM",
              frequency: "WEEKLY",
              notes: "",
            },
          ]
    );
    setShowForm(true);
  }

  async function handleSave(targetStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setLoading(true);
    setFeedback(null);

    const payload = {
      title,
      description,
      location,
      imageUrl,
      isRecurring,
      eventDate: isRecurring ? "" : eventDate,
      status: targetStatus,
      displayOrder: Number(displayOrder) || 0,
      schedules: isRecurring ? schedules : [],
    };

    const res = editingId
      ? await updateServiceAction(editingId, payload)
      : await createServiceAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Service saved.");
      setFeedback({ type: "success", text: res.message || "Saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save service.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleQuickStatus(
    id: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) {
    setLoading(true);
    const res = await setServiceStatusAction(id, status);
    setLoading(false);
    if (res.success) {
      toast.success(res.message || `Status changed to ${status}.`);
      setFeedback({ type: "success", text: res.message || "Status updated." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update service status.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    const res = await deleteServiceAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Service programme deleted.");
      setFeedback({ type: "success", text: "Service deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete service.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Services & Programmes
          </h1>
          <p className="text-xs text-slate-600">
            Manage recurring weekly activities and individual dated church
            programmes.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Service Entry
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
              {editingId ? "Edit Service Programme" : "Create Service Programme"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="svc-title">Programme Title</Label>
              <Input
                id="svc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sunday Communion & Worship Service"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-order">Display Order</Label>
              <Input
                id="svc-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">Brief Explanation</Label>
            <Textarea
              id="svc-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happens during this programme..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-location">Location (Optional)</Label>
              <Input
                id="svc-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Sanctuary, Lekki Phase 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-img">Image Asset (Optional)</Label>
              <AssetImageSelector
                id="svc-img"
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(true)}
                  className="text-[#EA580C] focus:ring-[#EA580C]"
                />
                <span>Recurring Weekly Schedule</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={!isRecurring}
                  onChange={() => setIsRecurring(false)}
                  className="text-[#EA580C] focus:ring-[#EA580C]"
                />
                <span>Individual Dated Programme</span>
              </label>
            </div>

            {isRecurring ? (
              <div className="space-y-3">
                {schedules.map((sch, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end bg-white p-3 rounded-sm border border-slate-200"
                  >
                    <div>
                      <Label className="text-xs">Day of Week</Label>
                      <select
                        value={sch.dayOfWeek}
                        onChange={(e) => {
                          const next = [...schedules];
                          next[idx] = {
                            ...next[idx],
                            dayOfWeek: e.target.value as typeof sch.dayOfWeek,
                          };
                          setSchedules(next);
                        }}
                        className="mt-1 h-9 w-full rounded-sm border border-slate-200 bg-white px-2.5 text-xs"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        value={sch.startTime}
                        onChange={(e) => {
                          const next = [...schedules];
                          next[idx] = { ...next[idx], startTime: e.target.value };
                          setSchedules(next);
                        }}
                        className="mt-1 h-9 text-xs"
                        placeholder="09:00 AM"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Time</Label>
                      <Input
                        value={sch.endTime}
                        onChange={(e) => {
                          const next = [...schedules];
                          next[idx] = { ...next[idx], endTime: e.target.value };
                          setSchedules(next);
                        }}
                        className="mt-1 h-9 text-xs"
                        placeholder="11:00 AM"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input
                        value={sch.notes || ""}
                        onChange={(e) => {
                          const next = [...schedules];
                          next[idx] = { ...next[idx], notes: e.target.value };
                          setSchedules(next);
                        }}
                        className="mt-1 h-9 text-xs"
                        placeholder="First Service"
                      />
                    </div>
                    <div>
                      {schedules.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSchedules(schedules.filter((_, i) => i !== idx))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSchedules([
                      ...schedules,
                      {
                        dayOfWeek: "WEDNESDAY",
                        startTime: "06:00 PM",
                        endTime: "07:30 PM",
                        frequency: "WEEKLY",
                        notes: "",
                      },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Schedule Slot
                </Button>
              </div>
            ) : (
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="svc-date">Programme Date & Time</Label>
                <Input
                  id="svc-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
            >
              Publish Service
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
              Save Archived
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
                <th className="py-3 px-4">Programme</th>
                <th className="py-3 px-4">Schedule Type</th>
                <th className="py-3 px-4">Times</th>
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
                      {item.description}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.isRecurring ? (
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <Clock className="h-3.5 w-3.5 text-[#EA580C]" />
                        Recurring
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-[#EA580C]" />
                        Dated
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.isRecurring
                      ? item.schedules
                          .map((s) => `${s.dayOfWeek}: ${s.startTime}`)
                          .join(", ")
                      : formatDate(item.eventDate, "MMM d, yyyy")}
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
                Service Preview: {previewItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {previewItem.description}
            </p>
            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-sm">
              <p className="font-semibold text-slate-900">
                Location: {previewItem.location || "Main Sanctuary"}
              </p>
              {previewItem.schedules.map((s) => (
                <p key={s.id}>
                  {s.dayOfWeek}: {s.startTime} to {s.endTime}
                </p>
              ))}
            </div>
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
              Confirm Service Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this service programme
              and its schedule?
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


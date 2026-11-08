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
  createTestimonyAction,
  deleteTestimonyAction,
  setTestimonyStatusAction,
  updateTestimonyAction,
} from "@/features/testimonies/actions";
import type { TestimonyStatus } from "@/types";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface TestimonyRow {
  id: string;
  title: string;
  slug: string;
  personName: string;
  displayPersonName: boolean;
  hasMediaPermission: boolean;
  hasStoryPermission: boolean;
  roleOrRelation: string | null;
  excerpt: string;
  fullTestimony: string;
  imageUrl: string;
  isFeatured: boolean;
  status: TestimonyStatus;
  publishedAt: Date | null;
  createdAt: Date;
}

export function TestimoniesManager({
  initialTestimonies,
}: {
  initialTestimonies: TestimonyRow[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<TestimonyRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [personName, setPersonName] = useState("");
  const [displayPersonName, setDisplayPersonName] = useState(true);
  const [hasMediaPermission, setHasMediaPermission] = useState(true);
  const [hasStoryPermission, setHasStoryPermission] = useState(true);
  const [roleOrRelation, setRoleOrRelation] = useState("Church Member");
  const [excerpt, setExcerpt] = useState("");
  const [fullTestimony, setFullTestimony] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "/assets/testimonies/deacon-chinedu-obi.jpg"
  );
  const [isFeatured, setIsFeatured] = useState(true);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = initialTestimonies.filter((t) =>
    statusFilter === "ALL" ? true : t.status === statusFilter
  );

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setPersonName("");
    setDisplayPersonName(true);
    setHasMediaPermission(true);
    setHasStoryPermission(true);
    setRoleOrRelation("Church Member");
    setExcerpt("");
    setFullTestimony("");
    setImageUrl("/assets/testimonies/deacon-chinedu-obi.jpg");
    setIsFeatured(true);
    setShowForm(true);
  }

  function openEdit(item: TestimonyRow) {
    setEditingId(item.id);
    setTitle(item.title);
    setPersonName(item.personName);
    setDisplayPersonName(item.displayPersonName);
    setHasMediaPermission(item.hasMediaPermission);
    setHasStoryPermission(item.hasStoryPermission);
    setRoleOrRelation(item.roleOrRelation || "");
    setExcerpt(item.excerpt);
    setFullTestimony(item.fullTestimony);
    setImageUrl(item.imageUrl);
    setIsFeatured(item.isFeatured);
    setShowForm(true);
  }

  async function handleSave(status: TestimonyStatus) {
    setLoading(true);
    setFeedback(null);

    const payload = {
      title,
      personName,
      displayPersonName,
      hasMediaPermission,
      hasStoryPermission,
      roleOrRelation,
      excerpt,
      fullTestimony,
      imageUrl,
      isFeatured,
      status,
    };

    const res = editingId
      ? await updateTestimonyAction(editingId, payload)
      : await createTestimonyAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Testimony saved.");
      setFeedback({ type: "success", text: res.message || "Testimony saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save testimony.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleQuickStatus(id: string, status: TestimonyStatus) {
    setLoading(true);
    const res = await setTestimonyStatusAction(id, status);
    setLoading(false);
    if (res.success) {
      toast.success(res.message || `Testimony status updated to ${status}.`);
      setFeedback({ type: "success", text: res.message || "Status updated." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update testimony status.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    const res = await deleteTestimonyAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Testimony deleted.");
      setFeedback({ type: "success", text: "Testimony deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete testimony.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Testimonies Management
          </h1>
          <p className="text-xs text-slate-600">
            Review, approve, and publish testimonies with strict privacy and
            consent controls.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Testimony
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
              {editingId ? "Edit Testimony" : "Create Testimony"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="tst-title">Testimony Title</Label>
              <Input
                id="tst-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tst-person">Person&apos;s Name</Label>
              <Input
                id="tst-person"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tst-role">Role / Fellowship</Label>
              <Input
                id="tst-role"
                value={roleOrRelation}
                onChange={(e) => setRoleOrRelation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tst-img">Testimony Image</Label>
            <AssetImageSelector
              id="tst-img"
              value={imageUrl}
              onChange={setImageUrl}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tst-excerpt">Short Excerpt</Label>
            <Textarea
              id="tst-excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tst-full">Full Testimony</Label>
            <Textarea
              id="tst-full"
              rows={4}
              value={fullTestimony}
              onChange={(e) => setFullTestimony(e.target.value)}
            />
          </div>

          <div className="rounded-sm bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
            <p className="font-bold text-slate-900">
              Privacy & Consent Verification
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={displayPersonName}
                onChange={(e) => setDisplayPersonName(e.target.checked)}
              />
              <span>
                Display person&apos;s name publicly (unchecked shows
                &ldquo;Church Member&rdquo;)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasStoryPermission}
                onChange={(e) => setHasStoryPermission(e.target.checked)}
              />
              <span>
                Confirmed permission to publish this personal testimony
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasMediaPermission}
                onChange={(e) => setHasMediaPermission(e.target.checked)}
              />
              <span>
                Confirmed permission to display accompanying photograph
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span>Feature on Homepage</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
            >
              Approve & Publish
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => handleSave("PENDING")}
            >
              Save as Pending
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
        {["ALL", "PENDING", "PUBLISHED", "ARCHIVED"].map((st) => (
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
                <th className="py-3 px-4">Testimony</th>
                <th className="py-3 px-4">Person & Privacy</th>
                <th className="py-3 px-4">Permissions</th>
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
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900">
                      {item.personName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Public Name:{" "}
                      {item.displayPersonName
                        ? item.personName
                        : "Church Member (Hidden)"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.hasStoryPermission && item.hasMediaPermission
                      ? "Story & Photo Verified"
                      : "Consent Incomplete"}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === "PUBLISHED"
                          ? "success"
                          : item.status === "PENDING"
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
                          title="Approve & Publish"
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
                Testimony Preview: {previewItem.title}
              </h3>
              <button type="button" onClick={() => setPreviewItem(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#EA580C]">
              Public Display Name:{" "}
              {previewItem.displayPersonName
                ? previewItem.personName
                : "Church Member"}{" "}
              &middot; {formatDate(previewItem.publishedAt ?? previewItem.createdAt)}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {previewItem.fullTestimony}
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
              Confirm Testimony Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this testimony?
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


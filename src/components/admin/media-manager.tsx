"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import {
  deleteMediaAction,
  cleanupOrphanedMediaAction,
} from "@/features/media/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export interface MediaItemRow {
  id: string;
  filename: string;
  originalName: string;
  objectKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string;
  folder: string;
  createdAt: Date | string;
}

const FOLDERS = [
  "all",
  "general",
  "hero",
  "church",
  "leadership",
  "services",
  "events",
  "messages",
  "blog",
  "testimonies",
];

export function MediaManager({ initialItems }: { initialItems: MediaItemRow[] }) {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = React.useState("all");
  const [uploadFolder, setUploadFolder] = React.useState("general");
  const [altText, setAltText] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const filteredItems =
    selectedFolder === "all"
      ? initialItems
      : initialItems.filter((item) => item.folder === selectedFolder);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setFeedback({ type: "error", text: "Please choose an image file to upload." });
      return;
    }

    setFeedback(null);
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", uploadFolder);
      formData.append(
        "altText",
        altText.trim() || selectedFile.name.replace(/\.[^.]+$/, "")
      );

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        toast.error(json.error || "Failed to upload image.");
        setFeedback({
          type: "error",
          text: json.error || "Failed to upload media file.",
        });
      } else {
        toast.success("Image uploaded to media library.");
        setFeedback({
          type: "success",
          text: "Media file uploaded and registered in library.",
        });
        setSelectedFile(null);
        setAltText("");
        router.refresh();
      }
    } catch {
      toast.error("Network error while uploading image.");
      setFeedback({
        type: "error",
        text: "Network error while uploading image.",
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string, fileName: string) {
    if (!window.confirm(`Delete "${fileName}" from media library?`)) return;
    setFeedback(null);
    setIsPending(true);
    try {
      const res = await deleteMediaAction(id);
      if (res.success) {
        toast.success(res.message || "Media asset deleted.");
        setFeedback({ type: "success", text: res.message || "Media deleted." });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete media asset.");
        setFeedback({ type: "error", text: res.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleCleanupOrphaned() {
    setFeedback(null);
    setIsPending(true);
    try {
      const res = await cleanupOrphanedMediaAction();
      if (res.success) {
        toast.success(res.message || "Unused media files removed.");
        setFeedback({
          type: "success",
          text: res.message || "Orphaned media cleanup complete.",
        });
        router.refresh();
      } else {
        toast.error(res.error || "Cleanup failed.");
        setFeedback({ type: "error", text: res.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  function handleCopyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    toast.info("Media URL copied to clipboard.");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload, organize, and reuse validated church images (JPEG, PNG, WebP, SVG up to 5MB).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleCleanupOrphaned}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Clean Unused Uploads
        </Button>
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs"
      >
        <h2 className="font-serif text-lg font-bold text-slate-900">
          Upload New Image
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label htmlFor="media-file">Image File (Max 5MB)</Label>
            <Input
              id="media-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="mt-1.5"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Label htmlFor="media-folder">Folder</Label>
            <select
              id="media-folder"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {FOLDERS.filter((f) => f !== "all").map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="media-alt">Alt Text (Accessibility)</Label>
            <Input
              id="media-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Sunday worship congregation"
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isPending || !selectedFile}>
            <Upload className="mr-1.5 h-4 w-4" />
            {isPending ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </form>

      {/* Folder Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {FOLDERS.map((folder) => (
          <button
            key={folder}
            type="button"
            onClick={() => setSelectedFolder(folder)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              selectedFolder === folder
                ? "bg-[#0B1325] text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {folder}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.url}
                alt={item.altText || item.originalName}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge variant="default" className="bg-slate-900/80 text-white">
                  {item.folder}
                </Badge>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <p
                  className="truncate text-sm font-semibold text-slate-900"
                  title={item.originalName}
                >
                  {item.originalName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {item.altText || "No alt text"}
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {(item.sizeBytes / 1024).toFixed(1)} KB · {item.mimeType}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => handleCopyUrl(item.id, item.url)}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy Path
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(item.id, item.originalName)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

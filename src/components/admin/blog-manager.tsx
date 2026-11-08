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
  FolderPlus,
} from "lucide-react";
import {
  createBlogPostAction,
  createCategoryAction,
  deleteBlogPostAction,
  setBlogPostStatusAction,
  updateBlogPostAction,
} from "@/features/blog/actions";
import type { BlogPostListItem } from "@/features/blog/queries";
import { AssetImageSelector } from "@/components/shared/asset-image-selector";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function BlogManager({
  initialPosts,
  categories,
  defaultAuthorName,
}: {
  initialPosts: Array<
    BlogPostListItem & {
      content?: string;
      seoTitle?: string | null;
      seoDescription?: string | null;
    }
  >;
  categories: Array<{ id: string; name: string; slug: string }>;
  defaultAuthorName: string;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<BlogPostListItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [coverImage, setCoverImage] = useState(
    "/assets/blog/abiding-in-the-living-word.jpg"
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [tagsInput, setTagsInput] = useState("Faith, Scripture");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = initialPosts.filter((p) =>
    statusFilter === "ALL" ? true : p.status === statusFilter
  );

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setContent("<p>Write your biblical article here...</p>");
    setCoverImage("/assets/blog/abiding-in-the-living-word.jpg");
    setCategoryId(categories[0]?.id || "");
    setAuthorName(defaultAuthorName);
    setTagsInput("Faith, Scripture");
    setSeoTitle("");
    setSeoDescription("");
    setShowForm(true);
  }

  function openEdit(
    item: BlogPostListItem & {
      content?: string;
      seoTitle?: string | null;
      seoDescription?: string | null;
    }
  ) {
    setEditingId(item.id);
    setTitle(item.title);
    setExcerpt(item.excerpt);
    setContent(item.content || `<p>${item.excerpt}</p>`);
    setCoverImage(item.coverImage);
    setCategoryId(item.categoryId || "");
    setAuthorName(item.authorName);
    setTagsInput(item.tags.map((t) => t.name).join(", "));
    setSeoTitle(item.seoTitle || "");
    setSeoDescription(item.seoDescription || "");
    setShowForm(true);
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setLoading(true);
    setFeedback(null);

    const tagNames = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      excerpt,
      content,
      coverImage,
      categoryId,
      authorName,
      tagNames,
      status,
      seoTitle,
      seoDescription,
    };

    const res = editingId
      ? await updateBlogPostAction(editingId, payload)
      : await createBlogPostAction(payload);

    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Article saved.");
      setFeedback({ type: "success", text: res.message || "Post saved." });
      setShowForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save article.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    const res = await createCategoryAction({
      name: newCategoryName,
      scope: "BLOG",
      description: "",
    });
    setLoading(false);
    if (res.success) {
      setNewCategoryName("");
      toast.success("Category added.");
      setFeedback({ type: "success", text: "Category added." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add category.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  async function handleQuickStatus(
    id: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) {
    setLoading(true);
    const res = await setBlogPostStatusAction(id, status);
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
    const res = await deleteBlogPostAction(id);
    setLoading(false);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Article deleted.");
      setFeedback({ type: "success", text: "Blog post deleted." });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete article.");
      setFeedback({ type: "error", text: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog Management</h1>
          <p className="text-xs text-slate-600">
            Write, preview, publish, and organize church articles, categories,
            tags, and SEO metadata.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Blog Article
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
              {editingId ? "Edit Blog Article" : "Write New Blog Article"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="post-title">Article Title</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Abiding in the Living Word"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-author">Author Name</Label>
              <Input
                id="post-author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="post-cat">Category</Label>
              <select
                id="post-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-tags">Tags (Comma-separated)</Label>
              <Input
                id="post-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Faith, Scripture, Prayer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-img">Cover Image</Label>
            <AssetImageSelector
              id="post-img"
              value={coverImage}
              onChange={setCoverImage}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Article Content (Rich Text)</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-sm bg-slate-50 p-4 border border-slate-200">
            <div className="space-y-1.5">
              <Label htmlFor="post-seo-title">SEO Title (Optional)</Label>
              <Input
                id="post-seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to article title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post-seo-desc">SEO Description (Optional)</Label>
              <Input
                id="post-seo-desc"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Defaults to excerpt"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
            >
              Publish Article
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <form onSubmit={handleAddCategory} className="flex items-center gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name..."
            className="h-8 text-xs w-44"
          />
          <Button type="submit" variant="outline" size="sm" disabled={loading}>
            <FolderPlus className="h-3.5 w-3.5" />
            Add Category
          </Button>
        </form>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
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
                      {item.excerpt}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.categoryName || "General"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.authorName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(item.publishedAt ?? item.createdAt)}
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
                Article Preview: {previewItem.title}
              </h3>
              <button type="button" onClick={() => setPreviewItem(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              By {previewItem.authorName} &middot;{" "}
              {previewItem.categoryName || "General"}
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
              Confirm Article Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this blog post?
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


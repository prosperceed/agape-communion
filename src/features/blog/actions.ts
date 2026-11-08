"use server";

import type { ActionResult, ContentStatus } from "@/types";
import {
  createBlogPost,
  createContentCategory,
  deleteBlogPost,
  updateBlogPost,
  updateBlogPostStatus,
} from "./service";
import type { BlogPostInput, CategoryInput } from "./schemas";

export async function createBlogPostAction(
  input: BlogPostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const created = await createBlogPost(input);
    return {
      success: true,
      data: { id: created.id, slug: created.slug },
      message: "Blog post saved successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create blog post.",
    };
  }
}

export async function updateBlogPostAction(
  id: string,
  input: BlogPostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const updated = await updateBlogPost(id, input);
    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
      message: "Blog post updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update blog post.",
    };
  }
}

export async function setBlogPostStatusAction(
  id: string,
  status: ContentStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateBlogPostStatus(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Blog post status changed to ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status.",
    };
  }
}

export async function deleteBlogPostAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteBlogPost(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Blog post deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete blog post.",
    };
  }
}

export async function createCategoryAction(
  input: CategoryInput
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const created = await createContentCategory(input);
    return {
      success: true,
      data: { id: created.id, name: created.name },
      message: "Category created.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create category.",
    };
  }
}


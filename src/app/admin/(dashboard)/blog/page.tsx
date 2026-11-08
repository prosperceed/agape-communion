import { listAdminPosts, listBlogCategories } from "@/features/blog/queries";
import { getCurrentAdmin } from "@/lib/auth";
import { BlogManager } from "@/components/admin/blog-manager";

export default async function AdminBlogPage() {
  const [posts, categories, admin] = await Promise.all([
    listAdminPosts(),
    listBlogCategories("BLOG"),
    getCurrentAdmin(),
  ]);

  return (
    <BlogManager
      initialPosts={posts}
      categories={categories}
      defaultAuthorName={admin?.name || "Pastor Emmanuel Adeyemi"}
    />
  );
}


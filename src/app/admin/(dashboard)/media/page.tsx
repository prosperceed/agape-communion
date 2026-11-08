import { listMediaLibrary } from "@/features/media/queries";
import { MediaManager } from "@/components/admin/media-manager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const mediaItems = await listMediaLibrary();
  return <MediaManager initialItems={mediaItems} />;
}


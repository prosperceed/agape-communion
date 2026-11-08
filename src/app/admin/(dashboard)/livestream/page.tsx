import { listAdminLivestreams } from "@/features/livestream/queries";
import { LivestreamManager } from "@/components/admin/livestream-manager";

export default async function AdminLivestreamPage() {
  const streams = await listAdminLivestreams();
  return <LivestreamManager initialStreams={streams} />;
}


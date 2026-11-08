import { listAdminEvents } from "@/features/events/queries";
import { EventsManager } from "@/components/admin/events-manager";

export default async function AdminEventsPage() {
  const events = await listAdminEvents();
  return <EventsManager initialEvents={events} />;
}


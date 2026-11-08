import { listAdminMessages } from "@/features/messages/queries";
import { MessagesManager } from "@/components/admin/messages-manager";

export default async function AdminMessagesPage() {
  const messages = await listAdminMessages();
  return <MessagesManager initialMessages={messages} />;
}


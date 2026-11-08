import { listAdminDevotionals } from "@/features/devotionals/queries";
import { getCurrentAdmin } from "@/lib/auth";
import { DevotionalsManager } from "@/components/admin/devotionals-manager";

export default async function AdminDevotionalsPage() {
  const [devotionals, admin] = await Promise.all([
    listAdminDevotionals(),
    getCurrentAdmin(),
  ]);

  return (
    <DevotionalsManager
      initialDevotionals={devotionals}
      defaultAuthorName={admin?.name || "Pastor Emmanuel Adeyemi"}
    />
  );
}


import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth";
import { getAdminChurchSettings } from "@/features/pages/queries";
import { SettingsManager } from "@/components/admin/settings-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  try {
    await requireAdminPermission("MANAGE_SETTINGS");
  } catch {
    redirect("/admin?error=forbidden");
  }

  const churchSettings = await getAdminChurchSettings();
  return <SettingsManager initialSettings={churchSettings} />;
}


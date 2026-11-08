import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth";
import { listAdministrators } from "@/features/users/queries";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let actor;
  try {
    actor = await requireAdminPermission("MANAGE_ADMINS");
  } catch {
    redirect("/admin?error=forbidden");
  }

  const administrators = await listAdministrators();
  return (
    <UsersManager
      initialUsers={administrators}
      currentAdminId={actor.id}
    />
  );
}


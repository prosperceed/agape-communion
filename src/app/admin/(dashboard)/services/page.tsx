import { listAdminServices } from "@/features/services/queries";
import { ServicesManager } from "@/components/admin/services-manager";

export default async function AdminServicesPage() {
  const services = await listAdminServices();
  return <ServicesManager initialServices={services} />;
}


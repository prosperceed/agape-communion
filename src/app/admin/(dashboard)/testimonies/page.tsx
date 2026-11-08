import { listAdminTestimonies } from "@/features/testimonies/queries";
import { TestimoniesManager } from "@/components/admin/testimonies-manager";

export default async function AdminTestimoniesPage() {
  const testimonies = await listAdminTestimonies();
  return <TestimoniesManager initialTestimonies={testimonies} />;
}


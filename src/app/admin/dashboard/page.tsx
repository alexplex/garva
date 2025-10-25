import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminDashboard from "@/components/admin";

export default async function DashboardPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  return <AdminDashboard />;
}

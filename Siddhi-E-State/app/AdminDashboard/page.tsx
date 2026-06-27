import { redirect } from "next/navigation";

export default function AdminDashboardRoot() {
  // Automatically redirect to the first tab
  redirect("/AdminDashboard/property");
}

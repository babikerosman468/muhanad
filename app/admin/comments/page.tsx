import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comment Administration | Muhanad",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCommentsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}

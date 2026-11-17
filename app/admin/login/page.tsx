import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administrator Login | Muhanad",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/comments");
  }

  return <LoginForm />;
}

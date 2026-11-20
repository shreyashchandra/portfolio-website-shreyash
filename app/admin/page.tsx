import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/admin/session";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminApp from "@/components/admin/AdminApp";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="adm adm--center">
        <div className="adm-card adm-login">
          <h1>Admin is off</h1>
          <p className="adm-muted">
            Set <code>ADMIN_PASSWORD</code> (12+ characters) and <code>ADMIN_SESSION_SECRET</code> (32+ characters) to
            enable it.
          </p>
        </div>
      </main>
    );
  }

  return (await isAdmin()) ? <AdminApp /> : <AdminLogin />;
}

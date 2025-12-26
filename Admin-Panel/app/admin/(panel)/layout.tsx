import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

type Props = {
  children: ReactNode;
};

export default async function AdminPanelLayout({
  children,
}: Props) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Admin Panel
            </p>
            <h1 className="text-lg font-semibold text-gray-900">
              Blog Management
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/blog"
              className="text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
            <Link
              href="/admin/settings"
              className="text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}

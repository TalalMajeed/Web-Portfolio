"use client";

export function LogoutButton() {
  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
    >
      Logout
    </button>
  );
}


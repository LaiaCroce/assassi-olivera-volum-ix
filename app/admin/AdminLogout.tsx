"use client";

export default function AdminLogout() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem("admin_id");
        window.location.href = "/admin-login";
      }}
      className="rounded-xl border border-red-900 px-4 py-3 text-sm text-red-500"
    >
      Sortir
    </button>
  );
}
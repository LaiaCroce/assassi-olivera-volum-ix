"use client";

import { useEffect, useState } from "react";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const adminId = localStorage.getItem("admin_id");

    if (!adminId) {
      window.location.href = "/admin-login";
      return;
    }

    setAllowed(true);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-stone-200 flex items-center justify-center">
        Comprovant accés...
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
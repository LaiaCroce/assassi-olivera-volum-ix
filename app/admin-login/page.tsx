"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username.trim())
      .eq("password", password.trim())
      .maybeSingle();

    if (!data) {
      setError("Usuari o contrasenya incorrectes.");
      return;
    }

    localStorage.setItem("admin_id", data.id);
    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 flex items-center justify-center px-6">
      <section className="max-w-md w-full border border-stone-700 rounded-2xl p-8">
        <p className="text-red-700 tracking-[0.25em] text-xs text-center">
          L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
        </p>

        <h1 className="mt-4 text-4xl font-black text-center">
          Accés Admin
        </h1>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Contrasenya"
              className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 pr-12 outline-none focus:border-red-700"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-500 transition"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Contrasenya"
            className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 outline-none focus:border-red-700"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-red-950 border border-red-900 px-6 py-4 font-bold"
          >
            ENTRAR
          </button>
        </form>
      </section>
    </main>
  );
}
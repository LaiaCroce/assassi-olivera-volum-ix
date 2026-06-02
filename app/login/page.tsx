"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [playerCode, setPlayerCode] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("player_code", playerCode.trim().toUpperCase())
      .eq("secret_code", secretCode.trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      setError("ID o codi incorrecte.");
      return;
    }

    localStorage.setItem("player_id", data.id);
    router.push("/jugador");
  }

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 px-6">
      <div className="max-w-5xl mx-auto pt-6 flex justify-end">
        <Link
          href="/"
          className="rounded-xl border border-stone-700 px-4 py-2 text-sm hover:border-red-700 transition"
        >
          ← Inici
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[85vh]">
      <section className="max-w-md w-full border border-stone-700 rounded-2xl p-8">
        <h1 className="text-3xl font-black text-center">ACCÉS NINJA</h1>

        <p className="mt-3 text-center text-stone-400">
          Introdueix el teu ID i codi secret
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            value={playerCode}
            onChange={(e) => setPlayerCode(e.target.value)}
            type="text"
            placeholder="NINJA001"
            className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 outline-none focus:border-red-700"
          />

          <div className="relative">
            <input
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Codi secret"
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-red-950 border border-red-900 px-6 py-4 font-bold hover:bg-red-900 transition"
          >
            ACCEDIR
          </button>
        </form>
      </section>
      </div>
    </main>
  );
}
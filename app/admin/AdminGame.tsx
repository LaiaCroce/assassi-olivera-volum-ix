"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  name: string;
  is_alive: boolean;
};

type Props = {
  players: Player[];
};

export default function AdminGame({ players }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  async function generateChain() {
    const alivePlayers = players.filter((p) => p.is_alive);

    if (alivePlayers.length < 2) {
      setMessage("Calen almenys 2 jugadors vius.");
      return;
    }

    const shuffled = [...alivePlayers].sort(
      () => Math.random() - 0.5
    );

    for (let i = 0; i < shuffled.length; i++) {
      const current = shuffled[i];
      const next = shuffled[(i + 1) % shuffled.length];

      await supabase
        .from("players")
        .update({
          current_target_id: next.id,
        })
        .eq("id", current.id);
    }

    setMessage("Cadena generada correctament.");
    setShowConfirm(false);
  }

  return (
    <>
      <div className="border border-stone-700 rounded-2xl p-6">
        <h2 className="text-2xl font-black">
          ⚙️ Partida
        </h2>

        <p className="mt-2 text-stone-500">
          {players.filter((p) => p.is_alive).length} jugadors vius
        </p>

        <button
          onClick={() => setShowConfirm(true)}
          className="mt-6 w-full rounded-xl bg-red-950 border border-red-900 px-6 py-4 font-bold"
        >
          GENERAR CADENA
        </button>

        {message && (
          <p className="mt-4 text-sm text-stone-400">
            {message}
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-4 border border-red-900 bg-[#090909] rounded-2xl p-6">

            <h3 className="text-2xl font-black text-red-500">
              ⚠️ Confirmar generació
            </h3>

            <p className="mt-4 text-stone-300">
              Aquesta acció substituirà tots els objectius actuals.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-stone-700 py-3"
              >
                CANCEL·LAR
              </button>

              <button
                onClick={generateChain}
                className="flex-1 rounded-xl bg-red-950 border border-red-900 py-3 font-bold"
              >
                GENERAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
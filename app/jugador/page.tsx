"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Target = {
  id: string;
  name: string;
  player_code: string;
};

type Player = {
  id: string;
  name: string;
  player_code: string;
  is_alive: boolean;
  current_target_id: string | null;
};

export default function PlayerPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [rule, setRule] = useState("");
  const [message, setMessage] = useState("");
  const [loadingKill, setLoadingKill] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    async function loadData() {
      const playerId = localStorage.getItem("player_id");

      if (!playerId) {
        window.location.href = "/login";
        return;
      }

      const { data: playerData } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .maybeSingle();

      if (!playerData) {
        window.location.href = "/login";
        return;
      }

      setPlayer(playerData);

      if (playerData.current_target_id) {
        const { data: targetData } = await supabase
          .from("players")
          .select("id, name, player_code")
          .eq("id", playerData.current_target_id)
          .maybeSingle();

        setTarget(targetData);
      }

      const { data: ruleData } = await supabase
        .from("rules")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      setRule(ruleData?.text ?? "Sense consigna activa");
    }

    loadData();
  }, []);

  async function reportKill() {
    if (!player || !target) return;

    setLoadingKill(true);
    setMessage("");

    const { error } = await supabase.from("kills").insert({
      killer_id: player.id,
      victim_id: target.id,
      status: "pending",
    });

    if (error) {
      setMessage("No s'ha pogut registrar l'eliminació.");
      setLoadingKill(false);
      return;
    }

    setMessage("Eliminació reportada. Esperant confirmació de la víctima.");
    setLoadingKill(false);
  }

  if (!player) {
    return (
      <main className="min-h-screen bg-black text-stone-200 flex items-center justify-center">
        Carregant...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10">
      <section className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <p className="text-red-700 tracking-[0.4em] text-sm">VOLUM IX</p>
          <h1 className="mt-4 text-4xl font-black">
            Benvinguda, {player.name}
          </h1>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">ESTAT</p>
          <p className="text-3xl font-black mt-2">
            {player.is_alive ? "VIU" : "ELIMINAT"}
          </p>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">OBJECTIU ACTUAL</p>
          <p className="text-3xl font-black mt-2">
            {target ? target.name : "Encara no assignat"}
          </p>
          {target && <p className="mt-2 text-stone-500">{target.player_code}</p>}
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">PROTECCIÓ ACTIVA</p>
          <p className="text-xl mt-2 text-red-600">{rule}</p>
        </div>

        {!showConfirmation ? (
  <button
    onClick={() => setShowConfirmation(true)}
    disabled={!target || !player.is_alive}
    className="w-full rounded-xl bg-red-950 border border-red-900 px-6 py-4 font-bold disabled:opacity-40"
  >
    HE ELIMINAT EL MEU OBJECTIU
  </button>
) : (
  <div className="space-y-4">
    <div className="border border-red-900 rounded-xl p-4 text-center">
      <p className="text-red-500 font-bold">
        ⚠️ Confirma l'eliminació
      </p>

      <p className="mt-2 text-stone-400 text-sm">
        Aquesta acció enviarà una notificació a la víctima perquè confirmi la seva eliminació.
      </p>
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => setShowConfirmation(false)}
        className="flex-1 rounded-xl border border-stone-700 py-3"
      >
        CANCEL·LAR
      </button>

      <button
        onClick={reportKill}
        className="flex-1 rounded-xl bg-red-950 border border-red-900 py-3 font-bold"
      >
        CONFIRMAR
      </button>
    </div>
  </div>
)}

        {message && (
          <p className="text-center text-sm text-stone-400">{message}</p>
        )}
      </section>
    </main>
  );
}
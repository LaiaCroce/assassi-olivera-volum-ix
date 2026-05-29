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

type PendingKill = {
  id: string;
  killer_id: string;
  victim_id: string;
  status: string;
};

export default function PlayerPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [rule, setRule] = useState("");
  const [message, setMessage] = useState("");
  const [loadingKill, setLoadingKill] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingKill, setPendingKill] = useState<PendingKill | null>(null);

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

      const { data: pendingKillData } = await supabase
        .from("kills")
        .select("*")
        .eq("victim_id", playerData.id)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();

      setPendingKill(pendingKillData);

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

    setShowConfirmation(false);
    setMessage("Eliminació reportada. Esperant confirmació de la víctima.");
    setLoadingKill(false);
  }

  async function confirmDeath() {
  if (!player || !pendingKill) return;

  setMessage("");

  const { data: victimData } = await supabase
    .from("players")
    .select("current_target_id")
    .eq("id", player.id)
    .maybeSingle();

  const { error: killError } = await supabase
    .from("kills")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", pendingKill.id);

  if (killError) {
    setMessage("No s'ha pogut confirmar l'eliminació.");
    return;
  }

  const { error: victimError } = await supabase
    .from("players")
    .update({
      is_alive: false,
    })
    .eq("id", player.id);

  if (victimError) {
    setMessage("S'ha confirmat la mort, però no s'ha pogut actualitzar la víctima.");
    return;
  }

  const { error: killerError } = await supabase
    .from("players")
    .update({
      current_target_id: victimData?.current_target_id,
    })
    .eq("id", pendingKill.killer_id);

  if (killerError) {
    setMessage("La víctima ha mort, però no s'ha pogut actualitzar el nou objectiu.");
    return;
  }

  setPendingKill(null);
  setPlayer({
    ...player,
    is_alive: false,
  });

  setMessage("Has confirmat la teva eliminació.");
}

  async function rejectDeath() {
    if (!pendingKill) return;

    setMessage("");

    const { error } = await supabase
      .from("kills")
      .update({
        status: "rejected",
      })
      .eq("id", pendingKill.id);

    if (error) {
      setMessage("No s'ha pogut rebutjar l'eliminació.");
      return;
    }

    setPendingKill(null);
    setMessage("Has rebutjat l'eliminació. Els admins ho revisaran.");
  }

  if (!player) {
    return (
      <main className="min-h-screen bg-black text-stone-200 flex items-center justify-center">
        Carregant...
      </main>
    );
  }

  if (pendingKill && player.is_alive) {
    return (
      <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10 flex items-center justify-center">
        <section className="max-w-md w-full space-y-6 text-center">
          <p className="text-red-700 tracking-[0.4em] text-sm">
            L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
          </p>

          <div className="border border-red-900 rounded-2xl p-8">
            <h1 className="text-4xl font-black text-red-600">
              ELIMINACIÓ REPORTADA
            </h1>

            <p className="mt-6 text-stone-400">
              Un membre del Clan afirma haver-te eliminat.
            </p>

            <p className="mt-2 text-stone-400">
              Confirmes la teva caiguda?
            </p>
          </div>

          <button
            onClick={confirmDeath}
            className="w-full rounded-xl bg-red-950 border border-red-900 px-6 py-4 font-bold"
          >
            HE CAIGUT
          </button>

          <button
            onClick={rejectDeath}
            className="w-full rounded-xl border border-stone-700 px-6 py-4 font-bold"
          >
            NO ÉS CORRECTE
          </button>

          {message && (
            <p className="text-center text-sm text-stone-400">{message}</p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10">
      <section className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <p className="text-red-700 tracking-[0.25em] text-xs">
            L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Benvinguda, {player.name}
          </h1>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">ESTAT</p>
          <p className="text-3xl font-black mt-2">
            {player.is_alive ? "VIU" : "MORT"}
          </p>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">OBJECTIU ACTUAL</p>
          <p className="text-3xl font-black mt-2">
            {target ? target.name : "Encara no assignat"}
          </p>

          {target && (
            <p className="mt-2 text-stone-500">{target.player_code}</p>
          )}
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
                ⚠️ Confirma l&apos;eliminació
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
                disabled={loadingKill}
                className="flex-1 rounded-xl bg-red-950 border border-red-900 py-3 font-bold disabled:opacity-40"
              >
                {loadingKill ? "ENVIANT..." : "CONFIRMAR"}
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
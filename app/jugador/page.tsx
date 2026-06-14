"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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

type KillHistoryItem = {
  id: string;
  victim_id: string;
  victim_name: string;
  victim_code: string;
};

export default function PlayerPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [rule, setRule] = useState("");
  const [message, setMessage] = useState("");
  const [loadingKill, setLoadingKill] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingKill, setPendingKill] = useState<PendingKill | null>(null);
  const [killCount, setKillCount] = useState(0);
  const [killHistory, setKillHistory] = useState<KillHistoryItem[]>([]);
  const [showTarget, setShowTarget] = useState(false);
  const [currentSecret, setCurrentSecret] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showCurrentSecret, setShowCurrentSecret] = useState(false);
  const [showNewSecret, setShowNewSecret] = useState(false);
  const [showConfirmSecret, setShowConfirmSecret] = useState(false);

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

      const { count } = await supabase
        .from("kills")
        .select("*", { count: "exact", head: true })
        .eq("killer_id", playerData.id)
        .eq("status", "confirmed");

      setKillCount(count ?? 0);

      const { data: killHistoryData } = await supabase
        .from("kills")
        .select("id, victim_id")
        .eq("killer_id", playerData.id)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      const victimIds = killHistoryData?.map((kill) => kill.victim_id) ?? [];

      const { data: victimsData } = await supabase
        .from("players")
        .select("id, name, player_code")
        .in("id", victimIds);

      const history =
        killHistoryData?.map((kill) => {
          const victim = victimsData?.find((p) => p.id === kill.victim_id);

          return {
            id: kill.id,
            victim_id: kill.victim_id,
            victim_name: victim?.name ?? "Jugador eliminat",
            victim_code: victim?.player_code ?? "",
          };
        }) ?? [];

      setKillHistory(history);

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
      .update({ is_alive: false })
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
    setPlayer({ ...player, is_alive: false });
    setMessage("Has confirmat la teva eliminació.");
  }

  async function rejectDeath() {
    if (!pendingKill) return;

    setMessage("");

    const { error } = await supabase
      .from("kills")
      .update({ status: "rejected" })
      .eq("id", pendingKill.id);

    if (error) {
      setMessage("No s'ha pogut rebutjar l'eliminació.");
      return;
    }

    setPendingKill(null);
    setMessage("Has rebutjat l'eliminació. Els admins ho revisaran.");
  }

  async function changeSecret(e: React.FormEvent) {
    e.preventDefault();

    if (!player) return;

    setPasswordMessage("");

    if (!currentSecret || !newSecret || !confirmSecret) {
      setPasswordMessage("Completa tots els camps.");
      return;
    }

    if (newSecret !== confirmSecret) {
      setPasswordMessage("El nou codi i la confirmació no coincideixen.");
      return;
    }

    setChangingPassword(true);

    const { data: playerData, error: selectError } = await supabase
      .from("players")
      .select("secret_code")
      .eq("id", player.id)
      .maybeSingle();

    if (selectError || !playerData) {
      setPasswordMessage("No s'ha pogut verificar el jugador.");
      setChangingPassword(false);
      return;
    }

    if (playerData.secret_code !== currentSecret) {
      setPasswordMessage("Codi actual incorrecte.");
      setChangingPassword(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("players")
      .update({ secret_code: newSecret })
      .eq("id", player.id);

    if (updateError) {
      setPasswordMessage("No s'ha pogut actualitzar el codi.");
      setChangingPassword(false);
      return;
    }

    setPasswordMessage("Codi actualitzat correctament.");
    setCurrentSecret("");
    setNewSecret("");
    setConfirmSecret("");
    setChangingPassword(false);
    setShowChangeModal(false);
  }

  if (!player) {
    return (
      <main className="min-h-screen bg-black text-stone-200 flex items-center justify-center">
        Carregant...
      </main>
    );
  }

  if (!player.is_alive) {
    return (
      <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10 flex items-center justify-center">
        <section className="max-w-md w-full space-y-6 text-center">
          <p className="text-red-700 tracking-[0.25em] text-xs">
            L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
          </p>

          <div className="border border-red-900 rounded-2xl p-8">
            <h1 className="text-5xl font-black text-red-600">HAS CAIGUT</h1>

            <p className="mt-6 text-stone-400">La teva missió ha acabat.</p>
            <p className="mt-2 text-stone-400">Però la teva llegenda continua.</p>
          </div>

          <div className="border border-stone-700 rounded-2xl p-6 text-left">
            <p className="text-stone-500">⚔️ ELIMINACIONS</p>
            <p className="text-4xl font-black mt-2 text-red-600">{killCount}</p>
          </div>

          <p className="text-sm text-stone-500">
            Encara pots participar a La Darrera Crònica i Ull de Falcó.
          </p>
        </section>
      </main>
    );
  }

  if (pendingKill) {
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
       <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-red-700 tracking-[0.25em] text-xs">
            L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Hola Ninja, {player.name}
          </h1>
        </div>

        {/* change code button moved to header; modal contains the form */}

        <div className="flex gap-2">
          <button
            onClick={() => setShowChangeModal(true)}
            className="rounded-xl border border-stone-700 px-3 py-2 text-xs text-stone-300"
          >
            Canvi de codi
          </button>
          
          <Link
            href="/partida"
            className="rounded-xl border border-stone-700 px-3 py-2 text-xs text-stone-300"
          >
            Historial del joc
          </Link>

          <Link
            href="/checkpoint"
            className="rounded-xl border border-stone-700 px-3 py-2 text-xs text-stone-300"
          >
            Checkpoint
          </Link>
          
          <button
            onClick={() => {
              localStorage.removeItem("player_id");
              window.location.href = "/ ";
            }}
            className="rounded-xl border border-red-900 px-3 py-2 text-xs text-red-500"
          >
            Sortir
          </button>
        </div>
      </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">🥷 ESTAT</p>
          <p className="text-3xl font-black mt-2">VIU</p>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-stone-500">🎯 OBJECTIU ACTUAL</p>

            <button
              onClick={() => setShowTarget(!showTarget)}
              className="text-sm text-red-600 font-bold"
            >
              {showTarget ? "AMAGAR" : "VEURE"}
            </button>
          </div>

          <p className="text-5xl font-black mt-4">
            {showTarget
              ? target
                ? target.name
                : "La partida encara no ha començat"
              : "••••••••"}
          </p>

          {target && showTarget && (
            <p className="mt-2 text-stone-500">{target.player_code}</p>
          )}

          {!target && showTarget && (
            <p className="mt-2 text-stone-500">
              L&apos;organització assignarà els objectius abans de començar.
            </p>
          )}
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">🛡️ PROTECCIÓ ACTIVA</p>
          <p className="text-xl mt-2 text-red-600">{rule}</p>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">⚔️ RECOMPTE DE MORTS</p>
          <p className="text-3xl font-black mt-2 text-red-600">{killCount}</p>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">📜 HISTORIAL DE MORTS</p>

          {killHistory.length === 0 ? (
            <p className="mt-2 text-stone-500">
              Encara no has eliminat ningú.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {killHistory.map((kill) => (
                <div
                  key={kill.id}
                  className="flex justify-between border-b border-stone-800 pb-2"
                >
                  <span>{kill.victim_name}</span>
                  <span className="text-stone-500">
                    {kill.victim_code}
                  </span>
                </div>
              ))}
            </div>
          )}
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
        {showChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowChangeModal(false)}
            />

            <div className="relative z-10 w-full max-w-md mx-4">
              <div className="bg-[#0b0b0b] border border-stone-700 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Canvi de codi secret</h2>
                  <button
                    onClick={() => setShowChangeModal(false)}
                    className="text-stone-400"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={changeSecret} className="mt-4 space-y-3">
                  <div className="relative">
                    <input
                      value={currentSecret}
                      onChange={(e) => setCurrentSecret(e.target.value)}
                      type={showCurrentSecret ? "text" : "password"}
                      placeholder="Codi actual"
                      className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 pr-12 outline-none focus:border-red-700"
                    />

                    <button
                      type="button"
                      onClick={() => setShowCurrentSecret(!showCurrentSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      {showCurrentSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                      type={showNewSecret ? "text" : "password"}
                      placeholder="Nou codi secret"
                      className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 pr-12 outline-none focus:border-red-700"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewSecret(!showNewSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      {showNewSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      value={confirmSecret}
                      onChange={(e) => setConfirmSecret(e.target.value)}
                      type={showConfirmSecret ? "text" : "password"}
                      placeholder="Confirma nou codi"
                      className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 pr-12 outline-none focus:border-red-700"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmSecret(!showConfirmSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      {showConfirmSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {passwordMessage && (
                    <p className="text-center text-sm text-stone-400">{passwordMessage}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowChangeModal(false)}
                      className="flex-1 rounded-xl border border-stone-700 py-3"
                    >
                      Cancel·lar
                    </button>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1 rounded-xl bg-red-950 border border-red-900 py-3 font-bold disabled:opacity-40"
                    >
                      {changingPassword ? "CANVIANT..." : "CANVIAR CODI"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
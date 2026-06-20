import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Player = {
  id: string;
  name: string;
  player_code: string;
  is_alive: boolean;
};

type Kill = {
  id: string;
  status: string;
  created_at: string;
  killer_id: string;
  victim_id: string;
};

export default async function GameHistoryPage() {
  const { data: players } = await supabase
    .from("players")
    .select("id, name, player_code, is_alive")
    .order("player_code", { ascending: true });

  const { data: kills } = await supabase
    .from("kills")
    .select("id, status, created_at, killer_id, victim_id")
    .order("created_at", { ascending: false });

  const safePlayers = (players ?? []) as Player[];
  const safeKills = (kills ?? []) as Kill[];

  const totalPlayers = safePlayers.length;
  const aliveCount = safePlayers.filter((player) => player.is_alive).length;
  const deadCount = totalPlayers - aliveCount;

  const alivePercentage =
    totalPlayers > 0 ? Math.round((aliveCount / totalPlayers) * 100) : 0;

  const confirmedKills = safeKills.filter(
    (kill) => kill.status === "confirmed"
  );

  const ranking = safePlayers
    .map((player) => {
      const count = confirmedKills.filter(
        (kill) => kill.killer_id === player.id
      ).length;

      return {
        ...player,
        kills: count,
      };
    })
    .filter((player) => player.kills > 0)
    .sort((a, b) => b.kills - a.kills);

  function getPlayer(id: string) {
    return safePlayers.find((player) => player.id === id);
  }

  function getMedal(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  }

  function getStatusLabel(status: string) {
    if (status === "confirmed") return "Confirmada";
    if (status === "pending") return "Pendent";
    if (status === "rejected") return "Rebutjada";
    return status;
  }

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10">
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-red-700 tracking-[0.25em] text-xs">
              L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
            </p>
            <h1 className="mt-4 text-5xl font-black">
              Historial 
            </h1>
          </div>

          <Link
            href="/jugador"
            className="rounded-xl border border-stone-700 px-4 py-3 text-sm"
          >
            Tornar
          </Link>
        </div>

        <div className="border border-red-900/70 rounded-3xl p-6 bg-black/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-red-700 tracking-[0.25em] text-xs">
                ESTAT DE LA PARTIDA
              </p>
              <h2 className="text-3xl font-black mt-2">Supervivents</h2>
            </div>

            <p className="text-5xl font-black text-red-600">
              {aliveCount}/{totalPlayers}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-stone-800 p-4">
              <p className="text-stone-500 text-sm">Totals</p>
              <p className="text-3xl font-black">{totalPlayers}</p>
            </div>

            <div className="rounded-2xl border border-stone-800 p-4">
              <p className="text-stone-500 text-sm">Vius</p>
              <p className="text-3xl font-black">{aliveCount}</p>
            </div>

            <div className="rounded-2xl border border-stone-800 p-4">
              <p className="text-stone-500 text-sm">Morts</p>
              <p className="text-3xl font-black text-red-600">{deadCount}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-stone-400 mb-2">
              <span>Supervivència</span>
              <span>{alivePercentage}%</span>
            </div>

            <div className="h-4 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-red-700"
                style={{ width: `${alivePercentage}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-stone-500">
              {totalPlayers === 0
                ? "Encara no hi ha jugadors carregats."
                : `${aliveCount} de ${totalPlayers} jugadors continuen vius.`}
            </p>
          </div>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <h2 className="text-2xl font-black mb-4">🏆 Rànquing</h2>

          {ranking.length === 0 ? (
            <p className="text-stone-500">
              Encara no hi ha cap eliminació confirmada.
            </p>
          ) : (
            <div className="space-y-3">
              {ranking.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between border-b border-stone-900 pb-3"
                >
                  <div>
                    <p className="font-bold">
                      <span className="mr-2">{getMedal(index)}</span>
                      {player.player_code}
                    </p>
                  </div>

                  <p className="text-red-600 font-black text-2xl">
                    ⚔️ {player.kills}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <h2 className="text-2xl font-black mb-4"> 💀 Morts</h2>

          {safeKills.length === 0 ? (
            <p className="text-stone-500">
              Encara no hi ha cap mort registrada.
            </p>
          ) : (
            <div className="space-y-4">
              {safeKills.map((kill) => {
                const killer = getPlayer(kill.killer_id);
                const victim = getPlayer(kill.victim_id);
                const isAdminKill = kill.killer_id === "organitzadors" || kill.killer_id === "admin";

                return (
                  <div
                    key={kill.id}
                    className="border border-stone-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black">
                          {isAdminKill ? "Organitzadors" : killer?.player_code ?? "?"}
                        </p>

                        <p className="text-stone-500 text-sm">↓</p>

                        <p className="text-lg font-black text-red-600">
                          {victim?.name ?? "?"}
                        </p>

                        {isAdminKill && (
                          <p className="text-xs text-stone-500 mt-2">Mort pels organitzadors</p>
                        )}
                      </div>

                      <span className="text-sm font-bold text-stone-400">
                        {getStatusLabel(kill.status)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mt-4">
                      {new Date(kill.created_at).toLocaleString("ca-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Madrid",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
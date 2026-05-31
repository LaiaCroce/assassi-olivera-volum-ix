import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  name: string;
  player_code: string;
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
    .select("id, name, player_code")
    .order("player_code", { ascending: true });

  const { data: kills } = await supabase
    .from("kills")
    .select("id, status, created_at, killer_id, victim_id")
    .order("created_at", { ascending: false });

  const safePlayers = (players ?? []) as Player[];
  const safeKills = (kills ?? []) as Kill[];

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
              Historial de partida
            </h1>
          </div>

          <Link
            href="/jugador"
            className="rounded-xl border border-stone-700 px-4 py-3 text-sm"
          >
            Tornar
          </Link>
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
                      {player.name}
                    </p>
                    <p className="text-xs text-stone-500">
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
          <h2 className="text-2xl font-black mb-4">📜 Historial de morts</h2>

          {safeKills.length === 0 ? (
            <p className="text-stone-500">
              Encara no hi ha cap mort registrada.
            </p>
          ) : (
            <div className="space-y-4">
              {safeKills.map((kill) => {
                const killer = getPlayer(kill.killer_id);
                const victim = getPlayer(kill.victim_id);

                return (
                  <div
                    key={kill.id}
                    className="border border-stone-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black">
                          {killer?.name ?? "?"}
                        </p>
                        <p className="text-stone-500 text-sm">↓</p>
                        <p className="text-lg font-black text-red-600">
                          {victim?.name ?? "?"}
                        </p>
                      </div>

                      <span className="text-sm font-bold text-stone-400">
                        {getStatusLabel(kill.status)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mt-4">
                      {new Date(kill.created_at).toLocaleString("ca-ES")}
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
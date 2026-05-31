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

export default async function HomePage() {
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
  const aliveCount = safePlayers.filter((p) => p.is_alive).length;
  const deadCount = totalPlayers - aliveCount;

  const confirmedKills = safeKills.filter((k) => k.status === "confirmed");

  const alivePercentage =
    totalPlayers > 0 ? Math.round((aliveCount / totalPlayers) * 100) : 0;

  const ranking = safePlayers
    .map((player) => ({
      ...player,
      kills: confirmedKills.filter((kill) => kill.killer_id === player.id)
        .length,
    }))
    .filter((player) => player.kills > 0)
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 5);

  function getPlayer(id: string) {
    return safePlayers.find((player) => player.id === id);
  }

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-8">
      <section className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-red-700 tracking-[0.35em] text-xs">
              VOL. IX
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black">
              L&apos;ASSASSÍ
              <br />
              DE L&apos;OLIVERA
            </h1>

            <p className="mt-4 text-stone-500">
              Evolució pública de la partida
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-xl bg-red-950 border border-red-900 px-5 py-3 text-sm font-bold"
          >
            Login jugadors
          </Link>
        </header>

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
              <p className="text-3xl font-black text-red-600">
                {deadCount}
              </p>
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="flex justify-between border-b border-stone-900 pb-3"
                  >
                    <span className="font-bold">
                      {index + 1}. {player.player_code}
                    </span>

                    <span className="text-red-600 font-black">
                      ⚔️ {player.kills}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/partida"
              className="mt-5 inline-block text-sm text-red-600 font-bold"
            >
              Veure historial complet →
            </Link>
          </div>

          <div className="border border-stone-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black mb-4">💀 Últimes morts</h2>

            {confirmedKills.length === 0 ? (
              <p className="text-stone-500">
                Encara no hi ha cap mort confirmada.
              </p>
            ) : (
              <div className="space-y-3">
                {confirmedKills.slice(0, 5).map((kill) => {
                  const killer = getPlayer(kill.killer_id);
                  const victim = getPlayer(kill.victim_id);

                  return (
                    <div
                      key={kill.id}
                      className="border-b border-stone-900 pb-3"
                    >
                      <p>
                        <span className="font-bold">
                          {killer?.player_code ?? "?"}
                        </span>{" "}
                        →{" "}
                        <span className="font-bold text-red-600">
                          {victim?.name ?? "?"}
                        </span>
                      </p>

                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(kill.created_at).toLocaleString("ca-ES")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
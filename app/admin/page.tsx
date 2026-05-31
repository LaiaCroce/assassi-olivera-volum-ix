import { supabase } from "@/lib/supabase";
import AdminRules from "./AdminRules";
import AdminPlayers from "./AdminPlayers";
import AdminGuard from "./AdminGuard";
import AdminGame from "./AdminGame";
import AdminChain from "./AdminChain";
import AdminLogout from "./AdminLogout";

type Player = {
  id: string;
  name: string;
  player_code: string;
  is_alive: boolean;
  has_paid: boolean;
  current_target_id: string | null;
};

type Kill = {
  id: string;
  status: string;
  created_at: string;
  killer_id: string;
  victim_id: string;
};

export default async function AdminPage() {
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("player_code", { ascending: true });

  const { data: kills } = await supabase
    .from("kills")
    .select("id, status, created_at, killer_id, victim_id")
    .order("created_at", { ascending: false });

    const { data: activeRule } = await supabase
        .from("rules")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

  const aliveCount = players?.filter((p) => p.is_alive).length ?? 0;
  const deadCount = players?.filter((p) => !p.is_alive).length ?? 0;
  const pendingKills = kills?.filter((k) => k.status === "pending").length ?? 0;

  const totalPlayers = players?.length ?? 0;
  const paidCount = players?.filter((p) => p.has_paid).length ?? 0;
  const unpaidCount = totalPlayers - paidCount;
  const confirmedKills =
    kills?.filter((k) => k.status === "confirmed").length ?? 0;

  const alivePercentage =
    totalPlayers > 0 ? Math.round((aliveCount / totalPlayers) * 100) : 0;

  const paidPercentage =
    totalPlayers > 0 ? Math.round((paidCount / totalPlayers) * 100) : 0;

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10">
        <section className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-red-700 tracking-[0.25em] text-xs">
                  L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
                </p>
                <h1 className="mt-4 text-5xl font-black">Panell Admin</h1>
              </div>

              <div className="flex gap-2">
                <AdminChain
                  players={
                    players?.map((p) => ({
                      id: p.id,
                      name: p.name,
                      player_code: p.player_code,
                      current_target_id: p.current_target_id,
                    })) ?? []
                  }
                />
                <AdminLogout />
              </div>
            </div>
            <div className="mt-8 border border-red-900/70 rounded-3xl p-6 bg-black/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-red-700 tracking-[0.25em] text-xs">
                    CONTROL DE PARTIDA
                  </p>
                  <h2 className="text-3xl font-black mt-2">Resum ràpid</h2>
                </div>

                <p className="text-5xl font-black text-red-600">
                  {aliveCount}/{totalPlayers}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

                <div className="rounded-2xl border border-stone-800 p-4">
                  <p className="text-stone-500 text-sm">Pagats</p>
                  <p className="text-3xl font-black">{paidCount}</p>
                </div>

                <div className="rounded-2xl border border-stone-800 p-4">
                  <p className="text-stone-500 text-sm">No pagats</p>
                  <p className="text-3xl font-black">{unpaidCount}</p>
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
                  {aliveCount} de {totalPlayers} jugadors continuen vius.
                </p>
              </div>
            </div>
          </div>
  
          <AdminRules currentRule={activeRule?.text ?? ""} />
          <AdminGame
            players={
              players?.map((p) => ({
                id: p.id,
                name: p.name,
                is_alive: p.is_alive,
              })) ?? []
            }
          />
          <AdminPlayers initialPlayers={players ?? []} />


          <div className="border border-stone-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black mb-4">Eliminacions</h2>

            <div className="space-y-3">
              {kills?.length === 0 && (
                <p className="text-stone-500">Encara no hi ha eliminacions.</p>
              )}

              {kills?.map((kill: Kill) => {
                const killer = players?.find((p: Player) => p.id === kill.killer_id);
                const victim = players?.find((p: Player) => p.id === kill.victim_id);

                return (
                <div
                  key={kill.id}
                  className="flex justify-between gap-4 border-b border-stone-900 pb-3"
                >
                  <div>
                    <p>
                      <span className="font-bold">
                        {killer?.name ?? "?"}
                      </span>{" "}
                      →{" "}
                      <span className="font-bold">
                        {victim?.name ?? "?"}
                      </span>
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(kill.created_at).toLocaleString("ca-ES")}
                    </p>
                  </div>

                  <span className="text-red-600 font-bold">
                    {kill.status}
                  </span>
                </div>
              );
            })}
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
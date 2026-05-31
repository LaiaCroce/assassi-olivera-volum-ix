import { supabase } from "@/lib/supabase";
import AdminRules from "./AdminRules";
import AdminPlayers from "./AdminPlayers";
import AdminGuard from "./AdminGuard";

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
  killer: {
    name: string;
    player_code: string;
  }[] | null;
  victim: {
    name: string;
    player_code: string;
  }[] | null;
};

export default async function AdminPage() {
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("player_code", { ascending: true });

  const { data: kills } = await supabase
    .from("kills")
    .select(`
      id,
      status,
      created_at,
      killer:killer_id (
        name,
        player_code
      ),
      victim:victim_id (
        name,
        player_code
      )
    `)
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

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10">
        <section className="max-w-5xl mx-auto space-y-8">
          <div>
            <p className="text-red-700 tracking-[0.25em] text-xs">
              L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
            </p>
            <h1 className="mt-4 text-5xl font-black">Panell Admin</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-stone-700 rounded-2xl p-6">
              <p className="text-stone-500">🥷 VIUS</p>
              <p className="text-4xl font-black mt-2 text-red-600">
                {aliveCount}
              </p>
            </div>

            <div className="border border-stone-700 rounded-2xl p-6">
              <p className="text-stone-500">☠️ MORTS</p>
              <p className="text-4xl font-black mt-2 text-red-600">
                {deadCount}
              </p>
            </div>

            <div className="border border-stone-700 rounded-2xl p-6">
              <p className="text-stone-500">⚠️ PENDENTS</p>
              <p className="text-4xl font-black mt-2 text-red-600">
                {pendingKills}
              </p>
            </div>
          </div>
          
          <AdminRules currentRule={activeRule?.text ?? ""} />

          <AdminPlayers initialPlayers={players ?? []} />


          <div className="border border-stone-700 rounded-2xl p-6">
            <h2 className="text-2xl font-black mb-4">Eliminacions</h2>

            <div className="space-y-3">
              {kills?.length === 0 && (
                <p className="text-stone-500">Encara no hi ha eliminacions.</p>
              )}

              {kills?.map((kill: Kill) => (
                <div
                  key={kill.id}
                  className="flex justify-between gap-4 border-b border-stone-900 pb-3"
                >
                  <div>
                    <p>
                      <span className="font-bold">
                        {kill.killer?.[0]?.name ?? "?"}
                      </span>{" "}
                      →{" "}
                      <span className="font-bold">
                        {kill.victim?.[0]?.name ?? "?"}
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
              ))}
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
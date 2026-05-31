import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Player = {
  id: string;
  name: string;
  player_code: string;
};

type Checkpoint = {
  id: string;
  player_id: string;
  checkpoint_date: string;
};

export default async function CheckpointPage() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: players } = await supabase
    .from("players")
    .select("id, name, player_code")
    .order("name", { ascending: true });

  const { data: checkpoints } = await supabase
    .from("checkpoints")
    .select("id, player_id, checkpoint_date")
    .eq("checkpoint_date", today);

  const safePlayers = (players ?? []) as Player[];
  const safeCheckpoints = (checkpoints ?? []) as Checkpoint[];

  const confirmedPlayers = safeCheckpoints
    .map((checkpoint) =>
      safePlayers.find((player) => player.id === checkpoint.player_id)
    )
    .filter(Boolean) as Player[];

  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 px-6 py-10">
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-red-700 tracking-[0.25em] text-xs">
              L&apos;ASSASSÍ DE L&apos;OLIVERA VOL.IX
            </p>

            <h1 className="mt-4 text-5xl font-black">
              Checkpoint
            </h1>

            <p className="mt-3 text-stone-500">
              Jugadors confirmats avui
            </p>
          </div>

          <Link
            href="/jugador"
            className="rounded-xl border border-stone-700 px-4 py-3 text-sm"
          >
            Tornar
          </Link>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <p className="text-stone-500">Confirmats</p>
          <p className="text-5xl font-black mt-2 text-red-600">
            {confirmedPlayers.length}
          </p>
        </div>

        <div className="border border-stone-700 rounded-2xl p-6">
          <h2 className="text-2xl font-black mb-4">
            🥷 Han passat pel checkpoint
          </h2>

          {confirmedPlayers.length === 0 ? (
            <p className="text-stone-500">
              Encara no hi ha cap jugador confirmat.
            </p>
          ) : (
            <div className="space-y-3">
              {confirmedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex justify-between border-b border-stone-900 pb-3"
                >
                  <span className="font-bold">
                    {player.player_code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
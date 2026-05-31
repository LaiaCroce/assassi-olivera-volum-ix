"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  name: string;
  player_code: string;
  is_alive: boolean;
};

type Checkpoint = {
  id: string;
  player_id: string;
  checkpoint_date: string;
};

type Props = {
  players: Player[];
  initialCheckpoints: Checkpoint[];
};

export default function AdminCheckpoint({
  players,
  initialCheckpoints,
}: Props) {
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints);
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const filteredPlayers = players.filter((player) => {
    const text = `${player.name} ${player.player_code}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  function hasChecked(playerId: string) {
    return checkpoints.some(
      (checkpoint) =>
        checkpoint.player_id === playerId &&
        checkpoint.checkpoint_date === today
    );
  }

  async function toggleCheckpoint(player: Player) {
    const existing = checkpoints.find(
      (checkpoint) =>
        checkpoint.player_id === player.id &&
        checkpoint.checkpoint_date === today
    );

    if (existing) {
      const { error } = await supabase
        .from("checkpoints")
        .delete()
        .eq("id", existing.id);

      if (error) return;

      setCheckpoints((prev) =>
        prev.filter((checkpoint) => checkpoint.id !== existing.id)
      );

      return;
    }

    const { data, error } = await supabase
      .from("checkpoints")
      .insert({
        player_id: player.id,
        checkpoint_date: today,
      })
      .select()
      .single();

    if (error || !data) return;

    setCheckpoints((prev) => [...prev, data]);
  }

  const checkedCount = checkpoints.filter(
    (checkpoint) => checkpoint.checkpoint_date === today
  ).length;

  return (
    <div className="border border-stone-700 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-black">Checkpoint</h2>
          <p className="text-stone-500 text-sm mt-1">
            Marca qui ha passat pel checkpoint d’avui
          </p>
        </div>

        <div className="text-right">
          <p className="text-stone-500 text-sm">Confirmats</p>
          <p className="text-4xl font-black text-red-600">
            {checkedCount}
          </p>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cercar jugador..."
        className="mb-4 w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 outline-none focus:border-red-700"
      />

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredPlayers.map((player) => {
          const checked = hasChecked(player.id);

          return (
            <div
              key={player.id}
              className="flex items-center justify-between gap-4 border border-stone-800 rounded-xl p-4"
            >
              <div>
                <p className="font-bold">{player.name}</p>
                <p className="text-xs text-stone-500">
                  {player.player_code}
                </p>
              </div>

              <button
                onClick={() => toggleCheckpoint(player)}
                className={
                  checked
                    ? "rounded-xl bg-red-950 border border-red-900 px-4 py-2 text-sm font-bold"
                    : "rounded-xl border border-stone-700 px-4 py-2 text-sm"
                }
              >
                {checked ? "Confirmat" : "Marcar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  name: string;
  player_code: string;
  is_alive: boolean;
  has_paid: boolean;
  current_target_id: string | null;
};

type Props = {
  initialPlayers: Player[];
};

export default function AdminPlayers({ initialPlayers }: Props) {
  const [players, setPlayers] = useState(initialPlayers);

  async function togglePaid(player: Player) {
    const newValue = !player.has_paid;

    const { error } = await supabase
      .from("players")
      .update({ has_paid: newValue })
      .eq("id", player.id);

    if (error) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, has_paid: newValue } : p
      )
    );
  }

  async function toggleAlive(player: Player) {
    const newValue = !player.is_alive;

    const { error } = await supabase
      .from("players")
      .update({ is_alive: newValue })
      .eq("id", player.id);

    if (error) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, is_alive: newValue } : p
      )
    );
  }

  return (
    <div className="border border-stone-700 rounded-2xl p-6">
      <h2 className="text-2xl font-black mb-4">Jugadors</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-stone-500">
            <tr className="border-b border-stone-800">
              <th className="text-left py-3">ID</th>
              <th className="text-left py-3">Nom</th>
              <th className="text-left py-3">Estat</th>
              <th className="text-left py-3">Pagat</th>
              <th className="text-left py-3">Objectiu</th>
              <th className="text-left py-3">Accions</th>
            </tr>
          </thead>

          <tbody>
            {players.map((player) => {
              const target = players.find(
                (p) => p.id === player.current_target_id
              );

              return (
                <tr key={player.id} className="border-b border-stone-900">
                  <td className="py-3 text-stone-500">
                    {player.player_code}
                  </td>

                  <td className="py-3">{player.name}</td>

                  <td className="py-3">
                    {player.is_alive ? "VIU" : "MORT"}
                  </td>

                  <td className="py-3">
                    {player.has_paid ? "Sí" : "No"}
                  </td>

                  <td className="py-3 text-stone-400">
                    {target ? target.name : "—"}
                  </td>

                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => togglePaid(player)}
                      className="rounded-lg border border-stone-700 px-3 py-2 text-xs"
                    >
                      {player.has_paid ? "No pagat" : "Pagat"}
                    </button>

                    <button
                      onClick={() => toggleAlive(player)}
                      className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-500"
                    >
                      {player.is_alive ? "Matar" : "Reviure"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
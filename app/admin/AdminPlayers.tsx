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
    const [search, setSearch] = useState("");
    const [confirmAction, setConfirmAction] = useState<{
        player: Player;
        type: "paid" | "alive";
    } | null>(null);

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

        // If admin is killing the player, reassign their assassin's target
        // to the victim's target without recording a kill.
        if (!newValue) {
            try {
                const { data: victimData, error: victimErr } = await supabase
                    .from("players")
                    .select("current_target_id")
                    .eq("id", player.id)
                    .maybeSingle();

                if (victimErr) return;

                const victimTargetId = victimData?.current_target_id ?? null;

                const { data: assassinData, error: assassinErr } = await supabase
                    .from("players")
                    .select("id")
                    .eq("current_target_id", player.id)
                    .maybeSingle();

                if (assassinErr) return;

                const assassinId = assassinData?.id ?? null;

                if (assassinId) {
                    const { error: updateAssassinError } = await supabase
                        .from("players")
                        .update({ current_target_id: victimTargetId })
                        .eq("id", assassinId);

                    if (updateAssassinError) return;
                }

                const { error: updateVictimError } = await supabase
                    .from("players")
                    .update({ is_alive: false, current_target_id: null })
                    .eq("id", player.id);

                if (updateVictimError) return;

                setPlayers((prev) =>
                    prev.map((p) => {
                        if (p.id === player.id) return { ...p, is_alive: false, current_target_id: null };
                        if (assassinId && p.id === assassinId) return { ...p, current_target_id: victimTargetId };
                        return p;
                    })
                );

                return;
            } catch (err) {
                return;
            }
        }

        // revive or simple toggle
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
    const filteredPlayers = players.filter((player) => {
    const text = `${player.name} ${player.player_code}`.toLowerCase();
    return text.includes(search.toLowerCase());
    });

    return (
        <div className="border border-stone-700 rounded-2xl p-6">
        <h2 className="text-2xl font-black mb-4">Jugadors</h2>

        <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cercar jugador..."
            className="mb-4 w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 outline-none focus:border-red-700"
        />

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
                {filteredPlayers.map((player) => {
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
                        onClick={() =>
                            setConfirmAction({
                                player,
                                type: "paid",
                            })
                        }
                        className="rounded-lg border border-stone-700 px-3 py-2 text-xs"
                        >
                        {player.has_paid ? "No pagat" : "Pagat"}
                        </button>

                        <button
                        onClick={() =>
                            setConfirmAction({
                                player,
                                type: "alive",
                            })
                        }
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
            {confirmAction && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="w-full max-w-md mx-4 border border-red-900 bg-[#090909] rounded-2xl p-6">

                    <h3 className="text-2xl font-black text-red-500">
                        ⚠️ Confirmar acció
                    </h3>

                    <p className="mt-4 text-stone-300">
                        {confirmAction.type === "alive"
                        ? `Vols ${
                            confirmAction.player.is_alive ? "matar" : "reviure"
                            } ${confirmAction.player.name}?`
                        : `Vols marcar ${
                            confirmAction.player.name
                            } com ${
                            confirmAction.player.has_paid ? "NO PAGAT" : "PAGAT"
                            }?`}
                    </p>

                    <div className="flex gap-3 mt-6">
                        <button
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 rounded-xl border border-stone-700 py-3"
                        >
                        CANCEL·LAR
                        </button>

                        <button
                        onClick={async () => {
                            if (confirmAction.type === "paid") {
                            await togglePaid(confirmAction.player);
                            }

                            if (confirmAction.type === "alive") {
                            await toggleAlive(confirmAction.player);
                            }

                            setConfirmAction(null);
                        }}
                        className="flex-1 rounded-xl bg-red-950 border border-red-900 py-3 font-bold"
                        >
                        CONFIRMAR
                        </button>
                    </div>
                    </div>
                </div>
                )}
        </div>
        </div>
    );
}


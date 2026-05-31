"use client";

import { useState } from "react";

type Player = {
  id: string;
  name: string;
  player_code: string;
  current_target_id: string | null;
};

type Props = {
  players: Player[];
};

export default function AdminChain({ players }: Props) {
  const [open, setOpen] = useState(false);

  function getTarget(targetId: string | null) {
    return players.find((player) => player.id === targetId);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-stone-700 px-4 py-3 text-sm hover:border-red-700"
      >
        Veure cadena
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-red-900 bg-[#090909] rounded-2xl p-6">
            <div className="flex justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-black text-red-600">
                  Cadena de la partida
                </h2>
                <p className="text-stone-500 mt-2">
                  Cada jugador i el seu objectiu actual
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                Tancar
              </button>
            </div>

            <div className="space-y-3">
              {players.map((player) => {
                const target = getTarget(player.current_target_id);

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

                    <span className="text-red-600 font-black">→</span>

                    <div className="text-right">
                      <p className="font-bold">
                        {target ? target.name : "Sense objectiu"}
                      </p>
                      <p className="text-xs text-stone-500">
                        {target ? target.player_code : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
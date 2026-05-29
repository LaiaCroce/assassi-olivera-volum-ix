"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  currentRule: string;
};

export default function AdminRules({ currentRule }: Props) {
  const [rule, setRule] = useState(currentRule);
  const [newRule, setNewRule] = useState("");
  const [message, setMessage] = useState("");

  async function updateRule(e: React.FormEvent) {
    e.preventDefault();

    if (!newRule.trim()) return;

    setMessage("");

    await supabase
      .from("rules")
      .update({ is_active: false })
      .eq("is_active", true);

    const { error } = await supabase.from("rules").insert({
      text: newRule.trim(),
      is_active: true,
    });

    if (error) {
      setMessage("No s'ha pogut actualitzar la consigna.");
      return;
    }

    setRule(newRule.trim());
    setNewRule("");
    setMessage("Consigna actualitzada correctament.");
  }

  return (
    <div className="border border-stone-700 rounded-2xl p-6">
      <h2 className="text-2xl font-black mb-4">Consigna activa</h2>

      <p className="text-xl text-red-600 font-bold">
        {rule || "Sense consigna activa"}
      </p>

      <form onSubmit={updateRule} className="mt-6 space-y-4">
        <input
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Nova consigna..."
          className="w-full rounded-xl bg-stone-900 border border-stone-700 px-4 py-3 outline-none focus:border-red-700"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-red-950 border border-red-900 px-6 py-4 font-bold"
        >
          ACTUALITZAR CONSIGNA
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-stone-400">
          {message}
        </p>
      )}
    </div>
  );
}
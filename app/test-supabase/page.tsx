import { supabase } from "@/lib/supabase";

export default async function TestSupabasePage() {
  const { data, error } = await supabase
    .from("rules")
    .select("*");

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}
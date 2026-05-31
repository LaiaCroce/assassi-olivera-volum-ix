import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090909] text-stone-200 flex items-center justify-center px-6">
      <section className="w-full max-w-xl text-center">

        <div className="mb-8">
          <p className="text-red-700 tracking-[0.4em] text-sm font-semibold">
            VOL.IX
          </p>
        </div>

        <h1 className="text-6xl md:text-7xl font-black leading-none">
          L&apos;ASSASSÍ
        </h1>

        <h1 className="text-6xl md:text-7xl font-black leading-none mt-2">
          DE
        </h1>

        <h1 className="text-6xl md:text-7xl font-black leading-none mt-2">
          L&apos;OLIVERA
        </h1>

        <div className="mt-8">
          <p className="uppercase tracking-[0.3em] text-stone-500">
            Ninjes de l&apos;Olivera
          </p>
        </div>

        <div className="mt-14">
          <p className="text-2xl italic text-red-700">
            Si el veus venir,
          </p>

          <p className="text-2xl italic text-red-700">
            ja és massa tard.
          </p>
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">

          <Link
            href="/login"
            className="rounded-2xl bg-red-950 border border-red-900 px-8 py-4 font-bold"
          >
            ENTRAR
          </Link>

          <Link
            href="/partida"
            className="rounded-2xl border border-stone-700 px-8 py-4 font-bold"
          >
            VEURE HISTORIAL
          </Link>

        </div>
      </section>
    </main>
  );
}
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

        <div className="mt-14 border-t border-stone-800 pt-8">
          <p className="text-stone-500 tracking-[0.25em] text-xs">
            COL·LABORADORS
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            {/* <img
              src="/collaboradors/pebre.png"
              alt="El Pebre"
              className="max-h-16 max-w-full object-contain opacity-90"
            /> */}
            
            <div className="rounded-2xl border border-stone-800 bg-black/30 p-4 h-24 flex items-center justify-center">
              <span className="text-stone-500 text-sm">LOGO 1</span>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-black/30 p-4 h-24 flex items-center justify-center">
              <span className="text-stone-500 text-sm">LOGO 2</span>
            </div>
            
            <div className="rounded-2xl border border-stone-800 bg-black/30 p-4 h-24 flex items-center justify-center">
              <img
              src="/collaboradors/el_rebost_de_casa.png"
              alt="El Rebost de Casa"
              className="max-h-16 max-w-full object-contain opacity-90"
              /> 
            </div>
            
            <div className="rounded-2xl border border-stone-800 bg-black/30 p-4 h-24 flex items-center justify-center">
              <span className="text-stone-500 text-sm">LOGO 4</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
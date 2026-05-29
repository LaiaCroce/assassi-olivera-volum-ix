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

        <Link
          href="/login"
          className="
            mt-14
            inline-flex
            items-center
            justify-center
            rounded-xl
            border
            border-red-900
            bg-red-950
            px-10
            py-4
            font-bold
            tracking-widest
            transition
            hover:bg-red-900
          "
        >
          ENTRAR
        </Link>
      </section>
    </main>
  );
}
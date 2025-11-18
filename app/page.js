import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/80">
            STRATEGY ANALYZER
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold">
            Stop guessing.
            <span className="text-emerald-400"> Prove your edge.</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            Describe your rules, let AI structure them, then stress-test your
            strategy on real historical data. No more hope, only stats.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/test"
            className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition"
          >
            Start testing
          </Link>
        </div>
      </div>
    </div>
  );
}

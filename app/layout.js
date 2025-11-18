import "./globals.css";

export const metadata = {
  title: "Strategy Analyzer",
  description: "Build confidence through proof, not hope.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-gray-100 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-xs font-bold tracking-widest">
                SA
              </div>
              <div>
                <div className="font-semibold text-lg">Strategy Analyzer</div>
                <div className="text-xs text-zinc-400">
                  Build confidence through proof, not hope.
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

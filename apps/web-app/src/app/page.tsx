import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-blue-400 animate-fade-in">
          WRO 2026: The Heritage Keeper
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent italic">
          EV3 CONTROLLER
        </h1>

        <p className="max-w-xl text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
          Hệ sinh thái di sản thông minh kết hợp AI Brain và Robot EV3.
          Khám phá tương lai của việc bảo tồn văn hóa.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/test-control"
            className="group relative px-8 py-4 bg-blue-600 rounded-2xl font-bold text-lg transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
          >
            Mở Dashboard Test
            <span className="ml-2 transition-transform group-hover:translate-x-1 inline-block">→</span>
          </Link>

          <Link
            href="/dashboard/robot-settings"
            className="px-8 py-4 bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-2xl font-bold text-lg backdrop-blur-md transition-all hover:bg-purple-600/30"
          >
            Cấu hình Robot
          </Link>

          <Link
            href="/.antigravity/INSTRUCTION.md"
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg backdrop-blur-md transition-all hover:bg-white/10"
          >
            Tài liệu
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale group hover:opacity-100 transition-opacity">
          {["Next.js", "Python AI", "Supabase", "MQTT"].map((tech) => (
            <div key={tech} className="text-sm font-bold tracking-widest uppercase">{tech}</div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-10 text-slate-600 text-sm">
        © 2026 Antigravyti Team. All rights reserved.
      </footer>
    </div>
  );
}

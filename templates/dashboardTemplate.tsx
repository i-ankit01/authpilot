import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col gap-20 items-center justify-center">
      <header className="sticky z-50 border border-zinc-700 drop-shadow-2xl bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-black/60 md:w-2/3 w-80 mx-auto rounded-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="#" className="flex items-center gap-2">
            <span className="font-bold text-white font-mono text-lg">
              AuthPilot
            </span>
          </a>
          User
        </div>
      </header>
      <footer className="flex flex-col items-center gap-3 font-mono text-white">
        <p className="text-sm opacity-80">Built by Ankit</p>

        <div className="flex gap-4">
          <a
            href="https://x.com/ankit_codes_"
            className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center hover:bg-zinc-700 transition"
          >
            <Twitter size={20} />
          </a>

          <a
            href="https://www.linkedin.com/in/i-ankit01/"
            className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center hover:bg-zinc-700 transition"
          >
            <Linkedin size={20} />
          </a>

          <a
            href="https://github.com/i-ankit01"
            className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center hover:bg-zinc-700 transition"
          >
            <Github size={20} />
          </a>
        </div>

        <p className="text-xs opacity-60 md:mt-3">Reach out to me</p>
      </footer>
    </div>
  );
}

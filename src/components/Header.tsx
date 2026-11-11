"use client";

import { useEffect, useState } from "react";
import { AndroidIcon, GlobeIcon, LogoMark, MenuIcon, XIcon } from "./Icons";

const links = [
  { href: "#downloader", label: "Downloader" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#trending", label: "Trending" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <LogoMark className="h-10 w-10 drop-shadow-[0_6px_14px_rgba(229,29,29,0.45)]" />
          <span className={`text-[22px] font-extrabold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
            Flick<span className={scrolled ? "text-brand-600" : "text-yellow-300"}>Grab</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-[15px] font-medium transition ${
                scrolled ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-white/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
              scrolled ? "text-slate-600 hover:bg-slate-100" : "text-white/85 hover:bg-white/10"
            }`}
          >
            <GlobeIcon className="h-4 w-4" /> EN
          </button>
          <a
            href="#app"
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 ${
              scrolled
                ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-brand-500/30"
                : "bg-white text-brand-600 shadow-black/10"
            }`}
          >
            <AndroidIcon className="h-4 w-4" /> Get the App
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`grid h-11 w-11 place-items-center rounded-xl lg:hidden ${scrolled ? "text-slate-800" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-up mx-4 mb-4 rounded-3xl bg-white p-3 shadow-2xl lg:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#app"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-3.5 font-bold text-white"
          >
            <AndroidIcon className="h-5 w-5" /> Get the App
          </a>
        </div>
      )}
    </header>
  );
}

import {
  AndroidIcon,
  BoltIcon,
  CheckIcon,
  DownloadIcon,
  GlobeIcon,
  InstagramIcon,
  LogoMark,
  MusicIcon,
  PasteIcon,
  PlayIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  TikTokIcon,
  VideoIcon,
  YouTubeIcon,
} from "./Icons";
import Faq from "./Faq";

export function PlatformStrip() {
  const items = [
    { Icon: YouTubeIcon, name: "YouTube" },
    { Icon: InstagramIcon, name: "Instagram" },
    { Icon: TikTokIcon, name: "TikTok" },
    { Icon: YouTubeIcon, name: "YouTube Shorts" },
    { Icon: InstagramIcon, name: "Instagram Reels" },
    { Icon: TikTokIcon, name: "TikTok Sounds" },
    { Icon: InstagramIcon, name: "Stories" },
    { Icon: YouTubeIcon, name: "YouTube Music" },
  ];
  const all = [...items, ...items];
  return (
    <section className="relative border-y border-slate-100 bg-white py-7">
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Check links from your favourite platforms
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max gap-4">
          {all.map((it, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 shadow-sm"
            >
              <it.Icon className="h-7 w-7" />
              <span className="whitespace-nowrap font-semibold text-slate-700">{it.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    Icon: ShieldIcon,
    title: "Nothing on our servers",
    text: "No downloader runs here. Direct links are fetched by your browser straight from the file's own host, so no video is ever stored, proxied or transcoded.",
    color: "from-emerald-400 to-teal-600",
  },
  {
    Icon: SearchIcon,
    title: "Real metadata",
    text: "The title, channel and thumbnail come from public oEmbed data, so you can confirm what a link is before you save anything.",
    color: "from-amber-400 to-orange-500",
  },
  {
    Icon: DownloadIcon,
    title: "Saves on your device",
    text: "When a host allows cross-origin reads, the file goes from that host to your device. FlickGrab never sits in the middle.",
    color: "from-brand-500 to-rose-600",
  },
  {
    Icon: BoltIcon,
    title: "Honest verdicts",
    text: "If a source cannot be saved in a browser, the page says exactly why instead of starting a download that would fail halfway.",
    color: "from-cyan-400 to-sky-600",
  },
  {
    Icon: SparkIcon,
    title: "Clean links",
    text: "Share links are expanded and tracking parameters stripped before anything leaves the page, and only known hosts are ever contacted.",
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    Icon: GlobeIcon,
    title: "No account, no tracking",
    text: "No sign-up, no email, no analytics pixels. Paste a link, read the answer, close the tab — nothing to come back to.",
    color: "from-pink-500 to-brand-600",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-600">
            <SparkIcon className="h-4 w-4" /> Why FlickGrab
          </span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            What this build <span className="bg-gradient-to-r from-brand-500 to-orange-500 bg-clip-text text-transparent">actually does</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Three social sources, one straight answer each — plus direct links that save on your own device.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(229,29,29,0.25)]"
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} opacity-10 blur-2xl transition group-hover:opacity-25`} />
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                <f.Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { Icon: SearchIcon, title: "Copy the link", text: "Open YouTube, Instagram or TikTok and tap Share → Copy link on any video." },
  { Icon: PasteIcon, title: "Paste it here", text: "FlickGrab expands short links, detects the platform and reads its public metadata." },
  { Icon: DownloadIcon, title: "Save what your browser can", text: "Direct file links download straight to your device. For the three social sources, we show the exact reason a browser cannot fetch them." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 overflow-hidden bg-slate-50 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-600 shadow-sm">3 simple steps</span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">How it works</h2>
          <p className="mt-4 text-lg text-slate-500">Paste a link and get a straight answer — no account, no install.</p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-[repeating-linear-gradient(90deg,#fca5a5_0_10px,transparent_10px_20px)] md:block" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[30px] bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_20px_40px_-10px_rgba(229,29,29,0.6)]">
                <s.Icon className="h-10 w-10" />
                <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-extrabold text-brand-600 shadow-lg ring-4 ring-slate-50">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-bold text-slate-900">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const thumbs = [
  "from-rose-400 to-orange-300",
  "from-violet-500 to-fuchsia-400",
  "from-sky-400 to-cyan-300",
  "from-emerald-400 to-lime-300",
];

export function AppPromo() {
  return (
    <section id="app" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-[#5b0a0f] py-24 text-white">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="animate-blob absolute -left-20 top-10 h-80 w-80 rounded-full bg-orange-400/30 blur-3xl" />
      <div className="animate-blob absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-pink-500/30 blur-3xl [animation-delay:-6s]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur">
            <AndroidIcon className="h-4 w-4" /> Android app · in development
          </span>
          <h2 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Some links need <br />
            <span className="text-yellow-300">a real app</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            A web page cannot fetch YouTube, TikTok or Instagram media: their URLs are sealed to the address that
            resolved them, and their CDNs refuse cross-origin reads. Doing it properly means running the downloader on
            the device itself — that is the next build, and nothing here pretends it already shipped.
          </p>
          <ul className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
            {[
              "On-device yt-dlp runtime",
              "On-device muxing",
              "Share-sheet intake",
              "Background downloads",
              "No server round-trip",
              "Saves to your gallery",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5 font-medium">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-3 rounded-2xl border border-white/25 bg-black/30 px-6 py-3.5 text-white/70 backdrop-blur">
              <AndroidIcon className="h-6 w-6 text-lime-300" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] font-semibold text-white/50">Not released</span>
                <span className="block text-base font-extrabold">No APK yet</span>
              </span>
            </span>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative mx-auto">
          <div className="animate-float relative h-[600px] w-[300px] rounded-[48px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]">
            <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
            <div className="h-full w-full overflow-hidden rounded-[38px] bg-slate-50">
              <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-4 pb-4 pt-10 text-white">
                <div className="flex items-center gap-2">
                  <LogoMark className="h-7 w-7" />
                  <span className="text-lg font-extrabold">FlickGrab</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs text-slate-400">
                  <SearchIcon className="h-4 w-4" /> Paste a link
                </div>
              </div>
              <div className="flex justify-around border-b border-slate-200 bg-white py-3">
                {[YouTubeIcon, InstagramIcon, TikTokIcon].map((I, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 shadow-sm"><I className="h-6 w-6" /></span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shadow-sm"><MusicIcon className="h-5 w-5" /></span>
                </div>
              </div>
              <div className="space-y-3 p-3">
                {thumbs.map((g, i) => (
                  <div key={i} className="flex gap-3 rounded-xl bg-white p-2 shadow-sm">
                    <div className={`relative grid h-14 w-24 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${g}`}>
                      <PlayIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1.5 py-1">
                      <div className="h-2.5 w-full rounded-full bg-slate-200" />
                      <div className="h-2.5 w-2/3 rounded-full bg-slate-200" />
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${[100, 72, 45, 18][i]}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-[10px] bottom-[10px] flex justify-around rounded-b-[38px] border-t border-slate-200 bg-white py-3 text-slate-400">
                <VideoIcon className="h-5 w-5 text-brand-600" />
                <SearchIcon className="h-5 w-5" />
                <DownloadIcon className="h-5 w-5" />
                <MusicIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="animate-float-slow absolute -left-16 top-24 hidden rounded-2xl bg-white p-3 text-slate-900 shadow-2xl sm:block">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold">Link checked</p>
                <p className="text-[11px] text-slate-500">Metadata only</p>
              </div>
            </div>
          </div>
          <div className="animate-float-slow absolute -right-14 bottom-32 hidden rounded-2xl bg-white p-3 text-slate-900 shadow-2xl [animation-delay:-3s] sm:block">
            <div className="flex items-center gap-2.5">
              <TikTokIcon className="h-9 w-9" />
              <div>
                <p className="text-xs font-bold">Not in browser</p>
                <p className="text-[11px] text-slate-500">Needs the app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const stats = [
    { k: "0 B", v: "Video stored on our servers" },
    { k: "3", v: "Social sources recognised" },
    { k: "1", v: "Download path live today" },
    { k: "40", v: "Lookups a minute, per address" },
  ];
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-[32px] bg-white p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v} className="text-center">
              <p className="bg-gradient-to-r from-brand-500 to-orange-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">{s.k}</p>
              <p className="mt-1 font-medium text-slate-500">{s.v}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">No inflated numbers</h2>
          <p className="mt-4 text-lg text-slate-500">
            FlickGrab is new, so there is no review count to quote. What you see above is the whole build: a media-free
            API that classifies a link, reads public metadata, and hands direct files to your browser.
          </p>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-600">FAQ</span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Frequently asked questions</h2>
        </div>
        <Faq />
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="bg-white px-5 pb-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-gradient-to-r from-brand-500 via-brand-600 to-orange-500 px-8 py-16 text-center text-white shadow-[0_40px_80px_-30px_rgba(229,29,29,0.7)]">
        <div className="bg-grid absolute inset-0" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold sm:text-5xl">See what a link really is</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Paste it, read the verdict, and save it only if your browser honestly can. Free, no sign-up, nothing stored.
          </p>
          <a href="#downloader" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-extrabold text-brand-600 shadow-xl transition hover:-translate-y-0.5">
            <SearchIcon className="h-5 w-5" /> Check a link
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    { h: "Product", l: [["Check a link", "#downloader"], ["What works", "#features"], ["How it works", "#how"], ["FAQ", "#faq"]] as const },
    { h: "On-device app", l: [["Status", "#app"], ["Why a browser can't", "#app"]] as const },
  ];
  return (
    <footer className="bg-[#0d0d12] pt-20 text-slate-400">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-10 w-10" />
              <span className="text-2xl font-extrabold text-white">Flick<span className="text-brand-500">Grab</span></span>
            </div>
            <p className="mt-5 max-w-sm leading-relaxed">
              A link inspector and on-device downloader for YouTube, Instagram, TikTok and direct media links. No video
              ever passes through our servers.
            </p>
            <div className="mt-6 flex gap-3">
              {[YouTubeIcon, InstagramIcon, TikTokIcon].map((I, i) => (
                <span key={i} className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <I className="h-5 w-5" />
                </span>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="font-bold text-white">{c.h}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {c.l.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition hover:text-white">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} FlickGrab.</p>
          <p className="text-center text-xs text-slate-500">
            Please respect copyright and only download content you own or have permission to use.
          </p>
        </div>
      </div>
    </footer>
  );
}

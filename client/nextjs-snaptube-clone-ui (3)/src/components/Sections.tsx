import {
  AndroidIcon,
  BoltIcon,
  DownloadIcon,
  InfinityIcon,
  InstagramIcon,
  LogoMark,
  MusicIcon,
  PasteIcon,
  PlayIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
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
        Download from your favourite platforms
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
  { Icon: BoltIcon, title: "Lightning fast", text: "Multi-threaded downloads that run up to 3× faster than standard browser saves.", color: "from-amber-400 to-orange-500" },
  { Icon: VideoIcon, title: "Up to 4K quality", text: "Pick any resolution from 144p up to 2160p Ultra HD, including 60fps sources.", color: "from-brand-500 to-rose-600" },
  { Icon: MusicIcon, title: "MP3 converter", text: "Extract crisp 320kbps audio from any video in a single tap. Perfect for music.", color: "from-violet-500 to-fuchsia-600" },
  { Icon: SparkIcon, title: "No watermark", text: "Save TikTok videos without the watermark — clean, original, ready to share.", color: "from-cyan-400 to-sky-600" },
  { Icon: ShieldIcon, title: "Safe & private", text: "No sign-up, no tracking, no malware. Your links never leave your session.", color: "from-emerald-400 to-teal-600" },
  { Icon: InfinityIcon, title: "Unlimited & free", text: "Download as many videos as you want with no daily caps or hidden fees.", color: "from-pink-500 to-brand-600" },
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
            Everything you need to <span className="bg-gradient-to-r from-brand-500 to-orange-500 bg-clip-text text-transparent">save any video</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            One tool, three platforms, every format. Built for speed and designed to feel effortless.
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
  { Icon: PasteIcon, title: "Paste it here", text: "Drop the URL into the box above. We detect the platform automatically." },
  { Icon: DownloadIcon, title: "Choose & download", text: "Pick your quality or MP3 format and the file saves straight to your device." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 overflow-hidden bg-slate-50 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-600 shadow-sm">3 simple steps</span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">How to download videos</h2>
          <p className="mt-4 text-lg text-slate-500">No apps to install, no account to create. It just works.</p>
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
            <AndroidIcon className="h-4 w-4" /> Android app · v6.2
          </span>
          <h2 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Take FlickGrab <br />
            <span className="text-yellow-300">everywhere you go</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            Browse, search and download in one beautiful app. Background downloads, built-in player, night mode and a
            smart library that organises everything for you.
          </p>
          <ul className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
            {["Built-in video player", "Background downloads", "Night mode", "Smart library", "Floating player", "Batch downloads"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 font-medium">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#" className="flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-slate-900 shadow-xl transition hover:-translate-y-0.5">
              <DownloadIcon className="h-6 w-6 text-brand-600" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] font-semibold text-slate-500">Free download</span>
                <span className="block text-base font-extrabold">Download APK</span>
              </span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-2xl border border-white/30 bg-black/30 px-6 py-3.5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/40">
              <AndroidIcon className="h-6 w-6 text-lime-300" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] font-semibold text-white/60">Android 5.0+</span>
                <span className="block text-base font-extrabold">18.4 MB</span>
              </span>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/80">
            <div className="flex text-yellow-300">
              {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className="h-5 w-5" />)}
            </div>
            <span><b className="text-white">4.8</b> · 2.1M reviews · 100M+ downloads</span>
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
                  <SearchIcon className="h-4 w-4" /> Search or paste link
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
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>
              </span>
              <div>
                <p className="text-xs font-bold">Download complete</p>
                <p className="text-[11px] text-slate-500">1080p · 128 MB</p>
              </div>
            </div>
          </div>
          <div className="animate-float-slow absolute -right-14 bottom-32 hidden rounded-2xl bg-white p-3 text-slate-900 shadow-2xl [animation-delay:-3s] sm:block">
            <div className="flex items-center gap-2.5">
              <TikTokIcon className="h-9 w-9" />
              <div>
                <p className="text-xs font-bold">No watermark</p>
                <p className="text-[11px] text-slate-500">Saved in HD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const trending = [
  { t: "Top 10 Hidden Beaches in Bali You Must Visit", c: "Travel Diaries", v: "2.4M", d: "14:22", g: "from-sky-400 via-cyan-400 to-emerald-400", p: "youtube" },
  { t: "60-second pasta that went viral 🍝", c: "@quickbites", v: "11M", d: "0:58", g: "from-amber-300 via-orange-400 to-red-500", p: "tiktok" },
  { t: "Neon nights in Tokyo — cinematic reel", c: "@citylights", v: "860K", d: "0:45", g: "from-fuchsia-500 via-purple-600 to-indigo-700", p: "instagram" },
  { t: "Morning Jazz Café — Relaxing Background Music", c: "Cozy Sounds", v: "15M", d: "3:01:12", g: "from-yellow-200 via-amber-400 to-rose-500", p: "youtube" },
  { t: "Skateboard trick tutorial for beginners 🛹", c: "@skate.daily", v: "4.7M", d: "0:39", g: "from-lime-300 via-emerald-500 to-teal-700", p: "tiktok" },
  { t: "Minimal home studio setup tour", c: "@deskgoals", v: "1.1M", d: "1:12", g: "from-slate-300 via-slate-500 to-slate-800", p: "instagram" },
  { t: "Building a Gaming PC in 2026 — Full Guide", c: "Tech Lab", v: "3.9M", d: "22:05", g: "from-violet-400 via-blue-500 to-cyan-400", p: "youtube" },
  { t: "Sunset yoga flow · 10 min stretch", c: "@zen.with.ana", v: "620K", d: "0:59", g: "from-orange-300 via-pink-400 to-purple-500", p: "instagram" },
] as const;

const pIcon = { youtube: YouTubeIcon, instagram: InstagramIcon, tiktok: TikTokIcon };

export function Trending() {
  return (
    <section id="trending" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-600">🔥 Trending now</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Popular downloads today</h2>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {["All", "Music", "Gaming", "Travel", "Food", "Sports"].map((c, i) => (
              <button
                key={c}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((v) => {
            const I = pIcon[v.p];
            return (
              <a key={v.t} href="#downloader" className="group">
                <div className={`relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br ${v.g} shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.4),transparent_55%)]" />
                  <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                    <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-600 shadow-lg">
                      <DownloadIcon className="h-4 w-4" /> Download
                    </span>
                  </div>
                  <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/95 shadow"><I className="h-4.5 w-4.5" /></span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">{v.d}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-bold leading-snug text-slate-900 group-hover:text-brand-600">{v.t}</h3>
                <p className="mt-1 text-sm text-slate-500">{v.c} · {v.v} views</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const reviews = [
  { n: "Aisha K.", r: "Content creator", t: "The cleanest downloader I've used. TikToks come out without the watermark and in full HD — exactly what I need for my compilations." },
  { n: "Marco D.", r: "Student", t: "I save lectures from YouTube to watch offline on the train. The MP3 option for podcasts is a lifesaver." },
  { n: "Priya S.", r: "Social media manager", t: "Saving Instagram Reels for client mood boards used to be painful. Now it's literally paste and done." },
];

export function Stats() {
  const stats = [
    { k: "100M+", v: "Happy users" },
    { k: "5B+", v: "Videos downloaded" },
    { k: "4.8★", v: "Average rating" },
    { k: "150+", v: "Countries" },
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

        <div className="mt-20 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Loved by millions</h2>
          <p className="mt-4 text-lg text-slate-500">Here&apos;s what our users say about FlickGrab.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r.n} className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-xl">
              <div className="flex text-amber-400">
                {[0, 1, 2, 3, 4].map((s) => <StarIcon key={s} className="h-5 w-5" />)}
              </div>
              <blockquote className="mt-4 leading-relaxed text-slate-700">&ldquo;{r.t}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${["from-brand-500 to-orange-400", "from-violet-500 to-sky-400", "from-emerald-500 to-cyan-400"][i]}`}>
                  {r.n.split(" ").map((x) => x[0]).join("")}
                </span>
                <span>
                  <span className="block font-bold text-slate-900">{r.n}</span>
                  <span className="block text-sm text-slate-500">{r.r}</span>
                </span>
              </figcaption>
            </figure>
          ))}
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
          <h2 className="text-3xl font-extrabold sm:text-5xl">Ready to grab your first video?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Paste a link and download in seconds. Free forever, no sign-up needed.</p>
          <a href="#downloader" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-extrabold text-brand-600 shadow-xl transition hover:-translate-y-0.5">
            <DownloadIcon className="h-5 w-5" /> Start downloading
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    { h: "Downloaders", l: ["YouTube Downloader", "YouTube to MP3", "Instagram Reels", "Instagram Stories", "TikTok No Watermark", "TikTok to MP3"] },
    { h: "Product", l: ["Android App", "Features", "Changelog", "Help Center"] },
    { h: "Company", l: ["About", "Blog", "Contact", "Careers"] },
    { h: "Legal", l: ["Terms of Service", "Privacy Policy", "DMCA", "Cookies"] },
  ];
  return (
    <footer className="bg-[#0d0d12] pt-20 text-slate-400">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-10 w-10" />
              <span className="text-2xl font-extrabold text-white">Flick<span className="text-brand-500">Grab</span></span>
            </div>
            <p className="mt-5 max-w-xs leading-relaxed">
              The fastest free video downloader for YouTube, Instagram and TikTok. HD, 4K and MP3 in one tap.
            </p>
            <div className="mt-6 flex gap-3">
              {[YouTubeIcon, InstagramIcon, TikTokIcon].map((I, i) => (
                <a key={i} href="#" className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/10">
                  <I className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="font-bold text-white">{c.h}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {c.l.map((x) => (
                  <li key={x}><a href="#" className="transition hover:text-white">{x}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} FlickGrab. All rights reserved.</p>
          <p className="text-center text-xs text-slate-500">
            Please respect copyright and only download content you own or have permission to use.
          </p>
        </div>
      </div>
    </footer>
  );
}

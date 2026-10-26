"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  DownloadIcon,
  InstagramIcon,
  MusicIcon,
  PasteIcon,
  PlayIcon,
  SearchIcon,
  TikTokIcon,
  VideoIcon,
  XIcon,
  YouTubeIcon,
} from "./Icons";

type Platform = "youtube" | "instagram" | "tiktok";

const platforms: {
  id: Platform;
  name: string;
  Icon: typeof YouTubeIcon;
  placeholder: string;
  sample: string;
  ring: string;
}[] = [
  {
    id: "youtube",
    name: "YouTube",
    Icon: YouTubeIcon,
    placeholder: "Paste YouTube link, e.g. https://youtu.be/...",
    sample: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ring: "from-red-500 to-red-600",
  },
  {
    id: "instagram",
    name: "Instagram",
    Icon: InstagramIcon,
    placeholder: "Paste Instagram Reel / Post / Story link",
    sample: "https://www.instagram.com/reel/C8xYz12AbCd/",
    ring: "from-fuchsia-500 via-pink-500 to-orange-400",
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: TikTokIcon,
    placeholder: "Paste TikTok video link (no watermark)",
    sample: "https://www.tiktok.com/@creator/video/7312345678901234567",
    ring: "from-cyan-400 via-slate-900 to-pink-500",
  },
];

type Format = { label: string; sub: string; size: string; kind: "video" | "audio"; badge?: string };

const formatsByPlatform: Record<Platform, Format[]> = {
  youtube: [
    { label: "2160p", sub: "4K Ultra HD · MP4", size: "412.6 MB", kind: "video", badge: "4K" },
    { label: "1080p", sub: "Full HD · MP4", size: "128.4 MB", kind: "video", badge: "HD" },
    { label: "720p", sub: "HD · MP4", size: "64.2 MB", kind: "video", badge: "HD" },
    { label: "480p", sub: "SD · MP4", size: "32.8 MB", kind: "video" },
    { label: "360p", sub: "Low · MP4", size: "18.1 MB", kind: "video" },
    { label: "320kbps", sub: "High Quality · MP3", size: "8.9 MB", kind: "audio", badge: "HQ" },
    { label: "128kbps", sub: "Standard · M4A", size: "3.6 MB", kind: "audio" },
  ],
  instagram: [
    { label: "1080p", sub: "Original · MP4", size: "24.3 MB", kind: "video", badge: "HD" },
    { label: "720p", sub: "HD · MP4", size: "12.7 MB", kind: "video" },
    { label: "Photo", sub: "Cover · JPG", size: "412 KB", kind: "video" },
    { label: "Audio", sub: "Reel sound · MP3", size: "1.2 MB", kind: "audio" },
  ],
  tiktok: [
    { label: "No Watermark", sub: "1080p · MP4", size: "9.8 MB", kind: "video", badge: "HD" },
    { label: "No Watermark", sub: "720p · MP4", size: "5.4 MB", kind: "video" },
    { label: "With Watermark", sub: "720p · MP4", size: "5.9 MB", kind: "video" },
    { label: "Original Sound", sub: "MP3 · 192kbps", size: "1.1 MB", kind: "audio", badge: "HQ" },
  ],
};

const meta: Record<Platform, { title: string; author: string; duration: string; views: string; grad: string }> = {
  youtube: {
    title: "Sunset Drive — Lo-fi Beats to Relax, Study & Chill (Full Album)",
    author: "Chillhop Studio",
    duration: "12:47",
    views: "8.2M views",
    grad: "from-orange-400 via-rose-500 to-purple-700",
  },
  instagram: {
    title: "Golden hour in Santorini ✨ #travel #reels",
    author: "@wanderlust.daily",
    duration: "0:32",
    views: "1.4M plays",
    grad: "from-amber-300 via-pink-500 to-indigo-600",
  },
  tiktok: {
    title: "This dance trend is taking over 🔥 #fyp #viral",
    author: "@moves.by.mia",
    duration: "0:21",
    views: "23.9M views",
    grad: "from-cyan-400 via-fuchsia-500 to-rose-500",
  },
};

function detect(url: string): Platform | null {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  return null;
}

type Job = { id: string; name: string; fmt: Format; progress: number; platform: Platform };

export default function Downloader() {
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Platform | null>(null);
  const [tab, setTab] = useState<"video" | "audio">("video");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = platforms.find((p) => p.id === platform)!;

  useEffect(() => {
    if (jobs.some((j) => j.progress < 100)) {
      timer.current = setInterval(() => {
        setJobs((js) =>
          js.map((j) => (j.progress >= 100 ? j : { ...j, progress: Math.min(100, j.progress + Math.random() * 9 + 3) }))
        );
      }, 300);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [jobs]);

  const analyze = (value = url) => {
    const v = value.trim();
    if (!v) {
      setError("Please paste a video link first.");
      setStatus("error");
      return;
    }
    const d = detect(v);
    if (!d) {
      setError("Unsupported link. We support YouTube, Instagram and TikTok URLs.");
      setStatus("error");
      return;
    }
    setError("");
    setPlatform(d);
    setStatus("loading");
    setResult(null);
    setTab("video");
    setTimeout(() => {
      setResult(d);
      setStatus("done");
    }, 1600);
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        analyze(text);
        return;
      }
    } catch {
      /* clipboard denied */
    }
    setUrl(current.sample);
  };

  const startDownload = (fmt: Format) => {
    if (!result) return;
    setJobs((js) => [
      { id: Math.random().toString(36).slice(2), name: meta[result].title, fmt, progress: 0, platform: result },
      ...js,
    ]);
  };

  const formats = result ? formatsByPlatform[result].filter((f) => f.kind === tab) : [];

  return (
    <div id="downloader" className="relative mx-auto w-full max-w-4xl scroll-mt-28">
      {/* Platform tabs */}
      <div className="mx-auto mb-5 flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPlatform(p.id);
              setStatus("idle");
              setError("");
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 ${
              platform === p.id ? "bg-white text-slate-900 shadow-lg" : "text-white/90 hover:bg-white/10"
            }`}
          >
            <p.Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          analyze();
        }}
        className="group relative rounded-[28px] bg-white p-2.5 shadow-[0_30px_80px_-20px_rgba(120,0,0,0.55)] ring-1 ring-black/5"
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex flex-1 items-center">
            <div className={`ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${current.ring} p-[2px]`}>
              <div className="grid h-full w-full place-items-center rounded-[14px] bg-white">
                <current.Icon className="h-6 w-6" />
              </div>
            </div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={current.placeholder}
              className="h-14 w-full bg-transparent px-4 text-[16px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {url ? (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setStatus("idle");
                  setResult(null);
                }}
                className="mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear"
              >
                <XIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={paste}
                className="mr-1 flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <PasteIcon className="h-4 w-4" /> Paste
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex h-14 items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 px-8 text-[16px] font-bold text-white shadow-lg shadow-brand-600/40 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-80"
          >
            {status === "loading" ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
                Analyzing…
              </>
            ) : (
              <>
                <DownloadIcon className="h-5 w-5" /> Download
              </>
            )}
          </button>
        </div>
      </form>

      {status === "error" && (
        <p className="animate-fade-up mt-4 text-center text-sm font-medium text-yellow-200">⚠ {error}</p>
      )}

      {status === "idle" && (
        <p className="mt-4 text-center text-sm text-white/75">
          Try a sample:{" "}
          {platforms.map((p, i) => (
            <span key={p.id}>
              <button
                onClick={() => {
                  setUrl(p.sample);
                  analyze(p.sample);
                }}
                className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                {p.name}
              </button>
              {i < platforms.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      )}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="animate-fade-up mt-6 rounded-[28px] bg-white p-5 shadow-2xl">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="shimmer aspect-video w-full rounded-2xl sm:w-72" />
            <div className="flex-1 space-y-3">
              <div className="shimmer h-5 w-4/5 rounded-full" />
              <div className="shimmer h-5 w-3/5 rounded-full" />
              <div className="shimmer h-4 w-1/3 rounded-full" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="shimmer h-14 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {status === "done" && result && (
        <div className="animate-fade-up mt-6 overflow-hidden rounded-[28px] bg-white text-left shadow-2xl">
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
            <div className={`relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${meta[result].grad} sm:w-72`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/25 backdrop-blur-md ring-1 ring-white/50">
                  <PlayIcon className="ml-1 h-7 w-7 text-white" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                {meta[result].duration}
              </span>
              <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-white shadow">
                {(() => {
                  const P = platforms.find((p) => p.id === result)!.Icon;
                  return <P className="h-5 w-5" />;
                })()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">{meta[result].title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">
                {meta[result].author} · {meta[result].views}
              </p>

              <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
                {(["video", "audio"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
                      tab === k ? "bg-white text-brand-600 shadow" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {k === "video" ? <VideoIcon className="h-4 w-4" /> : <MusicIcon className="h-4 w-4" />}
                    {k === "video" ? "Video" : "MP3 / Audio"}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {formats.map((f, i) => (
                  <button
                    key={f.label + f.sub + i}
                    onClick={() => startDownload(f)}
                    className="group/f flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{f.label}</span>
                        {f.badge && (
                          <span className="rounded-md bg-gradient-to-r from-brand-500 to-orange-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                            {f.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {f.sub} · {f.size}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30 transition group-hover/f:scale-110">
                      <DownloadIcon className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download queue */}
      {jobs.length > 0 && (
        <div className="animate-fade-up mt-5 rounded-[28px] bg-white/95 p-5 text-left shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-slate-900">Downloads</h4>
            <button onClick={() => setJobs([])} className="text-xs font-semibold text-slate-400 hover:text-brand-600">
              Clear all
            </button>
          </div>
          <ul className="space-y-3">
            {jobs.map((j) => {
              const P = platforms.find((p) => p.id === j.platform)!.Icon;
              const done = j.progress >= 100;
              return (
                <li key={j.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                    <P className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{j.name}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            done ? "bg-emerald-500" : "bg-gradient-to-r from-brand-500 to-orange-400"
                          }`}
                          style={{ width: `${j.progress}%` }}
                        />
                      </div>
                      <span className="w-24 text-right text-xs font-medium text-slate-500">
                        {done ? "Completed" : `${Math.floor(j.progress)}% · ${j.fmt.label}`}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      done ? "bg-emerald-100 text-emerald-600" : "bg-brand-100 text-brand-600"
                    }`}
                  >
                    {done ? <CheckIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4 animate-pulse" />}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

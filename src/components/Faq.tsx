"use client";

import { useState } from "react";
import { ChevronIcon } from "./Icons";

const faqs = [
  { q: "Is FlickGrab free to use?", a: "Yes — FlickGrab is 100% free with unlimited downloads. There is no registration, subscription or hidden fee." },
  { q: "Which platforms are supported?", a: "You can download from YouTube (videos, Shorts and music), Instagram (Reels, posts, IGTV and Stories) and TikTok (videos with or without watermark and original sounds)." },
  { q: "How do I download TikTok videos without a watermark?", a: "Copy the TikTok video link, paste it into the box at the top of the page and choose the “No Watermark” option. The clean video saves directly to your device." },
  { q: "Can I convert YouTube videos to MP3?", a: "Absolutely. After analyzing a link, switch to the “MP3 / Audio” tab and pick 128kbps or 320kbps quality." },
  { q: "Where are my downloaded files saved?", a: "Files are saved to your browser's default downloads folder. On Android they appear in the Downloads app or your gallery; on iPhone check the Files app." },
  { q: "Is it legal to download videos?", a: "Downloading for personal, offline use is usually fine, but always respect copyright and the platform's terms. Only download content you own or have permission to use." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-12 space-y-4">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className={`overflow-hidden rounded-3xl border transition ${
              isOpen ? "border-brand-200 bg-brand-50/50 shadow-lg shadow-brand-500/5" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
              <span className="text-[17px] font-bold text-slate-900">{f.q}</span>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${isOpen ? "rotate-180 bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <ChevronIcon className="h-5 w-5" />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-6 leading-relaxed text-slate-600">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

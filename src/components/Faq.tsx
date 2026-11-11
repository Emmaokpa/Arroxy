"use client";

import { useState } from "react";
import { ChevronIcon } from "./Icons";

const faqs = [
  {
    q: "Why can't FlickGrab download YouTube in my browser?",
    a: "Because YouTube makes it impossible, not because we skipped it. Each media URL is signed to the IP address that requested it, the CDN sends no CORS headers, and HD formats arrive as separate video and audio streams that need muxing on the device. A browser can do none of those things, so the only honest option is to say so.",
  },
  {
    q: "What about TikTok and Instagram?",
    a: "Both need an extraction step to turn a page into a media URL, and that step has to run somewhere. Instagram's public metadata additionally needs a Meta app access token. FlickGrab deliberately keeps no extractor, downloader or video storage on its servers, so these two are identified but not saved here.",
  },
  {
    q: "What does download today, then?",
    a: "Direct media links — a URL ending in .mp4, .webm, .mp3, .m4a and similar. Your browser fetches the file straight from its host and writes it to your device. Nothing passes through our server, and the host has to allow cross-origin reads for this to work.",
  },
  {
    q: "Is FlickGrab free?",
    a: "Yes. Checking a link and saving a direct file are free, with no account, no email and no daily limit. The only limit is a fair-use cap of 40 lookups a minute per address.",
  },
  {
    q: "Do you store the links I paste?",
    a: "No. The API reads public metadata from the source, returns it, and keeps nothing: no database, no accounts, no history. There are no analytics scripts on this page either.",
  },
  {
    q: "Where do saved files go?",
    a: "Wherever your browser puts downloads. On Android that is usually the Downloads app or your gallery; on iPhone, the Files app; on desktop, your Downloads folder.",
  },
  {
    q: "Is downloading videos legal?",
    a: "That depends on the content, the platform's terms and your local law. Only download what you own or have permission to use, and treat this page's verdict as a technical answer rather than legal advice.",
  },
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

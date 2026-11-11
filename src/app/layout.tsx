import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlickGrab — Free YouTube, Instagram & TikTok Video Downloader",
  description:
    "Download YouTube, Instagram and TikTok videos in HD, 4K or MP3. Free, fast, unlimited and no watermark.",
};

export const viewport: Viewport = {
  themeColor: "#e51d1d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}

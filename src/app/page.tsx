import Header from "@/components/Header";
import Downloader from "@/components/Downloader";
import { CheckIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/Icons";
import {
  AppPromo,
  CTA,
  FaqSection,
  Features,
  Footer,
  HowItWorks,
  PlatformStrip,
  Stats,
  Trending,
} from "@/components/Sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#ff4d3d] via-brand-600 to-[#8f0b17] pb-28 pt-36 text-center text-white sm:pt-40">
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="animate-blob absolute -left-24 top-20 h-96 w-96 rounded-full bg-orange-400/40 blur-3xl" />
          <div className="animate-blob absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-pink-600/40 blur-3xl [animation-delay:-5s]" />
          <div className="animate-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl [animation-delay:-9s]" />

          {/* floating platform badges */}
          <div className="animate-float absolute left-[7%] top-44 hidden rotate-[-12deg] rounded-3xl bg-white p-4 shadow-2xl xl:block">
            <YouTubeIcon className="h-12 w-12" />
          </div>
          <div className="animate-float-slow absolute right-[8%] top-52 hidden rotate-[10deg] rounded-3xl bg-white p-4 shadow-2xl xl:block">
            <InstagramIcon className="h-12 w-12" />
          </div>
          <div className="animate-float-slow absolute bottom-28 left-[12%] hidden rotate-[8deg] rounded-3xl bg-white p-4 shadow-2xl [animation-delay:-4s] xl:block">
            <TikTokIcon className="h-12 w-12" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-300" />
              </span>
              Free · Unlimited · No sign-up
            </span>
            <h1 className="animate-fade-up mx-auto mt-6 max-w-4xl text-[clamp(2.4rem,6vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight [animation-delay:80ms]">
              Download videos from{" "}
              <span className="relative whitespace-nowrap text-yellow-300">
                anywhere
                <svg viewBox="0 0 300 20" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none">
                  <path d="M3 15C80 4 220 2 297 12" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              , in seconds.
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-white/85 sm:text-xl [animation-delay:160ms]">
              Save YouTube, Instagram & TikTok videos in HD, 4K or MP3. Just paste the link and hit download.
            </p>

            <div className="animate-fade-up mt-10 [animation-delay:240ms]">
              <Downloader />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/85">
              {["No watermark", "4K & 60fps", "MP3 320kbps", "Works on all devices"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-yellow-300" /> {t}
                </span>
              ))}
            </div>
          </div>

          <svg className="absolute -bottom-px left-0 w-full text-white" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor">
            <path d="M0 80h1440V30c-240 40-480 50-720 30S240 0 0 30v50Z" />
          </svg>
        </section>

        <PlatformStrip />
        <Features />
        <HowItWorks />
        <AppPromo />
        <Trending />
        <Stats />
        <FaqSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

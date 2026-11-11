"use client";

import { useState } from "react";
import {
	ApiErrorSchema,
	InspectResponseSchema,
	type DeviceDownload,
	type InspectResponse,
} from "@/lib/contracts";
import type { InspectSource, SourceId } from "@/lib/sources";
import {
	DownloadIcon,
	InstagramIcon,
	PasteIcon,
	PlayIcon,
	SearchIcon,
	ShieldIcon,
	TikTokIcon,
	VideoIcon,
	XIcon,
	YouTubeIcon,
} from "./Icons";

const platforms: {
	id: SourceId;
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
		placeholder: "Paste Instagram Reel / Post link",
		sample: "https://www.instagram.com/reel/C8xYz12AbCd/",
		ring: "from-fuchsia-500 via-pink-500 to-orange-400",
	},
	{
		id: "tiktok",
		name: "TikTok",
		Icon: TikTokIcon,
		placeholder: "Paste TikTok video link",
		sample: "https://www.tiktok.com/@creator/video/7312345678901234567",
		ring: "from-cyan-400 via-slate-900 to-pink-500",
	},
];

/** A small, CC0 file every modern browser is allowed to fetch cross-origin. */
const SAMPLE_FILE = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

/** Browsers have to hold the file in memory before saving it. */
const MAX_INLINE_BYTES = 512 * 1024 * 1024;

const SOURCE_LABELS: Record<InspectSource, string> = {
	youtube: "YouTube",
	instagram: "Instagram",
	tiktok: "TikTok",
	file: "Direct file",
};

const SOURCE_ICONS: Record<InspectSource, typeof YouTubeIcon> = {
	youtube: YouTubeIcon,
	instagram: InstagramIcon,
	tiktok: TikTokIcon,
	file: VideoIcon,
};

async function readError(response: Response): Promise<string> {
	try {
		const parsed = ApiErrorSchema.safeParse(await response.json());
		return parsed.success ? parsed.data.error : `Request failed (${response.status}).`;
	} catch {
		return `Request failed (${response.status}).`;
	}
}

/**
 * Fetches a file straight from its host and saves it on this device. The bytes
 * go from the host to the browser — FlickGrab's server is never involved.
 */
async function saveOnDevice(download: DeviceDownload): Promise<void> {
	const response = await fetch(download.url, { mode: "cors" });
	if (!response.ok) throw new Error(`The file's host answered with ${response.status}.`);

	const declared = Number(response.headers.get("content-length") ?? "");
	if (Number.isFinite(declared) && declared > MAX_INLINE_BYTES) {
		throw new Error("too-large");
	}

	const blob = await response.blob();
	const href = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = href;
	anchor.download = download.filename;
	anchor.rel = "noopener";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

export default function Downloader() {
	const [platform, setPlatform] = useState<SourceId>("youtube");
	const [url, setUrl] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
	const [result, setResult] = useState<InspectResponse | null>(null);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState("");
	const [copied, setCopied] = useState(false);

	const current = platforms.find((p) => p.id === platform) ?? platforms[0];

	const inspect = async (value = url) => {
		const trimmed = value.trim();
		if (!trimmed) {
			setError("Please paste a video link first.");
			setStatus("error");
			return;
		}
		setError("");
		setSaveMessage("");
		setStatus("loading");
		setResult(null);
		try {
			const response = await fetch("/api/inspect", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: trimmed }),
			});
			if (!response.ok) {
				setError(await readError(response));
				setStatus("error");
				return;
			}
			setResult(InspectResponseSchema.parse(await response.json()));
			setStatus("ready");
		} catch {
			setError("Could not reach the server. Is the API running?");
			setStatus("error");
		}
	};

	const paste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			if (text.trim()) {
				setUrl(text);
				await inspect(text);
				return;
			}
		} catch {
			/* clipboard permission denied — fall through to the sample */
		}
		setUrl(current.sample);
		await inspect(current.sample);
	};

	const download = async (target: DeviceDownload) => {
		setSaving(true);
		setSaveMessage("");
		try {
			await saveOnDevice(target);
			setSaveMessage("Saved to your device.");
		} catch (caught) {
			const reason = caught instanceof Error ? caught.message : "";
			setSaveMessage(
				reason === "too-large"
					? "That file is over 512 MB, which a browser cannot hold in memory. Open the link directly to save it."
					: "Your browser could not read that file. The host may not allow cross-origin downloads.",
			);
		} finally {
			setSaving(false);
		}
	};

	const copyLink = async () => {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(result.url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setSaveMessage("Copying needs clipboard permission in this browser.");
		}
	};

	const reset = () => {
		setUrl("");
		setStatus("idle");
		setResult(null);
		setSaveMessage("");
		setCopied(false);
	};

	const ResultIcon = result ? SOURCE_ICONS[result.source] : YouTubeIcon;

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
					void inspect();
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
								onClick={reset}
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
								Checking…
							</>
						) : (
							<>
								<SearchIcon className="h-5 w-5" /> Check link
							</>
						)}
					</button>
				</div>
			</form>

			{status === "error" && <p className="animate-fade-up mt-4 text-center text-sm font-medium text-yellow-200">⚠ {error}</p>}

			{status === "idle" && (
				<p className="mt-4 text-center text-sm text-white/75">
					Try a sample:{" "}
					{platforms.map((p, i) => (
						<span key={p.id}>
							<button
								onClick={() => {
									setUrl(p.sample);
									void inspect(p.sample);
								}}
								className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
							>
								{p.name}
							</button>
							{i < platforms.length - 1 ? " · " : " · "}
						</span>
					))}
					<button
						onClick={() => {
							setUrl(SAMPLE_FILE);
							void inspect(SAMPLE_FILE);
						}}
						className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
					>
						direct file
					</button>
				</p>
			)}

			{status === "loading" && (
				<div className="animate-fade-up mt-6 rounded-[28px] bg-white p-5 shadow-2xl">
					<div className="flex flex-col gap-5 sm:flex-row">
						<div className="shimmer aspect-video w-full rounded-2xl sm:w-72" />
						<div className="flex-1 space-y-3">
							<div className="shimmer h-5 w-4/5 rounded-full" />
							<div className="shimmer h-5 w-3/5 rounded-full" />
							<div className="shimmer h-4 w-1/3 rounded-full" />
							<div className="mt-6 shimmer h-24 rounded-2xl" />
						</div>
					</div>
				</div>
			)}

			{/* Result */}
			{status === "ready" && result && (
				<div className="animate-fade-up mt-6 overflow-hidden rounded-[28px] bg-white text-left shadow-2xl">
					<div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
						<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-rose-500 to-purple-700 sm:w-72">
							{result.thumbnail ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={result.thumbnail} alt="" className="h-full w-full object-cover" />
							) : (
								<div className="absolute inset-0 grid place-items-center">
									<PlayIcon className="ml-1 h-10 w-10 text-white" />
								</div>
							)}
							<span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-white shadow">
								<ResultIcon className="h-5 w-5" />
							</span>
						</div>

						<div className="min-w-0 flex-1">
							<span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
								{SOURCE_LABELS[result.source]}
							</span>
							<h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-slate-900">
								{result.title ?? result.verdict.headline}
							</h3>
							{result.author && <p className="mt-1.5 text-sm text-slate-500">{result.author}</p>}
							{result.metadataNote && <p className="mt-1 text-xs text-slate-400">{result.metadataNote}</p>}

							<div
								className={`mt-4 rounded-2xl border p-4 ${
									result.verdict.downloadInBrowser ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
								}`}
							>
								<p className="flex items-center gap-2 text-sm font-bold text-slate-900">
									<ShieldIcon className="h-4 w-4 shrink-0" />
									{result.verdict.headline}
								</p>
								<p className="mt-1.5 text-sm leading-relaxed text-slate-600">{result.verdict.detail}</p>

								<div className="mt-3.5 flex flex-wrap items-center gap-2">
									{result.deviceDownload ? (
										<button
											onClick={() => void download(result.deviceDownload!)}
											disabled={saving}
											className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:brightness-110 disabled:opacity-70"
										>
											{saving ? (
												<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
											) : (
												<DownloadIcon className="h-4 w-4" />
											)}
											{saving ? "Saving…" : "Download to this device"}
										</button>
									) : (
										<button
											onClick={() => void copyLink()}
											className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
										>
											{copied ? "Link copied" : "Copy link"}
										</button>
									)}
									<a
										href={result.url}
										target="_blank"
										rel="noreferrer"
										className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
									>
										Open original
									</a>
								</div>
								{saveMessage && <p className="mt-2.5 text-xs font-medium text-slate-600">{saveMessage}</p>}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

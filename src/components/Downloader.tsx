"use client";

import { useEffect, useState } from "react";
import {
	AnalyzeResponseSchema,
	ApiErrorSchema,
	DownloadJobSchema,
	type AnalyzeResponse,
	type DownloadJob,
	type DownloadOption,
} from "@/lib/contracts";
import { classifySource, type SourceId } from "@/lib/sources";
import {
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

type Platform = SourceId;

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

function platformFor(url: string): Platform {
	return classifySource(url) ?? "youtube";
}

function formatBytes(bytes: number | null): string | null {
	if (bytes === null || bytes <= 0) return null;
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

function formatDuration(seconds: number | null): string | null {
	if (seconds === null || seconds <= 0) return null;
	const total = Math.round(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const rest = total % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

async function readError(response: Response): Promise<string> {
	try {
		const parsed = ApiErrorSchema.safeParse(await response.json());
		return parsed.success ? parsed.data.error : `Request failed (${response.status}).`;
	} catch {
		return `Request failed (${response.status}).`;
	}
}

type QueueItem = DownloadJob & { title: string };

export default function Downloader() {
	const [platform, setPlatform] = useState<Platform>("youtube");
	const [url, setUrl] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
	const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
	const [tab, setTab] = useState<"video" | "audio">("video");
	const [queue, setQueue] = useState<QueueItem[]>([]);
	const [error, setError] = useState("");
	const [busyOption, setBusyOption] = useState<string | null>(null);

	const current = platforms.find((p) => p.id === platform)!;

	const analyze = async (value = url) => {
		const trimmed = value.trim();
		if (!trimmed) {
			setError("Please paste a video link first.");
			setStatus("error");
			return;
		}
		setError("");
		setStatus("loading");
		setAnalysis(null);
		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: trimmed }),
			});
			if (!response.ok) {
				setError(await readError(response));
				setStatus("error");
				return;
			}
			const data = AnalyzeResponseSchema.parse(await response.json());
			setAnalysis(data);
			setPlatform(classifySource(trimmed) ?? platform);
			setTab(data.options.some((option) => option.kind === "video") ? "video" : "audio");
			setStatus("done");
		} catch {
			setError("Could not reach the server. Is it running?");
			setStatus("error");
		}
	};

	const paste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			if (text.trim()) {
				setUrl(text);
				await analyze(text);
				return;
			}
		} catch {
			/* clipboard permission denied — fall through to the sample */
		}
		setUrl(current.sample);
		await analyze(current.sample);
	};

	const startDownload = async (option: DownloadOption) => {
		if (!analysis) return;
		setBusyOption(option.id);
		setError("");
		try {
			const response = await fetch("/api/download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: analysis.sourceUrl, optionId: option.id }),
			});
			if (!response.ok) {
				setError(await readError(response));
				return;
			}
			const job = DownloadJobSchema.parse(await response.json());
			setQueue((items) => [{ ...job, title: analysis.title }, ...items]);
		} catch {
			setError("Could not start the download. Is the server running?");
		} finally {
			setBusyOption(null);
		}
	};

	const activeIds = queue
		.filter((job) => job.status === "queued" || job.status === "downloading")
		.map((job) => job.id)
		.join(",");

	useEffect(() => {
		if (!activeIds) return;
		const ids = activeIds.split(",");
		const timer = setInterval(async () => {
			const updates = await Promise.all(
				ids.map(async (id) => {
					try {
						const response = await fetch(`/api/download/${id}`, { cache: "no-store" });
						if (!response.ok) return null;
						return DownloadJobSchema.parse(await response.json());
					} catch {
						return null;
					}
				}),
			);
			setQueue((items) =>
				items.map((item) => {
					const update = updates.find((candidate) => candidate?.id === item.id);
					return update ? { ...item, ...update } : item;
				}),
			);
		}, 1000);
		return () => clearInterval(timer);
	}, [activeIds]);

	const options = analysis ? analysis.options.filter((option) => option.kind === tab) : [];
	const tabs = analysis
		? (["video", "audio"] as const).filter((kind) => analysis.options.some((option) => option.kind === kind))
		: [];
	const duration = analysis ? formatDuration(analysis.durationSeconds) : null;

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
					void analyze();
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
									setAnalysis(null);
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

			{status === "error" && <p className="animate-fade-up mt-4 text-center text-sm font-medium text-yellow-200">⚠ {error}</p>}

			{status === "idle" && (
				<p className="mt-4 text-center text-sm text-white/75">
					Try a sample:{" "}
					{platforms.map((p, i) => (
						<span key={p.id}>
							<button
								onClick={() => {
									setUrl(p.sample);
									void analyze(p.sample);
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
			{status === "done" && analysis && (
				<div className="animate-fade-up mt-6 overflow-hidden rounded-[28px] bg-white text-left shadow-2xl">
					<div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
						<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-rose-500 to-purple-700 sm:w-72">
							{analysis.thumbnail ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={analysis.thumbnail} alt="" className="h-full w-full object-cover" />
							) : (
								<div className="absolute inset-0 grid place-items-center">
									<PlayIcon className="ml-1 h-10 w-10 text-white" />
								</div>
							)}
							{duration && (
								<span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
									{duration}
								</span>
							)}
							<span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-white shadow">
								{(() => {
									const P = platforms.find((p) => p.id === platformFor(analysis.sourceUrl))!.Icon;
									return <P className="h-5 w-5" />;
								})()}
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">{analysis.title}</h3>
							<p className="mt-1.5 text-sm text-slate-500">
								{analysis.uploader ?? "Unknown uploader"}
								{analysis.durationSeconds ? ` · ${formatDuration(analysis.durationSeconds)}` : ""}
							</p>

							{tabs.length > 1 && (
								<div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
									{tabs.map((kind) => (
										<button
											key={kind}
											onClick={() => setTab(kind)}
											className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
												tab === kind ? "bg-white text-brand-600 shadow" : "text-slate-500 hover:text-slate-800"
											}`}
										>
											{kind === "video" ? <VideoIcon className="h-4 w-4" /> : <MusicIcon className="h-4 w-4" />}
											{kind === "video" ? "Video" : "MP3 / Audio"}
										</button>
									))}
								</div>
							)}

							<div className="mt-4 grid gap-2.5 sm:grid-cols-2">
								{options.map((option) => {
									const size = formatBytes(option.filesize);
									return (
										<button
											key={option.id}
											onClick={() => void startDownload(option)}
											disabled={busyOption !== null}
											className="group/f flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
										>
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<span className="font-bold text-slate-900">{option.label}</span>
													<span className="rounded-md bg-gradient-to-r from-brand-500 to-orange-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
														{option.container}
													</span>
												</div>
												<p className="text-xs text-slate-500">
													{size ? `${size} · ` : ""}
													{option.note ?? (option.kind === "video" ? "video" : "audio")}
												</p>
											</div>
											<span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30 transition group-hover/f:scale-110">
												{busyOption === option.id ? (
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
												) : (
													<DownloadIcon className="h-4 w-4" />
												)}
											</span>
										</button>
									);
								})}
							</div>
							{options.length === 0 && (
								<p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
									No {tab} formats were found for this link.
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Download queue */}
			{queue.length > 0 && (
				<div className="animate-fade-up mt-5 rounded-[28px] bg-white/95 p-5 text-left shadow-2xl backdrop-blur">
					<div className="mb-3 flex items-center justify-between">
						<h4 className="font-bold text-slate-900">Downloads</h4>
						<button onClick={() => setQueue([])} className="text-xs font-semibold text-slate-400 hover:text-brand-600">
							Clear list
						</button>
					</div>
					<ul className="space-y-3">
						{queue.map((job) => {
							const done = job.status === "completed";
							const failed = job.status === "failed";
							const P = platforms.find((p) => p.id === platformFor(analysis?.sourceUrl ?? ""))!.Icon;
							return (
								<li key={job.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
									<span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
										<P className="h-6 w-6" />
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-slate-800">{job.filename ?? job.title}</p>
										<div className="mt-1.5 flex items-center gap-3">
											<div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
												<div
													className={`h-full rounded-full transition-all duration-300 ${
														failed ? "bg-red-500" : done ? "bg-emerald-500" : "bg-gradient-to-r from-brand-500 to-orange-400"
													}`}
													style={{ width: `${failed ? 100 : job.progress}%` }}
												/>
											</div>
											<span className="w-28 truncate text-right text-xs font-medium text-slate-500">
												{failed ? job.error ?? "Failed" : done ? "Completed" : `${Math.floor(job.progress)}%`}
											</span>
										</div>
									</div>
									{done ? (
										<a
											href={`/api/download/${job.id}/file`}
											className="grid h-8 place-items-center rounded-full bg-emerald-100 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
										>
											Save
										</a>
									) : (
										<span
											className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
												failed ? "bg-red-100 text-red-600" : "bg-brand-100 text-brand-600"
											}`}
										>
											{failed ? <XIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4 animate-pulse" />}
										</span>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

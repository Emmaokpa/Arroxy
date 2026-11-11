import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { DownloadOption } from "./contracts";

const BIN_NAME = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";

/** Resolves the yt-dlp executable: explicit env override, local `.bin/`, then PATH. */
export function resolveYtDlp(): string {
	const configured = process.env.YTDLP_PATH?.trim();
	if (configured) return configured;
	const local = path.join(process.cwd(), ".bin", BIN_NAME);
	if (existsSync(local)) return local;
	return BIN_NAME;
}

function execFileAsync(bin: string, args: string[], timeout: number, maxBuffer: number) {
	return new Promise<string>((resolve, reject) => {
		execFile(bin, args, { timeout, maxBuffer, windowsHide: true }, (error, stdout) => {
			if (error) reject(error);
			else resolve(stdout);
		});
	});
}

export async function ytDlpVersion(): Promise<string | null> {
	try {
		const out = await execFileAsync(resolveYtDlp(), ["--version"], 15_000, 1024 * 1024);
		return out.trim() || null;
	} catch {
		return null;
	}
}

let ffmpegCache: string | null | undefined;

/**
 * Resolves an ffmpeg executable: explicit env override, local `.bin/`, then the
 * `ffmpeg-static` package installed by npm, then `ffmpeg` on PATH. Returns null
 * when none of them can run.
 */
export async function resolveFfmpeg(): Promise<string | null> {
	if (ffmpegCache !== undefined) return ffmpegCache;
	const exe = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
	const candidates = [
		process.env.FFMPEG_PATH?.trim(),
		path.join(process.cwd(), ".bin", exe),
		path.join(process.cwd(), "node_modules", "ffmpeg-static", exe),
		"ffmpeg",
	].filter((candidate): candidate is string => Boolean(candidate));

	for (const candidate of candidates) {
		try {
			await execFileAsync(candidate, ["-version"], 15_000, 1024 * 1024);
			ffmpegCache = candidate;
			return candidate;
		} catch {
			/* try the next candidate */
		}
	}
	ffmpegCache = null;
	return null;
}

/** True when ffmpeg is reachable, which enables merging and MP3 conversion. */
export async function hasFfmpeg(): Promise<boolean> {
	return (await resolveFfmpeg()) !== null;
}

const RawFormatSchema = z.object({
	format_id: z.string().optional(),
	ext: z.string().optional(),
	height: z.number().nullish(),
	vcodec: z.string().nullish(),
	acodec: z.string().nullish(),
	filesize: z.number().nullish(),
	filesize_approx: z.number().nullish(),
	abr: z.number().nullish(),
	tbr: z.number().nullish(),
	format_note: z.string().nullish(),
});

const RawInfoSchema = z.object({
	title: z.string().optional(),
	uploader: z.string().nullish(),
	channel: z.string().nullish(),
	duration: z.number().nullish(),
	thumbnail: z.string().nullish(),
	webpage_url: z.string().nullish(),
	formats: z.array(RawFormatSchema).nullish(),
});

type RawFormat = z.infer<typeof RawFormatSchema>;

export type ProbeResult = {
	title: string;
	uploader: string | null;
	durationSeconds: number | null;
	thumbnail: string | null;
	sourceUrl: string;
	formats: RawFormat[];
};

/** Yt-dlp failure that carries a message safe to show to the user. */
export class ProbeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ProbeError";
	}
}

export async function probe(url: string): Promise<ProbeResult> {
	let stdout: string;
	try {
		stdout = await execFileAsync(
			resolveYtDlp(),
			["--dump-single-json", "--no-playlist", "--no-warnings", "--no-progress", "--socket-timeout", "20", "--", url],
			90_000,
			64 * 1024 * 1024,
		);
	} catch (error) {
		throw new ProbeError(describeFailure(error));
	}

	let parsed: z.infer<typeof RawInfoSchema>;
	try {
		parsed = RawInfoSchema.parse(JSON.parse(stdout));
	} catch {
		throw new ProbeError("The source returned metadata this app could not read.");
	}

	return {
		title: parsed.title?.trim() || "Untitled",
		uploader: parsed.uploader ?? parsed.channel ?? null,
		durationSeconds: typeof parsed.duration === "number" ? parsed.duration : null,
		thumbnail: parsed.thumbnail ?? null,
		sourceUrl: parsed.webpage_url ?? url,
		formats: parsed.formats ?? [],
	};
}

function describeFailure(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	if (message.includes("ENOENT")) {
		return "yt-dlp is not installed on the server. Run `bun run setup:bin`.";
	}
	const cleaned = message
		.split(/\r?\n/)
		.map((line) => line.replace(/^ERROR:\s*/i, "").trim())
		.filter(Boolean)
		.slice(0, 2)
		.join(" ");
	return cleaned.slice(0, 300) || "The source could not be read.";
}

function bestByHeight(formats: RawFormat[], height: number): RawFormat | undefined {
	return formats
		.filter((f) => f.height === height && f.vcodec && f.vcodec !== "none")
		.sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0))[0];
}

/** A format that already contains both video and audio (no merge needed). */
function progressiveAtHeight(formats: RawFormat[], height: number): RawFormat | undefined {
	return formats
		.filter(
			(f) =>
				f.height === height &&
				f.vcodec &&
				f.vcodec !== "none" &&
				f.acodec &&
				f.acodec !== "none",
		)
		.sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0))[0];
}

function bestAudio(formats: RawFormat[]): RawFormat | undefined {
	return formats
		.filter((f) => (!f.vcodec || f.vcodec === "none") && f.acodec && f.acodec !== "none")
		.sort((a, b) => (b.abr ?? b.tbr ?? 0) - (a.abr ?? a.tbr ?? 0))[0];
}

function sizeOf(format: RawFormat | undefined): number | null {
	const size = format?.filesize ?? format?.filesize_approx;
	return typeof size === "number" && Number.isFinite(size) && size > 0 ? Math.round(size) : null;
}

/** Largest known size among the formats at one height, ignoring HLS variants with no size. */
function sizeAtHeight(formats: RawFormat[], height: number): number | null {
	const sizes = formats
		.filter((format) => format.height === height)
		.map((format) => sizeOf(format))
		.filter((size): size is number => size !== null);
	return sizes.length > 0 ? Math.max(...sizes) : null;
}

const VIDEO_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240, 144];

/**
 * Turns raw yt-dlp formats into the options this app offers. The ids are
 * semantic (`video:1080`, `audio:mp3`) rather than raw yt-dlp format ids, so
 * the client can never ask the server to run an arbitrary selector.
 */
export function buildDownloadOptions(formats: RawFormat[], ffmpeg: boolean): DownloadOption[] {
	const options: DownloadOption[] = [];
	// Without ffmpeg no streams can be merged, so only heights that already have
	// a complete video+audio format are honest to offer.
	const heights = VIDEO_HEIGHTS.filter((height) =>
		ffmpeg ? bestByHeight(formats, height) !== undefined : progressiveAtHeight(formats, height) !== undefined,
	);
	const audio = bestAudio(formats);

	for (const height of heights.slice(0, 6)) {
		const format = ffmpeg ? bestByHeight(formats, height) : progressiveAtHeight(formats, height);
		const videoSize = sizeAtHeight(formats, height);
		const audioSize = sizeOf(audio);
		const mergedSize = ffmpeg && videoSize !== null && audioSize !== null ? videoSize + audioSize : videoSize;
		options.push({
			id: `video:${height}`,
			kind: "video",
			label: `${height}p`,
			container: ffmpeg ? "mp4" : (format?.ext ?? "mp4"),
			filesize: mergedSize,
			note: ffmpeg ? (height >= 2160 ? "4K" : height >= 1080 ? "Full HD" : null) : "single file",
		});
	}

	if (ffmpeg) {
		options.push({
			id: "audio:mp3",
			kind: "audio",
			label: "MP3",
			container: "mp3",
			filesize: sizeOf(audio),
			note: "converted audio",
		});
	} else if (audio) {
		options.push({
			id: "audio:original",
			kind: "audio",
			label: "Audio",
			container: audio.ext ?? "m4a",
			filesize: sizeOf(audio),
			note: "original stream · ffmpeg not installed",
		});
	}

	return options;
}

/** Maps a semantic option id to safe yt-dlp arguments. */
export function formatArgsFor(optionId: string, ffmpeg: boolean): string[] {
	const video = /^video:(\d{3,4})$/.exec(optionId);
	if (video) {
		const height = Number(video[1]);
		if (!VIDEO_HEIGHTS.includes(height)) throw new Error("Unsupported video quality.");
		if (ffmpeg) {
			return [
				"-f",
				`bv*[height<=${height}][ext=mp4]+ba[ext=m4a]/b[height<=${height}][ext=mp4]/bv*[height<=${height}]+ba/b[height<=${height}]/b`,
				"--merge-output-format",
				"mp4",
			];
		}
		return ["-f", `b[height<=${height}]/b`];
	}
	if (optionId === "audio:mp3") {
		if (!ffmpeg) throw new Error("MP3 conversion needs ffmpeg on the server.");
		return ["-x", "--audio-format", "mp3", "--audio-quality", "0"];
	}
	if (optionId === "audio:original") {
		return ["-f", "ba/b"];
	}
	throw new Error("Unknown download option.");
}

export type ProgressHandler = (percent: number) => void;

export type SpawnDownloadOptions = {
	url: string;
	optionId: string;
	outputDir: string;
	ffmpegPath: string | null;
	onProgress: ProgressHandler;
	signal?: AbortSignal;
};

/** Starts a yt-dlp download and resolves with nothing; rejects on failure. */
export function spawnDownload(options: SpawnDownloadOptions): Promise<void> {
	const args = [
		...formatArgsFor(options.optionId, options.ffmpegPath !== null),
		...(options.ffmpegPath ? ["--ffmpeg-location", options.ffmpegPath] : []),
		"-o",
		path.join(options.outputDir, "%(title).120B [%(id)s].%(ext)s"),
		"--no-playlist",
		"--no-warnings",
		"--newline",
		"--no-mtime",
		"--progress-template",
		"download:%(progress._percent_str)s",
		"--",
		options.url,
	];

	return new Promise((resolve, reject) => {
		const child = spawn(resolveYtDlp(), args, {
			shell: false,
			windowsHide: true,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stderr = "";
		const onData = (chunk: Buffer) => {
			const text = chunk.toString("utf8");
			const match = /(\d{1,3}(?:\.\d+)?)%/.exec(text);
			if (match) options.onProgress(Math.min(100, Number(match[1])));
		};
		child.stdout.on("data", onData);
		child.stderr.on("data", (chunk: Buffer) => {
			stderr = `${stderr}${chunk.toString("utf8")}`.slice(-4000);
			onData(chunk);
		});

		const abort = () => child.kill("SIGTERM");
		options.signal?.addEventListener("abort", abort, { once: true });

		child.on("error", (error) => {
			options.signal?.removeEventListener("abort", abort);
			reject(error);
		});
		child.on("close", (code) => {
			options.signal?.removeEventListener("abort", abort);
			if (code === 0) {
				resolve();
				return;
			}
			const detail = stderr
				.split(/\r?\n/)
				.map((line) => line.replace(/^ERROR:\s*/i, "").trim())
				.filter(Boolean)
				.at(-1);
			reject(new Error((detail ?? `yt-dlp exited with code ${code ?? 1}`).slice(0, 300)));
		});
	});
}

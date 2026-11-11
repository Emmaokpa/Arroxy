import { randomUUID } from "node:crypto";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { DownloadJob, JobStatus } from "./contracts";
import { buildDownloadOptions, probe, resolveFfmpeg, spawnDownload } from "./ytdlp";

const JOBS_ROOT = path.join(os.tmpdir(), "flickgrab");
const JOB_TTL_MS = 30 * 60 * 1000;
const MAX_ACTIVE_JOBS = 3;

type InternalJob = {
	id: string;
	status: JobStatus;
	progress: number;
	filename: string | null;
	error: string | null;
	filePath: string | null;
	dir: string;
	createdAt: number;
};

const globalForJobs = globalThis as typeof globalThis & {
	__flickgrabJobs?: Map<string, InternalJob>;
};

const jobs = globalForJobs.__flickgrabJobs ?? new Map<string, InternalJob>();
globalForJobs.__flickgrabJobs = jobs;

export class TooManyDownloadsError extends Error {
	constructor() {
		super("Too many downloads are running. Wait for one to finish and try again.");
		this.name = "TooManyDownloadsError";
	}
}

function toPublicJob(job: InternalJob): DownloadJob {
	return {
		id: job.id,
		status: job.status,
		progress: job.progress,
		filename: job.filename,
		error: job.error,
	};
}

export function getJob(id: string): DownloadJob | null {
	const job = jobs.get(id);
	return job ? toPublicJob(job) : null;
}

export function getJobFile(id: string): { path: string; filename: string } | null {
	const job = jobs.get(id);
	if (!job || job.status !== "completed" || !job.filePath || !job.filename) return null;
	return { path: job.filePath, filename: job.filename };
}

export function activeJobCount(): number {
	return [...jobs.values()].filter((job) => job.status === "queued" || job.status === "downloading").length;
}

async function findProducedFile(dir: string): Promise<string | null> {
	const entries = await readdir(dir, { withFileTypes: true });
	let best: { filePath: string; size: number } | null = null;
	for (const entry of entries) {
		if (!entry.isFile() || entry.name.endsWith(".part") || entry.name.endsWith(".ytdl")) continue;
		const filePath = path.join(dir, entry.name);
		const info = await stat(filePath);
		if (!best || info.size > best.size) best = { filePath, size: info.size };
	}
	return best?.filePath ?? null;
}

async function runJob(job: InternalJob, url: string, optionId: string): Promise<void> {
	try {
		const ffmpegPath = await resolveFfmpeg();
		job.status = "downloading";
		await spawnDownload({
			url,
			optionId,
			outputDir: job.dir,
			ffmpegPath,
			onProgress: (percent) => {
				job.progress = Math.max(job.progress, percent);
			},
		});
		const filePath = await findProducedFile(job.dir);
		if (!filePath) throw new Error("yt-dlp finished but produced no file.");
		job.filePath = filePath;
		job.filename = path.basename(filePath);
		job.progress = 100;
		job.status = "completed";
	} catch (error) {
		job.status = "failed";
		job.error = error instanceof Error ? error.message.slice(0, 500) : "Download failed.";
	} finally {
		setTimeout(() => {
			jobs.delete(job.id);
			void rm(job.dir, { recursive: true, force: true });
		}, JOB_TTL_MS).unref();
	}
}

/**
 * Probes the URL, verifies the requested option is genuinely offered, then
 * starts a background download. Returns immediately with the job snapshot.
 */
export async function createJob(url: string, optionId: string): Promise<DownloadJob> {
	if (activeJobCount() >= MAX_ACTIVE_JOBS) throw new TooManyDownloadsError();

	const info = await probe(url);
	const options = buildDownloadOptions(info.formats, (await resolveFfmpeg()) !== null);
	if (!options.some((option) => option.id === optionId)) {
		throw new Error("That quality is not available for this link.");
	}

	const id = randomUUID();
	const dir = path.join(JOBS_ROOT, id);
	await mkdir(dir, { recursive: true });

	const job: InternalJob = {
		id,
		status: "queued",
		progress: 0,
		filename: null,
		error: null,
		filePath: null,
		dir,
		createdAt: Date.now(),
	};
	jobs.set(id, job);
	void runJob(job, url, optionId);

	return toPublicJob(job);
}

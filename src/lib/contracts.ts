import { z } from "zod";

/** Request body for POST /api/analyze. */
export const AnalyzeRequestSchema = z.object({
	url: z.string().min(1).max(2048),
});

/** A single download option the backend is willing to produce. */
export const DownloadOptionSchema = z.object({
	id: z.string().min(1).max(64),
	kind: z.enum(["video", "audio"]),
	label: z.string().min(1).max(64),
	container: z.string().min(1).max(16),
	filesize: z.number().int().nonnegative().nullable(),
	note: z.string().max(120).nullable(),
});
export type DownloadOption = z.infer<typeof DownloadOptionSchema>;

/** Response body for POST /api/analyze. */
export const AnalyzeResponseSchema = z.object({
	title: z.string().min(1).max(500),
	uploader: z.string().max(200).nullable(),
	durationSeconds: z.number().nonnegative().nullable(),
	thumbnail: z.string().max(2048).nullable(),
	sourceUrl: z.string().max(2048),
	options: z.array(DownloadOptionSchema).max(40),
});
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

/** Request body for POST /api/download. */
export const DownloadRequestSchema = z.object({
	url: z.string().min(1).max(2048),
	optionId: z.string().min(1).max(64),
});

export const JOB_STATUS = ["queued", "downloading", "completed", "failed"] as const;
export const JobStatusSchema = z.enum(JOB_STATUS);
export type JobStatus = z.infer<typeof JobStatusSchema>;

/** Public shape of a download job polled from GET /api/download/[id]. */
export const DownloadJobSchema = z.object({
	id: z.string().min(1).max(64),
	status: JobStatusSchema,
	progress: z.number().min(0).max(100),
	filename: z.string().max(500).nullable(),
	error: z.string().max(500).nullable(),
});
export type DownloadJob = z.infer<typeof DownloadJobSchema>;

/** Error shape returned by every API route on failure. */
export const ApiErrorSchema = z.object({
	error: z.string().max(500),
});

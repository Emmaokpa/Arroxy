import { AnalyzeRequestSchema, AnalyzeResponseSchema } from "@/lib/contracts";
import { apiError } from "@/lib/http";
import { normalizeUrl } from "@/lib/sources";
import { buildDownloadOptions, hasFfmpeg, probe } from "@/lib/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError("Invalid request body.", 400);
	}

	const parsed = AnalyzeRequestSchema.safeParse(body);
	if (!parsed.success) {
		return apiError("Paste a valid link.", 400);
	}

	const url = normalizeUrl(parsed.data.url);
	if (!url) {
		return apiError("Unsupported link. Use a YouTube, Instagram or TikTok URL.", 400);
	}

	try {
		const info = await probe(url);
		const ffmpeg = await hasFfmpeg();
		const options = buildDownloadOptions(info.formats, ffmpeg);
		if (options.length === 0) {
			return apiError("No downloadable video or audio was found at that link.", 422);
		}

		const payload = AnalyzeResponseSchema.parse({
			title: info.title,
			uploader: info.uploader,
			durationSeconds: info.durationSeconds,
			thumbnail: info.thumbnail,
			sourceUrl: info.sourceUrl,
			options,
		});
		return Response.json(payload);
	} catch (error) {
		return apiError(error instanceof Error ? error.message : "Could not read that link.", 502);
	}
}

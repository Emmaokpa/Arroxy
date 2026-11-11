import { InspectRequestSchema, type InspectResponse } from "../src/lib/contracts";
import { canonicalize, classifySource, isDirectMediaUrl, mediaKind, suggestedFilename } from "../src/lib/sources";
import { verdictFor } from "./capabilities";
import { ApiError } from "./errors";
import { expandShortLink } from "./links";
import { readMetadata } from "./metadata";

/**
 * Classifies a pasted link and returns public metadata plus an honest verdict.
 *
 * This is the whole job of the API: it never downloads, proxies, muxes or
 * stores media, and it never asks yt-dlp or ffmpeg to touch a user's URL.
 */
export async function inspect(input: unknown): Promise<InspectResponse> {
	const parsed = InspectRequestSchema.safeParse(input);
	if (!parsed.success) {
		throw new ApiError(400, parsed.error.issues[0]?.message ?? "Paste a link first.");
	}

	const expanded = await expandShortLink(parsed.data.url);
	const canonical = canonicalize(expanded);
	if (!canonical) {
		throw new ApiError(400, "That doesn't look like a web link. Paste a full http(s) URL.");
	}

	const source = classifySource(canonical);

	if (!source) {
		if (!isDirectMediaUrl(canonical)) {
			throw new ApiError(400, "FlickGrab supports YouTube, Instagram, TikTok and direct media links.");
		}
		return {
			url: canonical,
			source: "file",
			title: null,
			author: null,
			thumbnail: null,
			metadataNote: null,
			deviceDownload: { url: canonical, filename: suggestedFilename(canonical) },
			verdict: verdictFor("file"),
		};
	}

	const metadata = await readMetadata(source, canonical);
	return {
		url: canonical,
		source,
		title: metadata.title,
		author: metadata.author,
		thumbnail: metadata.thumbnail,
		metadataNote: metadata.note,
		deviceDownload: null,
		verdict: verdictFor(source),
	};
}

/** Exposed for the capabilities route so the UI and docs cannot drift. */
export { mediaKind };

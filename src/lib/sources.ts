import { z } from "zod";

/**
 * Social sources this product knows how to classify. Adding a source means
 * adding it here, in the host allowlist below, and in the UI platform tabs.
 */
export const SOURCE_IDS = ["youtube", "instagram", "tiktok"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

export const SourceIdSchema = z.enum(SOURCE_IDS);

/** Everything `/api/inspect` can classify: the social sources plus plain files. */
export const INSPECT_SOURCES = [...SOURCE_IDS, "file"] as const;
export type InspectSource = (typeof INSPECT_SOURCES)[number];

export const InspectSourceSchema = z.enum(INSPECT_SOURCES);

const HOSTS: Record<SourceId, readonly string[]> = {
	youtube: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
	instagram: ["instagram.com"],
	tiktok: ["tiktok.com"],
};

/**
 * Hosts whose links can only be expanded by following a redirect. `youtu.be`
 * is deliberately absent: its video id is in the path, so canonicalising it
 * needs no network call.
 */
const REDIRECTING_HOSTS = new Set(["vm.tiktok.com", "vt.tiktok.com"]);

const TRACKING_PARAMS = new Set([
	"si",
	"feature",
	"pp",
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_term",
	"utm_content",
	"igsh",
	"igshid",
	"is_from_webapp",
	"is_copy_url",
	"sender_device",
	"web_id",
	"_r",
	"_t",
]);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

const MEDIA_EXTENSIONS: Record<string, "video" | "audio"> = {
	mp4: "video",
	webm: "video",
	mov: "video",
	m4v: "video",
	mkv: "video",
	mp3: "audio",
	m4a: "audio",
	aac: "audio",
	ogg: "audio",
	opus: "audio",
	wav: "audio",
	flac: "audio",
};

/** Classifies a pasted URL into a supported social source, or null. */
export function classifySource(raw: string): SourceId | null {
	const url = parseHttpUrl(raw);
	if (!url) return null;
	const host = url.hostname.toLowerCase().replace(/^www\./, "");
	for (const id of SOURCE_IDS) {
		if (HOSTS[id].some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) return id;
	}
	return null;
}

/** True when resolving this link requires following a redirect. */
export function needsRedirectResolution(raw: string): boolean {
	const url = parseHttpUrl(raw);
	if (!url) return false;
	return REDIRECTING_HOSTS.has(hostKey(url));
}

/**
 * Rewrites a pasted link into the form we want to store and show: a plain
 * `watch?v=` YouTube URL, or a social URL with tracking parameters stripped.
 * Returns null when the input is not an http(s) URL.
 */
export function canonicalize(raw: string): string | null {
	const url = parseHttpUrl(raw);
	if (!url) return null;
	const source = classifySource(url.toString());

	if (source === "youtube") {
		const id = youtubeId(url);
		if (id) return `https://www.youtube.com/watch?v=${id}`;
		return url.toString();
	}

	if (source) {
		const clean = new URL(url.toString());
		for (const key of [...clean.searchParams.keys()]) {
			if (TRACKING_PARAMS.has(key)) clean.searchParams.delete(key);
		}
		clean.hash = "";
		return clean.toString();
	}

	return url.toString();
}

/** A pasted URL that points straight at a media file, with no social host. */
export function isDirectMediaUrl(raw: string): boolean {
	return mediaExtension(raw) !== null;
}

/** Whether a direct media URL is audio or video, judged by its extension. */
export function mediaKind(raw: string): "video" | "audio" | null {
	return mediaExtension(raw);
}

/** A reasonable save-as name for a direct media URL. */
export function suggestedFilename(raw: string, fallback = "download"): string {
	const url = parseHttpUrl(raw);
	const last = url?.pathname.split("/").filter(Boolean).pop() ?? "";
	let decoded = last;
	try {
		decoded = decodeURIComponent(last);
	} catch {
		/* keep the raw segment when it is not valid percent-encoding */
	}
	const safe = decoded
		.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 120);
	return safe || fallback;
}

function mediaExtension(raw: string): "video" | "audio" | null {
	const url = parseHttpUrl(raw);
	if (!url) return null;
	const match = /\.([A-Za-z0-9]{1,5})$/.exec(url.pathname);
	if (!match) return null;
	return MEDIA_EXTENSIONS[match[1].toLowerCase()] ?? null;
}

function youtubeId(url: URL): string | null {
	const host = hostKey(url);
	if (host === "youtu.be") {
		const id = url.pathname.split("/").filter(Boolean)[0];
		return id && YOUTUBE_ID.test(id) ? id : null;
	}
	const fromQuery = url.searchParams.get("v");
	if (fromQuery && YOUTUBE_ID.test(fromQuery)) return fromQuery;
	const segments = url.pathname.split("/").filter(Boolean);
	const [first, second] = segments;
	if (first && second && ["shorts", "live", "embed", "v"].includes(first) && YOUTUBE_ID.test(second)) {
		return second;
	}
	if (first && YOUTUBE_ID.test(first)) return first;
	return null;
}

function hostKey(url: URL): string {
	return url.hostname.toLowerCase().replace(/^www\./, "");
}

function parseHttpUrl(raw: string): URL | null {
	let url: URL;
	try {
		url = new URL(raw.trim());
	} catch {
		return null;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;
	return url;
}

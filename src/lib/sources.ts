import { z } from "zod";

/**
 * The three sources this product supports. Adding a source means adding it
 * here, in `sources.ts`, and in the UI platform tabs.
 */
export const SOURCE_IDS = ["youtube", "instagram", "tiktok"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

export const SourceIdSchema = z.enum(SOURCE_IDS);

const HOSTS: Record<SourceId, readonly string[]> = {
	youtube: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
	instagram: ["instagram.com"],
	tiktok: ["tiktok.com"],
};

/**
 * Classifies a pasted URL into a supported source, or null when the URL is
 * malformed, not http(s), or belongs to a site this product does not handle.
 */
export function classifySource(raw: string): SourceId | null {
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		return null;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;
	const host = url.hostname.toLowerCase().replace(/^www\./, "");
	for (const id of SOURCE_IDS) {
		if (HOSTS[id].some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) return id;
	}
	return null;
}

export function normalizeUrl(raw: string): string | null {
	const trimmed = raw.trim();
	return classifySource(trimmed) ? trimmed : null;
}

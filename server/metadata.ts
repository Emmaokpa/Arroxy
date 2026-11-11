import { z } from "zod";
import type { SourceId } from "../src/lib/sources";

export type Metadata = {
	title: string | null;
	author: string | null;
	thumbnail: string | null;
	/** Set when metadata could not be read, so the UI can stay honest. */
	note: string | null;
};

const OEmbedSchema = z.object({
	title: z.string().min(1).max(500).optional(),
	author_name: z.string().min(1).max(200).optional(),
	thumbnail_url: z.string().max(2048).optional(),
});

const MAX_BYTES = 64 * 1024;
const TIMEOUT_MS = 6_000;

/** Public oEmbed endpoints. Only these hosts are ever fetched for metadata. */
const ENDPOINTS: Partial<Record<SourceId, (url: string) => string>> = {
	youtube: (url) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
	tiktok: (url) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
};

/**
 * Reads public metadata for a canonical link. Never throws: a missing endpoint
 * or an unreachable host becomes a `note` the UI can show.
 */
export async function readMetadata(source: SourceId, canonicalUrl: string): Promise<Metadata> {
	const endpoint = ENDPOINTS[source];
	if (!endpoint) {
		return {
			...empty(),
			note: "This source needs an app access token for public metadata, which this deployment does not have.",
		};
	}

	const payload = await getJson(endpoint(canonicalUrl));
	if (payload === null) return { ...empty(), note: "Public metadata for this link could not be read right now." };

	const parsed = OEmbedSchema.safeParse(payload);
	if (!parsed.success) return { ...empty(), note: "This link returned metadata in a shape FlickGrab does not understand." };

	return {
		title: parsed.data.title ?? null,
		author: parsed.data.author_name ?? null,
		thumbnail: safeHttpUrl(parsed.data.thumbnail_url),
		note: null,
	};
}

function empty(): Metadata {
	return { title: null, author: null, thumbnail: null, note: null };
}

async function getJson(endpoint: string): Promise<unknown | null> {
	try {
		const response = await fetch(endpoint, {
			signal: AbortSignal.timeout(TIMEOUT_MS),
			headers: { Accept: "application/json" },
			redirect: "follow",
		});
		if (!response.ok) return null;
		const text = (await response.text()).slice(0, MAX_BYTES);
		try {
			return JSON.parse(text) as unknown;
		} catch {
			return null;
		}
	} catch {
		return null;
	}
}

/** Metadata is third-party data: only keep http(s) thumbnails. */
function safeHttpUrl(raw: string | undefined): string | null {
	if (!raw) return null;
	try {
		const url = new URL(raw);
		return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
	} catch {
		return null;
	}
}

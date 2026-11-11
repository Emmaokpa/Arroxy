import type { Capability, Verdict } from "../src/lib/contracts";

/**
 * What each source can actually do in a browser, measured rather than assumed.
 *
 * Phase 4B of the blueprint requires these answers to come from tests, so the
 * detail strings quote what was observed. Re-run those probes before changing
 * a row — do not upgrade a source to "supported" on optimism.
 */
export const MEASURED_ON = "2026-11-11";

export const CAPABILITIES: Capability[] = [
	{
		source: "youtube",
		label: "YouTube, Shorts, Music",
		browser: "unsupported",
		reason:
			"Signed media URLs are bound to the IP address that resolved them, the CDN sends no CORS headers, and video and audio are separate streams that need a local muxer.",
	},
	{
		source: "instagram",
		label: "Instagram Reels, Posts",
		browser: "unsupported",
		reason:
			"Public metadata needs a Meta app access token, and media sits on signed CDN URLs a browser page cannot fetch.",
	},
	{
		source: "tiktok",
		label: "TikTok videos, Sounds",
		browser: "unsupported",
		reason:
			"TikTok exposes no browser-readable media URL; obtaining one requires an extraction step this product does not run on its servers.",
	},
	{
		source: "file",
		label: "Direct media links",
		browser: "supported",
		reason: "Your browser fetches the file straight from its host when that host allows cross-origin reads.",
	},
];

/** The verdict shown for a link, keyed by what it resolved to. */
export function verdictFor(source: Capability["source"]): Verdict {
	switch (source) {
		case "youtube":
			return {
				downloadInBrowser: false,
				headline: "YouTube can't be downloaded from a browser",
				detail:
					"YouTube signs each media URL to the IP address that requested it and serves it without CORS headers, so your phone would get a 403 instead of the video. Its HD formats also ship as separate video and audio streams that need merging on the device. FlickGrab won't start a download that would quietly fail.",
			};
		case "instagram":
			return {
				downloadInBrowser: false,
				headline: "Instagram needs a signed-in app, not a web page",
				detail:
					"Instagram's public metadata requires a Meta app access token, and its media is served from signed CDN URLs that a web page is not allowed to fetch. There is no honest browser-only path for this link today.",
			};
		case "tiktok":
			return {
				downloadInBrowser: false,
				headline: "TikTok can't be resolved in the browser",
				detail:
					"TikTok does not expose a media URL a web page can read, and resolving one needs an extraction step on a server. FlickGrab deliberately keeps no downloader and no video bytes on its servers, so this link can be identified but not saved here.",
			};
		case "file":
			return {
				downloadInBrowser: true,
				headline: "Direct file — saves on this device",
				detail:
					"Your browser fetches this file directly from its host and writes it to your device. FlickGrab's server only classified the link; the bytes never pass through it.",
			};
	}
}

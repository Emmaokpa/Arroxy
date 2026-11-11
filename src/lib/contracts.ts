import { z } from "zod";
import { InspectSourceSchema } from "./sources";

/** Body of `POST /api/inspect`. */
export const InspectRequestSchema = z.object({
	url: z.string().trim().min(1, "Paste a link first.").max(2048),
});
export type InspectRequest = z.infer<typeof InspectRequestSchema>;

/** How a source can be downloaded on each surface. */
export const CAPABILITY_STATES = ["supported", "unsupported", "unverified"] as const;
export const CapabilityStateSchema = z.enum(CAPABILITY_STATES);
export type CapabilityState = z.infer<typeof CapabilityStateSchema>;

/**
 * The plain-language outcome for one inspected link. `downloadInBrowser` is the
 * only field the UI may use to decide whether to offer a download button.
 */
export const VerdictSchema = z.object({
	downloadInBrowser: z.boolean(),
	headline: z.string().max(160),
	detail: z.string().max(700),
});
export type Verdict = z.infer<typeof VerdictSchema>;

/** A file the browser can fetch and save itself, without our server. */
export const DeviceDownloadSchema = z.object({
	url: z.string().max(2048),
	filename: z.string().max(200),
});
export type DeviceDownload = z.infer<typeof DeviceDownloadSchema>;

/** Response body of `POST /api/inspect`. */
export const InspectResponseSchema = z.object({
	/** Canonical form of the pasted link, after short links are expanded. */
	url: z.string().max(2048),
	source: InspectSourceSchema,
	title: z.string().max(500).nullable(),
	author: z.string().max(200).nullable(),
	thumbnail: z.string().max(2048).nullable(),
	/** Set when we could not read public metadata, and why. */
	metadataNote: z.string().max(300).nullable(),
	/** Non-null only when this device can save the file on its own. */
	deviceDownload: DeviceDownloadSchema.nullable(),
	verdict: VerdictSchema,
});
export type InspectResponse = z.infer<typeof InspectResponseSchema>;

/** One row of `GET /api/capabilities`. */
export const CapabilitySchema = z.object({
	source: InspectSourceSchema,
	label: z.string().max(80),
	browser: CapabilityStateSchema,
	reason: z.string().max(500),
});
export type Capability = z.infer<typeof CapabilitySchema>;

/** Response body of `GET /api/capabilities`. */
export const CapabilitiesResponseSchema = z.object({
	measuredOn: z.string().max(32),
	capabilities: z.array(CapabilitySchema).max(20),
});
export type CapabilitiesResponse = z.infer<typeof CapabilitiesResponseSchema>;

/** Response body of `GET /api/health`. */
export const HealthResponseSchema = z.object({
	ok: z.boolean(),
	uptimeSeconds: z.number().nonnegative(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/** Error shape returned by every API route on failure. */
export const ApiErrorSchema = z.object({
	error: z.string().max(500),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

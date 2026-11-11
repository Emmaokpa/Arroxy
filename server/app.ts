import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { CAPABILITIES, MEASURED_ON } from "./capabilities";
import { type ServerConfig, readConfig } from "./config";
import { ApiError } from "./errors";
import { inspect } from "./inspect";

const INSPECT_PER_MINUTE = 40;

/**
 * Builds the API app. The app is deliberately media-free: no route accepts a
 * file, spawns a process, keeps a job or writes to disk.
 */
export function createApp(config: ServerConfig = readConfig()): express.Express {
	const app = express();
	app.disable("x-powered-by");
	app.set("trust proxy", 1);

	app.use(helmet());
	app.use(cors({ origin: config.corsOrigins, methods: ["GET", "POST", "OPTIONS"], maxAge: 86_400 }));
	app.use(express.json({ limit: "8kb" }));

	const inspectLimiter = rateLimit({
		windowMs: 60_000,
		limit: INSPECT_PER_MINUTE,
		standardHeaders: "draft-8",
		legacyHeaders: false,
		message: { error: "Too many lookups from this address. Wait a minute and try again." },
	});

	app.get("/api/health", (_req: Request, res: Response) => {
		res.json({ ok: true, uptimeSeconds: Math.round(process.uptime()) });
	});

	app.get("/api/capabilities", (_req: Request, res: Response) => {
		res.json({ measuredOn: MEASURED_ON, capabilities: CAPABILITIES });
	});

	app.post("/api/inspect", inspectLimiter, async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.json(await inspect(req.body));
		} catch (error) {
			next(error);
		}
	});

	app.use((_req: Request, res: Response) => {
		res.status(404).json({ error: "Not found." });
	});

	app.use(handleError);
	return app;
}

function handleError(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
	if (error instanceof ApiError) {
		res.status(error.status).json({ error: error.message });
		return;
	}
	if (isJsonParseError(error)) {
		res.status(400).json({ error: "That request body was not valid JSON." });
		return;
	}
	if (isTooLarge(error)) {
		res.status(413).json({ error: "That request body is too large." });
		return;
	}
	console.error("[flickgrab-api] unhandled error", error);
	res.status(500).json({ error: "Something went wrong on our side." });
}

function isJsonParseError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"type" in error &&
		(error as { type?: unknown }).type === "entity.parse.failed"
	);
}

function isTooLarge(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"type" in error &&
		(error as { type?: unknown }).type === "entity.too.large"
	);
}

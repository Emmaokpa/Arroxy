import { z } from "zod";

const EnvSchema = z.object({
	PORT: z.coerce.number().int().min(1).max(65535).default(4000),
	CORS_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
});

export type ServerConfig = {
	port: number;
	corsOrigins: string[];
};

/** Reads and validates the API's environment. Fails loudly on bad values. */
export function readConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
	const parsed = EnvSchema.safeParse({ PORT: env.PORT, CORS_ORIGINS: env.CORS_ORIGINS });
	if (!parsed.success) {
		const fields = parsed.error.issues.map((issue) => issue.path.join(".") || "env").join(", ");
		throw new Error(`Invalid server environment: ${fields}`);
	}
	return {
		port: parsed.data.PORT,
		corsOrigins: parsed.data.CORS_ORIGINS.split(",")
			.map((origin) => origin.trim())
			.filter(Boolean),
	};
}

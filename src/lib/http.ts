/** Returns the single error shape every API route uses. */
export function apiError(message: string, status: number): Response {
	return Response.json({ error: message.slice(0, 500) }, { status });
}

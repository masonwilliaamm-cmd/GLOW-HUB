// A crashed API route can return a 500 with an empty or non-JSON body.
// response.json() throws on that, which — if unhandled in a form's submit
// handler — leaves the UI stuck (e.g. a button frozen on "Logging in…"
// forever) instead of showing an error. Never throws.
export async function parseJsonResponse(
  response: Response,
): Promise<{ error?: string; [key: string]: unknown }> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

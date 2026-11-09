// Cloudflare Worker: GET /times -> the mosque's Mawaqit timetable as JSON, with CORS for the app.
// Public data only. No secrets, no storage, no account data. See README.md.
import { parseMawaqitPage, MOSQUE_URL } from "./parse.js";

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = String(env.ALLOWED_ORIGINS || "https://hawnannahian.github.io").split(",").map(s => s.trim()).filter(Boolean);
    const cors = { Vary: "Origin", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400" };
    if (allowed.includes(origin)) cors["Access-Control-Allow-Origin"] = origin;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/times") return json({ error: "Not found" }, 404, cors);
    try {
      const page = env.MOSQUE_URL || MOSQUE_URL;
      const res = await fetch(page, { cf: { cacheTtl: 21600, cacheEverything: true }, headers: { "User-Agent": "driving-log-pro-mawaqit/1" } });
      if (!res.ok) throw new Error(`Mawaqit answered ${res.status}`);
      return json(parseMawaqitPage(await res.text(), { url: page }), 200, { ...cors, "Cache-Control": "public, max-age=3600" });
    } catch {
      return json({ error: "Mawaqit data is unavailable right now" }, 502, { ...cors, "Cache-Control": "no-store" });
    }
  },
};

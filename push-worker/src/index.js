import { sendPushNotification } from "@mmmike/web-push/send";

const DEVICE_ID_RE = /^[a-f0-9-]{32,36}$/i;
const ALLOWED_PUSH_HOSTS = [
  "push.apple.com",
  "fcm.googleapis.com",
  "push.services.mozilla.com"
];
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });

function allowedSubscription(subscription) {
  try {
    const url = new URL(subscription?.endpoint || "");
    return url.protocol === "https:" &&
      ALLOWED_PUSH_HOSTS.some(host => url.hostname === host || url.hostname.endsWith("." + host)) &&
      typeof subscription?.keys?.p256dh === "string" &&
      typeof subscription?.keys?.auth === "string";
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.APP_ORIGIN;
    if (!allowedOrigin || origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403);

    const cors = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);

    if (url.pathname === "/api/push/config" && request.method === "GET") {
      if (!env.VAPID_PUBLIC_KEY) return json({ error: "Push service is not configured" }, 503, cors);
      return json({ publicKey: env.VAPID_PUBLIC_KEY }, 200, cors);
    }

    if (!["/api/push/subscribe", "/api/push/schedule", "/api/push/cancel"].includes(url.pathname) || request.method !== "POST") {
      return json({ error: "Not found" }, 404, cors);
    }

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }
    if (!DEVICE_ID_RE.test(String(body.deviceId || ""))) return json({ error: "Invalid device identifier" }, 400, cors);
    if (url.pathname.endsWith("/subscribe") && !allowedSubscription(body.subscription)) {
      return json({ error: "Invalid or unsupported push subscription endpoint" }, 400, cors);
    }

    const id = env.REMINDERS.idFromName(body.deviceId);
    const stub = env.REMINDERS.get(id);
    const response = await stub.fetch("https://reminder.internal" + url.pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.text();
    return new Response(result, { status: response.status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });
  }
};

export class ReminderScheduler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const path = new URL(request.url).pathname;

    if (path === "/api/push/subscribe") {
      if (!allowedSubscription(body.subscription)) return json({ error: "Invalid subscription" }, 400);
      await this.state.storage.put("subscription", body.subscription);
      return json({ ok: true });
    }

    if (path === "/api/push/cancel") {
      const current = await this.state.storage.get("session");
      if (!body.session || current === body.session) {
        await this.state.storage.delete("events");
        await this.state.storage.delete("session");
        await this.state.storage.deleteAlarm();
      }
      return json({ ok: true });
    }

    if (path === "/api/push/schedule") {
      const subscription = await this.state.storage.get("subscription");
      if (!subscription) return json({ error: "Enable notifications on this device first" }, 409);
      const session = String(body.session || "");
      const elapsed = Number(body.elapsedMs);
      if (!session || session.length > 100 || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > 55 * 60 * 1000) {
        return json({ error: "Invalid timer schedule" }, 400);
      }
      if (body.running !== true) {
        await this.state.storage.delete("events");
        await this.state.storage.put("session", session);
        await this.state.storage.deleteAlarm();
        return json({ ok: true, paused: true });
      }
      const now = Date.now();
      const events = [];
      const reminderIn = 50 * 60 * 1000 - elapsed;
      const finishIn = 55 * 60 * 1000 - elapsed;
      if (reminderIn > 0) events.push({ type: "reminder", dueAt: now + reminderIn, attempts: 0 });
      if (finishIn > 0) events.push({ type: "finished", dueAt: now + finishIn, attempts: 0 });
      else events.push({ type: "finished", dueAt: now, attempts: 0 });
      await this.state.storage.put("session", session);
      await this.state.storage.put("events", events);
      await this.setNextAlarm(events);
      return json({ ok: true, scheduled: events.length });
    }

    return json({ error: "Not found" }, 404);
  }

  async setNextAlarm(events) {
    if (!events.length) return this.state.storage.deleteAlarm();
    await this.state.storage.setAlarm(Math.min(...events.map(event => event.dueAt)));
  }

  async alarm() {
    const subscription = await this.state.storage.get("subscription");
    const events = (await this.state.storage.get("events")) || [];
    if (!subscription || !events.length) return;
    const now = Date.now();
    const due = events.filter(event => event.dueAt <= now + 1000);
    let pending = events.filter(event => event.dueAt > now + 1000);

    for (const event of due) {
      const isFinal = event.type === "finished";
      const payload = {
        title: isFinal ? "Lesson time completed" : "5 minutes remaining",
        body: isFinal ? "Your driving lesson timer has finished." : "Your driving lesson timer will finish in 5 minutes.",
        url: "/",
        tag: "lesson-" + (await this.state.storage.get("session")) + "-" + event.type
      };
      try {
        const delivered = await sendPushNotification(subscription, payload, {
          publicKey: this.env.VAPID_PUBLIC_KEY,
          privateKey: this.env.VAPID_PRIVATE_KEY,
          subject: this.env.VAPID_SUBJECT
        }, { ttl: 3600, urgency: "high" });
        if (!delivered) await this.state.storage.delete("subscription");
      } catch {
        if (event.attempts < 2) pending.push({ ...event, dueAt: Date.now() + 60_000, attempts: event.attempts + 1 });
      }
    }

    if (due.some(event => event.type === "finished") && !pending.length) {
      await this.state.storage.delete("events");
      await this.state.storage.delete("session");
      await this.state.storage.deleteAlarm();
      return;
    }
    await this.state.storage.put("events", pending);
    await this.setNextAlarm(pending);
  }
}

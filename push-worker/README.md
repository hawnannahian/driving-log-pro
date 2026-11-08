# Driving Log Pro — iPhone Lock-Screen Push

This backend sends two visible Web Push notifications for a running lesson timer:
- At 50 active minutes: five-minute warning.
- At 55 active minutes: timer finished.

Pause removes pending alerts. Resume replaces the schedule using accumulated active time. Cancel/end removes pending alerts. The Worker stores only the push subscription, a random device identifier, timer session ID and reminder timestamps. It does not receive student names, lesson records, payments or course data.

## Requirements

- A Cloudflare account with Workers and Durable Objects enabled.
- The app served over HTTPS and installed using **Add to Home Screen** on iPhone.
- iOS/iPadOS 16.4 or later for Home Screen Web Push.
- Notifications allowed for Driving Log Pro in iPhone Settings.

## Deploy

From this directory:

```sh
npm install
npm run generate-vapid-keys
```

Keep the private key private. Do not commit either key. Deploy the Worker secrets (use the exact origin where the app is hosted):

```sh
npx wrangler secret put APP_ORIGIN
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_SUBJECT
npx wrangler deploy
```

For `APP_ORIGIN`, enter the app's origin only (scheme + hostname, no path), e.g. `https://your-site.example`.
For `VAPID_SUBJECT`, use a real contact URI such as `mailto:your-real-email@example.com`.
Use the matching public/private key pair printed by the generator. The public key is served by the Worker; the private key remains a Worker secret.

After deployment, copy the Worker URL (for example `https://driving-log-pro-push.<your-account>.workers.dev`) into the root `push-config.js`:

```js
window.DRIVING_LOG_PUSH_API = "https://YOUR-WORKER-URL";
```

Commit that URL change to the app branch and deploy the static app. The API URL is public; never put the VAPID private key in the website.

## Enable on iPhone

1. Install/update Driving Log Pro from its Home Screen icon.
2. Open it, go to Overview → Lock-screen notifications.
3. Tap **Enable lock-screen notifications** and allow the iOS prompt.
4. Start a lesson timer. Lock the screen to test the warning and final alert.

Notifications are subject to iOS Focus settings, network availability, push-service delivery, and iPhone notification settings. The app cannot force delivery if iOS has disabled or silenced notifications. The timer's own accounting is unchanged.

## Operations

- The Worker has a Durable Object per random device ID; it is not a shared public broadcast channel.
- Push endpoint hostnames are allowlisted for Apple, FCM and Mozilla to prevent the Worker from becoming an arbitrary outbound request proxy.
- The app checks same-origin installation support and asks for permission only after a button tap.
- To rotate VAPID keys, existing device subscriptions must be renewed by enabling notifications again.

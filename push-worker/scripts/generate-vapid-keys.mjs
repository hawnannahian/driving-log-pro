import { generateVapidKeys } from "@mmmike/web-push/vapid";

const keys = await generateVapidKeys();
process.stdout.write(
  "Save these values securely. Never commit the private key.\n\n" +
  "VAPID_PUBLIC_KEY=" + keys.publicKey + "\n" +
  "VAPID_PRIVATE_KEY=" + keys.privateKey + "\n"
);

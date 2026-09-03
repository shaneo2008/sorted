// Fail fast on boot rather than mid-request.
const required = ["DATABASE_URL", "JWT_SECRET"] as const;

export function assertEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}

export const env = {
  jwtSecret: () => process.env.JWT_SECRET!,
  n8nWebhookUrl: () => process.env.N8N_WEBHOOK_URL, // optional until M3
  internalSecret: () => process.env.INTERNAL_SECRET ?? "",
  stripeKey: () => process.env.STRIPE_SECRET_KEY, // optional until M2
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET,
};

import type { DomainEvent, DomainEventName } from "@sorted/core";
import { env } from "./env";

/**
 * Fire-and-forget POST to the single n8n webhook. Never throws, never blocks
 * the response path for long — automation failures must not break CRUD.
 *
 * TODO(M3): once n8n is live, consider writing failed emits to a small
 * `event_outbox` table and retrying on a cron for durability.
 */
export async function emitEvent(
  event: Omit<DomainEvent, "sent_at"> & { event: DomainEventName },
): Promise<void> {
  const url = env.n8nWebhookUrl();
  if (!url) {
    console.log("[events] N8N_WEBHOOK_URL unset, skipping", event.event);
    return;
  }
  const payload: DomainEvent = { ...event, sent_at: new Date().toISOString() };
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000),
    });
  } catch (err) {
    console.error("[events] emit failed", event.event, err);
  }
}

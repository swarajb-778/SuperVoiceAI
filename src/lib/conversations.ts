/**
 * Conversation lifecycle rules shared by the sweeper and its checks.
 */

/**
 * How long a conversation may sit in 'active' before the sweeper treats it as dropped.
 *
 * This MUST stay above the largest call an agent is allowed to hold, otherwise the sweeper
 * would close calls that are still in progress. `agentSchema.max_call_duration` is bounded
 * to 3600s, so two hours leaves generous headroom; `scripts/check-conversations.ts` asserts
 * the relationship rather than trusting this comment to stay true.
 */
export const STALE_CONVERSATION_MS = 2 * 60 * 60 * 1000;

/** Cutoff timestamp before which an 'active' conversation is considered abandoned. */
export function staleCutoff(now: Date = new Date()): string {
  return new Date(now.getTime() - STALE_CONVERSATION_MS).toISOString();
}

/**
 * Whether a still-'active' conversation started long enough ago to be swept.
 *
 * Clients close their own calls, but they cannot report a tab close, a browser crash, a
 * laptop suspend or a dead network — those rows would otherwise stay 'active' forever and
 * sit in the conversion-rate denominator.
 */
export function isStale(createdAt: string, now: Date = new Date()): boolean {
  return new Date(createdAt).getTime() < now.getTime() - STALE_CONVERSATION_MS;
}

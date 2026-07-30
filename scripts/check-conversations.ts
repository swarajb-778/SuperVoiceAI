/**
 * Runnable check for the stale-conversation sweeper.
 *
 *   npm run check
 *
 * The important assertion here is a cross-file invariant: the sweep threshold must stay
 * above the longest call an agent is permitted to hold. Those two numbers live in different
 * files with nothing connecting them, so raising the Zod bound on max_call_duration without
 * touching STALE_CONVERSATION_MS would make the sweeper start closing calls that are still
 * in progress — hanging up on live callers via a scheduled job, which would be spectacularly
 * hard to debug from the symptom.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isStale, staleCutoff, STALE_CONVERSATION_MS } from '../src/lib/conversations.ts';

const root = path.join(import.meta.dirname, '..');
let passed = 0;
const check = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log('\nsweeper threshold invariant');

check('sweep threshold exceeds the longest permitted call', () => {
  const validations = fs.readFileSync(path.join(root, 'src/validations/index.ts'), 'utf8');
  const maxSeconds = Number(
    validations.match(/max_call_duration:\s*z\.number\(\)\.min\(\d+\)\.max\((\d+)\)/)?.[1]
  );

  assert.ok(
    Number.isFinite(maxSeconds),
    'could not read the max_call_duration bound out of validations/index.ts'
  );

  assert.ok(
    STALE_CONVERSATION_MS > maxSeconds * 1000,
    `STALE_CONVERSATION_MS (${STALE_CONVERSATION_MS / 60_000} min) must exceed the maximum ` +
      `max_call_duration (${maxSeconds / 60} min), or the sweeper will close calls that are ` +
      `still running`
  );
});

console.log('\nstaleness');

const now = new Date('2026-06-01T12:00:00Z');

check('a conversation started just now is not stale', () => {
  assert.equal(isStale('2026-06-01T11:59:00Z', now), false);
});

check('a conversation inside the window is not stale', () => {
  // One hour old, threshold is two.
  assert.equal(isStale('2026-06-01T11:00:00Z', now), false);
});

check('a conversation past the window is stale', () => {
  // Three hours old.
  assert.equal(isStale('2026-06-01T09:00:00Z', now), true);
});

check('the boundary is not swept early', () => {
  const exactlyAtThreshold = new Date(now.getTime() - STALE_CONVERSATION_MS).toISOString();
  assert.equal(isStale(exactlyAtThreshold, now), false);
});

check('cutoff is the threshold behind the supplied clock', () => {
  assert.equal(staleCutoff(now), '2026-06-01T10:00:00.000Z');
});

console.log(`\n${passed} checks passed\n`);

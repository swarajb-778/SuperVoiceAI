/**
 * Runnable check for the public-endpoint guards.
 *
 *   npm run check
 *
 * These protect /api/realtime/session and /api/realtime/tools, which are unauthenticated
 * and spend the tenant's model budget. The allowlist matcher is the interesting part: a
 * naive `endsWith` implementation lets `notexample.com` satisfy `*.example.com`, so that
 * case is asserted explicitly.
 */

import assert from 'node:assert/strict';
import {
  isOriginAllowed,
  isOverSessionLimit,
  normalizeHost,
  SESSION_RATE_LIMIT_PER_MINUTE,
} from '../src/lib/security.ts';

let passed = 0;
const check = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log('\nhost normalization');

check('extracts the hostname from a full URL', () => {
  assert.equal(normalizeHost('https://Example.com/some/path?q=1'), 'example.com');
});

check('accepts a bare host and drops the port', () => {
  assert.equal(normalizeHost('example.com:3000'), 'example.com');
});

check('returns null for empty or unusable input', () => {
  assert.equal(normalizeHost(null), null);
  assert.equal(normalizeHost(''), null);
  assert.equal(normalizeHost('   '), null);
});

console.log('\norigin allowlist');

check('stays permissive when no allowlist is configured', () => {
  // Backward compatibility: enabling this must not break tenants who never set a list.
  assert.equal(isOriginAllowed('https://anything.com', null), true);
  assert.equal(isOriginAllowed('https://anything.com', []), true);
  assert.equal(isOriginAllowed(null, null), true);
});

check('allows an exactly listed host', () => {
  assert.equal(isOriginAllowed('https://shop.com', ['shop.com']), true);
});

check('matches regardless of entry format, case or port', () => {
  assert.equal(isOriginAllowed('https://shop.com:8443', ['https://SHOP.com']), true);
  assert.equal(isOriginAllowed('http://shop.com', ['shop.com:3000']), true);
});

check('rejects a host that is not listed', () => {
  assert.equal(isOriginAllowed('https://evil.com', ['shop.com']), false);
});

check('rejects a subdomain when only the apex is listed', () => {
  assert.equal(isOriginAllowed('https://sub.shop.com', ['shop.com']), false);
});

check('wildcard covers subdomains and the apex', () => {
  assert.equal(isOriginAllowed('https://sub.shop.com', ['*.shop.com']), true);
  assert.equal(isOriginAllowed('https://deep.sub.shop.com', ['*.shop.com']), true);
  assert.equal(isOriginAllowed('https://shop.com', ['*.shop.com']), true);
});

check('wildcard resists suffix confusion', () => {
  // The classic bug: `'notshop.com'.endsWith('shop.com')` is true.
  assert.equal(isOriginAllowed('https://notshop.com', ['*.shop.com']), false);
  assert.equal(isOriginAllowed('https://shop.com.evil.com', ['*.shop.com']), false);
});

check('denies a request with no origin once an allowlist exists', () => {
  // A configured tenant should not be reachable by a caller that sends no Origin/Referer.
  assert.equal(isOriginAllowed(null, ['shop.com']), false);
});

check('ignores blank entries in the allowlist', () => {
  assert.equal(isOriginAllowed('https://evil.com', ['', '   ']), false);
  assert.equal(isOriginAllowed('https://shop.com', ['', 'shop.com']), true);
});

console.log('\nsession rate limit');

check('permits traffic below the limit and sheds at the boundary', () => {
  assert.equal(isOverSessionLimit(0), false);
  assert.equal(isOverSessionLimit(SESSION_RATE_LIMIT_PER_MINUTE - 1), false);
  assert.equal(isOverSessionLimit(SESSION_RATE_LIMIT_PER_MINUTE), true);
  assert.equal(isOverSessionLimit(SESSION_RATE_LIMIT_PER_MINUTE + 50), true);
});

check('treats an unknown count as zero rather than failing closed', () => {
  // A count query returning null must not lock a tenant out of their own widget.
  assert.equal(isOverSessionLimit(null), false);
});

console.log(`\n${passed} checks passed\n`);

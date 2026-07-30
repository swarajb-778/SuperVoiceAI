/**
 * Runnable check for appointment slot arithmetic.
 *
 *   npm run check:slots
 *
 * These assertions cover the two bugs that made the AI offer already-booked times:
 *   1. Booked slots were computed in the SERVER's timezone, not the business's, so on a
 *      UTC host every booked slot landed on the wrong key and masked nothing.
 *   2. The day window was timezone-naive, so appointments near midnight were attributed
 *      to the wrong calendar day.
 *
 * No database and no test framework — pure functions and `node:assert`.
 */

import assert from 'node:assert/strict';
import { bookedSlotSet, buildSlotGrid, dayOfWeekForDate } from '../src/services/slots.ts';

const NY = 'America/New_York';
let passed = 0;
const check = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log('\nslot grid');

check('emits 30-minute starts inside opening hours', () => {
  assert.deepEqual(buildSlotGrid('08:00', '10:00', 30), ['08:00', '08:30', '09:00', '09:30']);
});

check('excludes starts where the job would run past closing', () => {
  // A 120-minute job cannot start at 17:00 when the shop closes at 18:00.
  const slots = buildSlotGrid('16:00', '18:00', 120);
  assert.deepEqual(slots, ['16:00']);
});

check('returns nothing when the window is shorter than the job', () => {
  assert.deepEqual(buildSlotGrid('09:00', '09:30', 60), []);
});

console.log('\nbooked slots (timezone projection)');

check('masks a New York booking stored as UTC — summer, EDT/UTC-4', () => {
  // 10:00 in New York during EDT is 14:00 UTC.
  const booked = bookedSlotSet(
    [{ scheduled_at: '2026-05-16T14:00:00Z', duration_minutes: 30 }],
    '2026-05-16',
    NY
  );
  assert.ok(booked.has('10:00'), 'expected 10:00 local to be masked');
  // The pre-fix behaviour on a UTC host: the raw UTC wall time leaked through.
  assert.ok(!booked.has('14:00'), 'must not mask the raw UTC time');
});

check('handles the offset shift in winter — EST/UTC-5', () => {
  // Same 10:00 local, but January is EST, so the UTC instant differs by an hour.
  // A hardcoded offset would fail exactly here.
  const booked = bookedSlotSet(
    [{ scheduled_at: '2026-01-15T15:00:00Z', duration_minutes: 30 }],
    '2026-01-15',
    NY
  );
  assert.ok(booked.has('10:00'), 'expected 10:00 local in EST');
});

check('blocks every 30-minute slot a long job spans', () => {
  // 90 minutes from 10:00 local occupies 10:00, 10:30 and 11:00.
  const booked = bookedSlotSet(
    [{ scheduled_at: '2026-05-16T14:00:00Z', duration_minutes: 90 }],
    '2026-05-16',
    NY
  );
  assert.deepEqual([...booked].sort(), ['10:00', '10:30', '11:00']);
});

check('attributes a late-evening booking to the correct local day', () => {
  // 02:00 UTC on the 17th is 22:00 on the 16th in New York.
  const booked = bookedSlotSet(
    [{ scheduled_at: '2026-05-17T02:00:00Z', duration_minutes: 30 }],
    '2026-05-16',
    NY
  );
  assert.ok(booked.has('22:00'), 'expected the booking to fall on the 16th locally');
});

check('ignores appointments belonging to another day', () => {
  const booked = bookedSlotSet(
    [{ scheduled_at: '2026-05-20T14:00:00Z', duration_minutes: 60 }],
    '2026-05-16',
    NY
  );
  assert.equal(booked.size, 0);
});

console.log('\nday of week');

check('reads YYYY-MM-DD as a calendar date, not a local instant', () => {
  // 2026-05-16 is a Saturday. Parsing this as an instant and calling getDay() on a host
  // behind UTC yields Friday, which would load the wrong day's opening hours.
  assert.equal(dayOfWeekForDate('2026-05-16'), 6);
  assert.equal(dayOfWeekForDate('2026-05-17'), 0);
});

console.log('\nend-to-end masking');

check('a booked slot disappears from the offered grid', () => {
  const grid = buildSlotGrid('09:00', '12:00', 60);
  const booked = bookedSlotSet(
    [{ scheduled_at: '2026-05-16T14:00:00Z', duration_minutes: 60 }], // 10:00–11:00 local
    '2026-05-16',
    NY
  );
  const available = grid.filter((s) => !booked.has(s));

  assert.ok(grid.includes('10:00'), 'sanity: 10:00 is in the raw grid');
  assert.ok(!available.includes('10:00'), '10:00 is taken and must not be offered');
  assert.ok(!available.includes('10:30'), '10:30 overlaps the booking');
  assert.ok(available.includes('09:00'), '09:00 is still free');
  assert.ok(available.includes('11:00'), '11:00 is still free');
});

console.log(`\n${passed} checks passed\n`);

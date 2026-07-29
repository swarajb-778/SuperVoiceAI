/**
 * Pure appointment-scheduling logic — no I/O, no database.
 *
 * Kept separate from `appointments.ts` so the timezone-sensitive arithmetic can be
 * exercised directly (see `scripts/check-slots.ts`) without a Supabase connection.
 */

export const SLOT_STEP_MINUTES = 30;

/** Calendar date (YYYY-MM-DD) and wall-clock time (HH:MM) of an instant, in a given IANA zone. */
export function partsInZone(instant: Date, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(instant);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}

/** Day of week (0=Sun) for a plain YYYY-MM-DD, read as a calendar date rather than an instant. */
export function dayOfWeekForDate(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Wall-clock HH:MM slots occupied by the given appointments on `date`, in the business's zone.
 *
 * Appointments are stored as timestamptz instants, so they must be projected into the
 * business's zone before being compared against the wall-clock grid — comparing in
 * server-local time silently mismatches whenever the server isn't running in that zone
 * (e.g. a UTC serverless host serving a New York shop).
 */
export function bookedSlotSet(
  appointments: Array<{ scheduled_at: string; duration_minutes: number }>,
  date: string,
  timeZone: string
): Set<string> {
  const booked = new Set<string>();

  for (const appt of appointments) {
    const start = new Date(appt.scheduled_at);
    const blocks = Math.max(1, Math.ceil(appt.duration_minutes / SLOT_STEP_MINUTES));

    for (let i = 0; i < blocks; i++) {
      // Step by real elapsed time so DST transitions stay correct.
      const at = new Date(start.getTime() + i * SLOT_STEP_MINUTES * 60_000);
      const { date: apptDate, time } = partsInZone(at, timeZone);
      if (apptDate === date) booked.add(time);
    }
  }

  return booked;
}

/** Every start time on a day where a `durationMinutes` job fits inside opening hours. */
export function buildSlotGrid(
  openTime: string,
  closeTime: string,
  durationMinutes: number
): string[] {
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const slots: string[] = [];
  for (let m = openMinutes; m + durationMinutes <= closeMinutes; m += SLOT_STEP_MINUTES) {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    slots.push(`${h}:${min}`);
  }
  return slots;
}

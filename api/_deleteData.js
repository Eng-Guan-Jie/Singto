const sql = require("./_db");

/*
 * Deleting personal data (AGENTS.md 5.1).
 *
 * Rows are removed child-first (availability →
 * participants → events) so this works whether or not the
 * tables use ON DELETE CASCADE.
 */

// How long an event is kept after its scheduling period
// ends. The privacy policy states this number
// (src/pages/Privacy/policyContent.js): change both.
const RETENTION_DAYS = 30;

/*
 * Delete events together with everyone's responses and
 * available days. Returns how many events were deleted.
 */
async function deleteEvents(eventIds) {
  if (!eventIds.length) return 0;

  const [, , eventRows] = await sql.transaction([
    sql`
      DELETE FROM availability
      WHERE event_id = ANY(${eventIds}::uuid[])
    `,
    sql`
      DELETE FROM participants
      WHERE event_id = ANY(${eventIds}::uuid[])
    `,
    sql`
      DELETE FROM events
      WHERE id = ANY(${eventIds}::uuid[])
      RETURNING id
    `,
  ]);

  return eventRows.length;
}

/*
 * "Delete my account": remove one LINE user's data.
 * - Their responses and available days in every event.
 * - Events they organized stay for the other members, but
 *   no longer point to them (organizer_line_user_id is
 *   cleared; needs db/migrations/002_allow_no_organizer.sql
 *   if that column is NOT NULL).
 */
async function deleteUserData(lineUserId) {
  const [, participantRows, eventRows] = await sql.transaction([
    sql`
      DELETE FROM availability
      WHERE participant_id IN (
        SELECT id
        FROM participants
        WHERE line_user_id = ${lineUserId}
      )
    `,
    sql`
      DELETE FROM participants
      WHERE line_user_id = ${lineUserId}
      RETURNING id
    `,
    sql`
      UPDATE events
      SET organizer_line_user_id = NULL
      WHERE organizer_line_user_id = ${lineUserId}
      RETURNING id
    `,
  ]);

  return {
    responsesDeleted: participantRows.length,
    eventsLeftWithoutOrganizer: eventRows.length,
  };
}

/*
 * Events whose scheduling period ended more than
 * RETENTION_DAYS ago. (Confirmed dates are always inside
 * the period, so end_date is the last day of the event.)
 */
async function deleteExpiredEvents() {
  const rows = await sql`
    SELECT id
    FROM events
    WHERE end_date < CURRENT_DATE - ${RETENTION_DAYS}::int
  `;

  return deleteEvents(rows.map((row) => row.id));
}

module.exports = {
  RETENTION_DAYS,
  deleteEvents,
  deleteUserData,
  deleteExpiredEvents,
};

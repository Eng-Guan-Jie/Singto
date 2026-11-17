const sql = require("./_db");
const {
  verifyLineIdToken,
  getBearerToken,
  sendError,
  setCorsHeaders,
} = require("./_auth");

// DATE columns come back as Date objects at UTC midnight.
const toDateKey = (value) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

// Today's date in Thailand, e.g. "2026-11-17".
const todayInThailand = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
  }).format(new Date());

/*
 * GET /api/my-events — the caller's own events for the
 * "On-going events" and "Archived events" menu.
 *
 * Only events the caller organizes or has answered, and
 * only what the list shows: no other members' names,
 * pictures or availability (AGENTS.md 5.3).
 *
 * An event is archived once its last day has passed: the
 * last confirmed date, or the end of the scheduling period
 * when no date was confirmed. Archived events are still
 * deleted 30 days after the period ends (api/_deleteData.js).
 */
module.exports = async function handler(req, res) {
  setCorsHeaders(res, "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const lineUser = await verifyLineIdToken(
      getBearerToken(req)
    );

    const rows = await sql`
      SELECT
        e.id,
        e.event_name,
        e.start_date,
        e.end_date,
        e.finalized_date,
        e.finalized_dates,
        e.organizer_line_user_id = ${lineUser.sub}
          AS is_organizer,
        p.status AS my_status
      FROM events e
      LEFT JOIN participants p
        ON p.event_id = e.id
        AND p.line_user_id = ${lineUser.sub}
      WHERE e.organizer_line_user_id = ${lineUser.sub}
        OR p.id IS NOT NULL
      ORDER BY e.start_date ASC, e.created_at ASC
    `;

    const today = todayInThailand();

    const ongoing = [];
    const archived = [];

    rows.forEach((row) => {
      const confirmedDates = row.finalized_dates?.length
        ? row.finalized_dates.map(toDateKey).sort()
        : [row.finalized_date]
            .filter(Boolean)
            .map(toDateKey);

      const lastDay =
        confirmedDates[confirmedDates.length - 1] ||
        toDateKey(row.end_date);

      const event = {
        id: row.id,
        event_name: row.event_name,
        start_date: toDateKey(row.start_date),
        end_date: toDateKey(row.end_date),
        confirmed_dates: confirmedDates,
        role: row.is_organizer ? "organizer" : "participant",
        // accepted / declined (the organizer is accepted).
        my_status: row.my_status || null,
      };

      (lastDay < today ? archived : ongoing).push(event);
    });

    // Most recent first in the archive.
    archived.reverse();

    res.status(200).json({ ongoing, archived });
  } catch (error) {
    sendError(res, error, "Failed to load your events");
  }
};

const sql = require("../_db");
const {
  AuthError,
  isEventId,
  verifyLineIdToken,
  getEventRole,
  sendError,
  setCorsHeaders,
} = require("../_auth");

// DATE values come back as Date objects at UTC midnight.
const toDateKey = (value) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

// Confirmed day(s): finalized_dates, or the single
// finalized_date when only that one is set.
const getFinalizedDates = (event) => {
  if (event.finalized_dates?.length) {
    return event.finalized_dates.map(toDateKey);
  }

  return event.finalized_date
    ? [toDateKey(event.finalized_date)]
    : [];
};

module.exports = async function handler(req, res) {
  setCorsHeaders(res, "GET, PATCH, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const { id } = req.query;

  if (!isEventId(id)) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  try {
    /*
     * ================= GET =================
     * Public event details for the invitation link.
     */
    if (req.method === "GET") {
      // SELECT * so this keeps working before the
      // confirmation columns are added (db/migrations).
      const rows = await sql`
        SELECT *
        FROM events
        WHERE id = ${id}
        LIMIT 1
      `;

      if (rows.length === 0) {
        res.status(404).json({
          message: "Event not found",
        });
        return;
      }

      const event = rows[0];

      // Only what the pages need: no chat ID or
      // organizer LINE ID.
      res.status(200).json({
        event: {
          id: event.id,
          event_name: event.event_name,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          status: event.status,
          created_at: event.created_at,
          confirmed_dates: getFinalizedDates(event),
          confirmation_note: event.finalization_note || null,
          confirmed_at: event.finalized_at || null,
        },
      });
      return;
    }

    /*
     * ================= PATCH =================
     * Organizer edits the event details.
     */
    if (req.method === "PATCH") {
      const {
        idToken,
        eventName,
        description,
        startDate,
        endDate,
      } = req.body || {};

      if (!eventName || !startDate || !endDate) {
        res.status(400).json({
          message:
            "eventName, startDate, and endDate are required",
        });
        return;
      }

      if (endDate < startDate) {
        res.status(400).json({
          message: "endDate must be on or after startDate",
        });
        return;
      }

      const lineUser = await verifyLineIdToken(idToken);

      const { role } = await getEventRole(id, lineUser.sub);

      if (role !== "organizer") {
        throw new AuthError(
          403,
          "Only the organizer can edit this event."
        );
      }

      // Availability outside a shortened period no longer
      // applies, so remove it together with the update.
      const [rows] = await sql.transaction([
        sql`
          UPDATE events
          SET
            event_name = ${eventName},
            description = ${description || null},
            start_date = ${startDate},
            end_date = ${endDate}
          WHERE id = ${id}
          RETURNING
            id,
            event_name,
            description,
            start_date,
            end_date,
            status
        `,
        sql`
          DELETE FROM availability
          WHERE event_id = ${id}
            AND (
              available_date < ${startDate}
              OR available_date > ${endDate}
            )
        `,
      ]);

      res.status(200).json({
        event: rows[0],
      });
      return;
    }

    res.setHeader("Allow", "GET, PATCH, OPTIONS");
    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    sendError(res, error, "Event request failed");
  }
};

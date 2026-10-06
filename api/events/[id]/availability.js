const sql = require("../../_db");
const {
  verifyLineIdToken,
  getBearerToken,
  getEventRole,
  sendError,
  setCorsHeaders,
} = require("../../_auth");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// DATE columns come back as Date objects at UTC midnight.
const toDateKey = (value) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

module.exports = async function handler(req, res) {
  setCorsHeaders(res, "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const { id: eventId } = req.query;

  if (!eventId) {
    res.status(400).json({
      message: "Event ID is required",
    });
    return;
  }

  try {
    /*
     * ================= GET =================
     * Organizer: who is free on each date.
     * Participant: their own dates + how many people
     * are free per date, without names (AGENTS.md 5.3).
     * Guest: only their own dates (none yet).
     */
    if (req.method === "GET") {
      const lineUser = await verifyLineIdToken(
        getBearerToken(req)
      );

      const { role } = await getEventRole(
        eventId,
        lineUser.sub
      );

      const rows = await sql`
        SELECT
          a.available_date,
          p.line_user_id
        FROM availability a
        INNER JOIN participants p
          ON a.participant_id = p.id
        WHERE a.event_id = ${eventId}
          AND p.status = 'accepted'
        ORDER BY a.available_date ASC
      `;

      const availability = {};
      const counts = {};

      rows.forEach((row) => {
        const date = toDateKey(row.available_date);

        counts[date] = (counts[date] || 0) + 1;

        if (
          role === "organizer" ||
          row.line_user_id === lineUser.sub
        ) {
          if (!availability[date]) {
            availability[date] = [];
          }

          availability[date].push(row.line_user_id);
        }
      });

      if (role === "guest") {
        res.status(200).json({
          role,
          availability,
        });
        return;
      }

      const acceptedRows = await sql`
        SELECT COUNT(*)::int AS count
        FROM participants
        WHERE event_id = ${eventId}
          AND status = 'accepted'
      `;

      res.status(200).json({
        role,
        availability,
        counts,
        acceptedCount: acceptedRows[0].count,
      });
      return;
    }

    /*
     * ================= POST =================
     * Replace the caller's available dates.
     */
    if (req.method === "POST") {
      const { idToken, dates } = req.body || {};

      if (!Array.isArray(dates)) {
        res.status(400).json({
          message: "dates must be an array",
        });
        return;
      }

      const lineUser = await verifyLineIdToken(idToken);

      const { event, participant, role } =
        await getEventRole(eventId, lineUser.sub);

      const startDate = toDateKey(event.start_date);
      const endDate = toDateKey(event.end_date);

      const uniqueDates = [...new Set(dates)];

      const invalidDate = uniqueDates.find(
        (date) =>
          typeof date !== "string" ||
          !DATE_PATTERN.test(date) ||
          date < startDate ||
          date > endDate
      );

      if (invalidDate !== undefined) {
        res.status(400).json({
          message:
            "Dates must be within the event's scheduling period.",
        });
        return;
      }

      let participantId = participant?.id;

      if (role === "organizer") {
        // The organizer's availability counts too
        // (PB-06), so make sure they have a row.
        const rows = await sql`
          INSERT INTO participants (
            event_id,
            line_user_id,
            display_name,
            picture_url,
            status,
            submitted_at
          )
          VALUES (
            ${eventId},
            ${lineUser.sub},
            ${lineUser.name || null},
            ${lineUser.picture || null},
            'accepted',
            NOW()
          )
          ON CONFLICT (event_id, line_user_id)
          DO UPDATE SET
            status = 'accepted',
            submitted_at = NOW()
          RETURNING id
        `;

        participantId = rows[0].id;
      } else if (participant?.status !== "accepted") {
        res.status(403).json({
          message:
            "You must accept the event before submitting availability.",
        });
        return;
      }

      // Delete + insert together, so a failure cannot
      // leave the user with half their dates saved.
      await sql.transaction([
        sql`
          DELETE FROM availability
          WHERE participant_id = ${participantId}
        `,
        ...uniqueDates.map(
          (date) => sql`
            INSERT INTO availability (
              event_id,
              participant_id,
              available_date
            )
            VALUES (
              ${eventId},
              ${participantId},
              ${date}
            )
          `
        ),
      ]);

      res.status(200).json({
        message: "Availability saved successfully",
        dates: uniqueDates,
      });
      return;
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    sendError(res, error, "Availability request failed");
  }
};

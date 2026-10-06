const sql = require("../../_db");
const {
  AuthError,
  verifyLineIdToken,
  getEventRole,
  sendError,
  setCorsHeaders,
} = require("../../_auth");
const { sendConfirmation } = require("../../_invitation");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// DATE columns come back as Date objects at UTC midnight.
const toDateKey = (value) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

/*
 * PB-09: the organizer confirms the final date(s).
 * Requires db/migrations/001_event_confirmation.sql.
 */
module.exports = async function handler(req, res) {
  setCorsHeaders(res, "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { id: eventId } = req.query;
  const { idToken, dates, note, notify } = req.body || {};

  try {
    const lineUser = await verifyLineIdToken(idToken);

    const { event, role } = await getEventRole(
      eventId,
      lineUser.sub
    );

    if (role !== "organizer") {
      throw new AuthError(
        403,
        "Only the organizer can confirm the date."
      );
    }

    const startDate = toDateKey(event.start_date);
    const endDate = toDateKey(event.end_date);

    const uniqueDates = Array.isArray(dates)
      ? [...new Set(dates)].sort()
      : [];

    const isValid =
      uniqueDates.length > 0 &&
      uniqueDates.every(
        (date) =>
          typeof date === "string" &&
          DATE_PATTERN.test(date) &&
          date >= startDate &&
          date <= endDate
      );

    if (!isValid) {
      res.status(400).json({
        message:
          "Choose at least one date within the scheduling period.",
      });
      return;
    }

    const trimmedNote =
      typeof note === "string" && note.trim()
        ? note.trim().slice(0, 500)
        : null;

    // confirmed_by "user": the organizer pressed Confirm
    // (AGENTS.md 5.6).
    await sql`
      UPDATE events
      SET
        confirmed_dates = ${uniqueDates}::date[],
        confirmation_note = ${trimmedNote},
        confirmed_at = NOW(),
        confirmed_by = 'user'
      WHERE id = ${eventId}
    `;

    // The date is saved even if the chat message fails;
    // report it so the organizer can tell the group.
    let notifyError = null;

    if (notify) {
      try {
        await sendConfirmation(eventId);
      } catch (error) {
        notifyError = error.message;
      }
    }

    res.status(200).json({
      confirmedDates: uniqueDates,
      notified: Boolean(notify) && !notifyError,
      notifyError,
    });
  } catch (error) {
    // 42703 = undefined_column: the confirmation columns
    // have not been added to this database yet.
    if (error.code === "42703") {
      console.error("Confirm date failed:", error.message);

      res.status(500).json({
        message:
          "The database is missing the confirmation columns. Run db/migrations/001_event_confirmation.sql in Neon.",
      });
      return;
    }

    sendError(res, error, "Failed to confirm the date");
  }
};

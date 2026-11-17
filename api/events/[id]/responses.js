const sql = require("../../_db");
const {
  verifyLineIdToken,
  getBearerToken,
  getEventRole,
  sendError,
  setCorsHeaders,
} = require("../../_auth");

/*
 * GET /api/events/:id/responses — who joins and who
 * declined, for the event details page (opened from the
 * "date confirmed" card).
 *
 * Shown to everyone in the event (organizer and anyone who
 * has answered); the team chose this, and the privacy
 * policy (v2) and the answer buttons say so. People who
 * have not answered (guests) get no names.
 *
 * Only names and pictures: no LINE user IDs or available
 * days of other members (AGENTS.md 5.3).
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

  const { id: eventId } = req.query;

  try {
    const lineUser = await verifyLineIdToken(
      getBearerToken(req)
    );

    // Throws 404 for an unknown event.
    const { event, participant, role } = await getEventRole(
      eventId,
      lineUser.sub
    );

    const organizerRows = await sql`
      SELECT display_name, picture_url
      FROM participants
      WHERE event_id = ${eventId}
        AND line_user_id = ${event.organizer_line_user_id}
      LIMIT 1
    `;

    const organizer = organizerRows[0] || null;

    if (role === "guest") {
      res.status(200).json({
        role,
        myStatus: null,
        organizer,
        accepted: [],
        declined: [],
      });
      return;
    }

    const rows = await sql`
      SELECT display_name, picture_url, status
      FROM participants
      WHERE event_id = ${eventId}
        AND status IN ('accepted', 'declined')
      ORDER BY submitted_at ASC
    `;

    const toPerson = (row) => ({
      display_name: row.display_name,
      picture_url: row.picture_url,
    });

    res.status(200).json({
      role,
      // The caller's own answer: accepted / declined.
      myStatus: participant?.status || null,
      organizer,
      accepted: rows
        .filter((row) => row.status === "accepted")
        .map(toPerson),
      declined: rows
        .filter((row) => row.status === "declined")
        .map(toPerson),
    });
  } catch (error) {
    sendError(res, error, "Failed to load responses");
  }
};

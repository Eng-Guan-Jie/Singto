const sql = require("../../_db");
const {
  verifyLineIdToken,
  getBearerToken,
  getEventRole,
  isLinePictureUrl,
  sendError,
  setCorsHeaders,
} = require("../../_auth");
const { getChatMemberCount } = require("../../_line");

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
     * Organizer: every participant (names + pictures).
     * Everyone else: only their own row (AGENTS.md 5.3).
     */
    if (req.method === "GET") {
      const lineUser = await verifyLineIdToken(
        getBearerToken(req)
      );

      const { event, role } = await getEventRole(
        eventId,
        lineUser.sub
      );

      // Shown to everyone as "Created by".
      const organizerRows = await sql`
        SELECT display_name, picture_url
        FROM participants
        WHERE event_id = ${eventId}
          AND line_user_id = ${event.organizer_line_user_id}
        LIMIT 1
      `;

      const rows =
        role === "organizer"
          ? await sql`
              SELECT
                id,
                line_user_id,
                display_name,
                picture_url,
                status,
                submitted_at,
                joined_at
              FROM participants
              WHERE event_id = ${eventId}
              ORDER BY joined_at ASC
            `
          : await sql`
              SELECT
                id,
                line_user_id,
                display_name,
                picture_url,
                status,
                submitted_at,
                joined_at
              FROM participants
              WHERE event_id = ${eventId}
                AND line_user_id = ${lineUser.sub}
            `;

      res.status(200).json({
        role,
        organizer: organizerRows[0] || null,
        participants: rows,
        // Total people in the LINE chat, for "5 of 6".
        memberCount:
          role === "organizer"
            ? await getChatMemberCount(event.line_chat_id)
            : null,
      });
      return;
    }

    /*
     * ================= POST =================
     * Accept or decline the invitation.
     */
    if (req.method === "POST") {
      const {
        idToken,
        status,
        displayName,
        pictureUrl,
      } = req.body || {};

      if (!["accepted", "declined"].includes(status)) {
        res.status(400).json({
          message: "Status must be accepted or declined",
        });
        return;
      }

      const lineUser = await verifyLineIdToken(idToken);

      // Throws 404 if the event does not exist.
      await getEventRole(eventId, lineUser.sub);

      // Prefer the values LINE verified over values
      // the client sent.
      const finalDisplayName =
        lineUser.name || displayName || null;

      const finalPictureUrl =
        lineUser.picture ||
        (isLinePictureUrl(pictureUrl) ? pictureUrl : null);

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
          ${finalDisplayName},
          ${finalPictureUrl},
          ${status},
          NOW()
        )
        ON CONFLICT (event_id, line_user_id)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          picture_url = EXCLUDED.picture_url,
          status = EXCLUDED.status,
          submitted_at = NOW()
        RETURNING
          id,
          event_id,
          line_user_id,
          display_name,
          picture_url,
          status,
          submitted_at,
          joined_at
      `;

      // A declined participant's availability is no
      // longer needed for scheduling, so remove it.
      if (status === "declined") {
        await sql`
          DELETE FROM availability
          WHERE participant_id = ${rows[0].id}
        `;
      }

      res.status(200).json({
        participant: rows[0],
      });
      return;
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    sendError(res, error, "Participant request failed");
  }
};

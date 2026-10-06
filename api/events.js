const sql = require("./_db");
const {
  verifyLineIdToken,
  sendError,
  setCorsHeaders,
} = require("./_auth");

module.exports = async function handler(req, res) {
  setCorsHeaders(res, "POST, OPTIONS");

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({
      message: "Method not allowed",
    });
    return;
  }

  try {
    const {
      eventName,
      description,
      startDate,
      endDate,
      lineChatId,
      idToken,
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
        message:
          "endDate must be on or after startDate",
      });
      return;
    }

    // The organizer is whoever LINE verified, not an
    // ID the client claims.
    const organizer = await verifyLineIdToken(idToken);

    const rows = await sql`
      INSERT INTO events (
        event_name,
        description,
        start_date,
        end_date,
        line_chat_id,
        organizer_line_user_id
      )
      VALUES (
        ${eventName},
        ${description || null},
        ${startDate},
        ${endDate},
        ${lineChatId || null},
        ${organizer.sub}
      )
      RETURNING
        id,
        event_name,
        description,
        start_date,
        end_date,
        line_chat_id,
        organizer_line_user_id,
        status,
        created_at
    `;

    // The organizer takes part in the event too: they count
    // as the first response, and their name and picture are
    // shown as "Created by" to participants.
    await sql`
      INSERT INTO participants (
        event_id,
        line_user_id,
        display_name,
        picture_url,
        status,
        submitted_at
      )
      VALUES (
        ${rows[0].id},
        ${organizer.sub},
        ${organizer.name || null},
        ${organizer.picture || null},
        'accepted',
        NOW()
      )
      ON CONFLICT (event_id, line_user_id)
      DO NOTHING
    `;

    res.status(201).json({
      event: rows[0],
    });
  } catch (error) {
    sendError(res, error, "Failed to create event");
  }
};


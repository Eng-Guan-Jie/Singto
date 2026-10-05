const sql = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const {
      eventName,
      description,
      startDate,
      endDate,
      lineChatId,
      organizerLineUserId,
    } = req.body || {};

    if (!eventName || !startDate || !endDate) {
      res.status(400).json({
        message: "eventName, startDate, and endDate are required",
      });
      return;
    }

    if (endDate < startDate) {
      res.status(400).json({
        message: "endDate must be on or after startDate",
      });
      return;
    }

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
        ${organizerLineUserId || null}
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

    res.status(201).json({
      event: rows[0],
    });
  } catch (error) {
    console.error("Create event failed:", error);

    res.status(500).json({
      message: "Failed to create event",
    });
  }
};
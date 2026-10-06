const sql = require("../../_db");

const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

async function verifyLineIdToken(idToken) {
  if (!idToken) {
    throw new Error("Missing LINE ID token");
  }

  if (!process.env.LINE_LOGIN_CHANNEL_ID) {
    throw new Error("Missing LINE_LOGIN_CHANNEL_ID");
  }

  const response = await fetch(LINE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: process.env.LINE_LOGIN_CHANNEL_ID,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("LINE ID token verification failed:", data);
    throw new Error("Invalid LINE ID token");
  }

  return data;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

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
    // GET participants
    if (req.method === "GET") {
      const rows = await sql`
        SELECT
          id,
          event_id,
          line_user_id,
          display_name,
          status,
          submitted_at,
          joined_at
        FROM participants
        WHERE event_id = ${eventId}
        ORDER BY joined_at ASC
      `;

      res.status(200).json({
        participants: rows,
      });
      return;
    }

    // POST participant
    if (req.method === "POST") {
      const {
        idToken,
        status,
        displayName,
        pictureUrl,
      } = req.body || {};

      if (!idToken) {
        res.status(400).json({
          message: "LINE ID token is required",
        });
        return;
      }

      if (!["accepted", "declined"].includes(status)) {
        res.status(400).json({
          message: "Status must be accepted or declined",
        });
        return;
      }

      // Make sure event exists
      const eventRows = await sql`
        SELECT id
        FROM events
        WHERE id = ${eventId}
        LIMIT 1
      `;

      if (eventRows.length === 0) {
        res.status(404).json({
          message: "Event not found",
        });
        return;
      }

      // Verify the user with LINE
      const lineUser = await verifyLineIdToken(idToken);

      const lineUserId = lineUser.sub;
      const finalDisplayName =
        displayName || lineUser.name || null;

      // Insert or update participant
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
        ${lineUserId},
        ${finalDisplayName},
        ${pictureUrl || null},
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
          status,
          submitted_at,
          joined_at
      `;

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
    console.error("Participant API failed:", error);

    res.status(500).json({
      message: error.message || "Participant request failed",
    });
  }
};
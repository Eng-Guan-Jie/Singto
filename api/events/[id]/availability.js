const sql = require("../../_db");

const LINE_VERIFY_URL =
  "https://api.line.me/oauth2/v2.1/verify";

async function verifyLineIdToken(idToken) {
  if (!idToken) {
    throw new Error("Missing LINE ID token");
  }

  if (!process.env.LINE_LOGIN_CHANNEL_ID) {
    throw new Error(
      "Missing LINE_LOGIN_CHANNEL_ID"
    );
  }

  const response = await fetch(
    LINE_VERIFY_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        id_token: idToken,
        client_id:
          process.env.LINE_LOGIN_CHANNEL_ID,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "LINE ID token verification failed:",
      data
    );

    throw new Error(
      "Invalid LINE ID token"
    );
  }

  return data;
}

module.exports = async function handler(
  req,
  res
) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
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
    /*
     * ================= GET =================
     * Used by Organizer Overview
     */

    if (req.method === "GET") {
      const rows = await sql`
        SELECT
          a.available_date,
          p.line_user_id,
          p.display_name
        FROM availability a
        INNER JOIN participants p
          ON a.participant_id = p.id
        WHERE a.event_id = ${eventId}
        ORDER BY a.available_date ASC
      `;

      const availability = {};

      rows.forEach((row) => {
        const date = row.available_date
          .toISOString()
          .slice(0, 10);

        if (!availability[date]) {
          availability[date] = [];
        }

        availability[date].push(
          row.line_user_id
        );
      });

      res.status(200).json({
        availability,
      });

      return;
    }

    /*
     * ================= POST =================
     * Used by Participant SAVE
     */

    if (req.method === "POST") {
      const {
        idToken,
        dates,
      } = req.body || {};

      if (!idToken) {
        res.status(400).json({
          message:
            "LINE ID token is required",
        });

        return;
      }

      if (!Array.isArray(dates)) {
        res.status(400).json({
          message:
            "dates must be an array",
        });

        return;
      }

      /*
       * Verify LINE user
       */

      const lineUser =
        await verifyLineIdToken(idToken);

      const lineUserId =
        lineUser.sub;

      /*
       * Check participant
       */

      const participantRows =
        await sql`
          SELECT
            id,
            status
          FROM participants
          WHERE event_id = ${eventId}
            AND line_user_id = ${lineUserId}
          LIMIT 1
        `;

      if (
        participantRows.length === 0
      ) {
        res.status(404).json({
          message:
            "You have not joined this event yet.",
        });

        return;
      }

      const participant =
        participantRows[0];

      /*
       * Only accepted participants
       * can submit availability.
       */

      if (
        participant.status !==
        "accepted"
      ) {
        res.status(403).json({
          message:
            "You must accept the event before submitting availability.",
        });

        return;
      }

      /*
       * Remove previous availability
       */

      await sql`
        DELETE FROM availability
        WHERE participant_id =
          ${participant.id}
      `;

      /*
       * Save new dates
       */

      for (const date of dates) {
        await sql`
          INSERT INTO availability (
            event_id,
            participant_id,
            available_date
          )
          VALUES (
            ${eventId},
            ${participant.id},
            ${date}
          )
          ON CONFLICT (
            participant_id,
            available_date
          )
          DO NOTHING
        `;
      }

      res.status(200).json({
        message:
          "Availability saved successfully",
        dates,
      });

      return;
    }

    res.setHeader(
      "Allow",
      "GET, POST, OPTIONS"
    );

    res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(
      "Availability API failed:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Availability request failed",
    });
  }
};
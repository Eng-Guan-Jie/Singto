const sql = require("../../_db");

module.exports = async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader(
      "Allow",
      "GET, OPTIONS"
    );

    res.status(405).json({
      message: "Method not allowed",
    });

    return;
  }

  try {
    const { id: eventId } = req.query;

    if (!eventId) {
      res.status(400).json({
        message: "Event ID is required",
      });

      return;
    }

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
  } catch (error) {
    console.error(
      "Get availability failed:",
      error
    );

    res.status(500).json({
      message:
        "Failed to get availability",
    });
  }
};
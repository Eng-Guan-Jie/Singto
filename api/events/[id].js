const sql = require("../_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const { id } = req.query;

    const rows = await sql`
      SELECT
        id,
        event_name,
        description,
        start_date,
        end_date,
        status,
        created_at
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

    res.status(200).json({
      event: rows[0],
    });
  } catch (error) {
    console.error("Get event failed:", error);

    res.status(500).json({
      message: "Failed to get event",
    });
  }
};
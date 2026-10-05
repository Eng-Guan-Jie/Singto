const sql = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const rows = await sql`
      SELECT NOW() AS current_time
    `;

    res.status(200).json({
      ok: true,
      message: "Connected to Neon successfully",
      currentTime: rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      ok: false,
      message: "Database connection failed",
    });
  }
};
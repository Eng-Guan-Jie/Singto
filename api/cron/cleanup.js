const {
  deleteExpiredEvents,
  RETENTION_DAYS,
} = require("../_deleteData");

/*
 * Daily retention clean-up (AGENTS.md 5.1), run by
 * Vercel Cron (see "crons" in vercel.json).
 *
 * Deletes events whose scheduling period ended more than
 * RETENTION_DAYS ago, with everyone's responses and
 * available days. The audit log is not touched: it has its
 * own minimum of 90 days (AGENTS.md 5.4).
 *
 * Vercel sends "Authorization: Bearer <CRON_SECRET>" when
 * the CRON_SECRET environment variable is set; anything
 * else is refused, so nobody else can trigger deletions.
 */
module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("Cleanup refused: CRON_SECRET is not set");
    res.status(500).json({ message: "Cleanup is not configured" });
    return;
  }

  if (req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const deletedEvents = await deleteExpiredEvents();

    console.log("Retention cleanup:", {
      deletedEvents,
      retentionDays: RETENTION_DAYS,
    });

    res.status(200).json({ deletedEvents });
  } catch (error) {
    console.error("Retention cleanup failed:", error);
    res.status(500).json({ message: "Cleanup failed" });
  }
};

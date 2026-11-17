const {
  verifyLineIdToken,
  getBearerToken,
  sendError,
  setCorsHeaders,
} = require("./_auth");
const { deleteUserData } = require("./_deleteData");

/*
 * DELETE /api/account — "Delete my account".
 *
 * Singto has no account of its own: people sign in with
 * LINE. Deleting the account removes everything Singto
 * stored about the signed-in LINE user (AGENTS.md 5.1).
 * Unlinking Singto from LINE is done by the user in the
 * LINE app; the page tells them how.
 */
module.exports = async function handler(req, res) {
  setCorsHeaders(res, "DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE, OPTIONS");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    // Only ever the caller's own data: the LINE user ID
    // comes from the verified token, not the request.
    const lineUser = await verifyLineIdToken(
      getBearerToken(req)
    );

    const result = await deleteUserData(lineUser.sub);

    res.status(200).json({ deleted: true, ...result });
  } catch (error) {
    // 23502 = not_null_violation: events.organizer_line_user_id
    // cannot be cleared yet. Nothing was deleted (the
    // statements run in one transaction).
    if (error.code === "23502") {
      console.error("Delete account failed:", error.message);

      res.status(500).json({
        message:
          "The database does not allow events without an organizer yet. Run db/migrations/002_allow_no_organizer.sql in Neon.",
      });
      return;
    }

    sendError(res, error, "Failed to delete account");
  }
};

const {
  AuthError,
  verifyLineIdToken,
  getEventRole,
  sendError,
} = require("./_auth");
const { sendInvitation } = require("./_invitation");

/*
 * Post the event's invitation card to its LINE chat.
 * Used when the event is created and by "Notify Again".
 */
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      message: "Method not allowed",
    });
    return;
  }

  const { eventId, idToken } = req.body || {};

  if (!eventId) {
    res.status(400).json({
      message: "Event ID is required",
    });
    return;
  }

  try {
    // Only the event's organizer may post its invitation,
    // and only to the chat the event was created from.
    const organizer = await verifyLineIdToken(idToken);

    const { role } = await getEventRole(
      eventId,
      organizer.sub
    );

    if (role !== "organizer") {
      throw new AuthError(
        403,
        "Only the organizer can share this event."
      );
    }

    const result = await sendInvitation(eventId);

    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    sendError(
      res,
      error,
      "Unable to push LINE event bubble"
    );
  }
};

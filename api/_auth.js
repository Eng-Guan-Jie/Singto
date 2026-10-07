const sql = require("./_db");

const LINE_VERIFY_URL =
  "https://api.line.me/oauth2/v2.1/verify";

/*
 * Error carrying an HTTP status, so handlers can
 * answer 401/403 without leaking internal details.
 */
class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/*
 * Verify a LIFF ID token with LINE.
 * Returns the token claims (sub, name, picture, ...).
 */
async function verifyLineIdToken(idToken) {
  if (!idToken) {
    throw new AuthError(401, "LINE ID token is required");
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

  if (!response.ok) {
    // LINE's reason, e.g. "IdToken expired." or
    // "Invalid IdToken audience.". Never log the token
    // itself (AGENTS.md 5.4).
    const detail = await response
      .json()
      .then((body) => body.error_description || "")
      .catch(() => "");

    console.error(
      "LINE ID token verification failed:",
      response.status,
      detail
    );

    throw new AuthError(
      401,
      "Your LINE session has expired. Please reopen this page from LINE."
    );
  }

  return response.json();
}

/*
 * Read "Authorization: Bearer <idToken>" from the request.
 */
function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  return match ? match[1] : null;
}

// Event IDs are UUIDs; anything else (a cut-off or mistyped
// link) would make Postgres throw "invalid input syntax".
function isEventId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

/*
 * Work out what the caller may see for this event:
 * - "organizer": the user who created the event
 * - "participant": has responded to the invitation
 * - "guest": signed in with LINE but not part of the event yet
 */
async function getEventRole(eventId, lineUserId) {
  if (!isEventId(eventId)) {
    throw new AuthError(404, "Event not found");
  }

  const eventRows = await sql`
    SELECT
      id,
      start_date,
      end_date,
      line_chat_id,
      organizer_line_user_id
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  if (eventRows.length === 0) {
    throw new AuthError(404, "Event not found");
  }

  const event = eventRows[0];

  const participantRows = await sql`
    SELECT id, status
    FROM participants
    WHERE event_id = ${eventId}
      AND line_user_id = ${lineUserId}
    LIMIT 1
  `;

  const participant = participantRows[0] || null;

  let role = "guest";

  if (
    event.organizer_line_user_id &&
    event.organizer_line_user_id === lineUserId
  ) {
    role = "organizer";
  } else if (participant) {
    role = "participant";
  }

  return { event, participant, role };
}

/*
 * Only accept LINE-hosted profile pictures.
 */
function isLinePictureUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".line-scdn.net")
    );
  } catch {
    return false;
  }
}

/*
 * Send AuthError as its status; anything else as a
 * generic 500 so internal messages are not exposed.
 */
function sendError(res, error, fallbackMessage) {
  if (error instanceof AuthError) {
    res.status(error.status).json({
      message: error.message,
    });
    return;
  }

  console.error(fallbackMessage, error);

  res.status(500).json({
    message: fallbackMessage,
  });
}

function setCorsHeaders(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

module.exports = {
  AuthError,
  isEventId,
  verifyLineIdToken,
  getBearerToken,
  getEventRole,
  isLinePictureUrl,
  sendError,
  setCorsHeaders,
};

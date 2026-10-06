const LINE_API = "https://api.line.me/v2/bot";

/*
 * Number of people in the LINE chat the event was created
 * from (the count LINE returns excludes the bot itself).
 * Returns null for 1:1 chats or if LINE does not answer,
 * so callers can fall back to the responder count.
 */
async function getChatMemberCount(chatId) {
  if (!chatId) return null;

  // Group IDs start with "C", multi-person chat IDs with "R".
  const kind = chatId.startsWith("C")
    ? "group"
    : chatId.startsWith("R")
      ? "room"
      : null;

  if (!kind) return null;

  try {
    const response = await fetch(
      `${LINE_API}/${kind}/${chatId}/members/count`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "LINE member count failed:",
        response.status
      );
      return null;
    }

    const data = await response.json();

    return typeof data.count === "number"
      ? data.count
      : null;
  } catch (error) {
    console.error("LINE member count failed:", error);
    return null;
  }
}

module.exports = { getChatMemberCount };

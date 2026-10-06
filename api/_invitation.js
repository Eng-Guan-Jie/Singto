const sql = require("./_db");
const { AuthError } = require("./_auth");
const { getChatMemberCount } = require("./_line");

// Max responder pictures shown in the bubble.
const MAX_RESPONDER_PICTURES = 5;

const LINE_PUSH_URL =
  "https://api.line.me/v2/bot/message/push";

// DATE columns come back as Date objects at UTC midnight.
const toDateKey = (value) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

/*
 * "Created by" row: the organizer's round LINE picture
 * (when they have one) followed by their name.
 */
// Round 24px LINE profile picture.
function createAvatar(pictureUrl) {
  return {
    type: "box",

    layout: "vertical",

    width: "24px",

    height: "24px",

    cornerRadius: "12px",

    flex: 0,

    contents: [
      {
        type: "image",

        url: pictureUrl,

        size: "full",

        aspectMode: "cover",

        aspectRatio: "1:1",
      },
    ],
  };
}

function createOrganizerRow(eventData) {
  const contents = [];

  if (eventData.organizerPictureUrl) {
    contents.push(
      createAvatar(eventData.organizerPictureUrl)
    );
  }

  contents.push({
    type: "text",

    text: `Created by ${eventData.organizerName}`,

    size: "md",

    color: "#666666",

    wrap: true,

    flex: 1,
  });

  return {
    type: "box",

    layout: "horizontal",

    spacing: "sm",

    alignItems: "center",

    contents,
  };
}

// Day-first to match the design, e.g. "7 SEP".
function formatDate(dateValue) {
  if (!dateValue) return "";

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    })
      .formatToParts(
        new Date(`${dateValue}T00:00:00Z`)
      )
      .map(({ type, value }) => [type, value])
  );

  return `${parts.day} ${parts.month}`.toUpperCase();
}

/*
 * Build the LIFF URL that participants will open.
 * The LIFF Endpoint URL is the site root, so the page
 * goes in the path.
 *
 * Example:
 * https://liff.line.me/1234567890-AbCdEfGh/participant?eventId=xxxxxxxx
 */
function buildParticipantUrl(eventData) {
  const liffId = process.env.LIFF_ID;

  console.log("LIFF_ID:", liffId);
  console.log("EVENT_ID:", eventData.eventId);

  if (!liffId) {
    throw new Error("Missing LIFF_ID");
  }

  const url = new URL(
    `https://liff.line.me/${liffId}/participant`
  );

  if (eventData.eventId) {
    url.searchParams.set(
      "eventId",
      eventData.eventId
    );
  }

  console.log(
    "PARTICIPANT URL:",
    url.toString()
  );

  return url.toString();
}

function createPickDateBubble(eventData) {
  const dateRange = `${formatDate(
    eventData.startDate
  )} - ${formatDate(eventData.endDate)}`;

  const { respondedCount, memberCount } = eventData;

  // "2/6" when LINE told us the chat size, otherwise "2".
  const responsesLabel = memberCount
    ? `${respondedCount}/${memberCount}`
    : String(respondedCount);

  const progressPercent = memberCount
    ? Math.min(
        100,
        Math.round((respondedCount / memberCount) * 100)
      )
    : 100;

  const responderAvatars = eventData.responderPictures
    .slice(0, MAX_RESPONDER_PICTURES)
    .map(createAvatar);

  return {
    type: "flex",

    altText: `${eventData.eventName}: pick your date`,

    contents: {
      type: "bubble",

      size: "mega",

      body: {
        type: "box",

        layout: "vertical",

        spacing: "md",

        paddingAll: "14px",

        contents: [
          {
            type: "text",

            text: eventData.eventName,

            weight: "bold",

            size: "xl",

            color: "#000000",

            wrap: true,
          },

          createOrganizerRow(eventData),

          {
            type: "text",

            text: dateRange,

            size: "md",

            color: "#666666",
          },

          {
            type: "box",

            layout: "horizontal",

            alignItems: "center",

            contents: [
              {
                type: "text",

                text: "Responses",

                size: "md",

                color: "#666666",

                flex: 1,
              },

              {
                type: "text",

                text: responsesLabel,

                size: "md",

                color: "#666666",

                align: "end",

                flex: 0,
              },
            ],
          },

          {
            type: "box",

            layout: "horizontal",

            height: "4px",

            backgroundColor: "#d8d8d8",

            contents: [
              {
                type: "box",

                layout: "vertical",

                width: `${progressPercent}%`,

                backgroundColor: "#2dc46d",

                contents: [
                  {
                    type: "filler",
                  },
                ],
              },

              {
                type: "filler",
              },
            ],
          },

          ...(responderAvatars.length > 0
            ? [
                {
                  type: "box",

                  layout: "horizontal",

                  spacing: "xs",

                  contents: responderAvatars,
                },
              ]
            : []),

          {
            type: "button",

            style: "primary",

            height: "sm",

            color: "#2d1f17",

            action: {
              type: "uri",

              label: "PICK YOUR DATE",

              uri: buildParticipantUrl(
                eventData
              ),
            },
          },
        ],
      },
    },
  };
}

/*
 * Post the "Pick your date" card for an event to the LINE
 * chat it was created from, with the current responses.
 * LINE cannot edit sent messages, so every update is a
 * new card.
 *
 * With onlyIfIncomplete, nothing is sent once everyone in
 * the chat has responded, or when the chat size is unknown.
 * Returns { sent, respondedCount, memberCount }.
 */
async function sendInvitation(
  eventId,
  { onlyIfIncomplete = false } = {}
) {
  const eventRows = await sql`
    SELECT
      id,
      event_name,
      start_date,
      end_date,
      line_chat_id,
      organizer_line_user_id
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  const event = eventRows[0];

  if (!event) {
    throw new AuthError(404, "Event not found");
  }

  if (!event.line_chat_id) {
    throw new AuthError(
      400,
      "This event was not created from a LINE chat."
    );
  }

  // Everyone who accepted or declined, including the
  // organizer (added as accepted when the event was made).
  const responderRows = await sql`
    SELECT line_user_id, display_name, picture_url
    FROM participants
    WHERE event_id = ${eventId}
      AND status IN ('accepted', 'declined')
    ORDER BY submitted_at ASC
  `;

  const respondedCount = responderRows.length;

  const memberCount = await getChatMemberCount(
    event.line_chat_id
  );

  const isComplete =
    memberCount !== null &&
    respondedCount >= memberCount;

  if (
    onlyIfIncomplete &&
    (memberCount === null || isComplete)
  ) {
    return { sent: false, respondedCount, memberCount };
  }

  const organizer = responderRows.find(
    (row) =>
      row.line_user_id === event.organizer_line_user_id
  );

  const eventData = {
    eventId: event.id,
    eventName: event.event_name,
    startDate: toDateKey(event.start_date),
    endDate: toDateKey(event.end_date),
    organizerName:
      organizer?.display_name || "the organizer",
    organizerPictureUrl: organizer?.picture_url || null,
    respondedCount,
    memberCount,
    responderPictures: responderRows
      .map((row) => row.picture_url)
      .filter(Boolean),
  };

  const response = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: event.line_chat_id,
      messages: [createPickDateBubble(eventData)],
    }),
  });

  if (!response.ok) {
    // LINE explains the failure, e.g. an invalid Flex
    // property or "You have reached your monthly limit."
    const body = await response.json().catch(() => ({}));

    const reason = [
      body.message,
      ...(body.details || []).map(
        (item) => `${item.property}: ${item.message}`
      ),
    ]
      .filter(Boolean)
      .join(" | ");

    console.error(
      "LINE push message failed:",
      response.status,
      reason
    );

    throw new AuthError(
      502,
      `LINE push message failed (${response.status}): ${
        reason || "no reason given"
      }`
    );
  }

  return { sent: true, respondedCount, memberCount };
}

module.exports = { sendInvitation };

const sql = require("./_db");
const {
  AuthError,
  verifyLineIdToken,
  getEventRole,
  sendError,
} = require("./_auth");
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

function getBaseUrl(req) {
  const configuredUrl =
    process.env.APP_BASE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`;
  }

  const protocol =
    req.headers["x-forwarded-proto"] ||
    "https";

  const host = req.headers.host;

  return `${protocol}://${host}`;
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

module.exports = async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST"
    );

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

    const eventRows = await sql`
      SELECT
        id,
        event_name,
        start_date,
        end_date,
        line_chat_id
      FROM events
      WHERE id = ${eventId}
      LIMIT 1
    `;

    const event = eventRows[0];

    if (!event.line_chat_id) {
      res.status(400).json({
        message:
          "This event was not created from a LINE chat.",
      });

      return;
    }

    const lineChatId = event.line_chat_id;

    // Name and picture come from the verified token,
    // not from the request body.
    // Everyone who accepted or declined, including the
    // organizer (added as accepted when the event was made).
    const responderRows = await sql`
      SELECT picture_url
      FROM participants
      WHERE event_id = ${eventId}
        AND status IN ('accepted', 'declined')
      ORDER BY submitted_at ASC
    `;

    const eventData = {
      eventId: event.id,
      eventName: event.event_name,
      startDate: toDateKey(event.start_date),
      endDate: toDateKey(event.end_date),
      organizerName: organizer.name || "the organizer",
      organizerPictureUrl: organizer.picture || null,
      respondedCount: responderRows.length,
      memberCount: await getChatMemberCount(lineChatId),
      responderPictures: responderRows
        .map((row) => row.picture_url)
        .filter(Boolean),
    };

    const response = await fetch(
      LINE_PUSH_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },

        body: JSON.stringify({
          to: lineChatId,

          messages: [
            createPickDateBubble(
              eventData
            ),
          ],
        }),
      }
    );

    if (!response.ok) {
      const detail =
        await response.text();

      res.status(response.status).json({
        message:
          "LINE push message failed",

        detail,
      });

      return;
    }

    res.status(200).json({
      ok: true,
    });
  } catch (error) {
    sendError(
      res,
      error,
      "Unable to push LINE event bubble"
    );
  }
};
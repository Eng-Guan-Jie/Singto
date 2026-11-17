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

    text: `สร้างโดย ${eventData.organizerName}`,

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

// Cards in the LINE chat are in Thai: one card is seen by
// the whole group, so it cannot follow each person's app
// language.

// Short date, e.g. "7 ก.ย."
function formatDate(dateValue) {
  if (!dateValue) return "";

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    })
      .formatToParts(
        new Date(`${dateValue}T00:00:00Z`)
      )
      .map(({ type, value }) => [type, value])
  );

  return `${parts.day} ${parts.month}`;
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

    altText: `${eventData.eventName}: เลือกวันที่คุณว่าง`,

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

                text: "ตอบแล้ว",

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

              label: "เลือกวันที่ว่าง",

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
 * Push messages to a LINE chat. Throws with LINE's reason
 * (e.g. an invalid Flex property or the monthly limit).
 */
async function pushToChat(to, messages) {
  const response = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  });

  if (!response.ok) {
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
}

/*
 * Post the "Pick your date" card for an event to the LINE
 * chat it was created from, with the current responses.
 * LINE cannot edit sent messages, so every update is a
 * new card.
 *
 * With untilComplete (a new response), the card that
 * reaches everyone (e.g. 5/5) is still sent, but nothing
 * after that, or when the chat size is unknown.
 * Returns { sent, respondedCount, memberCount }.
 */
async function sendInvitation(
  eventId,
  { untilComplete = false } = {}
) {
  const eventRows = await sql`
    SELECT
      id,
      event_name,
      start_date,
      end_date,
      line_chat_id,
      organizer_line_user_id,
      finalized_date
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  const event = eventRows[0];

  if (!event) {
    throw new AuthError(404, "Event not found");
  }

  // Once the date is confirmed, a new answer no longer
  // posts a "pick your date" card (it would only use up
  // the LINE message quota). "Notify Again" still can.
  if (untilComplete && event.finalized_date) {
    return { sent: false };
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

  // Everyone had already responded before this one.
  const wasComplete =
    memberCount !== null &&
    respondedCount > memberCount;

  if (
    untilComplete &&
    (memberCount === null || wasComplete)
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
      organizer?.display_name || "ผู้จัด",
    organizerPictureUrl: organizer?.picture_url || null,
    respondedCount,
    memberCount,
    responderPictures: responderRows
      .map((row) => row.picture_url)
      .filter(Boolean),
  };

  await pushToChat(event.line_chat_id, [
    createPickDateBubble(eventData),
  ]);

  return { sent: true, respondedCount, memberCount };
}

// "วันเสาร์ที่ 12 กันยายน 2569"
function formatLongDate(dateValue) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
      .formatToParts(new Date(`${dateValue}T00:00:00Z`))
      .map(({ type, value }) => [type, value])
  );

  return `${parts.weekday}ที่ ${parts.day} ${parts.month} ${parts.year}`;
}

// Pictures shown per group on the "date confirmed" card;
// the rest are counted in a "+N" circle.
const MAX_CONFIRMED_PICTURES = 3;

/*
 * Event details page: who joins and who declined
 * (src/pages/EventDetails). Opened from the confirmed card.
 */
function buildDetailsUrl(eventId) {
  const liffId = process.env.LIFF_ID;

  if (!liffId) {
    throw new Error("Missing LIFF_ID");
  }

  const url = new URL(
    `https://liff.line.me/${liffId}/event-details`
  );
  url.searchParams.set("eventId", eventId);

  return url.toString();
}

/*
 * Tinted panel for one group on the "date confirmed" card:
 * title on the left, "N คน" chip on the right, pictures
 * below.
 */
function createResponsePanel(title, people, colors) {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    margin: "md",
    backgroundColor: colors.panel,
    cornerRadius: "8px",
    paddingAll: "10px",
    contents: [
      {
        type: "box",
        layout: "horizontal",
        alignItems: "center",
        contents: [
          {
            type: "text",
            text: title,
            weight: "bold",
            size: "md",
            color: "#111111",
            flex: 1,
          },
          {
            type: "box",
            layout: "vertical",
            flex: 0,
            backgroundColor: colors.chip,
            borderColor: colors.chipBorder,
            borderWidth: "1px",
            cornerRadius: "10px",
            paddingStart: "8px",
            paddingEnd: "8px",
            paddingTop: "1px",
            paddingBottom: "1px",
            contents: [
              {
                type: "text",
                text: `${people.length} คน`,
                size: "xs",
                color: colors.chipText,
              },
            ],
          },
        ],
      },
      createPeopleRow(people),
    ],
  };
}

const ACCEPTED_COLORS = {
  panel: "#E7F6EA",
  chip: "#C9EED3",
  chipBorder: "#8ED3A0",
  chipText: "#2E7D45",
};

const DECLINED_COLORS = {
  panel: "#FBE6E6",
  chip: "#F6CACA",
  chipBorder: "#E79C9C",
  chipText: "#A93636",
};

// Grey circle with a number, e.g. "+1".
function createCountCircle(text) {
  return {
    type: "box",
    layout: "vertical",
    width: "28px",
    height: "28px",
    cornerRadius: "14px",
    flex: 0,
    backgroundColor: "#B5B5B5",
    justifyContent: "center",
    contents: [
      {
        type: "text",
        text,
        size: "xs",
        color: "#222222",
        align: "center",
      },
    ],
  };
}

function createPictureCircle(pictureUrl) {
  return {
    type: "box",
    layout: "vertical",
    width: "28px",
    height: "28px",
    cornerRadius: "14px",
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

/*
 * Up to MAX_CONFIRMED_PICTURES pictures, then "+N" for
 * everyone else (including people without a picture).
 */
function createPeopleRow(people) {
  if (people.length === 0) {
    return {
      type: "text",
      text: "ยังไม่มี",
      size: "sm",
      color: "#999999",
    };
  }

  const pictures = people
    .map((person) => person.picture_url)
    .filter(Boolean)
    .slice(0, MAX_CONFIRMED_PICTURES);

  const rest = people.length - pictures.length;

  const contents = pictures.map(createPictureCircle);

  if (rest > 0) {
    contents.push(
      createCountCircle(
        pictures.length > 0 ? `+${rest}` : String(rest)
      )
    );
  }

  return {
    type: "box",
    layout: "horizontal",
    spacing: "xs",
    contents,
  };
}

function createConfirmationBubble(data) {
  const bodyContents = [
    {
      type: "text",
      text: data.eventName,
      weight: "bold",
      size: "xl",
      color: "#000000",
      wrap: true,
    },
    ...data.dates.map((date) => ({
      type: "text",
      text: formatLongDate(date),
      weight: "bold",
      size: "md",
      color: "#000000",
      wrap: true,
    })),
  ];

  if (data.description) {
    bodyContents.push({
      type: "text",
      text: data.description,
      size: "md",
      color: "#606060",
      wrap: true,
    });
  }

  if (data.note) {
    bodyContents.push({
      type: "text",
      text: `หมายเหตุ: ${data.note}`,
      size: "sm",
      color: "#606060",
      wrap: true,
    });
  }

  // Who joins and who declined. Everyone in the group sees
  // this card; the team chose to show both (privacy policy
  // v2, "Who can see your data").
  bodyContents.push(
    createResponsePanel("เข้าร่วม", data.accepted, ACCEPTED_COLORS),
    createResponsePanel(
      "ไม่เข้าร่วม",
      data.declined,
      DECLINED_COLORS
    ),
    {
      type: "text",
      text: "ดูรายละเอียดเพิ่มเติม →",
      weight: "bold",
      size: "md",
      color: "#2a1e16",
      align: "end",
      decoration: "underline",
      margin: "lg",
      action: {
        type: "uri",
        label: "ดูรายละเอียดเพิ่มเติม",
        uri: data.detailsUrl,
      },
    }
  );

  return {
    type: "flex",

    altText: `ได้วันนัดแล้ว! ${data.eventName}: ${data.dates
      .map(formatLongDate)
      .join(", ")}`,

    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#2a1e16",
        paddingAll: "10px",
        contents: [
          {
            type: "text",
            text: "ได้วันนัดแล้ว!",
            weight: "bold",
            size: "xl",
            color: "#ffffff",
            align: "center",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "14px",
        contents: bodyContents,
      },
    },
  };
}

/*
 * Post the "date confirmed" card announcing the confirmed
 * date(s) to the event's LINE chat.
 */
async function sendConfirmation(eventId) {
  const eventRows = await sql`
    SELECT
      id,
      event_name,
      description,
      line_chat_id,
      finalized_date,
      finalized_dates,
      finalization_note
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  const event = eventRows[0];

  if (!event?.line_chat_id) {
    throw new AuthError(
      400,
      "This event was not created from a LINE chat."
    );
  }

  const responderRows = await sql`
    SELECT picture_url, status
    FROM participants
    WHERE event_id = ${eventId}
      AND status IN ('accepted', 'declined')
    ORDER BY submitted_at ASC
  `;

  await pushToChat(event.line_chat_id, [
    createConfirmationBubble({
      eventName: event.event_name,
      description: event.description,
      note: event.finalization_note,
      dates: event.finalized_dates?.length
        ? event.finalized_dates.map(toDateKey)
        : [event.finalized_date].filter(Boolean).map(toDateKey),
      accepted: responderRows.filter(
        (row) => row.status === "accepted"
      ),
      declined: responderRows.filter(
        (row) => row.status === "declined"
      ),
      detailsUrl: buildDetailsUrl(event.id),
    }),
  ]);
}

module.exports = { sendInvitation, sendConfirmation };

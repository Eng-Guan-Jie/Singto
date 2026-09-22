const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

function formatDate(dateValue) {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${dateValue}T00:00:00`))
    .toUpperCase();
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

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;

  return `${protocol}://${host}`;
}

function buildOverviewUrl(req, eventData) {
  const url = new URL("/overview", getBaseUrl(req));

  Object.entries(eventData).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}

function createPickDateBubble(req, eventData) {
  const dateRange = `${formatDate(eventData.startDate)} - ${formatDate(
    eventData.endDate
  )}`;

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
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "Created by Singto",
                size: "md",
                color: "#666666",
                wrap: true,
              },
            ],
          },
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
                text: "1/5",
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
                width: "20%",
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
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#2d1f17",
            action: {
              type: "uri",
              label: "PICK YOUR DATE",
              uri: buildOverviewUrl(req, eventData),
            },
          },
        ],
      },
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { lineChatId, eventData } = req.body || {};

  if (!lineChatId || !eventData?.eventName || !eventData?.startDate || !eventData?.endDate) {
    res.status(400).json({ message: "Missing LINE chat id or event details" });
    return;
  }

  try {
    const response = await fetch(LINE_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineChatId,
        messages: [createPickDateBubble(req, eventData)],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(response.status).json({
        message: "LINE push message failed",
        detail,
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to push LINE event bubble" });
  }
};

const crypto = require("crypto");

const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
const TRIGGER_WORDS = ["สิงโต", "singto"];

async function readBody(req) {
  if (req.body) {
    return Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(
          typeof req.body === "string" ? req.body : JSON.stringify(req.body)
        );
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function isValidSignature(body, signature, channelSecret) {
  if (!signature || !channelSecret) return false;

  const digest = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  const expected = Buffer.from(digest);
  const received = Buffer.from(signature);

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

function getChatId(source = {}) {
  return source.groupId || source.roomId || source.userId || "";
}

function buildCreateEventUrl(chatId) {
  const baseUrl =
    process.env.APP_BASE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!baseUrl) {
    throw new Error("Missing APP_BASE_URL for LINE create event link");
  }

  const origin = baseUrl?.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  const url = new URL("/create-event", origin);
  url.searchParams.set("lineChatId", chatId);

  return url.toString();
}

function createCallToActionBubble(chatId) {
  return {
    type: "flex",
    altText: "Create a Singto event",
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
            text: "Want to hang out?",
            weight: "bold",
            size: "lg",
            color: "#111111",
          },
          {
            type: "text",
            text: "Create a meetup and let Singto find a day that works for everyone.",
            size: "md",
            color: "#666666",
            wrap: true,
          },
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#2d1f17",
            action: {
              type: "uri",
              label: "CREATE EVENT",
              uri: buildCreateEventUrl(chatId),
            },
          },
        ],
      },
    },
  };
}

async function reply(replyToken, messages) {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
  }

  const response = await fetch(LINE_REPLY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE reply failed: ${response.status} ${detail}`);
  }
}

async function handleEvent(event) {
  console.log("LINE event received:", {
    type: event.type,
    sourceType: event.source?.type,
    hasReplyToken: Boolean(event.replyToken),
    messageType: event.message?.type,
    text: event.message?.type === "text" ? event.message.text : undefined,
  });

  if (!event.replyToken) return;

  if (event.type === "join") {
    await reply(event.replyToken, [
      {
        type: "text",
        text: "Hey everyone! 👋 Singto here!\nFrom now on, whenever you want to make plans, I’ll help you find a day that works for everyone. Just call on ‘Singto’ whenever you need me!",
      },
    ]);
    return;
  }

  const text = event.message?.type === "text" ? event.message.text : "";
  const isCalled =
    event.type === "message" &&
    TRIGGER_WORDS.some((word) => text.toLowerCase().includes(word));

  if (!isCalled) {
    console.log("LINE message ignored: trigger word not found");
    return;
  }

  const chatId = getChatId(event.source);

  if (!chatId) {
    throw new Error("Missing LINE chat id from webhook source");
  }

  await reply(event.replyToken, [createCallToActionBubble(chatId)]);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const body = await readBody(req);
  const signature = req.headers["x-line-signature"];

  console.log("LINE webhook request received:", {
    hasSignature: Boolean(signature),
    bodyBytes: body.length,
  });

  if (
    !isValidSignature(body, signature, process.env.LINE_CHANNEL_SECRET)
  ) {
    console.error("LINE signature validation failed");
    res.status(401).json({ message: "Invalid LINE signature" });
    return;
  }

  try {
    const payload = JSON.parse(body.toString("utf8"));
    await Promise.all((payload.events || []).map(handleEvent));
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Webhook handling failed" });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

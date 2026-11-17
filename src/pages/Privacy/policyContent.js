/*
 * Singto privacy notice (PDPA / AGENTS.md 5.1).
 *
 * Keep this true to what the code does. When the data
 * Singto stores, who sees it, or how long it is kept
 * changes, update this text and bump POLICY_VERSION so the
 * first-visit notice shows again.
 *
 * The retention period must match RETENTION_DAYS in
 * api/_deleteData.js.
 */

export const POLICY_VERSION = 3;

// Shown as the policy date.
export const POLICY_DATE = "2026-11-17";

// TODO(team): how people reach the team for privacy
// requests (e.g. an e-mail address). Must be filled in
// before release.
export const PRIVACY_CONTACT = "[ช่องทางติดต่อทีม / team contact]";

export const policy = {
  th: {
    title: "นโยบายความเป็นส่วนตัว",
    updated: "ปรับปรุงล่าสุด",
    version: "เวอร์ชัน",
    intro:
      "สิงโต (Singto) เป็นผู้ช่วยหาวันนัดในกลุ่ม LINE นโยบายนี้อธิบายว่าเราเก็บข้อมูลอะไร ใช้ทำอะไร ใครเห็นได้บ้าง เก็บนานแค่ไหน และคุณจัดการข้อมูลของคุณได้อย่างไร",
    sections: [
      {
        heading: "ข้อมูลที่เราเก็บ",
        items: [
          "จากบัญชี LINE ตอนที่คุณเข้าใช้: LINE user ID, ชื่อที่แสดง และลิงก์รูปโปรไฟล์",
          "นัดที่คุณสร้าง: ชื่อนัด รายละเอียด ช่วงวันที่นัดได้ กลุ่ม LINE ที่สร้างนัด วันที่ยืนยัน และหมายเหตุ",
          "คำตอบของคุณ: เข้าร่วมหรือไม่เข้าร่วม เวลาที่ตอบ และวันที่คุณว่าง",
          "บันทึกการใช้งาน: ใคร ทำอะไร เมื่อไหร่ ตามที่ พ.ร.บ.คอมพิวเตอร์กำหนด",
          "ภาษาที่คุณเลือก (TH/EN) เก็บไว้ในเครื่องของคุณเท่านั้น ไม่ได้ส่งมาที่เรา",
        ],
      },
      {
        heading: "เราใช้ข้อมูลทำอะไร",
        paragraphs: [
          "ใช้เพื่อหาวันนัดให้กลุ่มของคุณเท่านั้น คือแสดงว่าใครว่างวันไหน แนะนำวันที่เหมาะ และส่งการ์ดนัดเข้ากลุ่ม LINE เราไม่ใช้ข้อมูลเพื่อการตลาด และไม่ขายหรือส่งต่อให้ใคร",
          "เหตุผลทางกฎหมายที่เราประมวลผลข้อมูลคือ จำเป็นเพื่อให้บริการหาวันนัดที่คุณขอใช้",
        ],
      },
      {
        heading: "ใครเห็นข้อมูลของคุณบ้าง",
        items: [
          "ผู้จัดนัด: เห็นชื่อ รูป และวันที่แต่ละคนว่าง เพื่อเลือกวันนัด",
          "ผู้เข้าร่วมคนอื่น: เห็นชื่อและรูปของคนที่ตอบเข้าร่วมและไม่เข้าร่วม ใครว่างวันไหน (ในส่วนวันที่ดีที่สุด) และชื่อกับรูปของผู้จัด",
          "สมาชิกในกลุ่ม LINE: เห็นการ์ดที่สิงโตส่ง ซึ่งมีชื่อนัด ชื่อและรูปผู้จัด รูปของคนที่ตอบแล้ว จำนวนคนที่ตอบ และเมื่อยืนยันวันนัดแล้ว จะแยกรูปคนที่เข้าร่วมกับไม่เข้าร่วมให้เห็น",
        ],
      },
      {
        heading: "ผู้ให้บริการที่เกี่ยวข้อง",
        items: [
          "LINE: การเข้าสู่ระบบ และการส่งข้อความเข้ากลุ่ม",
          "Vercel: ที่ตั้งเว็บไซต์และ server",
          "Neon: ฐานข้อมูล",
        ],
      },
      {
        heading: "เราเก็บข้อมูลนานแค่ไหน",
        items: [
          "นัดและข้อมูลทั้งหมดของนัดนั้น (คำตอบ วันว่าง ชื่อ รูป) จะถูกลบอัตโนมัติ 30 วันหลังวันสุดท้ายของช่วงวันที่นัดได้",
          "คุณลบข้อมูลของคุณเองได้ทุกเมื่อ ดูหัวข้อถัดไป",
          "บันทึกการใช้งานเก็บไว้อย่างน้อย 90 วันตามที่กฎหมายกำหนด",
        ],
      },
      {
        heading: "สิทธิของคุณ",
        items: [
          "ดูและแก้ไข: คุณเห็นคำตอบและวันว่างของคุณในหน้านัด และแก้ได้ตลอด ชื่อและรูปจะอัปเดตจาก LINE ทุกครั้งที่คุณตอบนัด",
          "ลบข้อมูลทั้งหมดของคุณ: กดรูปโปรไฟล์มุมขวาบน แล้วเลือก \"ลบบัญชี\"",
          "ผู้จัดลบนัดได้: กดปุ่มแก้ไขนัด แล้วเลือก \"ลบนัดนี้\"",
          "เลิกเชื่อมสิงโตกับบัญชี LINE: ลบสิงโตออกจากรายการแอปที่อนุญาตในการตั้งค่าบัญชี LINE",
          "การ์ดที่ส่งเข้ากลุ่ม LINE ไปแล้วลบไม่ได้ เพราะ LINE ไม่อนุญาตให้ลบข้อความที่ส่งไปแล้ว",
        ],
      },
      {
        heading: "ติดต่อเรา",
        paragraphs: [
          `ถ้ามีคำถามหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล ติดต่อทีมสิงโตได้ที่ ${PRIVACY_CONTACT}`,
        ],
      },
    ],
  },

  en: {
    title: "Privacy Policy",
    updated: "Last updated",
    version: "Version",
    intro:
      "Singto helps LINE groups find a date to meet. This policy explains what we collect, what we use it for, who can see it, how long we keep it, and how you can manage your data.",
    sections: [
      {
        heading: "What we collect",
        items: [
          "From your LINE account when you sign in: your LINE user ID, display name and profile picture link",
          "Events you create: name, description, scheduling period, the LINE group it was created in, confirmed dates and note",
          "Your answers: whether you join, when you answered, and the days you are free",
          "Usage records: who did what and when, as required by the Computer Crime Act",
          "The language you choose (TH/EN) is kept only on your device and is not sent to us",
        ],
      },
      {
        heading: "What we use it for",
        paragraphs: [
          "Only to find a date for your group: showing who is free when, suggesting good dates and posting event cards in the LINE group. We do not use your data for marketing and do not sell or share it.",
          "Our legal basis is that processing is necessary to provide the scheduling service you asked to use.",
        ],
      },
      {
        heading: "Who can see your data",
        items: [
          "The organizer: names, pictures and the days each person is free, to choose a date",
          "Other participants: the names and pictures of who joins and who declined, who is free on which day (in Best Date), and the organizer's name and picture",
          "LINE group members: Singto's cards, which show the event name, the organizer's name and picture, pictures of people who answered and the answer count; once the date is confirmed, the card shows pictures of who joins and who declined separately",
        ],
      },
      {
        heading: "Service providers",
        items: [
          "LINE: sign-in and posting messages to groups",
          "Vercel: website and server hosting",
          "Neon: database",
        ],
      },
      {
        heading: "How long we keep it",
        items: [
          "An event and everything in it (answers, available days, names, pictures) is deleted automatically 30 days after the last day of its scheduling period",
          "You can delete your own data at any time — see below",
          "Usage records are kept for at least 90 days, as required by law",
        ],
      },
      {
        heading: "Your rights",
        items: [
          "See and correct: your answers and available days are shown on the event page and you can change them at any time; your name and picture are refreshed from LINE whenever you answer",
          "Delete all your data: tap your profile picture at the top right and choose \"Delete account\"",
          "Organizers can delete an event: tap Edit event, then \"Delete event\"",
          "Disconnect Singto from LINE: remove Singto from the authorized apps in your LINE account settings",
          "Cards already posted in a LINE group cannot be removed: LINE does not allow deleting sent messages",
        ],
      },
      {
        heading: "Contact us",
        paragraphs: [
          `For questions or to exercise your personal-data rights, contact the Singto team at ${PRIVACY_CONTACT}`,
        ],
      },
    ],
  },
};

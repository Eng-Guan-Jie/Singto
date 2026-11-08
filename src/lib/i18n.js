import { useSyncExternalStore } from "react";

/*
 * Thai / English text for every page.
 *
 * The language follows the LINE app's language setting
 * (set from initLiff once LIFF is ready). Thai for "th",
 * English for any other language LINE reports, and Thai
 * when no language can be read.
 */

const messages = {
  en: {
    // ---------- shared ----------
    loading: "Loading...",
    pageNotFound: "Page not found.",
    eventNotFound: "Event not found.",
    eventIdMissing: "Event ID is missing.",
    liffFailed: "Failed to initialize LINE Login.",
    somethingWrong: "Something went wrong.",
    failedLoadEvent: "Failed to load event.",
    failedLoadParticipants: "Failed to load participants.",
    failedLoadAvailability: "Failed to load availability.",
    failedSaveAvailability: "Failed to save availability.",
    availabilitySaved: "Your availability has been saved.",
    tabOverview: "OVERVIEW",
    tabMyAvailability: "MY AVAILABILITY",
    calendar: "CALENDAR",
    overviewSubtitle: "Overview of Everyone’s Availability",
    tapYourDays: "Tap your available days",
    quickSelect: "Quick Select",
    quickAllDays: "All Day",
    quickWeekends: "Weekends",
    quickEveryDay: "Every {day}",
    legendBusy: "Busy",
    legendFree: "Free",
    save: "SAVE",
    saving: "SAVING...",
    confirmedOn: "Confirmed: {dates}",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    dayAria: "Day {day}",
    dayCountAria: "Day {day}: {available} of {total} free",
    addDayAria: "Add availability for day {day}",
    removeDayAria: "Remove availability for day {day}",

    // ---------- participant ----------
    createdBy: "Created by {name}",
    theOrganizer: "the organizer",
    joinQuestion: "Do you want to join this event?",
    decline: "DECLINE",
    accept: "ACCEPT",
    youAccepted: "You accepted this event.",
    youDeclined: "You declined this event.",
    acceptFirst: "Please accept the event first.",
    acceptFirstHint: "Accept the event first to pick your days.",
    unableIdentifyParticipant: "Unable to identify this participant.",
    failedUpdateParticipation: "Failed to update participation.",

    // ---------- organizer overview ----------
    loadingEvent: "Loading event...",
    respondedCount: "{count} of {total} Responded",
    notifyAgain: "Notify Again",
    editEvent: "Edit event",
    ownAvailabilityNotice:
      "You haven’t added your available days yet, so every date counts you as busy.",
    addMyAvailability: "Add my availability",
    bestDate: "BEST DATE",
    filter: "Filter",
    filterSingle: "Single Day",
    filterTwoDays: "2 Consecutive Days",
    filterThreeDays: "3 Consecutive Days",
    filterHoliday: "Only holiday",
    available: "AVAILABLE",
    unavailable: "UNAVAILABLE",
    noOneYet: "No one yet",
    noOne: "No one",
    noAvailableDate: "No available date yet.",
    finalizeDate: "FINALIZE DATE",
    everyoneResponded: "Everyone has already responded.",
    reminderSent: "Reminder sent to the LINE chat.",
    reminderFailed: "Unable to send the reminder.",
    onlyOrganizerView: "Only the organizer of this event can view this page.",
    failedLoadOverview: "Failed to load overview.",

    // ---------- confirm date ----------
    confirmDateTitle: "CONFIRM DATE",
    singleDate: "Single Date",
    multipleDates: "Multiple Dates",
    chooseDate: "Choose a date that works for everyone.",
    note: "NOTE",
    notePlaceholder: "e.g. Meet in front of the restaurant.",
    sendNotification: "Send a notification to the group",
    toggleNotification: "Toggle group notification",
    confirmDateButton: "CONFIRM DATE",
    confirming: "CONFIRMING...",
    selectAtLeastOne: "Please select at least one date.",
    confirmedAndPosted: "The date is confirmed and posted to the LINE group.",
    confirmedOnly: "The date is confirmed.",
    confirmedNotPosted:
      "The date is confirmed, but Singto could not post it to the LINE group.\n\n{reason}",
    failedConfirm: "Failed to confirm the date.",
    onlyOrganizerConfirm: "Only the organizer of this event can confirm the date.",

    // ---------- create / edit event ----------
    eventName: "EVENT NAME",
    eventNamePlaceholder: "e.g. dinner, trip to CEI",
    description: "DESCRIPTION",
    descriptionPlaceholder: "e.g. trip to CEI 7:00PM",
    schedulingPeriod: "SCHEDULING PERIODS",
    startDate: "START DATE",
    endDate: "END DATE",
    savingEvent: "SAVING...",
    loadingButton: "LOADING...",
    updateEvent: "UPDATE EVENT",
    createEvent: "CREATE EVENT",
    fillRequired: "Please fill in the required fields.",
    endAfterStart: "End date must be on or after start date.",
    unableIdentifyOrganizer: "Unable to identify the organizer through LINE.",
    unableCreateEvent: "Unable to create the event.",
    createdNotSent:
      "Event created successfully, but Singto could not send the event to LINE.\n\n{reason}",
    unableUpdateEvent: "Unable to update the event.",
    saveEventFailed: "Something went wrong while saving the event.",
    language: "Language",
  },

  th: {
    // ---------- shared ----------
    loading: "กำลังโหลด...",
    pageNotFound: "ไม่พบหน้านี้",
    eventNotFound: "ไม่พบนัดนี้",
    eventIdMissing: "ลิงก์ไม่ถูกต้อง (ไม่มีรหัสนัด)",
    liffFailed: "เข้าสู่ระบบ LINE ไม่สำเร็จ",
    somethingWrong: "เกิดข้อผิดพลาด",
    failedLoadEvent: "โหลดข้อมูลนัดไม่สำเร็จ",
    failedLoadParticipants: "โหลดรายชื่อผู้เข้าร่วมไม่สำเร็จ",
    failedLoadAvailability: "โหลดวันว่างไม่สำเร็จ",
    failedSaveAvailability: "บันทึกวันว่างไม่สำเร็จ",
    availabilitySaved: "บันทึกวันว่างแล้ว",
    tabOverview: "ภาพรวม",
    tabMyAvailability: "วันว่างของฉัน",
    calendar: "ปฏิทิน",
    overviewSubtitle: "ภาพรวมวันว่างของทุกคน",
    tapYourDays: "แตะวันที่คุณว่าง",
    quickSelect: "เลือกด่วน",
    quickAllDays: "ทุกวัน",
    quickWeekends: "เสาร์-อาทิตย์",
    quickEveryDay: "ทุก{day}",
    legendBusy: "ไม่ว่าง",
    legendFree: "ว่าง",
    save: "บันทึก",
    saving: "กำลังบันทึก...",
    confirmedOn: "ยืนยันแล้ว: {dates}",
    prevMonth: "เดือนก่อนหน้า",
    nextMonth: "เดือนถัดไป",
    dayAria: "วันที่ {day}",
    dayCountAria: "วันที่ {day}: ว่าง {available} จาก {total} คน",
    addDayAria: "เพิ่มวันที่ {day} เป็นวันว่าง",
    removeDayAria: "เอาวันที่ {day} ออกจากวันว่าง",

    // ---------- participant ----------
    createdBy: "สร้างโดย {name}",
    theOrganizer: "ผู้จัด",
    joinQuestion: "คุณจะเข้าร่วมนัดนี้ไหม?",
    decline: "ไม่เข้าร่วม",
    accept: "เข้าร่วม",
    youAccepted: "คุณเข้าร่วมนัดนี้แล้ว",
    youDeclined: "คุณปฏิเสธนัดนี้แล้ว",
    acceptFirst: "กรุณากดเข้าร่วมก่อน",
    acceptFirstHint: "กดเข้าร่วมก่อน แล้วจึงเลือกวันที่ว่างได้",
    unableIdentifyParticipant: "ไม่สามารถยืนยันตัวตนผู้เข้าร่วมได้",
    failedUpdateParticipation: "อัปเดตการเข้าร่วมไม่สำเร็จ",

    // ---------- organizer overview ----------
    loadingEvent: "กำลังโหลดนัด...",
    respondedCount: "ตอบแล้ว {count} จาก {total} คน",
    notifyAgain: "แจ้งเตือนอีกครั้ง",
    editEvent: "แก้ไขนัด",
    ownAvailabilityNotice:
      "คุณยังไม่ได้เลือกวันว่างของตัวเอง ทุกวันจึงนับว่าคุณไม่ว่าง",
    addMyAvailability: "เลือกวันว่างของฉัน",
    bestDate: "วันที่ดีที่สุด",
    filter: "ตัวกรอง",
    filterSingle: "วันเดียว",
    filterTwoDays: "2 วันติดกัน",
    filterThreeDays: "3 วันติดกัน",
    filterHoliday: "เฉพาะวันหยุด",
    available: "ว่าง",
    unavailable: "ไม่ว่าง",
    noOneYet: "ยังไม่มีใคร",
    noOne: "ไม่มี",
    noAvailableDate: "ยังไม่มีวันที่มีคนว่าง",
    finalizeDate: "สรุปวันนัด",
    everyoneResponded: "ทุกคนตอบครบแล้ว",
    reminderSent: "ส่งการแจ้งเตือนเข้ากลุ่ม LINE แล้ว",
    reminderFailed: "ส่งการแจ้งเตือนไม่สำเร็จ",
    onlyOrganizerView: "หน้านี้เปิดได้เฉพาะผู้จัดนัดเท่านั้น",
    failedLoadOverview: "โหลดภาพรวมไม่สำเร็จ",

    // ---------- confirm date ----------
    confirmDateTitle: "ยืนยันวันนัด",
    singleDate: "วันเดียว",
    multipleDates: "หลายวัน",
    chooseDate: "เลือกวันที่ทุกคนสะดวก",
    note: "หมายเหตุ",
    notePlaceholder: "เช่น เจอกันหน้าร้าน",
    sendNotification: "ส่งการแจ้งเตือนเข้ากลุ่ม",
    toggleNotification: "เปิด/ปิดการแจ้งเตือนเข้ากลุ่ม",
    confirmDateButton: "ยืนยันวันนัด",
    confirming: "กำลังยืนยัน...",
    selectAtLeastOne: "กรุณาเลือกอย่างน้อย 1 วัน",
    confirmedAndPosted: "ยืนยันวันนัดและส่งเข้ากลุ่ม LINE แล้ว",
    confirmedOnly: "ยืนยันวันนัดแล้ว",
    confirmedNotPosted:
      "ยืนยันวันนัดแล้ว แต่ส่งเข้ากลุ่ม LINE ไม่สำเร็จ\n\n{reason}",
    failedConfirm: "ยืนยันวันนัดไม่สำเร็จ",
    onlyOrganizerConfirm: "เฉพาะผู้จัดนัดเท่านั้นที่ยืนยันวันได้",

    // ---------- create / edit event ----------
    eventName: "ชื่อนัด",
    eventNamePlaceholder: "เช่น กินข้าว, ไปเที่ยวเชียงใหม่",
    description: "รายละเอียด",
    descriptionPlaceholder: "เช่น เที่ยวเชียงใหม่ 19:00 น.",
    schedulingPeriod: "ช่วงวันที่นัดได้",
    startDate: "วันเริ่มต้น",
    endDate: "วันสิ้นสุด",
    savingEvent: "กำลังบันทึก...",
    loadingButton: "กำลังโหลด...",
    updateEvent: "บันทึกการแก้ไข",
    createEvent: "สร้างนัด",
    fillRequired: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
    endAfterStart: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น",
    unableIdentifyOrganizer: "ไม่สามารถยืนยันตัวตนผู้จัดผ่าน LINE ได้",
    unableCreateEvent: "สร้างนัดไม่สำเร็จ",
    createdNotSent:
      "สร้างนัดแล้ว แต่ส่งการ์ดเข้ากลุ่ม LINE ไม่สำเร็จ\n\n{reason}",
    unableUpdateEvent: "แก้ไขนัดไม่สำเร็จ",
    saveEventFailed: "บันทึกนัดไม่สำเร็จ",
    language: "ภาษา",
  },
};

// "th" for Thai, "en" for any other language that can be
// read, and Thai when nothing can be read.
export const pickLanguage = (code) => {
  if (!code) return "th";

  return String(code).toLowerCase().startsWith("th") ? "th" : "en";
};

// A language the user picked with the TH/EN switch. It is
// kept only in this browser (never sent to the server) and
// wins over the detected language on later visits.
const STORAGE_KEY = "singto-language";

const readSavedLanguage = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "th" || saved === "en" ? saved : null;
  } catch {
    return null;
  }
};

export const hasSavedLanguage = () => readSavedLanguage() !== null;

let currentLanguage =
  readSavedLanguage() ||
  pickLanguage(
    typeof navigator !== "undefined" ? navigator.language : ""
  );

if (typeof document !== "undefined") {
  document.documentElement.lang = currentLanguage;
}

const listeners = new Set();

export const setLanguage = (language) => {
  const next = language === "en" ? "en" : "th";

  if (next === currentLanguage) return;

  currentLanguage = next;

  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }

  listeners.forEach((listener) => listener());
};

// Called by the TH/EN switch: change now and remember it.
export const chooseLanguage = (language) => {
  setLanguage(language);

  try {
    window.localStorage.setItem(STORAGE_KEY, currentLanguage);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getLanguage = () => currentLanguage;

// "Hello {name}" + { name: "Mook" } → "Hello Mook"
const format = (text, vars = {}) =>
  text.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );

export const translate = (language, key, vars) =>
  format(messages[language][key] ?? messages.en[key] ?? key, vars);

const localeFor = (language) =>
  language === "th" ? "th-TH" : "en-US";

const toDate = (dateKey) => new Date(`${dateKey}T00:00:00`);

const formatParts = (language, dateKey, options) =>
  Object.fromEntries(
    new Intl.DateTimeFormat(localeFor(language), options)
      .formatToParts(toDate(dateKey))
      .map(({ type, value }) => [type, value])
  );

// Text helpers bound to one language.
const helpersFor = (language) => ({
  lang: language,

  t: (key, vars) => translate(language, key, vars),

  // "Oct 11, 2026" / "11 ต.ค. 2569"
  formatDate: (dateKey) =>
    dateKey
      ? new Intl.DateTimeFormat(localeFor(language), {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(toDate(dateKey))
      : "",

  // "12 OCT 2026" / "12 ต.ค. 2569"
  formatDayLabel: (dateKey) => {
    const parts = formatParts(language, dateKey, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const label = `${parts.day} ${parts.month} ${parts.year}`;

    return language === "en" ? label.toUpperCase() : label;
  },

  // "Monday" / "วันจันทร์"
  formatWeekday: (dateKey) =>
    new Intl.DateTimeFormat(localeFor(language), {
      weekday: "long",
    }).format(toDate(dateKey)),

  // "OCTOBER 2026" / "ตุลาคม 2569"; monthKey is "YYYY-MM"
  formatMonth: (monthKey) => {
    const label = new Intl.DateTimeFormat(localeFor(language), {
      month: "long",
      year: "numeric",
    }).format(toDate(`${monthKey}-01`));

    return language === "en" ? label.toUpperCase() : label;
  },

  // Sunday-first short weekday names for calendar headers.
  weekdaysShort:
    language === "th"
      ? ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]
      : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],

  // Sunday-first full weekday names ("Every Monday").
  weekdaysLong:
    language === "th"
      ? ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"]
      : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
});

const helpers = {
  th: helpersFor("th"),
  en: helpersFor("en"),
};

// Current language's helpers; re-renders when it changes.
export const useI18n = () => {
  const language = useSyncExternalStore(
    subscribe,
    getLanguage,
    getLanguage
  );

  return helpers[language];
};

// For code outside React components.
export const getI18n = () => helpers[currentLanguage];

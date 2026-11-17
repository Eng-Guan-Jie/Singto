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
    legendEveryone: "Everyone free",
    legendSome: "Some free",
    legendNoOne: "No one free",
    legendPending: "No one has picked their days yet",
    legendCountNote: "Numbers: people free / people joining",
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

    // ---------- server errors (src/lib/apiError.js) ----------
    sessionExpired:
      "Your LINE session has expired. Please close this page and open it again from LINE.",
    eventNameTooLong: "Event name must be 100 characters or fewer.",
    descriptionTooLong: "Description must be 500 characters or fewer.",
    invalidDates: "Please choose valid dates.",
    periodTooLong: "The scheduling period can be at most one year.",
    onlyOrganizerEdit: "Only the organizer can edit this event.",
    onlyOrganizerShare: "Only the organizer can send this event to the group.",
    datesOutOfRange: "Please choose dates within the scheduling period.",
    notFromLineChat: "This event was not created from a LINE group.",
    lineQuotaReached:
      "Singto has used up this month's LINE message quota, so the card could not be posted.",
    linePushFailed: "Singto could not post to the LINE group.",

    // ---------- account menu / privacy / deletion ----------
    accountMenu: "Account menu",
    privacyPolicy: "Privacy policy",
    deleteAccount: "Delete account",
    back: "Back",
    close: "Close",
    noticeTitle: "Your privacy",
    noticeBody:
      "Singto uses your LINE name, profile picture and LINE ID, and the days you pick, only to find a date for your group. Everyone in an event can see who joins and who declined. Events are deleted automatically 30 days after they end, and you can delete your data at any time from the profile menu.",
    noticeReadPolicy: "Read the privacy policy",
    noticeAcknowledge: "Got it",
    deleteAccountIntro:
      "You sign in to Singto with LINE, so deleting your account deletes everything Singto keeps about you:",
    deleteAccountItemAnswers:
      "Your answers (join or decline) and available days in every event",
    deleteAccountItemProfile:
      "Your LINE name and profile picture saved with those answers",
    deleteAccountItemEvents:
      "Events you created stay for the other members without your name, and nobody can edit them or confirm their date any more",
    deleteAccountNoteCards:
      "Cards Singto has already posted in LINE groups cannot be removed: LINE does not allow deleting sent messages.",
    deleteAccountNoteAgain:
      "If you open Singto again and answer an event, your new answer will be saved.",
    deleteAccountNoteLogs:
      "Usage records required by law are kept for at least 90 days.",
    deleteAccountButton: "DELETE MY DATA",
    deleteAccountConfirm:
      "Delete all your Singto data? This cannot be undone.",
    deletingAccount: "DELETING...",
    deleteAccountDone: "Your data has been deleted.",
    unlinkLineHint:
      "To also disconnect Singto from your LINE account, remove Singto from the authorized apps in your LINE account settings.",
    deleteAccountFailed: "Failed to delete your data.",
    deleteEvent: "DELETE EVENT",
    deleteEventConfirm:
      "Delete this event with everyone's answers and available days? This cannot be undone.",
    deletingEvent: "DELETING...",
    eventDeleted: "The event has been deleted.",
    deleteEventFailed: "Failed to delete the event.",
    onlyOrganizerDelete: "Only the organizer can delete this event.",

    // ---------- my events ----------
    ongoingEvents: "On-going events",
    archivedEvents: "Archived events",
    noOngoingEvents: "You have no on-going events.",
    noArchivedEvents: "You have no archived events.",
    archivedNote:
      "Events are deleted automatically 30 days after their scheduling period ends.",
    roleOrganizer: "Organizer",
    statusAccepted: "Joining",
    statusDeclined: "Not joining",
    notConfirmedYet: "Date not confirmed yet",
    failedLoadMyEvents: "Failed to load your events.",

    // ---------- event details (who joins) ----------
    tabAccepted: "Accepted ({count})",
    tabDeclined: "Declined ({count})",
    acceptedListNote:
      "These people have accepted the invitation and will be joining the event.",
    declinedListNote:
      "These people have declined the invitation and will not be joining the event.",
    noAcceptedYet: "No one has accepted yet.",
    noDeclinedYet: "No one has declined.",
    answerToSeeList: "Answer the invitation to see who is joining.",
    answerInvitation: "ANSWER THE INVITATION",
    failedLoadResponses: "Failed to load who is joining.",
    answerVisibleNote:
      "Everyone in this event can see whether you join or decline.",
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
    legendEveryone: "ทุกคนว่าง",
    legendSome: "ว่างบางคน",
    legendNoOne: "ไม่มีใครว่าง",
    legendPending: "ยังไม่มีใครเลือกวันว่าง",
    legendCountNote: "ตัวเลข: คนที่ว่าง / คนที่เข้าร่วมทั้งหมด",
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

    // ---------- server errors (src/lib/apiError.js) ----------
    sessionExpired:
      "การเข้าสู่ระบบ LINE หมดอายุแล้ว กรุณาปิดหน้านี้แล้วเปิดใหม่จาก LINE",
    eventNameTooLong: "ชื่อนัดต้องยาวไม่เกิน 100 ตัวอักษร",
    descriptionTooLong: "รายละเอียดต้องยาวไม่เกิน 500 ตัวอักษร",
    invalidDates: "กรุณาเลือกวันที่ให้ถูกต้อง",
    periodTooLong: "ช่วงวันที่นัดได้ต้องไม่เกิน 1 ปี",
    onlyOrganizerEdit: "เฉพาะผู้จัดเท่านั้นที่แก้ไขนัดนี้ได้",
    onlyOrganizerShare: "เฉพาะผู้จัดเท่านั้นที่ส่งนัดนี้เข้ากลุ่มได้",
    datesOutOfRange: "กรุณาเลือกวันที่อยู่ในช่วงวันที่นัดได้",
    notFromLineChat: "นัดนี้ไม่ได้สร้างจากกลุ่ม LINE",
    lineQuotaReached:
      "สิงโตใช้โควต้าข้อความ LINE ของเดือนนี้หมดแล้ว จึงส่งการ์ดเข้ากลุ่มไม่ได้",
    linePushFailed: "สิงโตส่งข้อความเข้ากลุ่ม LINE ไม่สำเร็จ",

    // ---------- account menu / privacy / deletion ----------
    accountMenu: "เมนูบัญชี",
    privacyPolicy: "นโยบายความเป็นส่วนตัว",
    deleteAccount: "ลบบัญชี",
    back: "กลับ",
    close: "ปิด",
    noticeTitle: "ความเป็นส่วนตัวของคุณ",
    noticeBody:
      "สิงโตใช้ชื่อ รูปโปรไฟล์ และ LINE ID ของคุณ รวมถึงวันที่คุณเลือก เพื่อหาวันนัดของกลุ่มเท่านั้น ทุกคนในนัดจะเห็นว่าใครเข้าร่วมหรือไม่เข้าร่วม นัดจะถูกลบอัตโนมัติ 30 วันหลังจบ และคุณลบข้อมูลของคุณได้ทุกเมื่อจากเมนูรูปโปรไฟล์",
    noticeReadPolicy: "อ่านนโยบายฉบับเต็ม",
    noticeAcknowledge: "รับทราบ",
    deleteAccountIntro:
      "คุณเข้าใช้สิงโตด้วยบัญชี LINE การลบบัญชีจึงเป็นการลบข้อมูลทั้งหมดที่สิงโตเก็บไว้เกี่ยวกับคุณ:",
    deleteAccountItemAnswers:
      "คำตอบเข้าร่วม/ไม่เข้าร่วม และวันว่างของคุณในทุกนัด",
    deleteAccountItemProfile:
      "ชื่อและรูปโปรไฟล์ LINE ที่บันทึกไว้กับคำตอบเหล่านั้น",
    deleteAccountItemEvents:
      "นัดที่คุณสร้างจะยังอยู่ให้สมาชิกคนอื่นใช้ แต่ไม่มีชื่อคุณเป็นผู้จัดแล้ว และจะไม่มีใครแก้ไขหรือยืนยันวันนัดนั้นได้อีก",
    deleteAccountNoteCards:
      "การ์ดที่สิงโตส่งเข้ากลุ่ม LINE ไปแล้วลบไม่ได้ เพราะ LINE ไม่อนุญาตให้ลบข้อความที่ส่งไปแล้ว",
    deleteAccountNoteAgain:
      "ถ้าเปิดสิงโตแล้วตอบนัดอีกครั้ง ระบบจะบันทึกคำตอบใหม่ของคุณ",
    deleteAccountNoteLogs:
      "บันทึกการใช้งานที่กฎหมายกำหนดจะเก็บไว้อย่างน้อย 90 วัน",
    deleteAccountButton: "ลบข้อมูลของฉัน",
    deleteAccountConfirm:
      "ลบข้อมูลทั้งหมดของคุณในสิงโต? ย้อนกลับไม่ได้",
    deletingAccount: "กำลังลบ...",
    deleteAccountDone: "ลบข้อมูลของคุณแล้ว",
    unlinkLineHint:
      "ถ้าต้องการเลิกเชื่อมสิงโตกับบัญชี LINE ด้วย ให้ลบสิงโตออกจากรายการแอปที่อนุญาตในการตั้งค่าบัญชี LINE",
    deleteAccountFailed: "ลบข้อมูลไม่สำเร็จ",
    deleteEvent: "ลบนัดนี้",
    deleteEventConfirm:
      "ลบนัดนี้พร้อมคำตอบและวันว่างของทุกคน? ย้อนกลับไม่ได้",
    deletingEvent: "กำลังลบ...",
    eventDeleted: "ลบนัดแล้ว",
    deleteEventFailed: "ลบนัดไม่สำเร็จ",
    onlyOrganizerDelete: "เฉพาะผู้จัดเท่านั้นที่ลบนัดนี้ได้",

    // ---------- my events ----------
    ongoingEvents: "นัดที่ยังไม่จบ",
    archivedEvents: "นัดที่จบแล้ว",
    noOngoingEvents: "ตอนนี้ยังไม่มีนัดที่ยังไม่จบ",
    noArchivedEvents: "ยังไม่มีนัดที่จบแล้ว",
    archivedNote:
      "นัดที่จบแล้วจะถูกลบอัตโนมัติ 30 วันหลังวันสุดท้ายของช่วงวันที่นัดได้",
    roleOrganizer: "ผู้จัด",
    statusAccepted: "เข้าร่วม",
    statusDeclined: "ไม่เข้าร่วม",
    notConfirmedYet: "ยังไม่ได้ยืนยันวัน",
    failedLoadMyEvents: "โหลดรายการนัดไม่สำเร็จ",

    // ---------- event details (who joins) ----------
    tabAccepted: "เข้าร่วม ({count})",
    tabDeclined: "ไม่เข้าร่วม ({count})",
    acceptedListNote: "คนเหล่านี้ตอบรับและยืนยันว่าจะมาร่วมนัด",
    declinedListNote: "คนเหล่านี้ตอบว่าจะไม่มาร่วมนัด",
    noAcceptedYet: "ยังไม่มีใครตอบรับ",
    noDeclinedYet: "ไม่มีใครตอบปฏิเสธ",
    answerToSeeList: "ตอบนัดก่อน ถึงจะเห็นว่าใครมาบ้าง",
    answerInvitation: "ไปตอบนัด",
    failedLoadResponses: "โหลดรายชื่อไม่สำเร็จ",
    answerVisibleNote:
      "ทุกคนในนัดนี้จะเห็นว่าคุณเข้าร่วมหรือไม่เข้าร่วม",
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

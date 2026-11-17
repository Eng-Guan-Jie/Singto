/*
 * Show API errors in the page's language.
 *
 * The API answers with fixed English messages (see
 * api/_validate.js, api/_auth.js and the route files).
 * Known ones are shown translated; anything else falls
 * back to the page's own message for that action.
 */

const SERVER_MESSAGES = {
  "eventName, startDate, and endDate are required": "fillRequired",
  "endDate must be on or after startDate": "endAfterStart",
  "Event name must be 100 characters or fewer.": "eventNameTooLong",
  "Description must be 500 characters or fewer.": "descriptionTooLong",
  "Dates must be valid YYYY-MM-DD dates.": "invalidDates",
  "The scheduling period can be at most one year.": "periodTooLong",
  "Only the organizer can edit this event.": "onlyOrganizerEdit",
  "Only the organizer can share this event.": "onlyOrganizerShare",
  "Only the organizer can confirm the date.": "onlyOrganizerConfirm",
  "Only the organizer can delete this event.": "onlyOrganizerDelete",
  "You must accept the event before submitting availability.":
    "acceptFirst",
  "Dates must be within the event's scheduling period.":
    "datesOutOfRange",
  "Choose at least one date within the scheduling period.":
    "datesOutOfRange",
  "This event was not created from a LINE chat.": "notFromLineChat",
  "The date is already confirmed.": "alreadyConfirmed",
  "Available days are locked because the date is confirmed.":
    "availabilityLocked",
  "Answers are locked because the date is confirmed.": "answersLocked",
  "Only the description can be edited after the date is confirmed.":
    "onlyDescriptionEditable",
};

/*
 * Translate one server message, e.g. the reason a LINE
 * card could not be posted. Returns null when unknown.
 */
export const translateServerMessage = (t, message) => {
  if (!message) return null;

  if (SERVER_MESSAGES[message]) {
    return t(SERVER_MESSAGES[message]);
  }

  // 429: the LINE Official Account used up its monthly
  // message quota.
  if (message.startsWith("LINE push message failed (429)")) {
    return t("lineQuotaReached");
  }

  if (message.startsWith("LINE push message failed")) {
    return t("linePushFailed");
  }

  return null;
};

/*
 * Message for a failed API response.
 * - 401: the LINE login expired → reopen from LINE
 * - 404: the event does not exist
 * - known messages: translated
 * - anything else: t(fallbackKey)
 */
export const apiErrorMessage = (t, response, data, fallbackKey) => {
  if (response.status === 401) return t("sessionExpired");
  if (response.status === 404) return t("eventNotFound");

  const translated = translateServerMessage(t, data?.message);

  if (translated) return translated;

  // Keep the server's wording in the console for debugging.
  if (data?.message) {
    console.warn("API error:", response.status, data.message);
  }

  return t(fallbackKey);
};

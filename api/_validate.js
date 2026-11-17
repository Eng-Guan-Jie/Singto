/*
 * Checks for the event fields sent when creating or
 * editing an event (security checklist §5).
 *
 * The messages are fixed English strings; the pages show
 * them translated (src/lib/apiError.js), so keep the two
 * in step when changing one.
 */

const MAX_EVENT_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

// Longest scheduling period: one year.
const MAX_PERIOD_DAYS = 365;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-02-30" matches the pattern but is not a real day.
function isRealDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

/*
 * Returns { error } with a message for a 400 response, or
 * { value } with the trimmed fields ready to save.
 */
function validateEventInput(body = {}) {
  const { eventName, description, startDate, endDate } = body;

  const name =
    typeof eventName === "string" ? eventName.trim() : "";

  if (!name || !startDate || !endDate) {
    return {
      error: "eventName, startDate, and endDate are required",
    };
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return { error: "Description must be text." };
  }

  const details = (description || "").trim();

  if (name.length > MAX_EVENT_NAME_LENGTH) {
    return {
      error: `Event name must be ${MAX_EVENT_NAME_LENGTH} characters or fewer.`,
    };
  }

  if (details.length > MAX_DESCRIPTION_LENGTH) {
    return {
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  if (!isRealDate(startDate) || !isRealDate(endDate)) {
    return { error: "Dates must be valid YYYY-MM-DD dates." };
  }

  if (endDate < startDate) {
    return { error: "endDate must be on or after startDate" };
  }

  const periodDays =
    (new Date(`${endDate}T00:00:00Z`) -
      new Date(`${startDate}T00:00:00Z`)) /
    DAY_MS;

  if (periodDays > MAX_PERIOD_DAYS) {
    return {
      error: "The scheduling period can be at most one year.",
    };
  }

  return {
    value: {
      eventName: name,
      description: details || null,
      startDate,
      endDate,
    },
  };
}

module.exports = {
  MAX_EVENT_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_PERIOD_DAYS,
  validateEventInput,
};

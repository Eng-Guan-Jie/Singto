import { getAvailabilityStatus, isHoliday } from "./calendar.js";

/*
 * Best Date calculation for the Participant page.
 *
 * Same rules as the organizer's Overview (which still has
 * its own copy in src/pages/Overview/Overview.jsx; keep
 * the two in step, or move Overview onto this file):
 * a set of days counts someone as free only if they are
 * free on every one of those days.
 */

export const BEST_DATE_FILTERS = [
  { value: "single", labelKey: "filterSingle", days: 1 },
  { value: "two-days", labelKey: "filterTwoDays", days: 2 },
  { value: "three-days", labelKey: "filterThreeDays", days: 3 },
  {
    value: "holiday",
    labelKey: "filterHoliday",
    days: 1,
    holidaysOnly: true,
  },
];

/*
 * Who is free on every one of `dates`.
 * availabilityByKey: { "2026-10-12": ["17", "21"], ... }
 * people: [{ key, display_name, picture_url }, ...]
 */
export const summarizeDates = (dates, availabilityByKey, people) => {
  const freeKeys = dates
    .map((date) => availabilityByKey[date] || [])
    .reduce((common, keys) =>
      common.filter((key) => keys.includes(key))
    );

  const availablePeople = people.filter((person) =>
    freeKeys.includes(person.key)
  );

  const unavailablePeople = people.filter(
    (person) => !freeKeys.includes(person.key)
  );

  return {
    dates,
    available: availablePeople.length,
    total: people.length,
    status: getAvailabilityStatus(
      availablePeople.length,
      people.length
    ),
    availablePeople,
    unavailablePeople,
  };
};

/*
 * The date sets for `filter` where the most people are
 * free. Empty when nobody is free on any of them.
 * rangeDates: every day of the scheduling period, sorted.
 */
export const findBestOptions = (
  rangeDates,
  filter,
  availabilityByKey,
  people
) => {
  const candidates = filter.holidaysOnly
    ? rangeDates.filter(isHoliday).map((date) => [date])
    : rangeDates
        .slice(0, Math.max(0, rangeDates.length - filter.days + 1))
        .map((_, index) =>
          rangeDates.slice(index, index + filter.days)
        );

  const summaries = candidates.map((dates) =>
    summarizeDates(dates, availabilityByKey, people)
  );

  const maxAvailable = Math.max(
    0,
    ...summaries.map((summary) => summary.available)
  );

  if (maxAvailable === 0) return [];

  return summaries.filter(
    (summary) => summary.available === maxAvailable
  );
};

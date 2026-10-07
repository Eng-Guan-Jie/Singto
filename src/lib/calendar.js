// Build YYYY-MM-DD from local date parts.
// toISOString() converts to UTC, which shifts dates back
// one day in UTC+7 (Thailand).
export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Weeks (Sunday → Saturday) covering every month of the
// scheduling period, like a wall calendar. Each day has:
// - muted: outside the scheduling period
// - otherMonth: belongs to the previous/next month
export const generateCalendarWeeks = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const monthStart = new Date(
    start.getFullYear(),
    start.getMonth(),
    1
  );

  const monthEnd = new Date(
    end.getFullYear(),
    end.getMonth() + 1,
    0
  );

  const calendarStart = new Date(monthStart);

  calendarStart.setDate(
    calendarStart.getDate() - calendarStart.getDay()
  );

  const calendarEnd = new Date(monthEnd);

  calendarEnd.setDate(
    calendarEnd.getDate() + (6 - calendarEnd.getDay())
  );

  const weeks = [];
  const current = new Date(calendarStart);

  while (current <= calendarEnd) {
    const week = [];

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(current);

      week.push({
        day: date.getDate(),
        date: toDateKey(date),
        muted: date < start || date > end,
        otherMonth: date < monthStart || date > monthEnd,
      });

      current.setDate(current.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
};

// Calendar colour for a date from how many accepted
// members are free: everyone → free, some → partial,
// nobody → busy.
export const getAvailabilityStatus = (count, total) => {
  if (!total) return "";
  if (count >= total) return "free";
  if (count > 0) return "partial";

  return "busy";
};

// Thai public holidays that fall on the same date every
// year (MM-DD). Lunar holidays (Makha Bucha, Visakha
// Bucha, Asahna Bucha, Khao Phansa) and substitution days
// change yearly and are not included.
const FIXED_THAI_HOLIDAYS = new Set([
  "01-01", // New Year's Day
  "04-06", // Chakri Memorial Day
  "04-13", // Songkran
  "04-14", // Songkran
  "04-15", // Songkran
  "05-01", // Labour Day
  "05-04", // Coronation Day
  "06-03", // Queen Suthida's Birthday
  "07-28", // King Vajiralongkorn's Birthday
  "08-12", // Mother's Day
  "10-13", // King Bhumibol Memorial Day
  "10-23", // Chulalongkorn Day
  "12-05", // Father's Day
  "12-10", // Constitution Day
  "12-31", // New Year's Eve
]);

// Saturday, Sunday, or a fixed-date Thai public holiday.
export const isHoliday = (dateKey) => {
  const day = new Date(`${dateKey}T00:00:00`).getDay();

  return (
    day === 0 ||
    day === 6 ||
    FIXED_THAI_HOLIDAYS.has(dateKey.slice(5))
  );
};

// One entry per month of the scheduling period, for showing
// a single month at a time. Days of the previous/next month
// that pad the grid are muted, so each day appears (and can
// be tapped) in its own month only.
export const getCalendarMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const months = [];
  let monthStart = new Date(start.getFullYear(), start.getMonth(), 1);

  while (monthStart <= end) {
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );

    const weeks = generateCalendarWeeks(
      toDateKey(monthStart),
      toDateKey(monthEnd)
    ).map((week) =>
      week.map((day) => {
        const date = new Date(`${day.date}T00:00:00`);

        return {
          ...day,
          muted: day.otherMonth || date < start || date > end,
        };
      })
    );

    months.push({
      key: toDateKey(monthStart).slice(0, 7),
      label: new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
      })
        .format(monthStart)
        .toUpperCase(),
      weeks,
    });

    monthStart = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      1
    );
  }

  return months;
};

// Index of the month containing a YYYY-MM-DD date (0 if none).
export const findMonthIndex = (months, dateKey) => {
  const index = months.findIndex(
    (month) => month.key === dateKey?.slice(0, 7)
  );

  return index === -1 ? 0 : index;
};

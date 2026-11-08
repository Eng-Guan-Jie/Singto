import React from "react";
import { useI18n } from "../lib/i18n";
import "./MonthNav.css";

// ‹ OCTOBER 2026 › above a calendar (Figma S4.1). Always
// shown so the month name is visible; a one-month period
// shows only the name, with no arrows to tap.
function MonthNav({ months, monthIndex, onChange }) {
  const { t, formatMonth } = useI18n();

  if (months.length === 0) return null;

  if (months.length === 1) {
    return (
      <div className="month-nav">
        <span className="month-nav-label">
          {formatMonth(months[0].key)}
        </span>
      </div>
    );
  }

  return (
    <div className="month-nav">
      <button
        type="button"
        className="month-nav-button"
        onClick={() => onChange(monthIndex - 1)}
        disabled={monthIndex === 0}
        aria-label={t("prevMonth")}
      >
        ‹
      </button>

      <span className="month-nav-label">
        {months[monthIndex] &&
          formatMonth(months[monthIndex].key)}
      </span>

      <button
        type="button"
        className="month-nav-button"
        onClick={() => onChange(monthIndex + 1)}
        disabled={monthIndex === months.length - 1}
        aria-label={t("nextMonth")}
      >
        ›
      </button>
    </div>
  );
}

export default MonthNav;

import React from "react";
import "./MonthNav.css";

// ‹ OCTOBER 2026 › above a calendar (Figma S4.1). Always
// shown so the month name is visible; a one-month period
// shows only the name, with no arrows to tap.
function MonthNav({ months, monthIndex, onChange }) {
  if (months.length === 0) return null;

  if (months.length === 1) {
    return (
      <div className="month-nav">
        <span className="month-nav-label">
          {months[0].label}
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
        aria-label="Previous month"
      >
        ‹
      </button>

      <span className="month-nav-label">
        {months[monthIndex]?.label}
      </span>

      <button
        type="button"
        className="month-nav-button"
        onClick={() => onChange(monthIndex + 1)}
        disabled={monthIndex === months.length - 1}
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}

export default MonthNav;

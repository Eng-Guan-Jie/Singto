import React from "react";
import "./MonthNav.css";

// ‹ OCTOBER 2026 › above a calendar. Rendered only when the
// scheduling period spans more than one month.
function MonthNav({ months, monthIndex, onChange }) {
  if (months.length < 2) return null;

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

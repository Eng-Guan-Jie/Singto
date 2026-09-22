import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ConfirmDate.css";

function ConfirmDate() {
  const location = useLocation();
  const navigate = useNavigate();

  const eventData = location.state?.eventData || {
    eventName: "Event",
    description: "",
    startDate: "2026-09-07",
    endDate: "2026-09-20",
  };

  const initialDate = location.state?.selectedDate || "2026-09-20";

  const [selectionMode, setSelectionMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([initialDate]);
  const [note, setNote] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  const availability = {
    "2026-09-07": "free",
    "2026-09-08": "partial",
    "2026-09-09": "busy",
    "2026-09-10": "busy",
    "2026-09-11": "busy",
    "2026-09-12": "free",
    "2026-09-13": "free",
    "2026-09-14": "free",
    "2026-09-15": "busy",
    "2026-09-16": "busy",
    "2026-09-17": "busy",
    "2026-09-18": "partial",
    "2026-09-19": "partial",
    "2026-09-20": "free",
  };

  const weeks = [
    [
      { day: 31, date: "2026-08-31", muted: true },
      { day: 1, date: "2026-09-01" },
      { day: 2, date: "2026-09-02" },
      { day: 3, date: "2026-09-03" },
      { day: 4, date: "2026-09-04" },
      { day: 5, date: "2026-09-05" },
      { day: 6, date: "2026-09-06" },
    ],
    [
      { day: 7, date: "2026-09-07" },
      { day: 8, date: "2026-09-08" },
      { day: 9, date: "2026-09-09" },
      { day: 10, date: "2026-09-10" },
      { day: 11, date: "2026-09-11" },
      { day: 12, date: "2026-09-12" },
      { day: 13, date: "2026-09-13" },
    ],
    [
      { day: 14, date: "2026-09-14" },
      { day: 15, date: "2026-09-15" },
      { day: 16, date: "2026-09-16" },
      { day: 17, date: "2026-09-17" },
      { day: 18, date: "2026-09-18" },
      { day: 19, date: "2026-09-19" },
      { day: 20, date: "2026-09-20" },
    ],
    [
      { day: 21, date: "2026-09-21", muted: true },
      { day: 22, date: "2026-09-22", muted: true },
      { day: 23, date: "2026-09-23", muted: true },
      { day: 24, date: "2026-09-24", muted: true },
      { day: 25, date: "2026-09-25", muted: true },
      { day: 26, date: "2026-09-26", muted: true },
      { day: 27, date: "2026-09-27", muted: true },
    ],
    [
      { day: 28, date: "2026-09-28", muted: true },
      { day: 29, date: "2026-09-29", muted: true },
      { day: 30, date: "2026-09-30", muted: true },
      { day: 1, date: "2026-10-01", muted: true },
      { day: 2, date: "2026-10-02", muted: true },
      { day: 3, date: "2026-10-03", muted: true },
      { day: 4, date: "2026-10-04", muted: true },
    ],
  ];

  const handleDateClick = (date) => {
    if (selectionMode === "single") {
      setSelectedDates([date]);
      return;
    }

    setSelectedDates((currentDates) => {
      if (currentDates.includes(date)) {
        return currentDates.filter(
          (selectedDate) => selectedDate !== date
        );
      }

      return [...currentDates, date].sort();
    });
  };

  const handleModeChange = (mode) => {
    setSelectionMode(mode);

    if (mode === "single" && selectedDates.length > 1) {
      setSelectedDates([selectedDates[0]]);
    }
  };

  const handleConfirm = () => {
    if (selectedDates.length === 0) {
      alert("Please select at least one date.");
      return;
    }

    const confirmationData = {
      eventData,
      selectedDates,
      note,
      sendNotification,
    };

    console.log("Confirmed Date:", confirmationData);

    alert(
      `Date ${selectedDates.join(", ")} confirmed!`
    );

    navigate("/overview", {
      state: {
        eventData,
        confirmedDates: selectedDates,
      },
    });
  };

  return (
    <div className="confirm-page">
      <header className="confirm-header">
        <h1>Singto</h1>
      </header>

      <main className="confirm-container">
        <section className="confirm-selection">
          <h2>CONFIRM DATE</h2>

          <div className="selection-options">
            <button
              type="button"
              className={`selection-option ${
                selectionMode === "single" ? "active" : ""
              }`}
              onClick={() => handleModeChange("single")}
            >
              <span className="radio-circle"></span>
              <span>Single Date</span>
            </button>

            <button
              type="button"
              className={`selection-option ${
                selectionMode === "multiple" ? "active" : ""
              }`}
              onClick={() => handleModeChange("multiple")}
            >
              <span className="radio-circle"></span>
              <span>Multiple Dates</span>
            </button>
          </div>
        </section>

        <section className="confirm-calendar-section">
          <h2>CALENDAR</h2>
          <p>Choose a date that works for everyone.</p>

          <div className="confirm-calendar">
            <div className="confirm-weekdays">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                (day) => (
                  <span key={day}>{day}</span>
                )
              )}
            </div>

            <div className="confirm-calendar-body">
              {weeks.map((week, weekIndex) => (
                <div className="confirm-calendar-week" key={weekIndex}>
                  {week.map((date) => {
                    const status = availability[date.date];
                    const isSelected = selectedDates.includes(date.date);

                    return (
                      <button
                        type="button"
                        key={date.date}
                        className={[
                          "confirm-date",
                          date.muted ? "muted" : "",
                          status || "",
                          isSelected ? "selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          if (!date.muted) {
                            handleDateClick(date.date);
                          }
                        }}
                        disabled={date.muted}
                      >
                        {date.day}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="confirm-note-section">
          <h2>NOTE</h2>

          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Meet in front of the restaurant."
          />
        </section>

        <section className="notification-section">
          <span>Send a notification to the group</span>

          <button
            type="button"
            className={`toggle-switch ${
              sendNotification ? "on" : ""
            }`}
            onClick={() =>
              setSendNotification((current) => !current)
            }
            aria-label="Toggle group notification"
          >
            <span className="toggle-knob"></span>
          </button>
        </section>

        <button
          type="button"
          className="confirm-date-button"
          onClick={handleConfirm}
        >
          CONFIRM DATE
        </button>
      </main>
    </div>
  );
}

export default ConfirmDate;
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  Pencil,
} from "lucide-react";
import "./Overview.css";

const defaultEventData = {
  eventName: "DINNER CAFE",
  description: "Dinner at Greyhound Café, CentralWorld 7:00 PM",
  startDate: "2026-09-07",
  endDate: "2026-09-20",
  responded: 5,
  total: 6,
};

const participants = [
  { id: 1, name: "Participant 1", avatar: "👩🏻" },
  { id: 2, name: "Participant 2", avatar: "👩🏻‍🦱" },
  { id: 3, name: "Participant 3", avatar: "👩🏻‍🦰" },
];

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
    { day: 30, date: "2026-08-30", muted: true },
    { day: 31, date: "2026-08-31", muted: true },
    { day: 1, date: "2026-09-01" },
    { day: 2, date: "2026-09-02" },
    { day: 3, date: "2026-09-03" },
    { day: 4, date: "2026-09-04" },
    { day: 5, date: "2026-09-05" },
  ],
  [
    { day: 6, date: "2026-09-06" },
    { day: 7, date: "2026-09-07" },
    { day: 8, date: "2026-09-08" },
    { day: 9, date: "2026-09-09" },
    { day: 10, date: "2026-09-10" },
    { day: 11, date: "2026-09-11" },
    { day: 12, date: "2026-09-12" },
  ],
  [
    { day: 13, date: "2026-09-13" },
    { day: 14, date: "2026-09-14" },
    { day: 15, date: "2026-09-15" },
    { day: 16, date: "2026-09-16" },
    { day: 17, date: "2026-09-17" },
    { day: 18, date: "2026-09-18" },
    { day: 19, date: "2026-09-19" },
  ],
  [
    { day: 20, date: "2026-09-20" },
    { day: 21, date: "2026-09-21" },
    { day: 22, date: "2026-09-22" },
    { day: 23, date: "2026-09-23" },
    { day: 24, date: "2026-09-24" },
    { day: 25, date: "2026-09-25" },
    { day: 26, date: "2026-09-26" },
  ],
  [
    { day: 27, date: "2026-09-27" },
    { day: 28, date: "2026-09-28" },
    { day: 29, date: "2026-09-29" },
    { day: 30, date: "2026-09-30" },
    { day: 1, date: "2026-10-01", muted: true },
    { day: 2, date: "2026-10-02", muted: true },
    { day: 3, date: "2026-10-03", muted: true },
  ],
];

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
};

function Overview() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState("2026-09-20");
  const [selectedAvailabilityDates, setSelectedAvailabilityDates] = useState([
    "2026-09-08",
    "2026-09-12",
    "2026-09-14",
  ]);
  const eventData = {
    ...defaultEventData,
    ...location.state?.eventData,
  };
  const dateRange = `${formatDate(eventData.startDate)} - ${formatDate(
    eventData.endDate
  )}`;

  const handleNotify = () => {
    alert("Notification sent again!");
  };

  const handleEdit = () => {
    alert("Edit event");
  };

  const handleFinalize = () => {
    alert(`Date ${selectedDate} selected!`);
  };

  const toggleAvailabilityDate = (date) => {
  setSelectedAvailabilityDates((currentDates) => {
    if (currentDates.includes(date)) {
      return currentDates.filter(
        (selectedDate) => selectedDate !== date
      );
    }

    return [...currentDates, date].sort();
  });
};

  const handleQuickSelect = () => {
    const availableDays = weeks
      .flat()
      .filter((date) => !date.muted)
      .map((date) => date.day);

    setSelectedAvailabilityDates(availableDays);
  };

  const handleSaveAvailability = () => {
    alert(
      `Saved availability for ${selectedAvailabilityDates.join(", ")}`
    );
  };

  return (
    <div className="overview-page">

      {/* ================= HEADER ================= */}
      <header className="overview-header">
        <h1>Singto</h1>
      </header>

      {/* ================= EVENT CARD ================= */}
      <section className="event-card">

        <div className="event-info">
          <h2>{eventData.eventName}</h2>

          <p className="event-description">
            {eventData.description}
          </p>

          <p className="event-date-range">
            {dateRange}
          </p>

          <p className="response-count">
            {eventData.responded} of {eventData.total} Responded
          </p>

          <div className="participants">
            {participants.map((participant) => (
              <div
                className="participant-avatar"
                key={participant.id}
                title={participant.name}
              >
                {participant.avatar}
              </div>
            ))}

            <div className="more-participants">
              +2
            </div>
          </div>
        </div>

        <div className="event-actions">

          <button
            className="notify-button"
            onClick={handleNotify}
          >
            <Bell size={30} strokeWidth={1.5} />
            <span>Notify Again</span>
          </button>

          <button
            className="edit-button"
            onClick={handleEdit}
            aria-label="Edit event"
          >
            <Pencil size={32} strokeWidth={1.5} />
          </button>

        </div>

      </section>

      {/* ================= TABS ================= */}
      <div className="tabs">

        <button
          className={`tab ${
            activeTab === "overview" ? "active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          OVERVIEW
        </button>

        <button
          className={`tab ${
            activeTab === "availability" ? "active" : ""
          }`}
          onClick={() => setActiveTab("availability")}
        >
          MY AVAILABILITY
        </button>

      </div>

      {/* ================= OVERVIEW ================= */}
      {activeTab === "overview" && (
        <main className="overview-content">

          <section className="calendar-section">

            <h2>CALENDAR</h2>

            <p className="calendar-subtitle">
              Overview of Everyone’s Availability
            </p>

            {/* Calendar */}
            <div className="calendar">

              {/* Weekday Header */}
              <div className="weekday-row">
                {[
                  "SUN",
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                ].map((day) => (
                  <div
                    className="weekday"
                    key={day}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Dates */}
              <div className="calendar-body">

                {weeks.map((week, weekIndex) => (
                  <div
                    className="calendar-week"
                    key={weekIndex}
                  >
                    {week.map((date, index) => {

                      const status =
                        availability[date.date];

                      const isSelected = date.date === selectedDate;

                      return (
                        <button
                          key={`${weekIndex}-${index}`}
                          className={`
                            calendar-date
                            ${date.muted ? "muted" : ""}
                            ${status || ""}
                            ${isSelected ? "selected" : ""}
                          `}
                          onClick={() => {
                              setSelectedDate(date.date);
                          }}
                        >
                          <span>{date.day}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}

              </div>
            </div>

            {/* Legend */}
            <div className="legend">

              <span className="legend-label">
                Busy
              </span>

              <span className="legend-item">
                <span className="legend-dot busy-dot"></span>
                🔴
              </span>

              <span className="legend-item">
                <span className="legend-dot partial-dot"></span>
                🟡
              </span>

              <span className="legend-item">
                <span className="legend-dot free-dot"></span>
                🟢
              </span>

              <span className="legend-label">
                Free
              </span>

            </div>

          </section>

          {/* ================= FINALIZE ================= */}
          <button
            className="finalize-button"
            onClick={handleFinalize}
          >
            FINALIZE DATE
          </button>

        </main>
      )}

      {/* ================= MY AVAILABILITY ================= */}
      {activeTab === "availability" && (
        <main className="availability-content">

          <section className="availability-calendar-section">

            <div className="availability-heading">
              <div>
                <h2>CALENDAR</h2>

                <p>
                  Tap your available days
                </p>
              </div>

              <button
                className="quick-select-button"
                onClick={handleQuickSelect}
              >
                Quick Select
              </button>
            </div>

            <div className="availability-calendar">

              <div className="availability-weekday-row">
                {[
                  "SUN",
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                ].map((day) => (
                  <div
                    className="availability-weekday"
                    key={day}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="availability-calendar-body">
                {weeks.map((week, weekIndex) => (
                  <div
                    className="availability-calendar-week"
                    key={weekIndex}
                  >
                    {week.map((date, index) => {
                      const isSelected =
                        selectedAvailabilityDates.includes(date.date);
                      return (
                        <button
                          key={`${weekIndex}-${index}`}
                          className={`
                            availability-date
                            ${date.muted ? "muted" : ""}
                            ${isSelected ? "selected" : ""}
                          `}
                          onClick={() => {                  
                              toggleAvailabilityDate(date.date);                       
                          }}
                          aria-label={`${
                            isSelected ? "Remove" : "Add"
                          } availability for day ${date.day}`}
                          aria-pressed={isSelected}
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

          <button
            className="save-availability-button"
            onClick={handleSaveAvailability}
          >
            SAVE
          </button>

        </main>
      )}

    </div>
  );
}

export default Overview;

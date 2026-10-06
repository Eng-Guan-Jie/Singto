import React, { useEffect, useMemo, useState } from "react";
import { Bell, Pencil } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import "./Overview.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
};

const getDateLabel = (dateValue) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${dateValue}T00:00:00`))
    .replace(",", "")
    .toUpperCase();

const getDayLabel = (dateValue) =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
  }).format(new Date(`${dateValue}T00:00:00`));

const generateCalendarWeeks = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const calendarStart = new Date(start);

  calendarStart.setDate(
    calendarStart.getDate() - calendarStart.getDay()
  );

  const calendarEnd = new Date(end);

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
        date: date.toISOString().slice(0, 10),
        muted: date < start || date > end,
      });

      current.setDate(current.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
};

function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAvailabilityDates, setSelectedAvailabilityDates] =
    useState([]);
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const [event, setEvent] = useState(
    location.state?.eventData || null
  );

  const [participants, setParticipants] = useState([]);
  const [availability, setAvailability] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  /*
   * ================= FETCH EVENT DATA =================
   */

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!eventId) {
        setError("Event ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [
          eventResponse,
          participantsResponse,
          availabilityResponse,
        ] = await Promise.all([
          fetch(`${API_BASE}/api/events/${eventId}`),
          fetch(`${API_BASE}/api/events/${eventId}/participants`),
          fetch(`${API_BASE}/api/events/${eventId}/availability`),
        ]);

        const eventData = await eventResponse.json();
        const participantsData = await participantsResponse.json();
        const availabilityData = await availabilityResponse.json();

        if (!eventResponse.ok) {
          throw new Error(
            eventData.message || "Failed to load event."
          );
        }

        if (!participantsResponse.ok) {
          throw new Error(
            participantsData.message ||
              "Failed to load participants."
          );
        }

        if (!availabilityResponse.ok) {
          throw new Error(
            availabilityData.message ||
              "Failed to load availability."
          );
        }

        setEvent(eventData.event);

        setParticipants(
          participantsData.participants || []
        );

        setAvailability(
          availabilityData.availability || {}
        );
      } catch (error) {
        console.error(
          "Failed to load overview:",
          error
        );

        setError(
          error.message ||
            "Failed to load overview."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, [eventId]);

  /*
   * ================= EVENT DATA =================
   */

  const eventData = useMemo(() => {
    if (!event) return null;

    return {
      eventName: event.event_name,
      description: event.description,
      startDate: event.start_date
        ? event.start_date.slice(0, 10)
        : "",
      endDate: event.end_date
        ? event.end_date.slice(0, 10)
        : "",
      id: event.id,
      status: event.status,
    };
  }, [event]);

  /*
   * ================= CALENDAR =================
   */

  const weeks = useMemo(() => {
    if (!eventData) return [];

    return generateCalendarWeeks(
      eventData.startDate,
      eventData.endDate
    );
  }, [eventData]);

  /*
   * ================= PARTICIPANTS =================
   */

  // Only accepted participants are used
  // for availability calculations.
  const acceptedParticipants = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.status === "accepted"
      ),
    [participants]
  );

  const respondedCount = participants.filter(
    (participant) =>
      participant.status === "accepted" ||
      participant.status === "declined"
  ).length;

  const totalParticipants = participants.length;

  /*
   * ================= AVAILABILITY =================
   */

  const getDateAvailabilitySummary = (dateValue) => {
    const availableIds = availability[dateValue] || [];

    const availableParticipants =
      acceptedParticipants.filter((participant) =>
        availableIds.includes(
          participant.line_user_id
        )
      );

    const unavailableParticipants =
      acceptedParticipants.filter(
        (participant) =>
          !availableIds.includes(
            participant.line_user_id
          )
      );

    const availableCount =
      availableParticipants.length;

    const total =
      acceptedParticipants.length;

    let status = "busy";

    if (total > 0) {
      if (availableCount === total) {
        status = "free";
      } else if (availableCount > 0) {
        status = "partial";
      }
    }

    return {
      date: dateValue,
      label: getDateLabel(dateValue),
      day: getDayLabel(dateValue),
      available: availableCount,
      total,
      status,
      availableParticipants,
      unavailableParticipants,
    };
  };

  const dateSummaries = useMemo(() => {
    if (!eventData) return [];

    return weeks
      .flat()
      .filter(
        (date) =>
          !date.muted &&
          date.date >= eventData.startDate &&
          date.date <= eventData.endDate
      )
      .map((date) =>
        getDateAvailabilitySummary(date.date)
      );
  }, [
    weeks,
    eventData,
    availability,
    acceptedParticipants,
  ]);

  /*
   * ================= BEST DATE =================
   */

  const maxAvailableCount = useMemo(() => {
    if (dateSummaries.length === 0) return 0;

    return Math.max(
      ...dateSummaries.map(
        (item) => item.available
      )
    );
  }, [dateSummaries]);

  const bestDates = useMemo(() => {
    if (
      dateSummaries.length === 0 ||
      maxAvailableCount === 0
    ) {
      return [];
    }

    return dateSummaries.filter(
      (item) =>
        item.available === maxAvailableCount
    );
  }, [
    dateSummaries,
    maxAvailableCount,
  ]);

  const selectedDateSummary = selectedDate
    ? getDateAvailabilitySummary(
        selectedDate
      )
    : null;

  const finalizeDate =
    selectedDate ||
    bestDates[0]?.date ||
    eventData?.endDate;

  /*
   * ================= QUICK SELECT =================
   */

  const quickSelectOptions = [
    { label: "All Day", type: "all" },
    { label: "Weekends", type: "weekends" },
    { label: "Every Monday", type: 1 },
    { label: "Every Tuesday", type: 2 },
    { label: "Every Wednesday", type: 3 },
    { label: "Every Thursday", type: 4 },
    { label: "Every Friday", type: 5 },
    { label: "Every Saturday", type: 6 },
    { label: "Every Sunday", type: 0 },
  ];

  const toggleAvailabilityDate = (date) => {
    setSelectedAvailabilityDates(
      (currentDates) => {
        if (currentDates.includes(date)) {
          return currentDates.filter(
            (selectedDate) =>
              selectedDate !== date
          );
        }

        return [...currentDates, date].sort();
      }
    );
  };

  const handleQuickSelect = (type) => {
    if (!eventData) return;

    const start = new Date(
      `${eventData.startDate}T00:00:00`
    );

    const end = new Date(
      `${eventData.endDate}T00:00:00`
    );

    const selectedDates = weeks
      .flat()
      .filter((date) => {
        if (date.muted) return false;

        const current = new Date(
          `${date.date}T00:00:00`
        );

        if (
          current < start ||
          current > end
        ) {
          return false;
        }

        if (type === "all") {
          return true;
        }

        if (type === "weekends") {
          return (
            current.getDay() === 0 ||
            current.getDay() === 6
          );
        }

        return current.getDay() === type;
      })
      .map((date) => date.date);

    setSelectedAvailabilityDates(
      selectedDates
    );

    setShowQuickSelect(false);
  };

  /*
   * ================= ACTIONS =================
   */

  const handleNotify = () => {
    alert("Notification sent again!");
  };

  const handleEdit = () => {
    navigate("/create-event", {
      state: {
        eventData,
        editMode: true,
      },
    });
  };

  const handleFinalize = () => {
    if (!finalizeDate) {
      alert("Please select a date first.");
      return;
    }

    navigate("/confirm-date", {
      state: {
        eventData,
        selectedDate: finalizeDate,
      },
    });
  };

  /*
   * ================= SAVE AVAILABILITY =================
   *
   * Organizer availability is still local-only
   * because this page does not have LINE identity
   * connected yet.
   */

  const handleSaveAvailability = async () => {
    setIsSavingAvailability(true);

    try {
      console.log(
        "Organizer availability:",
        selectedAvailabilityDates
      );

      alert(
        `Selected ${selectedAvailabilityDates.length} available day(s).`
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  /*
   * ================= LOADING / ERROR =================
   */

  if (isLoading) {
    return (
      <div className="overview-page">
        <div className="overview-header">
          <h1>Singto</h1>
        </div>

        <main className="overview-container">
          <p>Loading event...</p>
        </main>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="overview-page">
        <div className="overview-header">
          <h1>Singto</h1>
        </div>

        <main className="overview-container">
          <p>
            {error || "Event not found."}
          </p>
        </main>
      </div>
    );
  }

  const dateRange = `${formatDate(
    eventData.startDate
  )} - ${formatDate(eventData.endDate)}`;

  return (
    <div className="overview-page">
      {/* ================= HEADER ================= */}

      <div className="overview-header">
        <h1>Singto</h1>
      </div>

      <main className="overview-container">
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
              {respondedCount} of{" "}
              {totalParticipants} Responded
            </p>

            <div className="participants">
              {participants
                .slice(0, 3)
                .map((participant) => (
                  <div
                    className="participant-avatar"
                    key={participant.id}
                    title={
                      participant.display_name ||
                      participant.line_user_id
                    }
                  >
                    {participant.display_name
                      ? participant.display_name
                          .charAt(0)
                          .toUpperCase()
                      : "?"}
                  </div>
                ))}

              {participants.length > 3 && (
                <div className="more-participants">
                  +{participants.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="event-actions">
            <button
              className="notify-button"
              onClick={handleNotify}
            >
              <Bell
                size={30}
                strokeWidth={1.5}
              />

              <span>Notify Again</span>
            </button>

            <button
              className="edit-button"
              onClick={handleEdit}
              aria-label="Edit event"
            >
              <Pencil
                size={32}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </section>

        {/* ================= TABS ================= */}

        <div className="tabs">
          <button
            className={`tab ${
              activeTab === "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("overview")
            }
          >
            OVERVIEW
          </button>

          <button
            className={`tab ${
              activeTab === "availability"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("availability")
            }
          >
            MY AVAILABILITY
          </button>
        </div>

        {/* ================= OVERVIEW ================= */}

        {activeTab === "overview" && (
          <section className="overview-content">
            <section className="calendar-section">
              <h2>CALENDAR</h2>

              <p className="calendar-subtitle">
                Overview of Everyone’s Availability
              </p>

              <div className="calendar">
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

                <div className="calendar-body">
                  {weeks.map(
                    (week, weekIndex) => (
                      <div
                        className="calendar-week"
                        key={weekIndex}
                      >
                        {week.map(
                          (date, index) => {
                            const status =
                              date.muted
                                ? ""
                                : getDateAvailabilitySummary(
                                    date.date
                                  ).status;

                            const isSelected =
                              date.date ===
                              selectedDate;

                            return (
                              <button
                                key={`${weekIndex}-${index}`}
                                className={`
                                  calendar-date
                                  ${
                                    date.muted
                                      ? "muted"
                                      : ""
                                  }
                                  ${status}
                                  ${
                                    isSelected
                                      ? "selected"
                                      : ""
                                  }
                                `}
                                onClick={() => {
                                  if (
                                    !date.muted
                                  ) {
                                    setSelectedDate(
                                      date.date
                                    );
                                  }
                                }}
                                disabled={
                                  date.muted
                                }
                              >
                                <span>
                                  {date.day}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* ================= LEGEND ================= */}

            <div className="legend">
              <span className="legend-label">
                Busy
              </span>

              <span className="legend-item">
                <span className="legend-dot busy-dot" />
                🔴
              </span>

              <span className="legend-item">
                <span className="legend-dot partial-dot" />
                🟡
              </span>

              <span className="legend-item">
                <span className="legend-dot free-dot" />
                🟢
              </span>

              <span className="legend-label">
                Free
              </span>
            </div>

            {/* ================= BEST DATE ================= */}

            <section className="best-date-section">
              <div className="best-date-header">
                <div>
                  <h2>BEST DATE</h2>
                  <p>Single Day</p>
                </div>

                <button
                  className="filter-button"
                  onClick={() =>
                    alert("Filter options")
                  }
                >
                  Filter
                </button>
              </div>

              {selectedDateSummary ? (
                <div className="selected-date-detail">
                  <div
                    className={`best-date-card ${selectedDateSummary.status}`}
                  >
                    <div className="best-date-info">
                      <strong>
                        {
                          selectedDateSummary.label
                        }
                      </strong>

                      <span>
                        {
                          selectedDateSummary.day
                        }
                      </span>
                    </div>

                    <strong className="best-date-count">
                      {
                        selectedDateSummary.available
                      }
                      /
                      {
                        selectedDateSummary.total
                      }
                    </strong>
                  </div>

                  <div className="availability-breakdown">
                    {/* AVAILABLE */}

                    <section className="respondent-group">
                      <h3>
                        <span className="status-dot available-dot" />
                        AVAILABLE
                      </h3>

                      <div className="respondent-list">
                        {selectedDateSummary
                          .availableParticipants
                          .length > 0 ? (
                          selectedDateSummary.availableParticipants.map(
                            (participant) => (
                              <div
                                className="respondent-row"
                                key={
                                  participant.id
                                }
                              >
                                <span className="respondent-avatar">
                                  {participant.display_name
                                    ? participant.display_name
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()
                                    : "?"}
                                </span>

                                <span>
                                  {(
                                    participant.display_name ||
                                    "UNKNOWN"
                                  ).toUpperCase()}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p className="empty-respondent-list">
                            No one yet
                          </p>
                        )}
                      </div>
                    </section>

                    {/* UNAVAILABLE */}

                    <section className="respondent-group">
                      <h3>
                        <span className="status-dot unavailable-dot" />
                        UNAVAILABLE
                      </h3>

                      <div className="respondent-list">
                        {selectedDateSummary
                          .unavailableParticipants
                          .length > 0 ? (
                          selectedDateSummary.unavailableParticipants.map(
                            (participant) => (
                              <div
                                className="respondent-row"
                                key={
                                  participant.id
                                }
                              >
                                <span className="respondent-avatar">
                                  {participant.display_name
                                    ? participant.display_name
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()
                                    : "?"}
                                </span>

                                <span>
                                  {(
                                    participant.display_name ||
                                    "UNKNOWN"
                                  ).toUpperCase()}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p className="empty-respondent-list">
                            No one
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="best-date-list">
                  {bestDates.length > 0 ? (
                    bestDates.map((item) => (
                      <button
                        key={item.date}
                        className={`best-date-card ${item.status}`}
                        onClick={() =>
                          setSelectedDate(
                            item.date
                          )
                        }
                      >
                        <div className="best-date-info">
                          <strong>
                            {item.label}
                          </strong>

                          <span>
                            {item.day}
                          </span>
                        </div>

                        <strong className="best-date-count">
                          {item.available}/
                          {item.total}
                        </strong>
                      </button>
                    ))
                  ) : (
                    <p>
                      No available date yet.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* ================= FINALIZE ================= */}

            <button
              className="finalize-button"
              onClick={handleFinalize}
            >
              FINALIZE DATE
            </button>
          </section>
        )}

        {/* ================= MY AVAILABILITY ================= */}

        {activeTab === "availability" && (
          <section className="availability-content">
            <section className="availability-calendar-section">
              <div className="availability-heading">
                <div>
                  <h2>CALENDAR</h2>

                  <p>
                    Tap your available days
                  </p>
                </div>

                <div className="quick-select-wrapper">
                  <button
                    className="quick-select-button"
                    onClick={() =>
                      setShowQuickSelect(
                        (current) =>
                          !current
                      )
                    }
                  >
                    Quick Select
                  </button>

                  {showQuickSelect && (
                    <div className="quick-select-menu">
                      {quickSelectOptions.map(
                        (option) => (
                          <button
                            key={option.label}
                            className="quick-select-option"
                            onClick={() =>
                              handleQuickSelect(
                                option.type
                              )
                            }
                          >
                            {option.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
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
                  {weeks.map(
                    (week, weekIndex) => (
                      <div
                        className="availability-calendar-week"
                        key={weekIndex}
                      >
                        {week.map(
                          (date, index) => {
                            const isSelected =
                              selectedAvailabilityDates.includes(
                                date.date
                              );

                            return (
                              <button
                                key={`${weekIndex}-${index}`}
                                className={`
                                  availability-date
                                  ${
                                    date.muted
                                      ? "muted"
                                      : ""
                                  }
                                  ${
                                    isSelected
                                      ? "selected"
                                      : ""
                                  }
                                `}
                                disabled={
                                  date.muted
                                }
                                onClick={() =>
                                  toggleAvailabilityDate(
                                    date.date
                                  )
                                }
                                aria-label={`${isSelected ? "Remove" : "Add"} availability for day ${date.day}`}
                                aria-pressed={
                                  isSelected
                                }
                              >
                                {date.day}
                              </button>
                            );
                          }
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            <button
              className="save-availability-button"
              onClick={
                handleSaveAvailability
              }
              disabled={isSavingAvailability}
            >
              {isSavingAvailability
                ? "SAVING..."
                : "SAVE"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Overview;
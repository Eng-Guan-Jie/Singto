import React, { useEffect, useMemo, useState } from "react";
import bellRingIcon from "../../assets/icons/bell-ring.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import liff, {
  initLiff,
  getFreshIdToken,
  authHeaders,
} from "../../lib/liff";
import {
  generateCalendarWeeks,
  isHoliday,
} from "../../lib/calendar";
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

// Day-first label to match the design, e.g. "08 SEP 2026".
const getDateLabel = (dateValue) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .formatToParts(new Date(`${dateValue}T00:00:00`))
      .map(({ type, value }) => [type, value])
  );

  return `${parts.day} ${parts.month} ${parts.year}`.toUpperCase();
};

const getDayLabel = (dateValue) =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
  }).format(new Date(`${dateValue}T00:00:00`));

// LINE profile picture, or the first letter of the
// name when there is no picture.
function Avatar({ participant, className }) {
  if (participant.picture_url) {
    return (
      <img
        className={className}
        src={participant.picture_url}
        alt=""
        width="24"
        height="24"
      />
    );
  }

  return (
    <span className={className}>
      {participant.display_name
        ? participant.display_name.charAt(0).toUpperCase()
        : "?"}
    </span>
  );
}

// Best Date filters (Figma "filter" dropdown).
const BEST_DATE_FILTERS = [
  { value: "single", label: "Single Day", days: 1 },
  { value: "two-days", label: "2 Consecutive Days", days: 2 },
  { value: "three-days", label: "3 Consecutive Days", days: 3 },
  {
    value: "holiday",
    label: "Only holiday",
    days: 1,
    holidaysOnly: true,
  },
];

function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [activeTab, setActiveTab] = useState("overview");
  // Day(s) picked on the calendar or from Best Date.
  const [selectedDates, setSelectedDates] = useState([]);

  const [bestDateFilter, setBestDateFilter] =
    useState("single");

  const [showFilterMenu, setShowFilterMenu] =
    useState(false);
  const [selectedAvailabilityDates, setSelectedAvailabilityDates] =
    useState([]);
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const [event, setEvent] = useState(
    location.state?.eventData || null
  );

  const [participants, setParticipants] = useState([]);

  // People in the LINE chat (null if LINE did not say).
  const [memberCount, setMemberCount] = useState(null);

  const [isNotifying, setIsNotifying] = useState(false);
  const [availability, setAvailability] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  const [idToken, setIdToken] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);

  // Bumped after saving to reload the overview data.
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * ================= LIFF =================
   * The API only shows names and availability to the
   * event's organizer, so this page needs LINE login.
   */

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await initLiff();

        const token = getFreshIdToken();

        // Redirecting to LINE Login.
        if (!token) {
          return;
        }

        const profile = await liff.getProfile();

        setLineUserId(profile.userId);
        setIdToken(token);
      } catch (error) {
        console.error(
          "LIFF initialization failed:",
          error
        );

        setError(
          error.message ||
            "Failed to initialize LINE Login."
        );
      }
    };

    initializeLiff();
  }, []);

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

      // Wait for LINE login before loading protected data.
      if (!idToken) {
        return;
      }

      try {
        setError("");

        const [
          eventResponse,
          participantsResponse,
          availabilityResponse,
        ] = await Promise.all([
          fetch(`${API_BASE}/api/events/${eventId}`),
          fetch(`${API_BASE}/api/events/${eventId}/participants`, {
            headers: authHeaders(idToken),
          }),
          fetch(`${API_BASE}/api/events/${eventId}/availability`, {
            headers: authHeaders(idToken),
          }),
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

        if (participantsData.role !== "organizer") {
          throw new Error(
            "Only the organizer of this event can view this page."
          );
        }

        setEvent(eventData.event);

        // Pre-select the organizer's own saved dates.
        setSelectedAvailabilityDates(
          Object.entries(
            availabilityData.availability || {}
          )
            .filter(([, userIds]) =>
              userIds.includes(lineUserId)
            )
            .map(([date]) => date)
            .sort()
        );

        setParticipants(
          participantsData.participants || []
        );

        setMemberCount(
          participantsData.memberCount ?? null
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
  }, [eventId, idToken, lineUserId, refreshKey]);

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
      confirmedDates: event.confirmed_dates || [],
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

  const responders = participants.filter(
    (participant) =>
      participant.status === "accepted" ||
      participant.status === "declined"
  );

  const respondedCount = responders.length;

  // Everyone in the LINE chat when known, otherwise
  // everyone who has opened the invitation.
  const totalParticipants =
    memberCount ?? participants.length;

  /*
   * ================= AVAILABILITY =================
   */

  // Who is free on every one of the given dates.
  const getDatesSummary = (dates) => {
    const availableIds = dates
      .map((date) => availability[date] || [])
      .reduce((common, ids) =>
        common.filter((id) => ids.includes(id))
      );

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

    const first = dates[0];
    const last = dates[dates.length - 1];

    return {
      dates,
      label:
        dates.length > 1
          ? `${getDateLabel(first)} – ${getDateLabel(last)}`
          : getDateLabel(first),
      day:
        dates.length > 1
          ? `${getDayLabel(first)} – ${getDayLabel(last)}`
          : getDayLabel(first),
      available: availableCount,
      total,
      status,
      availableParticipants,
      unavailableParticipants,
    };
  };

  const getDateAvailabilitySummary = (dateValue) =>
    getDatesSummary([dateValue]);

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
      .map((date) => ({
        date: date.date,
        ...getDateAvailabilitySummary(date.date),
      }));
  }, [
    weeks,
    eventData,
    availability,
    acceptedParticipants,
  ]);

  /*
   * ================= BEST DATE =================
   */

  const activeFilter = BEST_DATE_FILTERS.find(
    (filter) => filter.value === bestDateFilter
  );

  // Candidate date sets for the active filter, keeping
  // those where the most people are free on every day.
  const bestOptions = useMemo(() => {
    const rangeDates = dateSummaries.map(
      (summary) => summary.date
    );

    const candidates = activeFilter.holidaysOnly
      ? rangeDates
          .filter(isHoliday)
          .map((date) => [date])
      : rangeDates
          .slice(0, rangeDates.length - activeFilter.days + 1)
          .map((_, index) =>
            rangeDates.slice(index, index + activeFilter.days)
          );

    const summaries = candidates.map(getDatesSummary);

    const maxAvailable = Math.max(
      0,
      ...summaries.map((summary) => summary.available)
    );

    if (maxAvailable === 0) return [];

    return summaries.filter(
      (summary) => summary.available === maxAvailable
    );
  }, [
    dateSummaries,
    activeFilter,
    availability,
    acceptedParticipants,
  ]);

  const selectedDateSummary =
    selectedDates.length > 0
      ? getDatesSummary(selectedDates)
      : null;

  const handleFilterChange = (value) => {
    setBestDateFilter(value);
    setSelectedDates([]);
    setShowFilterMenu(false);
  };

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

  // Post a fresh invitation card to the LINE chat with the
  // current response count (LINE cannot edit sent messages).
  const handleNotify = async () => {
    // Nobody left to remind.
    if (
      memberCount !== null &&
      respondedCount >= memberCount
    ) {
      alert("Everyone has already responded.");
      return;
    }

    setIsNotifying(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/line-push-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId,
            idToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send the reminder."
        );
      }

      alert("Reminder sent to the LINE chat.");
    } catch (error) {
      console.error("Notify again failed:", error);

      alert(
        error.message ||
          "Unable to send the reminder."
      );
    } finally {
      setIsNotifying(false);
    }
  };

  const handleEdit = () => {
    navigate(`/create-event?eventId=${eventId}`, {
      state: {
        eventData,
        editMode: true,
      },
    });
  };

  const handleFinalize = () => {
    // The picked day(s), otherwise the top Best Date.
    const finalizeDates =
      selectedDates.length > 0
        ? selectedDates
        : bestOptions[0]?.dates || [];

    navigate(`/confirm-date?eventId=${eventId}`, {
      state: {
        selectedDates: finalizeDates,
      },
    });
  };

  /*
   * ================= SAVE AVAILABILITY =================
   */

  const handleSaveAvailability = async () => {
    setIsSavingAvailability(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/events/${eventId}/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken,
            dates: selectedAvailabilityDates,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save availability."
        );
      }

      setRefreshKey((key) => key + 1);

      alert("Your availability has been saved.");
    } catch (error) {
      console.error(
        "Save availability failed:",
        error
      );

      alert(
        error.message ||
          "Failed to save availability."
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  /*
   * ================= LOADING / ERROR =================
   */

  // Check error first: if LINE login fails, the data
  // fetch never runs and isLoading would stay true.
  if (error) {
    return (
      <div className="overview-page">
        <div className="overview-header">
          <h1>Singto</h1>
        </div>

        <main className="overview-container">
          <p>{error}</p>
        </main>
      </div>
    );
  }

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

  if (!eventData) {
    return (
      <div className="overview-page">
        <div className="overview-header">
          <h1>Singto</h1>
        </div>

        <main className="overview-container">
          <p>Event not found.</p>
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

            {eventData.confirmedDates.length > 0 && (
              <p className="event-confirmed">
                Confirmed:{" "}
                {eventData.confirmedDates
                  .map(getDateLabel)
                  .join(", ")}
              </p>
            )}

            <p className="response-count">
              {respondedCount} of{" "}
              {totalParticipants} Responded
            </p>

            <div className="participants">
              {responders
                .slice(0, 3)
                .map((participant) => (
                  <Avatar
                    className="participant-avatar"
                    key={participant.id}
                    participant={participant}
                  />
                ))}

              {responders.length > 3 && (
                <div className="more-participants">
                  +{responders.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="event-actions">
            <button
              className="notify-button"
              onClick={handleNotify}
              disabled={isNotifying}
            >
              <img
                src={bellRingIcon}
                alt=""
                width="24"
                height="24"
              />

              <span>Notify Again</span>
            </button>

            <button
              className="edit-button"
              onClick={handleEdit}
              aria-label="Edit event"
            >
              <img
                src={pencilIcon}
                alt=""
                width="24"
                height="24"
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

              <div
                className={`calendar ${
                  selectedDates.length > 0
                    ? "has-selection"
                    : ""
                }`}
              >
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
                              selectedDates.includes(
                                date.date
                              );

                            return (
                              <button
                                key={`${weekIndex}-${index}`}
                                className={`
                                  calendar-date
                                  ${
                                    date.muted
                                      ? `muted ${date.otherMonth ? "other-month" : ""}`
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
                                    setSelectedDates([
                                      date.date,
                                    ]);
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

              <span className="legend-dot busy-dot" />
              <span className="legend-dot partial-dot" />
              <span className="legend-dot free-dot" />

              <span className="legend-label">
                Free
              </span>
            </div>

            {/* ================= BEST DATE ================= */}

            <section className="best-date-section">
              <div className="best-date-header">
                <div>
                  <h2>BEST DATE</h2>
                  <p>{activeFilter.label}</p>
                </div>

                <div className="filter-wrapper">
                  <button
                    className="filter-button"
                    onClick={() =>
                      setShowFilterMenu(
                        (current) => !current
                      )
                    }
                    aria-expanded={showFilterMenu}
                  >
                    Filter
                  </button>

                  {showFilterMenu && (
                    <div className="filter-menu">
                      {BEST_DATE_FILTERS.map(
                        (filter) => (
                          <button
                            key={filter.value}
                            className={`filter-option ${
                              filter.value ===
                              bestDateFilter
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              handleFilterChange(
                                filter.value
                              )
                            }
                          >
                            {filter.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedDateSummary ? (
                <div className="selected-date-detail">
                  <div
                    className={`best-date-card ${selectedDateSummary.status}`}
                  >
                    <div className="best-date-top">
                      <strong>
                        {
                          selectedDateSummary.label
                        }
                      </strong>

                      <strong>
                        {
                          selectedDateSummary.available
                        }
                        /
                        {
                          selectedDateSummary.total
                        }
                      </strong>
                    </div>

                    <span className="best-date-day">
                      {
                        selectedDateSummary.day
                      }
                    </span>
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
                                <Avatar
                                  className="respondent-avatar"
                                  participant={
                                    participant
                                  }
                                />

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
                                <Avatar
                                  className="respondent-avatar"
                                  participant={
                                    participant
                                  }
                                />

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
                  {bestOptions.length > 0 ? (
                    bestOptions.map((item) => (
                      <button
                        key={item.dates.join()}
                        className={`best-date-card ${item.status}`}
                        onClick={() =>
                          setSelectedDates(
                            item.dates
                          )
                        }
                      >
                        <div className="best-date-top">
                          <strong>
                            {item.label}
                          </strong>

                          <strong>
                            {item.available}/
                            {item.total}
                          </strong>
                        </div>

                        <span className="best-date-day">
                          {item.day}
                        </span>
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

            <div className="overview-bottom-bar">
              <button
                className="finalize-button"
                onClick={handleFinalize}
              >
                FINALIZE DATE
              </button>
            </div>
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
                                      ? `muted ${date.otherMonth ? "other-month" : ""}`
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

            <div className="overview-bottom-bar">
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
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Overview;
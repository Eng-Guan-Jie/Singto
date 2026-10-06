import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import liff, {
  initLiff,
  getFreshIdToken,
  authHeaders,
} from "../../lib/liff";
import "./Participant.css";

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

// Build YYYY-MM-DD from local date parts.
// toISOString() converts to UTC, which shifts dates back
// one day in UTC+7 (Thailand).
const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const generateCalendarWeeks = (
  startDate,
  endDate
) => {
  if (!startDate || !endDate) return [];

  const start = new Date(
    `${startDate}T00:00:00`
  );

  const end = new Date(
    `${endDate}T00:00:00`
  );

  const calendarStart = new Date(start);

  calendarStart.setDate(
    calendarStart.getDate() -
      calendarStart.getDay()
  );

  const calendarEnd = new Date(end);

  calendarEnd.setDate(
    calendarEnd.getDate() +
      (6 - calendarEnd.getDay())
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
        muted:
          date < start ||
          date > end,
      });

      current.setDate(
        current.getDate() + 1
      );
    }

    weeks.push(week);
  }

  return weeks;
};

function Participant() {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState(null);
  const [lineUser, setLineUser] =
    useState(null);

  const [idToken, setIdToken] =
    useState(null);

  const [liffLoading, setLiffLoading] =
    useState(true);

  const [event, setEvent] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [participantStatus, setParticipantStatus] =
    useState(null);

  // { display_name, picture_url } of the event creator.
  const [organizer, setOrganizer] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [
    selectedAvailabilityDates,
    setSelectedAvailabilityDates,
  ] = useState([]);

  // How many accepted members are free per date
  // (counts only, no names: AGENTS.md 5.3).
  const [availabilityCounts, setAvailabilityCounts] =
    useState({});

  const [acceptedCount, setAcceptedCount] =
    useState(0);

  // Bumped after accept/decline/save to reload counts.
  const [refreshKey, setRefreshKey] =
    useState(0);

  const [showQuickSelect, setShowQuickSelect] =
    useState(false);

  const [
    isSavingAvailability,
    setIsSavingAvailability,
  ] = useState(false);

  /*
   * ================= LIFF =================
   */

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await initLiff();

        // IMPORTANT:
        // Read eventId only AFTER liff.init() finishes.
        const params =
          new URLSearchParams(
            window.location.search
          );

        // Opening https://liff.line.me/{liffId}?eventId=...
        // first lands on ?liff.state=%3FeventId%3D...
        // before LIFF redirects, so check liff.state too.
        const liffState =
          params.get("liff.state");

        const currentEventId =
          params.get("eventId") ||
          (liffState
            ? new URLSearchParams(
                liffState.replace(/^[^?]*\?/, "")
              ).get("eventId")
            : null);

        console.log(
          "Event ID after LIFF init:",
          currentEventId
        );

        if (!currentEventId) {
          throw new Error(
            "Event ID is missing."
          );
        }

        setEventId(currentEventId);

        const token =
          getFreshIdToken();

        // Redirecting to LINE Login.
        if (!token) {
          return;
        }

        setIdToken(token);

        const profile =
          await liff.getProfile();

        setLineUser({
          userId: profile.userId,
          displayName:
            profile.displayName,
          pictureUrl:
            profile.pictureUrl,
        });
      } catch (error) {
        console.error(
          "LIFF initialization failed:",
          error
        );

        setError(
          error.message ||
            "Failed to initialize LINE Login."
        );
      } finally {
        setLiffLoading(false);
      }
    };;

    initializeLiff();
  }, []);

  /*
   * ================= EVENT =================
   */

  useEffect(() => {
    const fetchEvent = async () => {
      // eventId is only set after LIFF init.
      // A missing eventId is reported by the LIFF effect.
      if (!eventId) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE}/api/events/${eventId}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load event."
          );
        }

        setEvent(data.event);
      } catch (error) {
        console.error(
          "Failed to load event:",
          error
        );

        setError(
          error.message ||
            "Failed to load event."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  /*
   * ================= PARTICIPANTS =================
   */

  useEffect(() => {
    const fetchParticipants =
      async () => {
        if (!eventId || !idToken || !lineUser) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE}/api/events/${eventId}/participants`,
              {
                headers:
                  authHeaders(idToken),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to load participants."
            );
          }

          // The organizer manages the event from Overview.
          if (data.role === "organizer") {
            navigate(
              `/overview?eventId=${eventId}`,
              { replace: true }
            );
            return;
          }

          setOrganizer(data.organizer || null);

          const currentParticipant =
            data.participants?.find(
              (participant) =>
                participant.line_user_id ===
                lineUser.userId
            );

          if (currentParticipant) {
            setParticipantStatus(
              currentParticipant.status
            );
          }
        } catch (error) {
          console.error(
            "Failed to load participants:",
            error
          );
        }
      };

    fetchParticipants();
  }, [eventId, idToken, lineUser, navigate]);

  /*
   * ================= LOAD AVAILABILITY =================
   */

  useEffect(() => {
    const fetchAvailability =
      async () => {
        if (!eventId || !idToken || !lineUser) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE}/api/events/${eventId}/availability`,
              {
                headers:
                  authHeaders(idToken),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to load availability."
            );
          }

          const myDates = [];

          Object.entries(
            data.availability || {}
          ).forEach(
            ([date, userIds]) => {
              if (
                userIds.includes(
                  lineUser.userId
                )
              ) {
                myDates.push(date);
              }
            }
          );

          setSelectedAvailabilityDates(
            myDates
          );

          setAvailabilityCounts(
            data.counts || {}
          );

          setAcceptedCount(
            data.acceptedCount || 0
          );
        } catch (error) {
          console.error(
            "Failed to load availability:",
            error
          );
        }
      };

    fetchAvailability();
  }, [eventId, idToken, lineUser, refreshKey]);

  /*
   * ================= CALENDAR =================
   */

  const eventStartDate =
    event?.start_date
      ? event.start_date.slice(0, 10)
      : "";

  const eventEndDate =
    event?.end_date
      ? event.end_date.slice(0, 10)
      : "";

  const weeks = useMemo(
    () =>
      generateCalendarWeeks(
        eventStartDate,
        eventEndDate
      ),
    [
      eventStartDate,
      eventEndDate,
    ]
  );

  /*
   * ================= ACCEPT / DECLINE =================
   */

  const handleParticipantResponse =
    async (status) => {
      if (!eventId || !idToken) {
        alert(
          "Unable to identify this participant."
        );

        return;
      }

      setIsSubmitting(true);

      try {
        const response =
          await fetch(
            `${API_BASE}/api/events/${eventId}/participants`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                idToken,
                status,
                displayName: lineUser.displayName,
                pictureUrl: lineUser.pictureUrl,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update participation."
          );
        }

        setParticipantStatus(
          data.participant.status
        );

        setRefreshKey((key) => key + 1);

        alert(
          status === "accepted"
            ? "You accepted this event."
            : "You declined this event."
        );
      } catch (error) {
        console.error(
          "Participant response failed:",
          error
        );

        alert(
          error.message ||
            "Something went wrong."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /*
   * ================= AVAILABILITY =================
   */

  const toggleAvailabilityDate = (
    date
  ) => {
    if (participantStatus !== "accepted") {
      return;
    }

    setSelectedAvailabilityDates(
      (currentDates) => {
        if (
          currentDates.includes(date)
        ) {
          return currentDates.filter(
            (item) => item !== date
          );
        }

        return [
          ...currentDates,
          date,
        ].sort();
      }
    );
  };

  const handleQuickSelect = (
    type
  ) => {
    if (
      participantStatus !== "accepted"
    ) {
      return;
    }

    const start = new Date(
      `${eventStartDate}T00:00:00`
    );

    const end = new Date(
      `${eventEndDate}T00:00:00`
    );

    const dates = weeks
      .flat()
      .filter((item) => {
        if (item.muted) {
          return false;
        }

        const current =
          new Date(
            `${item.date}T00:00:00`
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

        return (
          current.getDay() === type
        );
      })
      .map(
        (item) => item.date
      );

    setSelectedAvailabilityDates(
      dates
    );

    setShowQuickSelect(false);
  };

  const handleSaveAvailability =
    async () => {
      if (
        participantStatus !== "accepted"
      ) {
        alert(
          "Please accept the event first."
        );

        return;
      }

      if (!idToken) {
        alert(
          "Unable to identify this participant."
        );

        return;
      }

      setIsSavingAvailability(true);

      try {
        const response =
          await fetch(
            `${API_BASE}/api/events/${eventId}/availability`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                idToken,
                dates:
                  selectedAvailabilityDates,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to save availability."
          );
        }

        setRefreshKey((key) => key + 1);

        alert(
          "Your availability has been saved."
        );
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
   * ================= OVERVIEW DATA =================
   */

  // Same thresholds as the organizer Overview:
  // everyone free → free, some → partial, none → busy.
  const getDateStatus = (date) => {
    if (acceptedCount === 0) return "";

    const count =
      availabilityCounts[date] || 0;

    if (count === acceptedCount) return "free";
    if (count > 0) return "partial";

    return "busy";
  };

  /*
   * ================= LOADING =================
   */

  // Check error first: if LIFF init fails before
  // eventId is set, the event fetch never runs and
  // isLoading would stay true forever.
  if (error) {
    return (
      <div className="participant-page">
        <header className="participant-header">
          <h1>Singto</h1>
        </header>

        <main className="participant-container">
          <p>{error}</p>
        </main>
      </div>
    );
  }

  if (
    isLoading ||
    liffLoading
  ) {
    return (
      <div className="participant-page">
        <header className="participant-header">
          <h1>Singto</h1>
        </header>

        <main className="participant-container">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="participant-page">
        <header className="participant-header">
          <h1>Singto</h1>
        </header>

        <main className="participant-container">
          <p>
            Event not found.
          </p>
        </main>
      </div>
    );
  }

  /*
   * ================= UI =================
   */

  return (
    <div className="participant-page">
      <header className="participant-header">
        <h1>Singto</h1>
      </header>

      <main className="participant-container">
        <section className="participant-event-card">
          <h2>
            {event.event_name}
          </h2>

          {event.description && (
            <p className="participant-description">
              {event.description}
            </p>
          )}

          <p className="participant-date">
            {formatDate(
              eventStartDate
            )}{" "}
            -{" "}
            {formatDate(
              eventEndDate
            )}
          </p>

          {organizer && (
            <div className="participant-created-by">
              {organizer.picture_url && (
                <img
                  className="participant-avatar"
                  src={organizer.picture_url}
                  alt=""
                  width="24"
                  height="24"
                />
              )}

              <p>
                Created by{" "}
                {organizer.display_name ||
                  "the organizer"}
              </p>
            </div>
          )}

          <p className="participant-question">
            Do you want to join this event?
          </p>

          <div className="response-buttons">
            <button
              type="button"
              className={`response-button decline ${
                participantStatus ===
                "declined"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleParticipantResponse(
                  "declined"
                )
              }
              disabled={
                isSubmitting
              }
            >
              DECLINE
            </button>

            <span
              className="response-divider"
              aria-hidden="true"
            />

            <button
              type="button"
              className={`response-button accept ${
                participantStatus ===
                "accepted"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleParticipantResponse(
                  "accepted"
                )
              }
              disabled={
                isSubmitting
              }
            >
              ACCEPT
            </button>
          </div>
        </section>

        <div className="participant-tabs">
          <button
            type="button"
            className={`participant-tab ${
              activeTab === "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "overview"
              )
            }
          >
            OVERVIEW
          </button>

          <button
            type="button"
            className={`participant-tab ${
              activeTab ===
              "availability"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "availability"
              )
            }
          >
            MY AVAILABILITY
          </button>
        </div>

        {activeTab === "overview" && (
          <section className="participant-overview">
            <h2>CALENDAR</h2>

            <p className="participant-section-subtitle">
              Overview of Everyone’s
              Availability
            </p>

            <div className="participant-calendar">
              <div className="participant-weekday-row">
                {[
                  "SUN",
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                ].map(
                  (day) => (
                    <div
                      className="participant-weekday"
                      key={day}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="participant-calendar-body">
                {weeks.map(
                  (
                    week,
                    weekIndex
                  ) => (
                    <div
                      className="participant-calendar-week"
                      key={
                        weekIndex
                      }
                    >
                      {week.map(
                        (
                          date,
                          index
                        ) => {
                          const status =
                            date.muted
                              ? ""
                              : getDateStatus(
                                  date.date
                                );

                          return (
                            <div
                              key={`${weekIndex}-${index}`}
                              className={`participant-calendar-date ${
                                date.muted
                                  ? "muted"
                                  : ""
                              } ${status}`}
                            >
                              {date.day}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="participant-legend">
              <span>Busy</span>
              <span className="legend-dot busy" />
              <span className="legend-dot partial" />
              <span className="legend-dot free" />
              <span>Free</span>
            </div>
          </section>
        )}

        {activeTab ===
          "availability" && (
          <section className="participant-availability">
            <div className="availability-heading">
              <div>
                <h2>CALENDAR</h2>

                <p>
                  Tap your available
                  days
                </p>
              </div>

              <div className="quick-select-wrapper">
                <button
                  type="button"
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
                    {[
                      {
                        label:
                          "All Day",
                        type: "all",
                      },
                      {
                        label:
                          "Weekends",
                        type: "weekends",
                      },
                      {
                        label:
                          "Every Monday",
                        type: 1,
                      },
                      {
                        label:
                          "Every Tuesday",
                        type: 2,
                      },
                      {
                        label:
                          "Every Wednesday",
                        type: 3,
                      },
                      {
                        label:
                          "Every Thursday",
                        type: 4,
                      },
                      {
                        label:
                          "Every Friday",
                        type: 5,
                      },
                      {
                        label:
                          "Every Saturday",
                        type: 6,
                      },
                      {
                        label:
                          "Every Sunday",
                        type: 0,
                      },
                    ].map(
                      (option) => (
                        <button
                          type="button"
                          key={
                            option.label
                          }
                          className="quick-select-option"
                          onClick={() =>
                            handleQuickSelect(
                              option.type
                            )
                          }
                        >
                          {
                            option.label
                          }
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="participant-availability-calendar">
              <div className="participant-weekday-row">
                {[
                  "SUN",
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                ].map(
                  (day) => (
                    <div
                      className="participant-weekday"
                      key={day}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="participant-calendar-body">
                {weeks.map(
                  (
                    week,
                    weekIndex
                  ) => (
                    <div
                      className="participant-calendar-week"
                      key={
                        weekIndex
                      }
                    >
                      {week.map(
                        (
                          date,
                          index
                        ) => {
                          const isSelected =
                            selectedAvailabilityDates.includes(
                              date.date
                            );

                          return (
                            <button
                              type="button"
                              key={`${weekIndex}-${index}`}
                              className={`participant-availability-date ${
                                date.muted
                                  ? "muted"
                                  : ""
                              } ${
                                isSelected
                                  ? "selected"
                                  : ""
                              }`}
                              disabled={
                                date.muted ||
                                participantStatus !==
                                  "accepted"
                              }
                              onClick={() =>
                                toggleAvailabilityDate(
                                  date.date
                                )
                              }
                            >
                              {
                                date.day
                              }
                            </button>
                          );
                        }
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="participant-bottom-bar">
              <button
                type="button"
                className="participant-save-button"
                onClick={
                  handleSaveAvailability
                }
                disabled={
                  isSavingAvailability ||
                  participantStatus !==
                    "accepted"
                }
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

export default Participant;
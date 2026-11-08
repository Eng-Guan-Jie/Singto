import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import liff, {
  initLiff,
  getFreshIdToken,
  authHeaders,
} from "../../lib/liff";
import {
  generateCalendarWeeks,
  getCalendarMonths,
  getAvailabilityStatus,
} from "../../lib/calendar";
import MonthNav from "../../components/MonthNav";
import { useI18n } from "../../lib/i18n";
import "./Participant.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

function Participant() {
  const {
    t,
    formatDate,
    weekdaysShort,
    weekdaysLong,
  } = useI18n();
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

  // Start on MY AVAILABILITY so people add their days first.
  const [activeTab, setActiveTab] =
    useState("availability");

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
            t("eventIdMissing")
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
            t("liffFailed")
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
              t("failedLoadEvent")
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
            t("failedLoadEvent")
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
                t("failedLoadParticipants")
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
                t("failedLoadAvailability")
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

  // Shown one month at a time; `weeks` above still covers
  // the whole period for Quick Select.
  const months = useMemo(
    () =>
      getCalendarMonths(
        eventStartDate,
        eventEndDate
      ),
    [
      eventStartDate,
      eventEndDate,
    ]
  );

  const [monthIndex, setMonthIndex] =
    useState(0);

  const visibleWeeks =
    months[monthIndex]?.weeks || [];

  /*
   * ================= ACCEPT / DECLINE =================
   */

  const handleParticipantResponse =
    async (status) => {
      if (!eventId || !idToken) {
        alert(
          t("unableIdentifyParticipant")
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
              t("failedUpdateParticipation")
          );
        }

        setParticipantStatus(
          data.participant.status
        );

        setRefreshKey((key) => key + 1);

        alert(
          status === "accepted"
            ? t("youAccepted")
            : t("youDeclined")
        );
      } catch (error) {
        console.error(
          "Participant response failed:",
          error
        );

        alert(
          error.message ||
            t("somethingWrong")
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
          t("acceptFirst")
        );

        return;
      }

      if (!idToken) {
        alert(
          t("unableIdentifyParticipant")
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
              t("failedSaveAvailability")
          );
        }

        setRefreshKey((key) => key + 1);

        alert(
          t("availabilitySaved")
        );

        // Then show how it fits with everyone else's.
        setActiveTab("overview");
      } catch (error) {
        console.error(
          "Save availability failed:",
          error
        );

        alert(
          error.message ||
            t("failedSaveAvailability")
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
  // Grey until anyone has picked a day.
  const hasAvailability =
    Object.keys(availabilityCounts).length > 0;

  const getDateStatus = (date) =>
    hasAvailability
      ? getAvailabilityStatus(
          availabilityCounts[date] || 0,
          acceptedCount
        )
      : "pending";

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
          <p>{t("loading")}</p>
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
          <p>{t("eventNotFound")}</p>
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

          {event.confirmed_dates?.length > 0 && (
            <p className="participant-confirmed">
              {t("confirmedOn", {
                dates: event.confirmed_dates
                  .map(formatDate)
                  .join(", "),
              })}
            </p>
          )}

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
                {t("createdBy", {
                  name:
                    organizer.display_name ||
                    t("theOrganizer"),
                })}
              </p>
            </div>
          )}

          <p className="participant-question">
            {t("joinQuestion")}
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
              {t("decline")}
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
              {t("accept")}
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
            {t("tabOverview")}
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
            {t("tabMyAvailability")}
          </button>
        </div>

        {activeTab === "overview" && (
          <section className="participant-overview">
            <h2>{t("calendar")}</h2>

            <p className="participant-section-subtitle">
              {t("overviewSubtitle")}
            </p>

            <MonthNav
              months={months}
              monthIndex={monthIndex}
              onChange={setMonthIndex}
            />

            <div className="participant-calendar">
              <div className="participant-weekday-row">
                {weekdaysShort.map(
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
                {visibleWeeks.map(
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
                                  ? `muted ${date.otherMonth ? "other-month" : ""}`
                                  : ""
                              } ${status}`}
                            >
                              <span>{date.day}</span>

                              {!date.muted &&
                                hasAvailability &&
                                acceptedCount > 0 && (
                                  <small className="date-count">
                                    {availabilityCounts[
                                      date.date
                                    ] || 0}
                                    /{acceptedCount}
                                  </small>
                                )}
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
              <span>{t("legendBusy")}</span>
              <span className="legend-dot busy" />
              <span className="legend-dot partial" />
              <span className="legend-dot free" />
              <span>{t("legendFree")}</span>
            </div>
          </section>
        )}

        {activeTab ===
          "availability" && (
          <section className="participant-availability">
            <div className="availability-heading">
              <div>
                <h2>{t("calendar")}</h2>

                <p>{t("tapYourDays")}</p>
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
                  {t("quickSelect")}
                </button>

                {showQuickSelect && (
                  <div className="quick-select-menu">
                    {[
                      {
                        label: t("quickAllDays"),
                        type: "all",
                      },
                      {
                        label: t("quickWeekends"),
                        type: "weekends",
                      },
                      // Monday … Saturday, then Sunday
                      ...[1, 2, 3, 4, 5, 6, 0].map(
                        (day) => ({
                          label: t("quickEveryDay", {
                            day: weekdaysLong[day],
                          }),
                          type: day,
                        })
                      ),
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

            {participantStatus !== "accepted" && (
              <p className="accept-first-hint">
                {t("acceptFirstHint")}
              </p>
            )}

            <MonthNav
              months={months}
              monthIndex={monthIndex}
              onChange={setMonthIndex}
            />

            <div className="participant-availability-calendar">
              <div className="participant-weekday-row">
                {weekdaysShort.map(
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
                {visibleWeeks.map(
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
                                  ? `muted ${date.otherMonth ? "other-month" : ""}`
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
                  ? t("saving")
                  : t("save")}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Participant;
import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  initLiff,
  getFreshIdToken,
  authHeaders,
} from "../../lib/liff";
import {
  getCalendarMonths,
  findMonthIndex,
  getAvailabilityStatus,
} from "../../lib/calendar";
import MonthNav from "../../components/MonthNav";
import { useI18n } from "../../lib/i18n";
import "./ConfirmDate.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

function ConfirmDate() {
  const { t, weekdaysShort } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [idToken, setIdToken] = useState(null);
  const [event, setEvent] = useState(null);

  // How many accepted members are free on each date.
  const [counts, setCounts] = useState({});
  const [acceptedCount, setAcceptedCount] = useState(0);

  const [selectionMode, setSelectionMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [note, setNote] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  /*
   * ================= LIFF =================
   */

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await initLiff();

        const token = getFreshIdToken();

        // Redirecting to LINE Login.
        if (!token) return;

        setIdToken(token);
      } catch (error) {
        console.error("LIFF initialization failed:", error);

        setError(
          error.message || t("liffFailed")
        );
      }
    };

    initializeLiff();
  }, []);

  /*
   * ================= LOAD =================
   */

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError(t("eventIdMissing"));
        return;
      }

      if (!idToken) return;

      try {
        const [eventResponse, participantsResponse, availabilityResponse] =
          await Promise.all([
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
          throw new Error(eventData.message || t("failedLoadEvent"));
        }

        if (participantsData.role !== "organizer") {
          throw new Error(
            t("onlyOrganizerConfirm")
          );
        }

        if (!availabilityResponse.ok) {
          throw new Error(
            availabilityData.message || t("failedLoadAvailability")
          );
        }

        const loadedEvent = eventData.event;

        setEvent(loadedEvent);
        setCounts(availabilityData.counts || {});
        setAcceptedCount(availabilityData.acceptedCount || 0);

        // Start from the day(s) picked on Overview, else an
        // earlier confirmation, else the top Best Date.
        const previous = loadedEvent.confirmed_dates || [];

        const initialDates = [
          location.state?.pickedDates,
          previous,
          location.state?.suggestedDates,
        ].find((dates) => dates?.length > 0) || [];

        setSelectedDates(initialDates);
        setSelectionMode(
          initialDates.length > 1 ? "multiple" : "single"
        );
        setNote(loadedEvent.confirmation_note || "");
      } catch (error) {
        console.error("Failed to load confirm page:", error);
        setError(error.message || t("failedLoadEvent"));
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId, idToken, location.state]);

  /*
   * ================= CALENDAR =================
   */

  const startDate = event?.start_date?.slice(0, 10) || "";
  const endDate = event?.end_date?.slice(0, 10) || "";

  // Shown one month at a time.
  const months = useMemo(
    () => getCalendarMonths(startDate, endDate),
    [startDate, endDate]
  );

  const [monthIndex, setMonthIndex] = useState(0);

  // Open on the month of the first preselected date.
  useEffect(() => {
    setMonthIndex(findMonthIndex(months, selectedDates[0]));
    // Only when the dates first load, not on every tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months]);

  const visibleWeeks = months[monthIndex]?.weeks || [];

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

  /*
   * ================= CONFIRM =================
   */

  const handleConfirm = async () => {
    if (selectedDates.length === 0) {
      alert(t("selectAtLeastOne"));
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/events/${eventId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken,
            dates: selectedDates,
            note,
            notify: sendNotification,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("failedConfirm"));
      }

      if (data.notifyError) {
        alert(
          t("confirmedNotPosted", { reason: data.notifyError })
        );
      } else {
        alert(
          data.notified
            ? t("confirmedAndPosted")
            : t("confirmedOnly")
        );
      }

      navigate(`/overview?eventId=${eventId}`);
    } catch (error) {
      console.error("Confirm date failed:", error);
      alert(error.message || t("failedConfirm"));
    } finally {
      setIsConfirming(false);
    }
  };

  /*
   * ================= RENDER =================
   */

  if (error || isLoading) {
    return (
      <div className="confirm-page">
        <header className="confirm-header">
          <h1>Singto</h1>
        </header>

        <main className="confirm-container">
          <p>{error || t("loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="confirm-page">
      <header className="confirm-header">
        <h1>Singto</h1>
      </header>

      <main className="confirm-container">
        <section className="confirm-selection">
          <h2>{t("confirmDateTitle")}</h2>

          <div className="selection-options">
            <button
              type="button"
              className={`selection-option ${
                selectionMode === "single" ? "active" : ""
              }`}
              onClick={() => handleModeChange("single")}
              aria-pressed={selectionMode === "single"}
            >
              <span className="radio-circle"></span>
              <span>{t("singleDate")}</span>
            </button>

            <button
              type="button"
              className={`selection-option ${
                selectionMode === "multiple" ? "active" : ""
              }`}
              onClick={() => handleModeChange("multiple")}
              aria-pressed={selectionMode === "multiple"}
            >
              <span className="radio-circle"></span>
              <span>{t("multipleDates")}</span>
            </button>
          </div>
        </section>

        <section className="confirm-calendar-section">
          <h2>{t("calendar")}</h2>
          <p>{t("chooseDate")}</p>

          <MonthNav
            months={months}
            monthIndex={monthIndex}
            onChange={setMonthIndex}
          />

          <div className="confirm-calendar">
            <div className="confirm-weekdays">
              {weekdaysShort.map(
                (day) => (
                  <span key={day}>{day}</span>
                )
              )}
            </div>

            <div className="confirm-calendar-body">
              {visibleWeeks.map((week, weekIndex) => (
                <div className="confirm-calendar-week" key={weekIndex}>
                  {week.map((date) => {
                    const status = date.muted
                      ? ""
                      : getAvailabilityStatus(
                          counts[date.date] || 0,
                          acceptedCount
                        );

                    const isSelected = selectedDates.includes(date.date);

                    return (
                      <button
                        type="button"
                        key={date.date}
                        className={[
                          "confirm-date",
                          date.muted ? "muted" : "",
                          date.otherMonth ? "other-month" : "",
                          status,
                          isSelected ? "selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => handleDateClick(date.date)}
                        disabled={date.muted}
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

        <section className="confirm-note-section">
          <h2>{t("note")}</h2>

          <input
            type="text"
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("notePlaceholder")}
          />
        </section>

        <section className="notification-section">
          <span>{t("sendNotification")}</span>

          <button
            type="button"
            className={`toggle-switch ${sendNotification ? "on" : ""}`}
            onClick={() => setSendNotification((current) => !current)}
            aria-label={t("toggleNotification")}
            aria-pressed={sendNotification}
          >
            <span className="toggle-knob"></span>
          </button>
        </section>

        <div className="confirm-bottom-bar">
          <button
            type="button"
            className="confirm-date-button"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? t("confirming") : t("confirmDateButton")}
          </button>
        </div>
      </main>
    </div>
  );
}

export default ConfirmDate;

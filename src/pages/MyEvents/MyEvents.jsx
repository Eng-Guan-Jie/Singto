import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  initLiff,
  getFreshIdToken,
  authHeaders,
} from "../../lib/liff";
import { useI18n } from "../../lib/i18n";
import { apiErrorMessage } from "../../lib/apiError";
import HeaderActions from "../../components/HeaderActions";
import { goBack } from "../Privacy/Privacy";
import "../InfoPage.css";
import "./MyEvents.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

const TABS = ["ongoing", "archived"];

/*
 * The signed-in user's events, opened from the profile
 * menu: "On-going events" and "Archived events".
 * Data comes from GET /api/my-events (only their own
 * events, no other members' details).
 */
function MyEvents() {
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "ongoing";

  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        await initLiff();

        const idToken = getFreshIdToken();

        // Redirecting to LINE Login.
        if (!idToken) return;

        const response = await fetch(
          `${API_BASE}/api/my-events`,
          { headers: authHeaders(idToken) }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            apiErrorMessage(t, response, data, "failedLoadMyEvents")
          );
        }

        setEvents(data);
      } catch (loadError) {
        console.error("Failed to load my events:", loadError);
        setError(loadError.message || t("failedLoadMyEvents"));
      }
    };

    load();
    // Load once; switching tabs only filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEvent = (event) => {
    navigate(
      event.role === "organizer"
        ? `/overview?eventId=${event.id}`
        : `/participant?eventId=${event.id}`
    );
  };

  const roleLabel = (event) => {
    if (event.role === "organizer") return t("roleOrganizer");
    if (event.my_status === "declined") return t("statusDeclined");
    return t("statusAccepted");
  };

  const list = events?.[tab] || [];

  return (
    <div className="info-page my-events-page">
      <header className="info-header">
        <h1>Singto</h1>
        <HeaderActions />
      </header>

      <main className="info-container">
        <button
          type="button"
          className="back-button"
          onClick={() => goBack(navigate)}
        >
          ← {t("back")}
        </button>

        <div className="my-events-tabs" role="tablist">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              className={tab === name ? "active" : ""}
              onClick={() =>
                setSearchParams({ tab: name }, { replace: true })
              }
            >
              {t(name === "ongoing" ? "ongoingEvents" : "archivedEvents")}
            </button>
          ))}
        </div>

        {error && <p>{error}</p>}

        {!error && !events && <p>{t("loading")}</p>}

        {!error && events && list.length === 0 && (
          <p className="my-events-empty">
            {t(tab === "ongoing" ? "noOngoingEvents" : "noArchivedEvents")}
          </p>
        )}

        {!error && events && list.length > 0 && (
          <ul className="my-events-list">
            {list.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className="my-event-card"
                  onClick={() => openEvent(event)}
                >
                  <span className="my-event-top">
                    <span className="my-event-name">
                      {event.event_name}
                    </span>

                    <span
                      className={`my-event-role ${
                        event.role === "organizer"
                          ? "organizer"
                          : event.my_status || ""
                      }`}
                    >
                      {roleLabel(event)}
                    </span>
                  </span>

                  <span className="my-event-dates">
                    {formatDate(event.start_date)} -{" "}
                    {formatDate(event.end_date)}
                  </span>

                  {event.confirmed_dates.length > 0 ? (
                    <span className="my-event-confirmed">
                      {t("confirmedOn", {
                        dates: event.confirmed_dates
                          .map(formatDate)
                          .join(", "),
                      })}
                    </span>
                  ) : (
                    <span className="my-event-pending">
                      {t("notConfirmedYet")}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "archived" && events && (
          <p className="info-note">{t("archivedNote")}</p>
        )}
      </main>
    </div>
  );
}

export default MyEvents;

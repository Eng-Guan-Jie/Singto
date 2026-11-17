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
import "./EventDetails.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

// LINE picture, or the first letter of the name.
function PersonAvatar({ person }) {
  if (person.picture_url) {
    return (
      <img
        className="details-avatar"
        src={person.picture_url}
        alt=""
        width="24"
        height="24"
      />
    );
  }

  return (
    <span className="details-avatar">
      {(person.display_name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

/*
 * Who joins and who declined, opened from "ดูรายละเอียด
 * เพิ่มเติม" on the "date confirmed" card in the LINE group
 * and from the "who goes" row on the Participant page.
 * Design: Figma frames "accepted" / "declined".
 * Lists come from GET /api/events/:id/responses, which
 * only gives names to people in the event.
 */
function EventDetails() {
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [activeTab, setActiveTab] = useState("accepted");
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState(null);
  const [error, setError] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  // Bumped after answering to reload the lists.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        if (!eventId) throw new Error(t("eventIdMissing"));

        await initLiff();

        const idToken = getFreshIdToken();

        // Redirecting to LINE Login.
        if (!idToken) return;

        const [eventResponse, responsesResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/events/${eventId}`),
            fetch(`${API_BASE}/api/events/${eventId}/responses`, {
              headers: authHeaders(idToken),
            }),
          ]);

        const eventData = await eventResponse.json().catch(() => ({}));
        const responsesData = await responsesResponse
          .json()
          .catch(() => ({}));

        if (!eventResponse.ok) {
          throw new Error(
            apiErrorMessage(t, eventResponse, eventData, "failedLoadEvent")
          );
        }

        if (!responsesResponse.ok) {
          throw new Error(
            apiErrorMessage(
              t,
              responsesResponse,
              responsesData,
              "failedLoadResponses"
            )
          );
        }

        setEvent(eventData.event);
        setResponses(responsesData);
      } catch (loadError) {
        console.error("Failed to load event details:", loadError);
        setError(loadError.message || t("failedLoadEvent"));
      }
    };

    load();
    // Load per event, and again after answering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, reloadKey]);

  // Join / decline from this page: once the date is
  // confirmed, every link to the event lands here, so this
  // is where people answer (or change their answer).
  const handleAnswer = async (status) => {
    setIsAnswering(true);

    try {
      await initLiff();

      const idToken = getFreshIdToken();

      // Redirecting to LINE Login.
      if (!idToken) return;

      const response = await fetch(
        `${API_BASE}/api/events/${eventId}/participants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          apiErrorMessage(t, response, data, "failedUpdateParticipation")
        );
      }

      setReloadKey((key) => key + 1);
    } catch (answerError) {
      console.error("Answer failed:", answerError);
      alert(answerError.message || t("failedUpdateParticipation"));
    } finally {
      setIsAnswering(false);
    }
  };

  const header = (
    <header className="details-header">
      <h1>Singto</h1>
      <HeaderActions />
    </header>
  );

  if (error || !event || !responses) {
    return (
      <div className="details-page">
        {header}
        <main className="details-container">
          <p className="details-message">{error || t("loading")}</p>
        </main>
      </div>
    );
  }

  const isGuest = responses.role === "guest";
  const isOrganizer = responses.role === "organizer";
  const people =
    activeTab === "accepted" ? responses.accepted : responses.declined;

  return (
    <div className="details-page">
      {header}

      <main className="details-container">
        <button
          type="button"
          className="details-back"
          onClick={() => goBack(navigate)}
        >
          ← {t("back")}
        </button>

        <section className="details-event-card">
          <h2>{event.event_name}</h2>

          {event.description && (
            <p className="details-description">{event.description}</p>
          )}

          {event.confirmed_dates?.length > 0 ? (
            <p className="details-confirmed">
              {t("confirmedOn", {
                dates: event.confirmed_dates.map(formatDate).join(", "),
              })}
            </p>
          ) : (
            <p className="details-pending">{t("notConfirmedYet")}</p>
          )}

          {responses.organizer && (
            <div className="details-created-by">
              <PersonAvatar person={responses.organizer} />
              <p>
                {t("createdBy", {
                  name:
                    responses.organizer.display_name ||
                    t("theOrganizer"),
                })}
              </p>
            </div>
          )}
          {isOrganizer ? (
            <button
              type="button"
              className="details-manage-button"
              onClick={() =>
                navigate(`/overview?eventId=${eventId}&manage=1`)
              }
            >
              {t("manageEvent")}
            </button>
          ) : (
            <div className="details-answer">
              <p className="details-question">{t("joinQuestion")}</p>

              <div className="details-answer-buttons">
                <button
                  type="button"
                  className={responses.myStatus === "declined" ? "active" : ""}
                  disabled={isAnswering}
                  onClick={() => handleAnswer("declined")}
                >
                  {t("decline")}
                </button>

                <button
                  type="button"
                  className={responses.myStatus === "accepted" ? "active" : ""}
                  disabled={isAnswering}
                  onClick={() => handleAnswer("accepted")}
                >
                  {t("accept")}
                </button>
              </div>

              <p className="details-answer-note">
                {t("answerVisibleNote")}
              </p>
            </div>
          )}
        </section>

        {isGuest ? (
          <section className="details-panel">
            <p className="details-note">{t("answerToSeeList")}</p>
          </section>
        ) : (
          <>
            <div className="details-tabs" role="tablist">
              {["accepted", "declined"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`details-tab ${
                    activeTab === tab ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {t(tab === "accepted" ? "tabAccepted" : "tabDeclined", {
                    count: responses[tab].length,
                  })}
                </button>
              ))}
            </div>

            <section className="details-panel" role="tabpanel">
              <p className="details-note">
                {t(
                  activeTab === "accepted"
                    ? "acceptedListNote"
                    : "declinedListNote"
                )}
              </p>

              {people.length === 0 ? (
                <p className="details-empty">
                  {t(
                    activeTab === "accepted"
                      ? "noAcceptedYet"
                      : "noDeclinedYet"
                  )}
                </p>
              ) : (
                <ul className="details-people">
                  {people.map((person, index) => (
                    <li key={index}>
                      <PersonAvatar person={person} />
                      <span>{person.display_name || "?"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default EventDetails;

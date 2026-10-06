import React, { useEffect, useState } from "react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { CalendarDays } from "lucide-react";
import liff, {
  initLiff,
  getFreshIdToken,
} from "../../lib/liff";

import "./CreateEvent.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

function CreateEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const existingEvent = location.state?.eventData;
  const isEditMode = location.state?.editMode === true;

  const lineChatId = searchParams.get("lineChatId");

  const [organizerLineUserId, setOrganizerLineUserId] =
    useState(null);

  const [isLiffLoading, setIsLiffLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [eventName, setEventName] = useState(
    existingEvent?.eventName || ""
  );

  const [description, setDescription] = useState(
    existingEvent?.description || ""
  );

  const [startDate, setStartDate] = useState(
    existingEvent?.startDate || ""
  );

  const [endDate, setEndDate] = useState(
    existingEvent?.endDate || ""
  );

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await initLiff();

        // Refresh an expired token now, before the
        // organizer fills in the form.
        if (!getFreshIdToken()) {
          return;
        }

        const profile = await liff.getProfile();

        setOrganizerLineUserId(profile.userId);

        console.log(
          "Organizer LINE User ID:",
          profile.userId
        );
      } catch (error) {
        console.error(
          "LIFF initialization failed:",
          error
        );
      } finally {
        setIsLiffLoading(false);
      }
    };

    initializeLiff();
  }, []);

  console.log("lineChatId:", lineChatId);
  console.log(
    "organizerLineUserId:",
    organizerLineUserId
  );
  console.log("API_BASE:", API_BASE);

  const handleSaveEvent = async () => {
    if (!eventName || !startDate || !endDate) {
      alert(
        "Please fill in the required fields."
      );
      return;
    }

    if (endDate < startDate) {
      alert(
        "End date must be on or after start date."
      );
      return;
    }

    if (!organizerLineUserId) {
      alert(
        "Unable to identify the organizer through LINE."
      );
      return;
    }

    setIsSaving(true);

    const eventData = {
      eventName,
      description,
      startDate,
      endDate,
    };

    try {
      /*
       * CREATE EVENT
       */
      if (!isEditMode) {
        const response = await fetch(
          `${API_BASE}/api/events`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName,
              description,
              startDate,
              endDate,
              lineChatId,
              idToken: getFreshIdToken(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to create the event."
          );
        }

        const createdEvent = data.event;

        console.log(
          "Created Event:",
          createdEvent
        );

        /*
         * Send event information to LINE
         * if this event was created from a LINE group.
         */
        if (lineChatId) {
          try {
            const lineResponse = await fetch(
              `${API_BASE}/api/line-push-event`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  eventId: createdEvent.id,
                  idToken: getFreshIdToken(),
                }),
              }
            );

            if (!lineResponse.ok) {
              const lineData = await lineResponse
                .json()
                .catch(() => ({}));

              throw new Error(
                lineData.message ||
                  "Unable to send the event bubble to LINE."
              );
            }
          } catch (error) {
            console.error(
              "LINE notification failed:",
              error
            );

            alert(
              `Event created successfully, but Singto could not send the event to LINE.\n\n${error.message}`
            );
          }
        }

        /*
         * Go to Overview using the real event ID.
         */
        navigate(
          `/overview?eventId=${createdEvent.id}`,
          {
            state: {
              eventData: {
                ...eventData,
                id: createdEvent.id,
              },
              lineChatId,
              organizerLineUserId,
            },
          }
        );

        return;
      }

      /*
       * EDIT MODE
       */
      // Overview loads the event by the ID in its URL.
      const eventId =
        searchParams.get("eventId") || existingEvent?.id;

      const updateResponse = await fetch(
        `${API_BASE}/api/events/${eventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...eventData,
            idToken: getFreshIdToken(),
          }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateData.message ||
            "Unable to update the event."
        );
      }

      navigate(`/overview?eventId=${eventId}`, {
        state: {
          lineChatId,
          organizerLineUserId,
        },
      });
    } catch (error) {
      console.error(
        "Save event failed:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while saving the event."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <h1>Singto</h1>
      </header>

      {/* Main Content */}
      <main className="form-container">
        {/* Event Name */}
        <div className="form-group">
          <label htmlFor="eventName">
            EVENT NAME
          </label>

          <input
            id="eventName"
            type="text"
            placeholder="e.g. dinner, trip to CEI"
            value={eventName}
            onChange={(e) =>
              setEventName(e.target.value)
            }
          />
        </div>

        {/* Description */}
        <div className="form-group description-group">
          <label htmlFor="description">
            DESCRIPTION
          </label>

          <input
            id="description"
            type="text"
            placeholder="e.g. trip to CEI 7:00PM"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        {/* Scheduling Periods */}
        <section className="scheduling-section">
          <h2>SCHEDULING PERIODS</h2>

          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="startDate">
              START DATE
            </label>

            <div className="date-input">
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />

              <CalendarDays
                size={27}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="form-group end-date-group">
            <label htmlFor="endDate">
              END DATE
            </label>

            <div className="date-input">
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />

              <CalendarDays
                size={27}
                strokeWidth={2}
              />
            </div>
          </div>
        </section>

        {/* Create Event Button */}
        <button
          className="create-button"
          onClick={handleSaveEvent}
          disabled={
            isSaving ||
            isLiffLoading
          }
        >
          {isSaving
            ? "SAVING..."
            : isLiffLoading
            ? "LOADING..."
            : isEditMode
            ? "UPDATE EVENT"
            : "CREATE EVENT"}
        </button>
      </main>
    </div>
  );
}

export default CreateEvent;
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import liff from "@line/liff";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

function Participant() {
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [lineUser, setLineUser] = useState(null);
  const [idToken, setIdToken] = useState(null);

  const [liffLoading, setLiffLoading] =
    useState(true);

  const [event, setEvent] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [participantStatus, setParticipantStatus] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * ================= INITIALIZE LIFF =================
   */

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID,
        });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        /*
         * Get LINE ID token
         */
        const token = liff.getIDToken();

        if (!token) {
          throw new Error(
            "Unable to get LINE ID token."
          );
        }

        setIdToken(token);

        /*
         * Get LINE profile
         */
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
    };

    initializeLiff();
  }, []);

  /*
   * ================= FETCH EVENT =================
   */

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("Event ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
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
   * ================= GET MY PARTICIPANT STATUS =================
   */

  useEffect(() => {
    const fetchMyParticipantStatus =
      async () => {
        if (!eventId || !idToken) {
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE}/api/events/${eventId}/participants`
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to load participant status."
            );
          }

          /*
           * Find the current LINE user
           * in this event.
           */
          const currentParticipant =
            data.participants?.find(
              (participant) =>
                participant.line_user_id ===
                lineUser?.userId
            );

          if (currentParticipant) {
            setParticipantStatus(
              currentParticipant.status
            );
          }
        } catch (error) {
          console.error(
            "Failed to load participant status:",
            error
          );
        }
      };

    fetchMyParticipantStatus();
  }, [
    eventId,
    idToken,
    lineUser,
  ]);

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
        const response = await fetch(
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
            "Something went wrong. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /*
   * ================= LOADING =================
   */

  if (isLoading || liffLoading) {
    return <div>Loading...</div>;
  }

  /*
   * ================= ERROR =================
   */

  if (error) {
    return <div>{error}</div>;
  }

  /*
   * ================= NO EVENT =================
   */

  if (!event) {
    return <div>Event not found.</div>;
  }

  /*
   * ================= UI =================
   */

  return (
    <div>
      <h1>{event.event_name}</h1>

      {event.description && (
        <p>{event.description}</p>
      )}

      <p>
        {event.start_date} —{" "}
        {event.end_date}
      </p>

      <p>
        Status: {event.status}
      </p>

      {lineUser ? (
        <div>
          <p>
            Logged in as:{" "}
            {lineUser.displayName}
          </p>

          <div>
            <button
              type="button"
              onClick={() =>
                handleParticipantResponse(
                  "declined"
                )
              }
              disabled={isSubmitting}
            >
              {participantStatus ===
              "declined"
                ? "DECLINED"
                : "DECLINE"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleParticipantResponse(
                  "accepted"
                )
              }
              disabled={isSubmitting}
            >
              {participantStatus ===
              "accepted"
                ? "ACCEPTED"
                : "ACCEPT"}
            </button>
          </div>

          {participantStatus && (
            <p>
              Your response:{" "}
              {participantStatus}
            </p>
          )}
        </div>
      ) : (
        <p>
          Unable to connect to LINE.
        </p>
      )}
    </div>
  );
}

export default Participant;

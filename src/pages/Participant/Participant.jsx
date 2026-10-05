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
  const [liffLoading, setLiffLoading] = useState(true);

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize LIFF
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

        const profile = await liff.getProfile();

        setLineUser({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });
      } catch (error) {
        console.error("LIFF initialization failed:", error);
      } finally {
        setLiffLoading(false);
      }
    };

    initializeLiff();
  }, []);

  // Fetch event from Neon
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load event."
          );
        }

        setEvent(data.event);
      } catch (error) {
        console.error("Failed to load event:", error);
        setError(
          error.message || "Failed to load event."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (isLoading || liffLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div>
      <h1>{event.event_name}</h1>

      {event.description && (
        <p>{event.description}</p>
      )}

      <p>
        {event.start_date} — {event.end_date}
      </p>

      <p>Status: {event.status}</p>

      {lineUser ? (
        <div>
          <p>
            Logged in as: {lineUser.displayName}
          </p>
        </div>
      ) : (
        <p>Unable to connect to LINE.</p>
      )}
    </div>
  );
}

export default Participant;
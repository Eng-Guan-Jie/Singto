import React, { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import "./CreateEvent.css";

function CreateEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const existingEvent = location.state?.eventData;
  const isEditMode = location.state?.editMode === true;
  const lineChatId = searchParams.get("lineChatId");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveEvent = async () => {
  if (!eventName || !startDate || !endDate) {
    alert("Please fill in the required fields.");
    return;
  }

  setIsSaving(true);

  const eventData = {
    eventName,
    description,
    startDate,
    endDate,
  };

  console.log(isEditMode ? "Updated Event:" : "Created Event:", eventData);

  if (lineChatId && !isEditMode) {
    try {
      const response = await fetch("/api/line-push-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineChatId,
          eventData,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send the event bubble to LINE.");
      }
    } catch (error) {
      console.error(error);
      alert("Event created, but Singto could not send it to LINE.");
    }
  }

  navigate("/overview", {
    state: {
      eventData,
      lineChatId,
    },
  });

  setIsSaving(false);
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
          <label htmlFor="eventName">EVENT NAME</label>

          <input
            id="eventName"
            type="text"
            placeholder="e.g. dinner, trip to CEI"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-group description-group">
          <label htmlFor="description">DESCRIPTION</label>

          <input
            id="description"
            type="text"
            placeholder="e.g. trip to CEI 7:00PM"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Scheduling Periods */}
        <section className="scheduling-section">
          <h2>SCHEDULING PERIODS</h2>

          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="startDate">START DATE</label>

            <div className="date-input">
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <CalendarDays size={27} strokeWidth={2} />
            </div>
          </div>

          {/* End Date */}
          <div className="form-group end-date-group">
            <label htmlFor="endDate">END DATE</label>

            <div className="date-input">
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <CalendarDays size={27} strokeWidth={2} />
            </div>
          </div>
        </section>

        {/* Create Event Button */}
        <button
          className="create-button"
          onClick={handleSaveEvent}
          disabled={isSaving}
        >
          {isSaving
            ? "SAVING..."
            : isEditMode
            ? "UPDATE EVENT"
            : "CREATE EVENT"}
        </button>

      </main>
    </div>
  );
}

export default CreateEvent;

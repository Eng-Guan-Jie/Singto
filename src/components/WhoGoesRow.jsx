import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import "./WhoGoesRow.css";

const MAX_PICTURES = 5;

/*
 * One-line "who goes" summary: up to 5 pictures of people
 * joining, "N joining · N not joining" and "See all".
 * Opens the event details page with the full lists, so the
 * row stays one line however big the group is.
 * Used on the Participant page and the organizer Overview.
 *
 * accepted / declined: [{ display_name, picture_url }]
 */
export default function WhoGoesRow({ eventId, accepted, declined }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="who-goes-row"
      onClick={() => navigate(`/event-details?eventId=${eventId}`)}
    >
      <span className="who-goes-avatars" aria-hidden="true">
        {accepted.slice(0, MAX_PICTURES).map((person, index) =>
          person.picture_url ? (
            <img
              key={index}
              className="who-goes-avatar"
              src={person.picture_url}
              alt=""
              width="24"
              height="24"
            />
          ) : (
            <span key={index} className="who-goes-avatar">
              {(person.display_name || "?").charAt(0).toUpperCase()}
            </span>
          )
        )}

        {accepted.length > MAX_PICTURES && (
          <span className="who-goes-avatar more">
            +{accepted.length - MAX_PICTURES}
          </span>
        )}
      </span>

      {/* Each part stays on one line; only the "·" breaks. */}
      <span className="who-goes-text">
        <span>{t("whoGoesJoining", { count: accepted.length })}</span>
        {" · "}
        <span>{t("whoGoesNotJoining", { count: declined.length })}</span>
      </span>

      <span className="who-goes-link">{t("seeAll")} →</span>
    </button>
  );
}

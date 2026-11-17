import { useI18n } from "../lib/i18n";
import "./ColorLegend.css";

// What each calendar colour means, shown under the
// calendar on Overview (both tabs' overview), Participant
// and Confirm Date. Colours follow getAvailabilityStatus
// in src/lib/calendar.js.
//
// pending:    nobody has picked days yet, so every day is
//             grey; explain only that.
// showCounts: the circles show "free / joining" numbers.
// tinted:     Confirm Date shows partial/busy days paler.
export default function ColorLegend({
  pending = false,
  showCounts = false,
  tinted = false,
}) {
  const { t } = useI18n();

  const items = pending
    ? [{ status: "pending", label: t("legendPending") }]
    : [
        { status: "free", label: t("legendEveryone") },
        { status: "partial", label: t("legendSome") },
        { status: "busy", label: t("legendNoOne") },
      ];

  return (
    <div className={`color-legend ${tinted ? "tinted" : ""}`}>
      <ul className="color-legend-items">
        {items.map((item) => (
          <li key={item.status}>
            <span
              className={`color-legend-dot ${item.status}`}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>

      {showCounts && !pending && (
        <p className="color-legend-note">{t("legendCountNote")}</p>
      )}
    </div>
  );
}

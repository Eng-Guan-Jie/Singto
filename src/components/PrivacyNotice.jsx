import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { POLICY_VERSION } from "../pages/Privacy/policyContent";
import "./PrivacyNotice.css";

// Which policy version this device has seen. Only a
// per-device reminder so the notice does not show every
// time: it is not a consent record (Singto relies on
// "necessary for the service", AGENTS.md 5.1). A consent
// checkbox would need server-side records (AGENTS.md 5.5).
const STORAGE_KEY = "singto-privacy-notice";

const hasSeenNotice = () => {
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) ===
      String(POLICY_VERSION)
    );
  } catch {
    return false;
  }
};

/*
 * Tells people what Singto does with their data the first
 * time they open it (and again when the policy changes).
 */
export default function PrivacyNotice() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(() => !hasSeenNotice());

  // Not on top of the policy itself or the delete page.
  if (
    !isOpen ||
    pathname === "/privacy" ||
    pathname === "/delete-account"
  ) {
    return null;
  }

  const handleAcknowledge = () => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        String(POLICY_VERSION)
      );
    } catch {
      // Storage blocked: it shows again next time.
    }

    setIsOpen(false);
  };

  return (
    <div
      className="privacy-notice"
      role="dialog"
      aria-labelledby="privacy-notice-title"
    >
      <h2 id="privacy-notice-title">{t("noticeTitle")}</h2>

      <p>{t("noticeBody")}</p>

      <div className="privacy-notice-actions">
        <Link to="/privacy">{t("noticeReadPolicy")}</Link>

        <button type="button" onClick={handleAcknowledge}>
          {t("noticeAcknowledge")}
        </button>
      </div>
    </div>
  );
}

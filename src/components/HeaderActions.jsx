import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import liff, { initLiff } from "../lib/liff";
import { useI18n } from "../lib/i18n";
import LanguageToggle from "./LanguageToggle";
import "./HeaderActions.css";

// The LINE profile picture, loaded once per page load and
// shared by every header.
let profilePromise = null;

const loadPictureUrl = () => {
  if (!profilePromise) {
    profilePromise = initLiff()
      .then(() =>
        liff.isLoggedIn() ? liff.getProfile() : null
      )
      .then((profile) => profile?.pictureUrl || null)
      .catch(() => null);
  }

  return profilePromise;
};

/*
 * Right side of every page header: the TH/EN switch and
 * the user's LINE picture, which opens a menu with their
 * archived and on-going events, the privacy policy and
 * "Delete account". (Singto has no
 * profile page: people sign in with LINE.)
 */
export default function HeaderActions() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [pictureUrl, setPictureUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let active = true;

    loadPictureUrl().then((url) => {
      if (active) setPictureUrl(url);
    });

    return () => {
      active = false;
    };
  }, []);

  // Close when tapping outside the menu.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () =>
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
  }, [isOpen]);

  const goTo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="header-actions">
      <LanguageToggle />

      <div className="profile-menu" ref={menuRef}>
        <button
          type="button"
          className="profile-button"
          aria-label={t("accountMenu")}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {pictureUrl ? (
            <img src={pictureUrl} alt="" width="30" height="30" />
          ) : (
            <UserRound size={18} strokeWidth={2.2} />
          )}
        </button>

        {isOpen && (
          <div className="profile-dropdown" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => goTo("/my-events?tab=archived")}
            >
              {t("archivedEvents")}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => goTo("/my-events?tab=ongoing")}
            >
              {t("ongoingEvents")}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => goTo("/privacy")}
            >
              {t("privacyPolicy")}
            </button>

            <button
              type="button"
              role="menuitem"
              className="danger"
              onClick={() => goTo("/delete-account")}
            >
              {t("deleteAccount")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import liff, {
  initLiff,
  getFreshIdToken,
  authHeaders,
} from "../../lib/liff";
import { useI18n } from "../../lib/i18n";
import { apiErrorMessage } from "../../lib/apiError";
import HeaderActions from "../../components/HeaderActions";
import { goBack } from "../Privacy/Privacy";
import "../InfoPage.css";

const API_BASE = import.meta.env.DEV
  ? "https://singto-eight.vercel.app"
  : "";

/*
 * "Delete account" (AGENTS.md 5.1): removes everything
 * Singto keeps about the signed-in LINE user. Singto has no
 * account of its own, so this is the user's data in every
 * event; see api/_deleteData.js.
 */
function DeleteAccount() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(t("deleteAccountConfirm"))) return;

    setIsDeleting(true);

    try {
      await initLiff();

      const idToken = getFreshIdToken();

      // Redirecting to LINE Login.
      if (!idToken) return;

      const response = await fetch(`${API_BASE}/api/account`, {
        method: "DELETE",
        headers: authHeaders(idToken),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          apiErrorMessage(t, response, data, "deleteAccountFailed")
        );
      }

      setIsDone(true);
    } catch (error) {
      console.error("Delete account failed:", error);
      alert(error.message || t("deleteAccountFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (liff.isInClient?.()) {
      liff.closeWindow();
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="info-page">
      <header className="info-header">
        <h1>Singto</h1>
        <HeaderActions />
      </header>

      <main className="info-container">
        {isDone ? (
          <>
            <h2>{t("deleteAccountDone")}</h2>

            <p className="info-note">{t("unlinkLineHint")}</p>

            <button
              type="button"
              className="plain-button"
              onClick={handleClose}
            >
              {t("close")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="back-button"
              onClick={() => goBack(navigate)}
            >
              ← {t("back")}
            </button>

            <h2>{t("deleteAccount")}</h2>

            <p>{t("deleteAccountIntro")}</p>

            <ul>
              <li>{t("deleteAccountItemAnswers")}</li>
              <li>{t("deleteAccountItemProfile")}</li>
              <li>{t("deleteAccountItemEvents")}</li>
            </ul>

            <div className="info-note">
              <p>{t("deleteAccountNoteCards")}</p>
              <p>{t("deleteAccountNoteAgain")}</p>
              <p>{t("deleteAccountNoteLogs")}</p>
              <p>{t("unlinkLineHint")}</p>
            </div>

            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? t("deletingAccount")
                : t("deleteAccountButton")}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default DeleteAccount;

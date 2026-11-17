import { useNavigate } from "react-router-dom";
import { useI18n } from "../../lib/i18n";
import HeaderActions from "../../components/HeaderActions";
import {
  policy,
  POLICY_DATE,
  POLICY_VERSION,
} from "./policyContent";
import "../InfoPage.css";

// Back to the page that opened this one, or to the start
// when the policy was opened directly.
export const goBack = (navigate) => {
  if (window.history.state?.idx > 0) {
    navigate(-1);
  } else {
    navigate("/", { replace: true });
  }
};

function Privacy() {
  const { lang, t, formatDate } = useI18n();
  const navigate = useNavigate();
  const content = policy[lang];

  return (
    <div className="info-page">
      <header className="info-header">
        <h1>Singto</h1>
        <HeaderActions />
      </header>

      <main className="info-container">
        <button
          type="button"
          className="back-button"
          onClick={() => goBack(navigate)}
        >
          ← {t("back")}
        </button>

        <h2>{content.title}</h2>

        <p className="info-meta">
          {content.updated} {formatDate(POLICY_DATE)} ·{" "}
          {content.version} {POLICY_VERSION}
        </p>

        <p>{content.intro}</p>

        {content.sections.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>

            {section.paragraphs?.map((text) => (
              <p key={text}>{text}</p>
            ))}

            {section.items && (
              <ul>
                {section.items.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}

export default Privacy;

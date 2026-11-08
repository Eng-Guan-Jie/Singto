import { chooseLanguage, useI18n } from "../lib/i18n";
import "./LanguageToggle.css";

const OPTIONS = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
];

// TH/EN switch for the page header. LINE only tells the
// page its language on iOS, so this lets everyone else
// pick theirs. The choice is remembered in this browser.
export default function LanguageToggle() {
  const { lang, t } = useI18n();

  return (
    <div
      className="language-toggle"
      role="group"
      aria-label={t("language")}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={lang === option.value ? "active" : ""}
          aria-pressed={lang === option.value}
          onClick={() => chooseLanguage(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

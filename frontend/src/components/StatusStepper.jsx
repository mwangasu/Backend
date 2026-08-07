import { useTranslation } from "react-i18next";

const STEPS = ["Open", "In Progress", "Pending Approval", "Approved", "Resolved"];

function StatusStepper({ status }) {
  const { t } = useTranslation();

  if (status === "Declined") {
    return (
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--danger)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" />
        </svg>
        {t("status.Declined")}
      </div>
    );
  }

  const currentIndex = Math.max(STEPS.indexOf(status), 0);

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                style={{
                  background: reached ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.18)",
                  color: reached ? "var(--primary-dark)" : "rgba(255,255,255,.6)",
                }}
              >
                {reached ? "✓" : i + 1}
              </div>
              <span
                className="text-[10px] mt-1.5 whitespace-nowrap font-medium"
                style={{ color: reached ? "#fff" : "rgba(255,255,255,.55)" }}
              >
                {t(`status.${step}`, step)}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-2 rounded-full"
                style={{ background: i < currentIndex ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.2)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatusStepper;

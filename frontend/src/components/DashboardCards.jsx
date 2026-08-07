import { useTranslation } from "react-i18next";
import useCountUp from "../hooks/useCountUp";

const ICONS = {
    reports: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6h-3" />
            <path d="M13 2v6h6" />
            <path d="M9 13h6" />
            <path d="M9 17h6" />
        </svg>
    ),
    alert: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    ),
    tag: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z" />
            <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
    ),
    map: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
};

const formatNumber = (value) => new Intl.NumberFormat("en-KE").format(value);

function StatCard({ title, value, note, icon, color, delay }) {
    const animated = useCountUp(value);

    return (
        <div
            className="card stat-card animate-in"
            style={{ "--stat-color": color, animationDelay: `${delay}ms` }}
        >
            <div className="stat-icon">
                {ICONS[icon]}
            </div>

            <p className="card-title">
                {title}
            </p>

            <div className="flex items-baseline gap-2">
                <h2 className="card-value tabular-nums">
                    {formatNumber(animated)}
                </h2>

                {note && (
                    <span className="text-xs font-semibold text-slate-400">
                        {note}
                    </span>
                )}
            </div>
        </div>
    );
}

function DashboardCards({ dashboard }) {
    const { t } = useTranslation();

    const highPriorityShare = dashboard.total_feedback
        ? Math.round((dashboard.high_priority / dashboard.total_feedback) * 100)
        : 0;

    const stats = [

        {
            title: t("cards.totalReports"),
            value: dashboard.total_feedback,
            icon: "reports",
            color: "var(--chart-1)",
        },

        {
            title: t("cards.highPriority"),
            value: dashboard.high_priority,
            note: dashboard.total_feedback ? `${highPriorityShare}${t("cards.ofTotal")}` : null,
            icon: "alert",
            color: "var(--danger)",
        },

        {
            title: t("cards.categories"),
            value: dashboard.categories.length,
            icon: "tag",
            color: "var(--chart-7)",
        },

        {
            title: t("cards.activeWards"),
            value: dashboard.wards.length,
            icon: "map",
            color: "var(--accent)",
        }

    ];

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {stats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={i * 60} />
            ))}

        </div>

    );

}

export default DashboardCards;

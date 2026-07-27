import { Clock } from "lucide-react";
import { daysUntilExpiration } from "@/lib/expiry";

function DaysBadge({ date, mode = "expiring" }) {
    if (!date) return null;

    let label;
    let isUrgent;

    if (mode === "expiring") {
        const days = daysUntilExpiration(date);
        if (days === null) return null;

        isUrgent = days <= 3;
        label = days < 0 ? "Exp" : days === 0 ? "Today" : `${days}d`;
    } else {
        // "created" mode
        const target = new Date(date);
        if (Number.isNaN(target.getTime())) return null;

        const now = new Date();
        const diffMs = now - target;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        isUrgent = diffHours < 24;
        label = diffHours < 1 ? "New" : diffHours < 24 ? `${diffHours}h` : `${diffDays}d`;
    }

    const colorClass = mode === "expiring"
        ? (isUrgent ? "bg-red-400/90" : "bg-emerald-500/90")
        : (isUrgent ? "bg-blue-400/90" : "bg-gray-400/90");

    return (
        <span className={`absolute top-1 left-1 z-10 rounded-md text-white text-[10px] px-1.5 py-0.5 flex items-center gap-1 ${colorClass}`}>
            <Clock size={10} />
            {label}
        </span>
    );
}

export default DaysBadge;
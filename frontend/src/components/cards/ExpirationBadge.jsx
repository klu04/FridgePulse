import { Clock } from "lucide-react";

function DaysBadge({ date, mode = "expiring" }) {
    if (!date) return null;

    const target = new Date(date);
    if (Number.isNaN(target.getTime())) return null;

    const now = new Date();
    const diffMs = mode === "expiring" ? target - now : now - target; // converts to milliseconds when subtracting dates
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let label;
    let isUrgent;

    if (mode === "expiring") {
        isUrgent = diffHours <= 72; // Items expiring in 3 days
        label = diffHours <= 0 ? "Exp" : diffHours < 24 ? `${diffHours}h` : `${diffDays}d`;
    // "created" mode: elapsed time since the item was added
    } else { 
        isUrgent = diffHours < 24; // Items that were within 24 hours
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
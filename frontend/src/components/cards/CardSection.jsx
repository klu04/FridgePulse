import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import CardRow from "@/components/cards/CardRow";

function CardSection({ title, to, isEmpty, emptyText, children }) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-2">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                <Link to={to} aria-label={`View all ${title}`}>
                    <ChevronRight size={20} className="text-gray-500" />
                </Link>
            </div>
            {isEmpty ? (
                <p className="text-gray-500 text-center py-8 px-6 text-sm">{emptyText}</p>
            ) : (
                <CardRow>{children}</CardRow>
            )}
        </div>
    );
}

export default CardSection;
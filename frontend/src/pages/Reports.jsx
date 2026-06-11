// Name: Paula Tica
// Date: 05/08/2026
// This page provides data on the following:
// items frequently used
// items frequently left unused
// items frequently spoiled
// Citation:
// URL: https://lucide.dev/icons/categories

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, ClockAlert, Trash2 } from "lucide-react"
import {
    REPORTS_FREQUENTLY_USED_URL,
    REPORTS_FREQUENTLY_WASTED_URL,
    REPORTS_UNUSED_URL,
} from "@/lib/api"
import { useAuth } from "@/lib/useAuth"
import { apiFetch } from "@/lib/api"

// Displays a list of the items within each report
function ItemList({items}) {
    return (
    <div className="flex flex-col gap-2">
        {items.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.count} {item.unit}
                </span>
            </div>
        ))}
    </div>
    )
}

function Reports() {
    const [usedItems, setUsedItems] = useState([])
    const [unusedItems, setUnusedItems] = useState([])
    const [spoiledItems, setSpoiledItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { token } = useAuth();

    useEffect(() => {
        async function fetchReports() {
            setLoading(true)
            setError(null)
            try {
                const [usedRes, unusedRes, wastedRes] = await Promise.all([
                    apiFetch(REPORTS_FREQUENTLY_USED_URL, token),
                    apiFetch(REPORTS_UNUSED_URL, token),
                    apiFetch(REPORTS_FREQUENTLY_WASTED_URL, token),
                ])

                setUsedItems(usedRes)
                setUnusedItems(unusedRes)
                setSpoiledItems(wastedRes)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchReports()
    }, [])

    // The three report cards
    const reports = [
        {
            title: "Frequently Used",
            description: "Restocked most often in the last 90 days",
            descriptionColor: "text-green-600",
            icon: <Utensils className="w-4 h-4" style={{ color: "#3B6D11" }} />,
            iconBg: "#EAF3DE",
            items: usedItems,
        },
        {
            title: "Frequently Unused",
            description: "Sitting in your inventory the longest",
            descriptionColor: "text-orange-500",
            icon: <ClockAlert className="w-4 h-4" style={{ color: "#fd4c00" }} />,
            iconBg: "#FAEEDA",
            items: unusedItems,
        },
        {
            title: "Frequently Spoiled",
            description: "Most often thrown away",
            descriptionColor: "text-red-600",
            icon: <Trash2 className="w-4 h-4" style={{ color: "#ff0000" }} />,
            iconBg: "#FAECE7",
            items: spoiledItems,
        },
    ]

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <h1 className="text-center text-4xl font-semibold text-gray-900">Reports</h1>
                <p className="text-center text-muted-foreground">Loading reports...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <h1 className="text-center text-4xl font-semibold text-gray-900">Reports</h1>
                <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-center text-4xl font-semibold text-gray-900">Reports</h1>

            {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <Card key={report.title} className="mx-auto w-full">
                        <CardHeader>
                        <div className="flex items-center justify-between">
                            <div
                                className="w-8 h-8 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: report.iconBg }}
                            >
                                {report.icon}
                            </div>
                        </div>
                        <CardTitle>{report.title}</CardTitle>
                        <p className={`text-s ${report.descriptionColor}`}>{report.description}</p>
                        </CardHeader>
                        <CardContent>
                            {report.items.length > 0 ? (
                                <ItemList items={report.items}/>
                            ) : (
                                <p className="text-sm text-muted-foreground">No data yet</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Reports

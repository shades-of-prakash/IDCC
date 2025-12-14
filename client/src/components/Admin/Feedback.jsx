import { useQuery } from "@tanstack/react-query";
import {
    LayoutDashboard,
    Users,
    Star,
    TrendingUp,
    MessageSquare,
    Quote,
} from "lucide-react";
import Loader from "../Loader";

/* --- API --- */
const fetchFeedbackDashboard = async () => {
    const res = await fetch("/api/admin/feedback", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to fetch feedback dashboard");
    const json = await res.json();
    return json.data;
};

const Feedback = () => {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["admin-feedback-dashboard"],
        queryFn: fetchFeedbackDashboard,
    });

    /* ================= LOADING ================= */
    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader text="Loading feedback dashboard..." />
            </div>
        );
    }

    /* ================= ERROR ================= */
    if (isError) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <LayoutDashboard className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold">
                    Could not load dashboard
                </h3>
                <p className="text-muted-foreground mb-4 text-sm max-w-xs">
                    {error.message}
                </p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { kpis, ratings, comments } = data;

    return (
        <div className="h-full w-full bg-background/50 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col h-full max-w-7xl w-full mx-auto">
                {/* Header */}
                <div className="shrink-0 flex p-4 flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Feedback Overview
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Analysis of participant satisfaction.
                        </p>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="shrink-0 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        icon={<Star className="h-5 w-5 text-yellow-500" />}
                        label="Overall Score"
                        value={kpis.overallRating}
                        suffix="/ 5"
                        hint="Average participant rating"
                    />
                    <KpiCard
                        icon={<Users className="h-5 w-5 text-blue-500" />}
                        label="Total Responses"
                        value={kpis.totalResponses}
                        hint="Unique submissions"
                    />
                    <KpiCard
                        icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                        label="Completion Rate"
                        value={kpis.completionRate}
                        suffix="%"
                        hint="Fully answered forms"
                    />
                    <KpiCard
                        icon={
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                        }
                        label="Positive Sentiment"
                        value={kpis.positivePercentage}
                        suffix="%"
                        hint="Ratings 4 stars and above"
                    />
                </div>

                {/* Bottom Section */}
                <div className="flex-1 min-h-0 grid p-4 grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category Ratings */}
                    <section className="lg:col-span-1 rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="font-semibold">
                                Category Breakdown
                            </h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                Average score distribution.
                            </p>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {ratings.map((r) => (
                                <div key={r.label} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">
                                            {r.label}
                                        </span>
                                        <span className="font-mono font-bold">
                                            {r.average} / 5
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary/80"
                                            style={{
                                                width: `${r.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Comments */}
                    <section className="lg:col-span-2 rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b flex justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Recent Comments
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    User-submitted feedback.
                                </p>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted">
                                {comments.length} total
                            </span>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {comments.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No written feedback available.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {comments.map((c, idx) => (
                                        <div
                                            key={idx}
                                            className="relative flex flex-col gap-3 rounded-lg border bg-background p-5 shadow-sm"
                                        >
                                            <Quote className="absolute top-4 right-4 h-5 w-5 text-muted/30 rotate-180" />
                                            <p className="text-sm italic">
                                                "{c.text}"
                                            </p>
                                            {c.rating !== null && (
                                                <div className="pt-3 border-t flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">
                                                        Rating Given
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 fill-primary text-primary" />
                                                        <span className="font-bold text-sm">
                                                            {c.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

/* --- KPI Card --- */
const KpiCard = ({ icon, label, value, suffix = "", hint }) => (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex justify-between mb-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="p-2 bg-secondary rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-bold">
            {value}
            <span className="text-muted-foreground text-lg ml-0.5">
                {suffix}
            </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
);

export default Feedback;

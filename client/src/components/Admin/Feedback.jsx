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
import CustomSelect from "../CustomSelect";
import { useContests } from "../../contexts/ContestContext";

/* ================= API ================= */
const fetchFeedbackDashboard = async ({ queryKey }) => {
    const [, contestId] = queryKey;

    const res = await fetch(`/api/admin/feedback/contest/${contestId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch feedback dashboard");
    }

    const json = await res.json();
    return json.data;
};

/* ================= COMPONENT ================= */
const Feedback = () => {
    const {
        allContests,
        allContestsQuery,
        selectedContest,
        setSelectedContest,
    } = useContests();

    const contestOptions = allContests
        ? allContests.map((c) => ({
              label: c.name,
              value: c._id,
          }))
        : [];

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["admin-feedback-dashboard", selectedContest?.value],
        queryFn: fetchFeedbackDashboard,
        enabled: !!selectedContest,
    });

    return (
        <div className="h-full w-full bg-background/50 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col h-full max-w-7xl w-full mx-auto">
                {/* ================= HEADER (ALWAYS) ================= */}
                <div className="shrink-0 flex p-4 flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Feedback Overview
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Contest-specific participant satisfaction
                        </p>
                    </div>

                    <div className="w-full sm:w-72">
                        <CustomSelect
                            options={contestOptions}
                            value={selectedContest}
                            onChange={setSelectedContest}
                            placeholder="Select contest"
                            loading={allContestsQuery.isLoading}
                        />
                    </div>
                </div>

                {/* ================= NO CONTEST ================= */}
                {!selectedContest && (
                    <EmptyState
                        title="Select a Contest"
                        description="Choose a contest to view feedback analytics."
                    />
                )}

                {/* ================= LOADING ================= */}
                {selectedContest && isLoading && (
                    <Centered>
                        <Loader text="Loading feedback dashboard..." />
                    </Centered>
                )}

                {/* ================= ERROR ================= */}
                {selectedContest && isError && (
                    <ErrorState message={error.message} onRetry={refetch} />
                )}

                {/* ================= ZERO DATA STATE ================= */}
                {selectedContest && data && data.kpis.totalResponses === 0 && (
                    <EmptyState
                        title="No Feedback Yet"
                        description="Participants haven’t submitted feedback for this contest."
                    />
                )}

                {/* ================= DASHBOARD ================= */}
                {selectedContest && data && data.kpis.totalResponses > 0 && (
                    <Dashboard data={data} />
                )}
            </div>
        </div>
    );
};

/* ================= DASHBOARD ================= */
const Dashboard = ({ data }) => {
    const { kpis, ratings, comments } = data;

    return (
        <>
            {/* KPI GRID */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<Star className="h-5 w-5 text-yellow-500" />}
                    label="Overall Score"
                    value={kpis.overallRating}
                    suffix="/ 5"
                />
                <KpiCard
                    icon={<Users className="h-5 w-5 text-blue-500" />}
                    label="Total Responses"
                    value={kpis.totalResponses}
                />
                <KpiCard
                    icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                    label="Completion Rate"
                    value={kpis.completionRate}
                    suffix="%"
                />
                <KpiCard
                    icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
                    label="Positive Sentiment"
                    value={kpis.positivePercentage}
                    suffix="%"
                />
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-h-0 grid p-4 grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ratings */}
                <section className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6 border-b font-semibold">
                        Category Breakdown
                    </div>
                    <div className="p-6 space-y-6">
                        {ratings.map((r) => (
                            <div key={r.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{r.label}</span>
                                    <span className="font-bold">
                                        {r.average} / 5
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${r.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Comments */}
                <section className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
                    <div className="p-6 border-b font-semibold flex justify-between">
                        Recent Comments
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                            {comments.length}
                        </span>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-4">
                        {comments.map((c, i) => (
                            <div
                                key={i}
                                className="p-5 border rounded-lg relative"
                            >
                                <Quote className="absolute top-4 right-4 h-5 w-5 text-muted/30 rotate-180" />
                                <p className="italic text-sm">“{c.text}”</p>
                                {c.rating !== null && (
                                    <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Rating
                                        </span>
                                        <span className="font-bold">
                                            ⭐ {c.rating}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

/* ================= SHARED UI ================= */
const Centered = ({ children }) => (
    <div className="flex-1 flex items-center justify-center">{children}</div>
);

const EmptyState = ({ title, description }) => (
    <Centered>
        <div className="text-center max-w-sm">
            <div className="mx-auto mb-4 p-4 rounded-full bg-muted w-fit">
                <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
    </Centered>
);

const ErrorState = ({ message, onRetry }) => (
    <Centered>
        <div className="text-center">
            <h3 className="font-semibold">Failed to load dashboard</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
            <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
                Retry
            </button>
        </div>
    </Centered>
);

const KpiCard = ({ icon, label, value, suffix = "" }) => (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex justify-between mb-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="p-2 bg-secondary rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-bold">
            {value}
            <span className="text-muted-foreground text-lg ml-1">{suffix}</span>
        </div>
    </div>
);

export default Feedback;

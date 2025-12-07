import React from "react";

const formatNum = (n) => {
    if (typeof n !== "number" || !isFinite(n)) return "-";
    return Number.isInteger(n) ? n : n.toFixed(2);
};

const ContestPointsSummaryPopup = ({ open, onClose, problems }) => {
    if (!open) return null;

    // 🔹 Build summary rows
    let totalAwarded = 0;
    let totalMax = 0;

    const summaryRows = (problems || []).map((p) => {
        const assigned =
            (p.problem && p.problem.assignedPoints) ?? p.maxPoints ?? 0;

        const totalTests = p.totalTests ?? 0;
        const passedTests = p.passedTests ?? 0;

        const testcasePointsArray = Array.isArray(p.testcasePoints)
            ? p.testcasePoints
            : [];

        const testcasePointsSum = testcasePointsArray.reduce(
            (sum, val) =>
                sum + (typeof val === "number" ? val : Number(val) || 0),
            0,
        );

        const passedTestcasePointsArray = Array.isArray(p.passedTestcasePoints)
            ? p.passedTestcasePoints
            : [];

        const passedTestcasePointsSum = passedTestcasePointsArray.reduce(
            (sum, val) =>
                sum + (typeof val === "number" ? val : Number(val) || 0),
            0,
        );

        const awarded =
            typeof p.awardedPoints === "number"
                ? p.awardedPoints
                : passedTestcasePointsSum;

        totalAwarded += awarded;
        totalMax += assigned;

        return {
            name: p.problem?.name || "Problem",
            passedTests,
            totalTests,
            testcasePointsArray,
            testcasePointsSum,
            passedTestcasePointsArray,
            passedTestcasePointsSum,
            awarded,
            max: assigned,
        };
    });

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Points Summary
                        </h2>
                        <p className="text-[12px] text-gray-500">
                            Full testcase points breakdown for each problem.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Body (scrollable when many problems) */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-[22%]">
                                    Problem
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-[10%]">
                                    Tests
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-[28%]">
                                    Passed Testcase Points
                                </th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-[28%]">
                                    Testcase Points (All)
                                </th>

                                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-[12%]">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {summaryRows.map((row, idx) => {
                                const allBreakdown =
                                    row.testcasePointsArray.length > 0
                                        ? `${row.testcasePointsArray
                                              .map((v) => formatNum(v))
                                              .join(" + ")} = ${formatNum(
                                              row.testcasePointsSum,
                                          )}`
                                        : "-";

                                const passedBreakdown =
                                    row.passedTestcasePointsArray.length > 0
                                        ? `${row.passedTestcasePointsArray
                                              .map((v) => formatNum(v))
                                              .join(" + ")} = ${formatNum(
                                              row.passedTestcasePointsSum,
                                          )}`
                                        : "0";

                                return (
                                    <tr
                                        key={idx}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 text-gray-900 font-medium">
                                            {row.name}
                                        </td>

                                        <td className="px-4 py-3 text-gray-700">
                                            {row.passedTests}/{row.totalTests}
                                        </td>

                                        <td className="px-4 py-3 text-gray-700 whitespace-pre-line">
                                            {passedBreakdown}
                                        </td>

                                        <td className="px-4 py-3 text-gray-700 whitespace-pre-line">
                                            {allBreakdown}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <span className="font-semibold text-gray-900">
                                                {formatNum(row.awarded)}
                                            </span>{" "}
                                            / {formatNum(row.max)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-2xl">
                    <div className="text-[12px] text-gray-600">
                        Total awarded points across all problems.
                    </div>
                    <div className="text-sm">
                        Total:{" "}
                        <span className="font-semibold text-gray-900">
                            {formatNum(totalAwarded)}
                        </span>{" "}
                        /{" "}
                        <span className="font-semibold text-gray-900">
                            {formatNum(totalMax)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestPointsSummaryPopup;

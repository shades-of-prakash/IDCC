import React from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { validateValueAgainstType } from "../../utils/type";

/* ---------------------------- helpers ---------------------------- */

const formatValueForDisplay = (val) => {
    if (val === null || val === undefined) return "null";
    if (val === "") return '""';

    if (typeof val === "string") return `"${val}"`;

    // ✅ FIX: arrays inline
    if (Array.isArray(val)) {
        return JSON.stringify(val); // [1,3]
    }

    // objects still formatted
    if (typeof val === "object") {
        return JSON.stringify(val, null, 2);
    }

    return String(val);
};

/* ------------------------ single document ------------------------ */

const TestcaseDocument = ({ index, testcase, argumentsList, OutputType }) => {
    const validationErrors = [];

    // Validate inputs
    argumentsList.forEach((arg) => {
        const val = testcase.input?.[arg.name];
        if (!validateValueAgainstType(val, arg.type)) {
            validationErrors.push(`Invalid ${arg.name}: expected ${arg.type}`);
        }
    });

    // Validate output
    if (OutputType && !validateValueAgainstType(testcase.output, OutputType)) {
        validationErrors.push(`Invalid output: expected ${OutputType}`);
    }

    const hasErrors = validationErrors.length > 0;
    const isHidden = testcase.isHidden;

    return (
        <div
            className={`border rounded-md bg-white ${
                hasErrors ? "border-red-300" : "border-gray-300"
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-neutral-50">
                <span className="text-xs font-medium text-gray-600">
                    Testcase #{index + 1}
                </span>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                    {/* Visibility */}
                    <div className="flex items-center gap-1">
                        {isHidden ? (
                            <>
                                <EyeOff size={14} className="text-red-400" />
                                <span className="text-red-400">Hidden</span>
                            </>
                        ) : (
                            <>
                                <Eye size={14} className="text-green-600" />
                                <span className="text-green-600">Visible</span>
                            </>
                        )}
                    </div>

                    {/* Points */}
                    <span>Points: {testcase.points ?? "—"}</span>
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-3 text-sm">
                {/* Input */}
                <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                        input
                    </div>

                    <div className="pl-4 border-l space-y-1 font-mono">
                        {argumentsList.map((arg) => (
                            <div
                                key={arg.name}
                                className="flex gap-2 items-start"
                            >
                                <span className="text-gray-500 shrink-0">
                                    {arg.name}
                                    <span className="text-[10px] ml-1">
                                        ({arg.type})
                                    </span>
                                    :
                                </span>

                                <span className="whitespace-pre-wrap break-words">
                                    {formatValueForDisplay(
                                        testcase.input?.[arg.name],
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Output */}
                <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                        output
                        {OutputType && (
                            <span className="text-[10px] ml-1">
                                ({OutputType})
                            </span>
                        )}
                    </div>

                    <div className="pl-4 border-l font-mono whitespace-pre-wrap">
                        {formatValueForDisplay(testcase.output)}
                    </div>
                </div>
            </div>

            {/* Validation errors */}
            {hasErrors && (
                <div className="px-3 py-2 border-t bg-red-50 text-sm text-red-700">
                    <div className="flex gap-2 items-start">
                        <CircleAlert size={14} className="mt-0.5" />
                        <div className="space-y-1">
                            {validationErrors.map((err, i) => (
                                <div key={i}>{err}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ------------------------ main component -------------------------- */

const TestcasePreviewDocumentView = ({
    testcases = [],
    argumentsList = [],
    OutputType,
}) => {
    if (!argumentsList.length) {
        return (
            <div className="text-sm text-gray-500">
                No arguments defined for this problem.
            </div>
        );
    }

    if (!testcases.length) {
        return <div className="text-sm text-gray-500">No testcases added.</div>;
    }

    return (
        <div className="h-full overflow-y-auto pr-1">
            <div className="space-y-4">
                {testcases.map((tc, i) => (
                    <TestcaseDocument
                        key={tc._id || i}
                        index={i}
                        testcase={tc}
                        argumentsList={argumentsList}
                        OutputType={OutputType}
                    />
                ))}
            </div>
        </div>
    );
};

export default TestcasePreviewDocumentView;

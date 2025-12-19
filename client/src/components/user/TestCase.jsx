import { useState, useEffect, useMemo, useRef } from "react";
import {
    SquareCheck,
    Terminal,
    Plus,
    X,
    AlertTriangle,
    Lock,
} from "lucide-react";
import { getDefaultValue, validateValueAgainstType } from "../../utils/type";

const formatValueForUi = (val) => {
    if (val === null || val === undefined) return "";

    if (Array.isArray(val) || typeof val === "object") {
        return JSON.stringify(val);
    }

    return String(val);
};

// ---------- Main TestCase wrapper ----------

const TestCase = ({
    visible,
    activeTab,
    setActiveTab,
    isRunning,
    result,
    onCustomCasesChange,
    resultMode = "run", // "run" | "submit"
}) => {
    // Map arg name -> type for validation
    const argTypes = useMemo(() => {
        const map = {};

        (visible?.arguments || []).forEach((arg) => {
            map[arg.name] = arg.type;
        });

        return map;
    }, [visible]);

    // Parse backend testcases into UI "cases"
    const parseCases = () => {
        const rawCases = visible?.testcases || visible?.visibleTests || [];

        if (!rawCases.length) return [];

        const args = visible?.arguments || [];

        return rawCases.map((tc, i) => {
            const argInputs = {};
            const backendInputObj = tc.input || {};

            args.forEach((arg, index) => {
                const name = arg.name || `arg${index + 1}`;
                const valueFromBackend = backendInputObj[name];
                argInputs[name] = formatValueForUi(valueFromBackend);
            });

            return {
                id: i + 1,
                input: argInputs,
                expected: tc.output, // still kept in state if you need it later
                editable: false, // API-provided cases not editable
            };
        });
    };

    const [cases, setCases] = useState(parseCases());
    const [selectedCase, setSelectedCase] = useState(
        () => parseCases()[0] || {},
    );
    const [fieldErrors, setFieldErrors] = useState({}); // { argName: errorMessage }

    // For debounced validation timers
    const validationTimeoutsRef = useRef({});

    // Rebuild when problem changes
    useEffect(() => {
        const parsed = parseCases();

        setCases(parsed);
        setSelectedCase(parsed[0] || {});
        setFieldErrors({});
        validationTimeoutsRef.current = {};

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // Reset errors/timers when switching selected case
    useEffect(() => {
        setFieldErrors({});

        Object.values(validationTimeoutsRef.current).forEach((t) =>
            clearTimeout(t),
        );

        validationTimeoutsRef.current = {};
    }, [selectedCase?.id]);

    // ---------- Validation logic (debounced) ----------

    const validateField = (caseId, key, rawValue, type) => {
        if (!selectedCase || caseId !== selectedCase.id) return;

        // If no type available, just clear any existing error
        if (!type) {
            setFieldErrors((prev) => {
                const copy = { ...prev };
                delete copy[key];
                return copy;
            });

            return;
        }

        let error = "";
        const trimVal = rawValue.trim();
        let parsedValue = null;

        try {
            // ----- ARRAY TYPES -----
            if (type.startsWith("array<")) {
                if (trimVal === "") {
                    error = "Value cannot be empty for array type.";
                } else {
                    parsedValue = JSON.parse(trimVal);

                    if (!Array.isArray(parsedValue)) {
                        error =
                            "Expected an array structure (e.g. [[1,2],[3,4]]).";
                    }
                }
            } else {
                // ----- PRIMITIVE TYPES -----
                if (type === "number") {
                    if (trimVal === "") {
                        error = "Expected a number.";
                    } else {
                        const num = Number(trimVal);

                        if (Number.isNaN(num)) {
                            error = "Expected a valid number.";
                        } else {
                            parsedValue = num;
                        }
                    }
                } else if (type === "boolean") {
                    if (trimVal.toLowerCase() === "true") parsedValue = true;
                    else if (trimVal.toLowerCase() === "false")
                        parsedValue = false;
                    else error = 'Expected "true" or "false".';
                } else if (type === "string" || type === "char") {
                    // treat as plain string
                    parsedValue = rawValue;

                    // extra guard: user typed something array-like
                    if (trimVal.startsWith("[") && trimVal.endsWith("]")) {
                        error =
                            "Expected a plain string, not an array-like value.";
                    }
                } else {
                    // any other primitive-ish type: just pass through
                    parsedValue = rawValue;
                }
            }
        } catch {
            error = "Invalid JSON format for array input.";
        }

        // If we parsed a value and still no error so far, run deep type-check
        if (!error && parsedValue !== null) {
            const ok = validateValueAgainstType(parsedValue, type);

            if (!ok) {
                error = "Value does not match expected type.";
            }
        }

        setFieldErrors((prev) => {
            const copy = { ...prev };
            if (error) copy[key] = error;
            else delete copy[key];
            return copy;
        });
    };

    // Add editable custom test case
    const addCase = () => {
        if (cases.length < 7) {
            let newInputs = {};

            if (cases.length > 0) {
                // copy from previous case
                const prev = cases[cases.length - 1];
                newInputs = { ...(prev.input || {}) };
            } else {
                // no prev -> use default value from type
                (visible?.arguments || []).forEach((arg) => {
                    const defVal = getDefaultValue(arg.type);

                    const uiVal =
                        Array.isArray(defVal) || typeof defVal === "object"
                            ? JSON.stringify(defVal)
                            : defVal === null || defVal === undefined
                              ? ""
                              : String(defVal);

                    newInputs[arg.name] = uiVal;
                });
            }

            const newCase = {
                id: cases.length + 1,
                input: newInputs,
                expected: "",
                editable: true,
            };

            setCases((prev) => [...prev, newCase]);
            setSelectedCase(newCase);
            setFieldErrors({});
            validationTimeoutsRef.current = {};
        }
    };

    // Update value with debounce validation
    const updateInput = (key, value, type) => {
        if (!selectedCase?.id) return;

        const caseId = selectedCase.id;

        // update UI state immediately
        setCases((prev) =>
            prev.map((c) =>
                c.id === caseId
                    ? { ...c, input: { ...c.input, [key]: value } }
                    : c,
            ),
        );

        setSelectedCase((prev) => ({
            ...prev,
            input: { ...(prev.input || {}), [key]: value },
        }));

        // debounce validate
        if (validationTimeoutsRef.current[key]) {
            clearTimeout(validationTimeoutsRef.current[key]);
        }

        validationTimeoutsRef.current[key] = setTimeout(() => {
            validateField(caseId, key, value, type);
        }, 400); // 400ms debounce
    };

    const removeCase = (id) => {
        const filtered = cases.filter((c) => c.id !== id);

        setCases(filtered);

        if (selectedCase.id === id && filtered.length > 0) {
            setSelectedCase(filtered[0]);
        } else if (!filtered.length) {
            setSelectedCase({});
        }

        setFieldErrors({});
        validationTimeoutsRef.current = {};
    };

    // ---------- Helpers to build rawInput + backend input for user testcases ----------

    // Build rawInput string from a case's input (in the same arg order)
    const buildRawInputForCase = (inputObj = {}) => {
        const args = visible?.arguments || [];

        const seen = new Set();
        const parts = [];

        for (const arg of args) {
            const name = arg.name;
            const raw = inputObj[name];

            if (raw === null || raw === undefined) continue;

            const str = String(raw).trim();

            if (seen.has(str)) continue;
            seen.add(str);

            parts.push(str);
        }

        return parts.join(" ") + "\n";
    };

    // Parse UI value (string) -> backend value according to type
    const parseValueForBackend = (rawValue, type) => {
        if (rawValue === null || rawValue === undefined) return null;

        const trimVal = String(rawValue).trim();

        // array types -> JSON parse
        if (type && type.startsWith("array<")) {
            if (trimVal === "") return [];
            try {
                const parsed = JSON.parse(trimVal);
                return parsed;
            } catch {
                // fallback: send as string if user typed non-JSON
                return trimVal;
            }
        }

        if (type === "number") {
            const num = Number(trimVal);
            return Number.isNaN(num) ? trimVal : num;
        }

        if (type === "boolean") {
            if (trimVal.toLowerCase() === "true") return true;
            if (trimVal.toLowerCase() === "false") return false;
            return trimVal;
        }

        // string / char / anything else
        return rawValue;
    };

    // Build backend-style input object from the UI input
    const buildInputForBackend = (inputObj = {}) => {
        const args = visible?.arguments || [];
        const result = {};

        args.forEach((arg, index) => {
            const name = arg.name || `arg${index + 1}`;
            const type = arg.type;
            const rawVal = inputObj[name];

            result[name] = parseValueForBackend(rawVal, type);
        });

        return result;
    };

    // Sync editable cases -> parent as `userTestcases`
    useEffect(() => {
        if (!onCustomCasesChange) return;

        const userCases = (cases || [])
            .filter((c) => c.editable) // only user-created cases
            .map((c) => {
                const backendInput = buildInputForBackend(c.input);
                const rawInput = buildRawInputForCase(c.input);

                return {
                    rawInput, // e.g. "pwwkew\n"
                    input: backendInput, // e.g. { s: "pwwkew" }
                };
            });

        onCustomCasesChange(userCases);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cases, visible, onCustomCasesChange]);

    return (
        <div className="h-full w-full flex flex-col  overflow-hidden min-h-0">
            <TestCaseNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "testcase" ? (
                // 🔽 Wrap in flex column with min-h-0 so inner overflow works
                <div className="flex-1 min-h-0 flex flex-col">
                    <TestCaseCases
                        cases={cases}
                        selectedCase={selectedCase}
                        setSelectedCase={setSelectedCase}
                        addCase={addCase}
                        removeCase={removeCase}
                    />

                    <TestCaseArguments
                        selectedCase={selectedCase}
                        updateInput={updateInput}
                        fieldErrors={fieldErrors}
                        argTypes={argTypes}
                    />
                </div>
            ) : resultMode === "submit" ? (
                <SubmitResult isRunning={isRunning} result={result} />
            ) : (
                <RunResult isRunning={isRunning} result={result} />
            )}
        </div>
    );
};

export default TestCase;

// ---------- Navbar ----------

const TestCaseNavbar = ({ activeTab, setActiveTab }) => (
    <div className="w-full gap-2 h-10 border-b border-neutral-800/30 flex shrink-0">
        <button
            className={`flex items-center gap-1 px-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "testcase"
                    ? "border-b-2 border-green-500"
                    : "text-neutral-600 hover:text-black"
            }`}
            onClick={() => setActiveTab("testcase")}
        >
            <SquareCheck size={16} className="text-green-600" />
            Testcase
        </button>

        <button
            className={`flex items-center gap-1 px-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "result"
                    ? "border-b-2 border-green-500"
                    : "text-neutral-600 hover:text-black"
            }`}
            onClick={() => setActiveTab("result")}
        >
            <Terminal size={16} className="text-green-600" />
            Test Result
        </button>
    </div>
);

// ---------- Test Case Tabs ----------

const TestCaseCases = ({
    cases,
    selectedCase,
    setSelectedCase,
    addCase,
    removeCase,
}) => (
    <div className="w-full h-14 flex items-center px-3 gap-2 overflow-x-auto whitespace-nowrap shrink-0">
        {cases.map((c) => (
            <div
                key={c.id}
                className={`text-sm flex-shrink-0 ${
                    selectedCase.id === c.id
                        ? "bg-blue-50 border border-blue-300"
                        : c.editable
                          ? "border border-gray-300"
                          : "border border-transparent"
                } rounded flex items-center cursor-pointer`}
            >
                <span
                    className={`p-1 px-1.5 ${c.editable ? "border-r border-gray-300" : ""}`}
                    onClick={() => setSelectedCase(c)}
                >
                    Case {c.id}
                </span>

                {c.editable && (
                    <button
                        onClick={() => removeCase(c.id)}
                        className="px-1 text-gray-400"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        ))}

        {cases.length < 7 && (
            <button
                onClick={addCase}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-800 rounded-md p-1"
            >
                <Plus size={16} />
            </button>
        )}
    </div>
);

// ---------- Test Case Arguments ----------

const TestCaseArguments = ({
    selectedCase,
    updateInput,
    fieldErrors,
    argTypes,
}) => {
    if (!selectedCase || !selectedCase.input) return null;

    const isEditable = !!selectedCase.editable;

    return (
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2 flex flex-col gap-3">
            {Object.entries(selectedCase.input).map(([key, value]) => {
                const error = fieldErrors[key];
                const type = argTypes?.[key];

                return (
                    <div key={key} className="flex flex-col gap-1 min-w-0">
                        <label className="text-sm font-medium text-black">
                            {key} =
                        </label>

                        <input
                            type="text"
                            value={value ?? ""}
                            disabled={!isEditable}
                            onChange={(e) =>
                                isEditable &&
                                updateInput(key, e.target.value, type)
                            }
                            className={`h-10 p-2 rounded-md border ${
                                isEditable
                                    ? error
                                        ? "border-red-400 bg-white"
                                        : "border-neutral-400 bg-white"
                                    : "border-neutral-200 bg-gray-100 cursor-not-allowed"
                            }`}
                        />

                        {error && (
                            <span className="text-xs text-red-500">
                                {error}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ---------- Shared Result Input UI (same style as testcase UI) ----------

const ResultInputUI = ({ input }) => {
    // If backend gives a raw string (e.g. "1 3\n2 [1,3] [2]")
    if (typeof input === "string" || input === null || input === undefined) {
        return (
            <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 mt-1 whitespace-pre-wrap">
                {input ?? ""}
            </pre>
        );
    }

    // If backend gives an object like { n: 2, arr: [1,3] }
    if (typeof input === "object") {
        const entries = Object.entries(input);
        if (!entries.length) {
            return (
                <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 mt-1 whitespace-pre-wrap">
                    {/* empty */}
                </pre>
            );
        }

        return (
            <div className="mt-1 flex flex-col gap-2">
                {entries.map(([key, val]) => {
                    const displayVal =
                        Array.isArray(val) || typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val);

                    return (
                        <div key={key} className="flex flex-col gap-1 min-w-0">
                            <label className="text-xs sm:text-sm font-medium text-neutral-800">
                                {key} =
                            </label>
                            <div className="h-9 px-2 rounded-md border border-neutral-300 bg-gray-50 text-[11px] sm:text-xs flex items-center overflow-x-auto">
                                <span className="whitespace-pre">
                                    {displayVal}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Fallback
    return (
        <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 mt-1 whitespace-pre-wrap">
            {String(input)}
        </pre>
    );
};

// ---------- Run Result (for runCode) ----------
const RunResult = ({ isRunning, result }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // 🔽 Always jump to last executed testcase when new result arrives
    useEffect(() => {
        if (!result) {
            setActiveIndex(0);
            return;
        }

        const payload = result?.data ?? result ?? {};
        const arr = payload?.results || [];

        if (arr.length) {
            setActiveIndex(arr.length - 1);
        } else {
            setActiveIndex(0);
        }
    }, [result]);

    if (isRunning) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center animate-pulse text-sm text-neutral-600">
                <div className="w-3/4 h-4 bg-neutral-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-neutral-200 rounded mb-2" />
                <div className="w-5/6 h-4 bg-neutral-200 rounded" />
                <p className="mt-4 text-xs text-neutral-500">
                    Running your code...
                </p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-500 px-4">
                No results yet. Run your code to see output.
            </div>
        );
    }

    // Support both: { success, data: { results: [...] } } and plain { results: [...] }
    const payload = result?.data ?? result ?? {};
    const resultsArray = payload?.results || [];

    const topError = payload?.error || payload?.errors || result?.error || null;
    const topMessage = payload?.message || null;
    const isSuccess = payload?.success;

    // Error with no per-test results
    if (
        !resultsArray.length &&
        (topError || topMessage || isSuccess === false)
    ) {
        return (
            <div className="flex-1 flex flex-col gap-3 px-4 py-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2 rounded-md border border-red-800 bg-red-50 px-3 py-2 text-red-800">
                    <AlertTriangle className="mt-0.5" size={16} />
                    <div className="space-y-1">
                        <p className="font-semibold">
                            {topMessage ||
                                "Error while compiling / running your code"}
                        </p>
                    </div>
                </div>

                {topError && (
                    <div>
                        <p className="text-[11px] sm:text-xs font-semibold text-neutral-700 mb-1">
                            Details:
                        </p>
                        <pre className="bg-neutral-900 text-neutral-100 rounded-md px-3 py-2 whitespace-pre-wrap overflow-auto">
                            {String(topError)}
                        </pre>
                    </div>
                )}
            </div>
        );
    }

    // No error and no results -> real "no testcase results"
    if (!resultsArray.length) {
        return (
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-600 px-4">
                No testcase results available.
            </div>
        );
    }

    const active = resultsArray[activeIndex] || resultsArray[0];

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="w-full flex h-14 items-center px-3 py-1.5 gap-2 border-b border-neutral-200 overflow-x-auto whitespace-nowrap shrink-0">
                {resultsArray.map((r, idx) => {
                    const isActiveTab = idx === activeIndex;
                    const passed = r.passed;
                    const hasError = !!r.error;

                    const baseClasses =
                        "text-xs sm:text-sm flex-shrink-0 rounded flex items-center cursor-pointer px-2 py-1 border gap-1.5";

                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={
                                isActiveTab
                                    ? `${baseClasses} bg-blue-50 border-blue-300`
                                    : `${baseClasses} border-gray-200 bg-white hover:bg-gray-50`
                            }
                        >
                            <span>
                                {r.source === "custom" ? "Custom" : "Case"}{" "}
                                {idx + 1}
                            </span>

                            {passed === true && (
                                <SquareCheck
                                    size={14}
                                    className="text-green-600"
                                />
                            )}

                            {passed === false && !hasError && (
                                <X size={14} className="text-red-500" />
                            )}

                            {/* no error icon here */}
                        </button>
                    );
                })}
            </div>

            {/* Selected case details */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 text-xs sm:text-sm font-mono text-neutral-800 space-y-3">
                {/* ERROR ON TOP */}
                {active.error && (
                    <div>
                        <span className="font-semibold text-red-600">
                            Error:
                        </span>
                        <pre className="bg-red-50 border border-red-200 rounded-md px-2 py-1 mt-1 whitespace-pre-wrap text-red-700">
                            {active.error}
                        </pre>
                    </div>
                )}

                <div>
                    <span className="font-semibold text-neutral-700">
                        Input:
                    </span>
                    <ResultInputUI input={active.input} />
                </div>

                <div>
                    <span className="font-semibold text-neutral-700">
                        Output:
                    </span>
                    <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 whitespace-pre-wrap">
                        {active.output ?? ""}
                    </pre>
                </div>

                {active.source !== "custom" &&
                    typeof active.expected !== "undefined" && (
                        <div>
                            <span className="font-semibold text-neutral-700">
                                Expected:
                            </span>
                            <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 mt-1 whitespace-pre-wrap">
                                {active.expected ?? "—"}
                            </pre>
                        </div>
                    )}
            </div>
        </div>
    );
};

// ---------- Submit Result (for submitCode) ----------
const SubmitResult = ({ isRunning, result }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [result]);

    if (isRunning) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center animate-pulse text-sm text-neutral-600">
                <div className="w-3/4 h-4 bg-neutral-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-neutral-200 rounded mb-2" />
                <div className="w-5/6 h-4 bg-neutral-200 rounded" />
                <p className="mt-4 text-xs text-neutral-500">
                    Evaluating your submission...
                </p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-500 px-4">
                No submission yet.
            </div>
        );
    }

    const payload = result?.data ?? result ?? {};
    const resultsArray = payload?.results || [];
    const status = payload?.status;

    const topError = payload?.error || payload?.errors || null;
    const topMessage = payload?.message || null;
    const isSuccess = payload?.success;

    if (
        !resultsArray.length &&
        (topError || topMessage || isSuccess === false)
    ) {
        return (
            <div className="flex-1 flex flex-col gap-3 px-4 py-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2 rounded-md border border-red-800 bg-red-50 px-3 py-2 text-red-800">
                    <AlertTriangle className="mt-0.5" size={16} />
                    <div className="space-y-1">
                        <p className="font-semibold">
                            {topMessage || "Submission failed to run"}
                        </p>
                    </div>
                </div>

                {topError && (
                    <div>
                        <p className="text-[11px] sm:text-xs font-semibold text-neutral-700 mb-1">
                            Details:
                        </p>
                        <pre className="bg-neutral-900 text-neutral-100 rounded-md px-3 py-2 whitespace-pre-wrap overflow-auto">
                            {String(topError)}
                        </pre>
                    </div>
                )}
            </div>
        );
    }

    if (!resultsArray.length) {
        return (
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-600 px-4">
                No testcase results available for this submission.
            </div>
        );
    }

    // visible vs hidden counts based on isHidden flag from backend
    const publicCases = resultsArray.filter((r) => !r.isHidden).length;
    const hiddenCases = resultsArray.filter((r) => r.isHidden).length;
    const totalCases = publicCases + hiddenCases;
    const passedCount = resultsArray.filter((r) => r.passed).length;

    const firstVisibleIndex = resultsArray.findIndex((r) => !r.isHidden);
    const current = resultsArray[activeIndex];
    const effectiveIndex =
        current && current.isHidden
            ? firstVisibleIndex === -1
                ? 0
                : firstVisibleIndex
            : activeIndex;

    const active = resultsArray[effectiveIndex] || resultsArray[0];
    const noVisiblePublic = publicCases === 0 && hiddenCases > 0;

    return (
        <div className="flex-1 min-h-0 flex flex-col border-t border-neutral-200">
            {/* Header: verdict + passed count */}
            <div className="px-4 py-2 border-b border-neutral-200 flex flex-col gap-1 text-xs sm:text-sm shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                        Verdict:{" "}
                        <span
                            className={
                                status === "Accepted"
                                    ? "text-green-600"
                                    : status === "Wrong Answer"
                                      ? "text-red-600"
                                      : status === "Runtime Error"
                                        ? "text-amber-600"
                                        : status === "Compile Error"
                                          ? "text-purple-600"
                                          : "text-neutral-700"
                            }
                        >
                            {status}
                        </span>
                    </span>

                    {/* ✔ Passed / Total */}
                    <span className="font-medium text-neutral-700">
                        Passed:{" "}
                        <span className="text-green-600 font-semibold">
                            {passedCount}
                        </span>{" "}
                        / {totalCases}
                    </span>
                </div>

                {/* Total testcases below verdict */}
                <span className="text-[11px] text-neutral-500">
                    Total Testcases: {totalCases}
                </span>
            </div>

            {/* Tabs row: public clickable, hidden locked */}
            <div className="w-full flex h-10 items-center px-3 py-1.5 gap-2 border-b border-neutral-200 overflow-x-auto whitespace-nowrap shrink-0">
                {resultsArray.map((r, idx) => {
                    const isHidden = !!r.isHidden;
                    const isActiveTab = idx === effectiveIndex;
                    const passed = r.passed;

                    const baseClasses =
                        "text-[11px] sm:text-xs flex-shrink-0 rounded flex items-center gap-1.5 px-2 py-1 border";

                    const StatusIcon =
                        passed === true ? (
                            <SquareCheck size={12} className="text-green-600" />
                        ) : passed === false ? (
                            <X size={12} className="text-red-500" />
                        ) : null;

                    if (isHidden) {
                        // 🔒 Hidden: Case number + tick/cross + lock, dashed + disabled
                        return (
                            <button
                                key={idx}
                                disabled
                                className={`${baseClasses} border-dashed border-neutral-600 bg-neutral-50 text-neutral-500 cursor-not-allowed`}
                            >
                                {StatusIcon}
                                <span>Case {idx + 1}</span>
                                <Lock size={12} className="opacity-90" />
                            </button>
                        );
                    }

                    // ✅ Visible: Case number + tick/cross
                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={
                                isActiveTab
                                    ? `${baseClasses} bg-blue-50 border-blue-300`
                                    : `${baseClasses} border-gray-200 bg-white hover:bg-gray-50`
                            }
                        >
                            {StatusIcon}
                            <span>Case {idx + 1}</span>
                        </button>
                    );
                })}
            </div>

            {/* Body: show only visible testcase details */}
            {noVisiblePublic ? (
                <div className="flex-1 flex items-center justify-center text-xs sm:text-sm text-neutral-500 px-4">
                    All official testcases for this problem are hidden. You can
                    see only the final verdict.
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 text-xs sm:text-sm font-mono text-neutral-800 space-y-3">
                    <div>
                        <span className="font-semibold text-neutral-700">
                            Input:
                        </span>
                        <ResultInputUI input={active.input} />
                    </div>
                    <div>
                        <span className="font-semibold text-neutral-700">
                            Your Output:
                        </span>
                        <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 whitespace-pre-wrap">
                            {active.output ?? ""}
                        </pre>
                    </div>
                    <div>
                        <span className="font-semibold text-neutral-700">
                            Expected:
                        </span>
                        <pre className="bg-neutral-50 border border-neutral-200 rounded-md p-2 mt-1 whitespace-pre-wrap">
                            {active.expected ?? "—"}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

import { Trash, X, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import CustomSelect from "../CustomSelect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";

const ConfigureArguments = ({
    close,
    initialArgs = [],
    problemId,
    problemOutputType,
}) => {
    /* =========================w
       Output Type
    ========================= */
    const [outputType, setOutputType] = useState(null);

    // Prefill output type ONLY ONCE
    useEffect(() => {
        if (problemOutputType && !outputType) {
            setOutputType({
                value: problemOutputType,
                label: problemOutputType,
            });
        }
    }, [problemOutputType, outputType]);

    /* =========================
       Arguments
    ========================= */
    const [argumentsList, setArgumentsList] = useState(() =>
        initialArgs
            .filter((a) => a?.name && a?.type)
            .map((arg) => ({
                name: arg.name,
                type:
                    typeof arg.type === "string"
                        ? { value: arg.type, label: arg.type }
                        : arg.type,
            })),
    );

    const [newArgument, setNewArgument] = useState({
        name: "",
        type: null,
    });

    const [errorMsg, setErrorMsg] = useState("");

    const queryClient = useQueryClient();

    /* =========================
       Data Type Options
    ========================= */
    const dataTypeOptions = [
        {
            label: "Primitive Types",
            options: [
                { value: "string", label: "string" },
                { value: "char", label: "char" },
                { value: "number", label: "number" },
                { value: "boolean", label: "boolean" },
            ],
        },
        {
            label: "Array Types",
            options: [
                { value: "array<string>", label: "array<string>" },
                { value: "array<char>", label: "array<char>" },
                { value: "array<number>", label: "array<number>" },
                { value: "array<boolean>", label: "array<boolean>" },
            ],
        },
        {
            label: "Nested Array",
            options: [
                {
                    value: "array<array<string>>",
                    label: "array<array<string>>",
                },
                { value: "array<array<char>>", label: "array<array<char>>" },
                {
                    value: "array<array<number>>",
                    label: "array<array<number>>",
                },
                {
                    value: "array<array<boolean>>",
                    label: "array<array<boolean>>",
                },
            ],
        },
    ];

    /* =========================
       Save Mutation
    ========================= */
    const { mutate: saveArguments, isPending } = useMutation({
        mutationFn: () =>
            apiFetch("/api/contest/admin/problem/add/arguments", {
                method: "POST",
                body: {
                    problemId,
                    output: outputType.value,
                    arguments: argumentsList.map((a) => ({
                        name: a.name,
                        type: a.type.value,
                    })),
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problem", problemId] });
            close();
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to save arguments.");
            setTimeout(() => setErrorMsg(""), 2000);
        },
    });

    /* =========================
       Handlers
    ========================= */
    const handleAddArgument = () => {
        if (!newArgument.name.trim() || !newArgument.type) {
            setErrorMsg("Please fill both argument name and type.");
            setTimeout(() => setErrorMsg(""), 2000);
            return;
        }

        setArgumentsList((prev) => {
            const index = prev.findIndex(
                (arg) => arg.name === newArgument.name.trim(),
            );

            // Update existing argument
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    type: newArgument.type,
                };
                return updated;
            }

            // Add new argument
            return [
                ...prev,
                {
                    name: newArgument.name.trim(),
                    type: newArgument.type,
                },
            ];
        });

        setNewArgument({ name: "", type: null });
    };

    const handleRemoveArgument = (index) => {
        setArgumentsList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveArguments = () => {
        if (!outputType?.value) {
            setErrorMsg("Output type is required.");
            setTimeout(() => setErrorMsg(""), 2000);
            return;
        }

        if (argumentsList.length === 0) {
            setErrorMsg("At least one argument is required.");
            setTimeout(() => setErrorMsg(""), 2000);
            return;
        }

        saveArguments();
    };

    /* =========================
       UI
    ========================= */
    return (
        <div className="h-full flex flex-col bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-black">
                    Configure Function Signature
                </h3>
                <X
                    size={16}
                    onClick={close}
                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                />
            </div>

            <p className="text-sm text-black/60 mb-3">
                Define the function output and arguments used in test cases.
            </p>

            {/* Output Type */}
            <div className="mb-8 h-8">
                <label className="block text-xs font-medium text-black mb-1">
                    Output Type <span className="text-red-500">*</span>
                </label>

                <CustomSelect
                    options={dataTypeOptions}
                    value={outputType}
                    onChange={(opt) => setOutputType(opt)}
                    placeholder="Output type"
                />
            </div>

            {/* Argument Input */}
            <div className="flex items-center gap-1.5 mb-2 h-8">
                <input
                    type="text"
                    value={newArgument.name}
                    onChange={(e) =>
                        setNewArgument((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                    placeholder="argument name"
                    className="flex-1 h-full rounded border border-gray-300 px-2 text-sm"
                />

                <div className="w-[50%] h-full">
                    <CustomSelect
                        options={dataTypeOptions}
                        value={newArgument.type}
                        onChange={(opt) =>
                            setNewArgument((prev) => ({
                                ...prev,
                                type: opt,
                            }))
                        }
                        placeholder="Data type"
                        className="h-full text-xs"
                        padding="px-2"
                    />
                </div>

                <button
                    onClick={handleAddArgument}
                    className="flex items-center justify-center h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Error */}
            {errorMsg && (
                <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                    <AlertCircle size={12} />
                    {errorMsg}
                </div>
            )}

            {/* Arguments List */}
            <div className="flex-1 overflow-y-auto mt-3">
                {argumentsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {argumentsList.map((arg, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-mono"
                            >
                                <span>{arg.name}</span>
                                <span>:</span>
                                <span className="text-purple-600 text-xs">
                                    {arg.type.label}
                                </span>
                                <Trash
                                    size={13}
                                    onClick={() => handleRemoveArgument(index)}
                                    className="cursor-pointer text-gray-500 hover:text-red-600 ml-1"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-sm text-gray-500 mt-3">
                        No arguments added yet.
                    </p>
                )}
            </div>

            {/* Save */}
            <div className="pt-3 flex justify-end">
                <button
                    onClick={handleSaveArguments}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium bg-black text-white hover:bg-black/90 disabled:opacity-70"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save"
                    )}
                </button>
            </div>
        </div>
    );
};

export default ConfigureArguments;

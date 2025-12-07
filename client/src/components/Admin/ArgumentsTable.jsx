import React, { useState } from "react";
import {
    BadgeX,
    CircleAlert,
    FilePlus,
    Save,
    Trash2,
    Loader2,
    SquarePen,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import InfoCard from "../InfoCard";
import CustomSelect from "../CustomSelect";
import { getDefaultValue, validateValueAgainstType } from "../../utils/type";
import Loader from "../Loader";

const visibilityOptions = [
    { label: "Visible", value: "visible" },
    { label: "Hidden", value: "hidden" },
];

const fetchTestcases = async (problemId) => {
    const res = await fetch("/api/contest/admin/problem/get/testcases", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ problemId }),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to fetch testcases");
    }

    const data = await res.json();
    const list = data.testcases || data.data || data;

    return Array.isArray(list) ? list : [];
};

const addTestcaseRequest = async (payload) => {
    const res = await fetch("/api/contest/admin/problem/add/testcase", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add testcase");
    }

    return res.json();
};

const updateTestcaseRequest = async (payload) => {
    const { _id, ...rest } = payload;

    const res = await fetch(`/api/contest/admin/testcase/update/${_id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rest),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update testcase");
    }

    return res.json();
};

const removeTestcaseRequest = async (testcaseId) => {
    const res = await fetch("/api/contest/admin/problem/remove/testcase", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ testcaseId }),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to remove testcase");
    }

    return res.json();
};

const TableHeader = ({ argumentsList }) => (
    <thead className="bg-neutral-200/50 font-medium uppercase text-xs text-black sticky top-0">
        <tr className="border-b border-gray-300">
            <th className="p-3 text-left">S.NO</th>

            {argumentsList.map((arg, idx) => (
                <th key={idx} className="text-left p-3">
                    {arg.name}
                    <span className="pl-1.5 text-[10px] text-gray-500">
                        ({arg.type})
                    </span>
                </th>
            ))}

            <th className="p-3 text-left">Output</th>
            <th className="p-3 text-left">Points</th>
            <th className="p-3 text-left">Visibility</th>
            <th className="p-3 text-left">Actions</th>
        </tr>
    </thead>
);

const TestcaseDisplayRow = ({
    index,
    testcase,
    argumentsList,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}) => (
    <tr key={testcase._id || index} className="border-t hover:bg-gray-50">
        <td className="text-center">{index + 1}</td>

        {argumentsList.map((arg) => (
            <td key={arg.name} className="p-2.5 text-base">
                {JSON.stringify(
                    testcase.input ? testcase.input[arg.name] : undefined,
                )}
            </td>
        ))}

        <td className="p-2.5 text-base">{JSON.stringify(testcase.output)}</td>

        <td className="p-2.5 text-base">
            {typeof testcase.points === "number" ? testcase.points : "—"}
        </td>

        <td className="p-2.5">{testcase.isHidden ? "Hidden" : "Visible"}</td>

        <td className="p-2.5 text-blue-600 cursor-pointer">
            <div className="flex max-w-fit rounded-md border border-gray-300 h-full">
                <button
                    className="p-2.5 text-green-700 border-r border-gray-300"
                    onClick={onEdit}
                    disabled={!canEdit}
                >
                    <SquarePen size={16} />
                </button>

                <button
                    className="p-2.5 text-red-600 disabled:opacity-60"
                    onClick={onDelete}
                    disabled={!canDelete}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </td>
    </tr>
);

const EditRow = ({
    row,
    index,
    argumentsList,
    errors,
    onChangeValue,
    onChangeOutput,
    onChangePoints,
    onChangeVisibility,
    onSave,
    onCancel,
    isSaving,
}) => (
    <>
        <tr className="border-t bg-gray-50">
            <td className="text-center">{index + 1}</td>

            {argumentsList.map((arg) => (
                <td key={arg.name} className="p-2.5">
                    <input
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={row.values[arg.name]}
                        onChange={(e) =>
                            onChangeValue(row.id, arg.name, e.target.value)
                        }
                    />
                </td>
            ))}

            <td className="p-1">
                <input
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={row.output}
                    onChange={(e) => onChangeOutput(row.id, e.target.value)}
                />
            </td>

            <td className="p-1">
                <input
                    type="number"
                    max={10}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={row.points}
                    onChange={(e) => onChangePoints(row.id, e.target.value)}
                    min={0}
                />
            </td>

            <td className="p-1">
                <CustomSelect
                    options={visibilityOptions}
                    value={row.visibility}
                    onChange={(v) => onChangeVisibility(row.id, v)}
                />
            </td>

            <td className="px-3 whitespace-nowrap">
                <div className="flex max-w-fit items-center justify-center rounded-md border border-gray-300 overflow-hidden">
                    <button
                        className="p-2.5 text-green-600 border-r border-gray-300"
                        onClick={() => onSave(row)}
                        disabled={isSaving}
                    >
                        <Save size={16} />
                    </button>
                    <button className="p-2.5 text-gray-700" onClick={onCancel}>
                        <BadgeX size={16} />
                    </button>
                </div>
            </td>
        </tr>

        {errors && (
            <RowError errors={errors} colSpan={argumentsList.length + 4} />
        )}
    </>
);

const AddRow = ({
    row,
    argumentsList,
    errors,
    onChangeValue,
    onChangeOutput,
    onChangePoints,
    onChangeVisibility,
    onAdd,
    onRemove,
    isAdding,
}) => (
    <>
        <tr className="border-t bg-gray-50">
            {/* No S.NO for new row */}
            <td className="text-center text-[10px] text-gray-400">-</td>

            {argumentsList.map((arg) => (
                <td key={arg.name} className="p-1">
                    <input
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={row.values[arg.name]}
                        onChange={(e) =>
                            onChangeValue(row.id, arg.name, e.target.value)
                        }
                    />
                </td>
            ))}

            <td className="p-1">
                <input
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={row.output}
                    onChange={(e) => onChangeOutput(row.id, e.target.value)}
                />
            </td>

            <td className="p-1">
                <input
                    type="number"
                    max={10}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={row.points}
                    onChange={(e) => onChangePoints(row.id, e.target.value)}
                    min={0}
                />
            </td>

            <td className="p-1">
                <CustomSelect
                    options={visibilityOptions}
                    value={row.visibility}
                    onChange={(v) => onChangeVisibility(row.id, v)}
                />
            </td>

            <td className="px-3 whitespace-nowrap">
                <div className="max-w-fit rounded-md border border-gray-300 overflow-hidden">
                    <button
                        className="p-2.5 text-green-700 border-r border-gray-300"
                        onClick={() => onAdd(row)}
                        disabled={isAdding}
                    >
                        <FilePlus size={16} />
                    </button>
                    <button
                        className="p-2.5 text-red-600"
                        onClick={() => onRemove(row.id)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>

        {errors && (
            <RowError errors={errors} colSpan={argumentsList.length + 4} />
        )}
    </>
);

const RowError = ({ errors, colSpan }) => {
    let parsed = null;

    if (errors?.api) {
        try {
            parsed = JSON.parse(errors.api);
        } catch {
            parsed = { message: "Something went wrong" };
        }
    }

    const messages = [];

    if (parsed?.message) {
        messages.push(parsed.message);
    }

    if (parsed?.errors && typeof parsed.errors === "object") {
        messages.push(...Object.values(parsed.errors));
    }

    if (!parsed && typeof errors === "object") {
        messages.push(...Object.values(errors));
    }

    return (
        <tr>
            <td colSpan={colSpan} className="p-2 text-sm text-red-700">
                <div className="flex gap-2 items-start p-1 rounded-md">
                    <CircleAlert size={14} className="mt-0.5" />
                    <div className="space-y-1">
                        {messages.map((msg, i) => (
                            <div key={i}>{msg}</div>
                        ))}
                    </div>
                </div>
            </td>
        </tr>
    );
};

const DeleteConfirmModal = ({ open, onCancel, onConfirm, isPending }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
                <h4 className="text-base font-semibold mb-2">
                    Delete testcase?
                </h4>
                <p className="text-base text-gray-600">
                    This action cannot be undone. Are you sure you want to
                    permanently delete this testcase?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        className="px-3 py-2 text-sm rounded border border-gray-300"
                        onClick={onCancel}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-3 py-2 text-sm rounded bg-red-600 text-white flex items-center gap-1 disabled:opacity-60"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending && (
                            <Loader2 size={14} className="animate-spin" />
                        )}
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ArgumentsTable = ({ argumentsList, problemId }) => {
    const [rows, setRows] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [editIndex, setEditIndex] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const queryClient = useQueryClient();

    const {
        data: testcases = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["testcases", problemId],
        queryFn: () => fetchTestcases(problemId),
        enabled: !!problemId,
    });

    const addTestcaseMutation = useMutation({
        mutationFn: addTestcaseRequest,
    });

    const updateTestcaseMutation = useMutation({
        mutationFn: updateTestcaseRequest,
    });

    const removeTestcaseMutation = useMutation({
        mutationFn: removeTestcaseRequest,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["testcases", problemId],
            });
            setDeleteTarget(null);
        },
    });

    const parseJSON = (val) => {
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    };

    const addInputs = () => {
        if (editIndex !== null) cancelEdit();

        const defaults = Object.fromEntries(
            argumentsList.map((arg) => {
                const defVal = getDefaultValue(arg.type);
                return [
                    arg.name,
                    typeof defVal === "string"
                        ? defVal
                        : JSON.stringify(defVal),
                ];
            }),
        );

        setRows([
            {
                id: Date.now() + Math.random(),
                values: defaults,
                output: "",
                points: "",
                visibility: { label: "Visible", value: "visible" },
            },
        ]);
    };

    const removeInputs = (id) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
        setRowErrors((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const updateRowValue = (id, field, value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, values: { ...r.values, [field]: value } }
                    : r,
            ),
        );
    };

    const updateRowOutput = (id, value) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, output: value } : r)),
        );
    };

    const updateRowPoints = (id, value) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, points: value } : r)),
        );
    };

    const updateRowVisibility = (id, value) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, visibility: value } : r)),
        );
    };

    const addTestcase = (row) => {
        const errors = {};

        argumentsList.forEach((arg) => {
            const val = parseJSON(row.values[arg.name]);
            if (!validateValueAgainstType(val, arg.type)) {
                errors[arg.name] = `Expected ${arg.type} for '${arg.name}'`;
            }
        });

        if (!row.output) errors["output"] = "Output cannot be empty";

        const pointsNum = Number(row.points);
        if (
            row.points === "" ||
            row.points === null ||
            row.points === undefined
        ) {
            errors["points"] = "Points are required";
        } else if (Number.isNaN(pointsNum) || pointsNum < 0) {
            errors["points"] = "Points must be a non-negative number";
        }

        if (Object.keys(errors).length > 0) {
            setRowErrors((prev) => ({ ...prev, [row.id]: errors }));
            return;
        }

        const inputObject = Object.fromEntries(
            argumentsList.map((arg) => [
                arg.name,
                parseJSON(row.values[arg.name]),
            ]),
        );

        const payload = {
            problemId,
            input: inputObject,
            output: row.output,
            isHidden: row.visibility.value === "hidden",
            points: pointsNum,
        };

        addTestcaseMutation.mutate(payload, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: ["testcases", problemId],
                });
                removeInputs(row.id);
            },
            onError: (error) => {
                setRowErrors((prev) => ({
                    ...prev,
                    [row.id]: {
                        ...(prev[row.id] || {}),
                        api: error.message || "Failed to save testcase",
                    },
                }));
            },
        });
    };

    const startEdit = (index) => {
        setEditIndex(index);
        const tc = testcases[index];

        const rowObj = {
            id: Date.now() + Math.random(),
            values: {},
            output: tc.output ?? "",
            points:
                typeof tc.points === "number"
                    ? tc.points.toString()
                    : tc.points || "",
            visibility: {
                label: tc.isHidden ? "Hidden" : "Visible",
                value: tc.isHidden ? "hidden" : "visible",
            },
            _id: tc._id,
        };

        argumentsList.forEach((arg) => {
            rowObj.values[arg.name] = JSON.stringify(
                tc.input ? tc.input[arg.name] : undefined,
            );
        });

        setRows([rowObj]);
    };

    const saveEdit = (row) => {
        const errors = {};

        argumentsList.forEach((arg) => {
            const val = parseJSON(row.values[arg.name]);
            if (!validateValueAgainstType(val, arg.type)) {
                errors[arg.name] = `Expected ${arg.type} for '${arg.name}'`;
            }
        });

        if (!row.output) errors["output"] = "Output cannot be empty";

        const pointsNum = Number(row.points);
        if (
            row.points === "" ||
            row.points === null ||
            row.points === undefined
        ) {
            errors["points"] = "Points are required";
        } else if (Number.isNaN(pointsNum) || pointsNum < 0) {
            errors["points"] = "Points must be a non-negative number";
        }

        if (Object.keys(errors).length > 0) {
            setRowErrors((prev) => ({ ...prev, [row.id]: errors }));
            return;
        }

        const inputObject = Object.fromEntries(
            argumentsList.map((arg) => [
                arg.name,
                parseJSON(row.values[arg.name]),
            ]),
        );

        const payload = {
            _id: row._id,
            problemId,
            input: inputObject,
            output: String(row.output),
            isHidden: row.visibility.value === "hidden",
            points: pointsNum,
        };

        updateTestcaseMutation.mutate(payload, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: ["testcases", problemId],
                });
                cancelEdit();
            },
            onError: (error) => {
                setRowErrors((prev) => ({
                    ...prev,
                    [row.id]: {
                        ...(prev[row.id] || {}),
                        api: error.message || "Failed to update testcase",
                    },
                }));
            },
        });
    };

    const removeTestcase = (testcaseId) => {
        if (!testcaseId) return;
        setDeleteTarget(testcaseId);
    };

    const cancelEdit = () => {
        setEditIndex(null);
        setRows([]);
    };

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                    <CircleAlert size={18} />
                    <span>{error?.message || "Failed to load testcases"}</span>
                </div>
            </div>
        );
    }

    // When no arguments, show InfoCard instead of table
    if (!argumentsList || argumentsList.length === 0) {
        return (
            <div className="w-full h-full flex flex-col">
                <div className="h-12 px-4 py-2 flex justify-between items-center">
                    <h3 className="text-md font-semibold">Testcases</h3>
                </div>

                <div className="flex-1 px-4 pb-4 flex items-center justify-center">
                    <InfoCard
                        title="No arguments defined"
                        description="This problem does not define any arguments, so there are no structured testcases to configure."
                        type="info"
                    />
                </div>
            </div>
        );
    }

    /* --------------------------------- Render -------------------------------- */

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Header */}
            <div className="h-12 px-4 py-2 flex justify-between items-center">
                <h3 className="text-md font-semibold">Testcases</h3>

                <div className="flex gap-2">
                    <button
                        onClick={addInputs}
                        className="px-3 py-1.5 bg-black text-white rounded text-sm"
                    >
                        + Add Testcase
                    </button>
                </div>
            </div>

            <div className="flex-1 py-2 px-4 overflow-auto">
                <div className="h-full">
                    <div className="border border-gray-300 overflow-visible rounded-md">
                        <table className="w-full text-sm table-fixed">
                            <colgroup>
                                <col className="w-12" />
                                {/* arguments + output + points */}
                                {[...Array(argumentsList.length + 2)].map(
                                    (_, idx) => (
                                        <col key={idx} />
                                    ),
                                )}
                                <col className="w-36" /> {/* visibility */}
                                <col className="w-36" /> {/* actions */}
                            </colgroup>

                            <TableHeader argumentsList={argumentsList} />

                            <tbody>
                                {/* No testcases yet but arguments exist */}
                                {testcases.length === 0 &&
                                    editIndex === null &&
                                    rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={
                                                    argumentsList.length + 4
                                                }
                                                className="p-4 text-center text-gray-500 text-sm"
                                            >
                                                No testcases added yet.
                                            </td>
                                        </tr>
                                    )}

                                {/* Existing testcases */}
                                {testcases.map((tc, i) => {
                                    const isEditing = editIndex === i;
                                    const editingRow = isEditing
                                        ? rows[0]
                                        : null;

                                    if (isEditing && editingRow) {
                                        const row = editingRow;

                                        return (
                                            <EditRow
                                                key={tc._id || i}
                                                row={row}
                                                index={i}
                                                argumentsList={argumentsList}
                                                errors={rowErrors[row.id]}
                                                onChangeValue={updateRowValue}
                                                onChangeOutput={updateRowOutput}
                                                onChangePoints={updateRowPoints}
                                                onChangeVisibility={
                                                    updateRowVisibility
                                                }
                                                onSave={saveEdit}
                                                onCancel={cancelEdit}
                                                isSaving={
                                                    updateTestcaseMutation.isPending
                                                }
                                            />
                                        );
                                    }

                                    return (
                                        <TestcaseDisplayRow
                                            key={tc._id || i}
                                            index={i}
                                            testcase={tc}
                                            argumentsList={argumentsList}
                                            onEdit={() => startEdit(i)}
                                            onDelete={() =>
                                                removeTestcase(tc._id)
                                            }
                                            canEdit={
                                                !updateTestcaseMutation.isPending &&
                                                !removeTestcaseMutation.isPending
                                            }
                                            canDelete={
                                                !removeTestcaseMutation.isPending
                                            }
                                        />
                                    );
                                })}

                                {/* ADD ROW (only when not editing) */}
                                {editIndex === null &&
                                    rows.map((row) => (
                                        <AddRow
                                            key={row.id}
                                            row={row}
                                            argumentsList={argumentsList}
                                            errors={rowErrors[row.id]}
                                            onChangeValue={updateRowValue}
                                            onChangeOutput={updateRowOutput}
                                            onChangePoints={updateRowPoints}
                                            onChangeVisibility={
                                                updateRowVisibility
                                            }
                                            onAdd={addTestcase}
                                            onRemove={removeInputs}
                                            isAdding={
                                                addTestcaseMutation.isPending
                                            }
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRM POPUP */}
            <DeleteConfirmModal
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() =>
                    deleteTarget && removeTestcaseMutation.mutate(deleteTarget)
                }
                isPending={removeTestcaseMutation.isPending}
            />
        </div>
    );
};

export default ArgumentsTable;

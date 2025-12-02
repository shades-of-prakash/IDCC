import { Trash, X, Plus, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import CustomSelect from "../CustomSelect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";

const ConfigureArguments = ({ close, initialArgs = [], problemId }) => {
  const [argumentsList, setArgumentsList] = useState(() =>
    initialArgs.map((arg) => ({
      name: arg.name,
      type:
        typeof arg.type === "string"
          ? { value: arg.type, label: arg.type }
          : { value: arg.type.value, label: arg.type.label },
    })),
  );

  const [newArgument, setNewArgument] = useState({ name: "", type: null });
  const [errorMsg, setErrorMsg] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const queryClient = useQueryClient();

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
        { value: "array<array<string>>", label: "array<array<string>>" },
        { value: "array<array<char>>", label: "array<array<char>>" },
        { value: "array<array<number>>", label: "array<array<number>>" },
        { value: "array<array<boolean>>", label: "array<array<boolean>>" },
      ],
    },
  ];

  const { mutate: saveArguments, isPending } = useMutation({
    mutationFn: () =>
      apiFetch("/api/contest/admin/problem/add/arguments", {
        method: "POST",
        body: {
          problemId,
          arguments: argumentsList.map((a) => ({
            name: a.name,
            type: a.type.value,
          })),
        },
      }),
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({
        queryKey: ["problem", problemId],
      });
      setTimeout(() => {
        setSaveSuccess(false);
        close();
      }, 500);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to save arguments.");
      setTimeout(() => setErrorMsg(""), 2000);
    },
  });

  const handleAddArgument = () => {
    if (!newArgument.name.trim() || !newArgument.type) {
      setErrorMsg("Please fill both name and type.");
      setTimeout(() => setErrorMsg(""), 2000);
      return;
    }
    setArgumentsList((prev) => [...prev, newArgument]);
    setNewArgument({ name: "", type: null });
  };

  const handleRemoveArgument = (index) => {
    setArgumentsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveArguments = () => {
    if (argumentsList.length === 0) {
      setErrorMsg("No arguments to save.");
      setTimeout(() => setErrorMsg(""), 2000);
      return;
    }
    saveArguments();
  };

  return (
    <div className="h-full flex flex-col bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-black">
          Configure Function Arguments
        </h3>
        <X
          size={16}
          onClick={close}
          className="text-gray-500 cursor-pointer hover:text-gray-700"
        />
      </div>

      <p className="text-sm text-black/60 mb-3">
        Define function arguments that will appear in your test cases.
      </p>

      {/* Input Row */}
      <div className="flex text-black h-8 items-center gap-1.5 mb-2">
        <input
          type="text"
          value={newArgument.name}
          onChange={(e) =>
            setNewArgument((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="name"
          className="flex-1 h-full rounded border border-gray-300 px-2 text-sm focus:border-black focus:ring-0"
        />
        <div className="w-[50%] h-full">
          <CustomSelect
            options={dataTypeOptions}
            value={newArgument.type}
            onChange={(opt) =>
              setNewArgument((prev) => ({ ...prev, type: opt }))
            }
            placeholder="Data type"
            className="h-full text-xs"
            padding="px-2"
          />
        </div>
        <button
          onClick={handleAddArgument}
          className="flex items-center justify-center h-8 w-8 rounded border border-gray-300 hover:bg-gray-100 transition"
          title="Add"
        >
          <Plus size={14} />
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
          <AlertCircle size={12} /> {errorMsg}
        </div>
      )}

      {/* Argument List */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-1 mt-3">
        {argumentsList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {argumentsList.map((arg, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-full px-3 py-1.5 text-sm font-mono text-black"
              >
                <span>{arg.name}</span>
                <span className="mx-0.5">:</span>
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

      {/* Save Button */}
      <div className="pt-3 flex justify-end">
        <button
          onClick={handleSaveArguments}
          disabled={argumentsList.length === 0 || isPending}
          className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${
            saveSuccess
              ? "bg-green-600 text-white"
              : "bg-black text-white hover:bg-black/90"
          }`}
        >
          {isPending ? (
            "Saving..."
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 text-white" /> Saved
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

import React, { useState } from "react";
import { parseType } from "../../utils/type";

/* -----------------------------------------------------
   INPUT PARSER HELPER
----------------------------------------------------- */
const parseInputString = (input, innerType) => {
  if (!input.trim()) return [];
  const items = input
    .trim()
    .split(/\s+/)
    .filter((item) => item.length > 0);

  return items.map((raw) => {
    if (innerType === "string") return raw;
    const parsedNumber = Number(raw);
    return isNaN(raw) || isNaN(parsedNumber) ? raw : parsedNumber;
  });
};

/* -----------------------------------------------------
   ARRAY INPUT COMPONENT
----------------------------------------------------- */
const ArrayInput = ({ type, value = [], onChange }) => {
  const { depth, innerType } = parseType(type); // Uses shared util
  const isPrimitiveArray = depth === 1;
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(JSON.stringify(value, null, 2));

  const addValue = () => {
    if (!input.trim()) return;
    const newItems = parseInputString(input, innerType);
    if (newItems.length === 0) return;

    if (isPrimitiveArray) {
      onChange([...value, ...newItems]);
    } else {
      onChange([...value, newItems]);
    }
    setInput("");
  };

  const handleSaveEdit = () => {
    try {
      const parsedValue = JSON.parse(editInput);
      if (!Array.isArray(parsedValue)) throw new Error("Must be an array.");
      onChange(parsedValue);
      setIsEditing(false);
    } catch (error) {
      alert(`Invalid JSON: ${error.message}`);
    }
  };

  return (
    <div className="p-3 border rounded bg-gray-50 space-y-3">
      {!isEditing ? (
        <div
          className="text-xs font-mono bg-white p-2 border rounded cursor-pointer hover:border-blue-500"
          onClick={() => {
            setEditInput(JSON.stringify(value, null, 2));
            setIsEditing(true);
          }}
          title="Click to edit raw JSON"
        >
          {JSON.stringify(value) || "[]"}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            className="w-full border p-2 rounded font-mono text-sm"
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isPrimitiveArray ? `e.g. val1 val2` : `e.g. inner items`
            }
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={addValue}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

/* -----------------------------------------------------
   TESTCASE POPUP
----------------------------------------------------- */
const TestcasePopup = ({ argumentsList, onClose, onSave }) => {
  const [values, setValues] = useState({});

  const handleChange = (name, val) => {
    setValues((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Add Testcase</h2>
        <div className="space-y-5">
          {argumentsList.map((arg) => (
            <div key={arg.name} className="space-y-1">
              <label className="font-medium text-sm">
                {arg.name}{" "}
                <span className="text-gray-500 text-xs">({arg.type})</span>
              </label>
              {arg.type.startsWith("array") ? (
                <ArrayInput
                  type={arg.type}
                  value={values[arg.name]}
                  onChange={(val) => handleChange(arg.name, val)}
                />
              ) : (
                <input
                  className="w-full border rounded p-2"
                  placeholder={`Enter ${arg.name}`}
                  onChange={(e) => handleChange(arg.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <div>
            <label className="font-medium text-sm">Expected Output</label>
            <input
              className="w-full border rounded p-2 mt-1"
              onChange={(e) => handleChange("output", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSave(values)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestcasePopup;

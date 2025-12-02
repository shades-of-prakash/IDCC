import React, { useState } from "react";

const Test = ({ argumentsList, onClose, onSave }) => {
  const [inputValues, setInputValues] = useState(() => {
    const initial = {};
    argumentsList.forEach((arg) => {
      initial[arg.name] = arg.type === "boolean" ? "false" : "";
    });
    return initial;
  });

  const [error, setError] = useState("");

  // Placeholder Generator
  const getPlaceholder = (type) => {
    const cleanType = type.replace(/\s+/g, "");

    const strPool = ["idcc", "rvr", "information", "technology", "logiq"];
    const charPool = ["i", "d", "c", "c", "r", "v", "r"];
    const numPool = [2, 3, 10, 55, 100];

    const generate = (t, idx = 0) => {
      if (t === "string") return strPool[idx % strPool.length];
      if (t === "char") return charPool[idx % charPool.length];
      if (t === "number") return numPool[idx % numPool.length];
      if (t === "boolean") return idx % 2 === 0;

      if (t.startsWith("array")) {
        const innerType = t.match(/^array<(.*)>$/)?.[1];
        if (!innerType) return [];
        return [generate(innerType, idx), generate(innerType, idx + 1)];
      }
      return "";
    };

    return JSON.stringify(generate(cleanType, 0));
  };

  const handleChange = (name, value) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Validation
  const isTypeValid = (value, type) => {
    type = type.replace(/\s+/g, "");

    if (type === "string") return typeof value === "string";
    if (type === "number") return typeof value === "number" && !isNaN(value);
    if (type === "boolean") return typeof value === "boolean";
    if (type === "char") return typeof value === "string" && value.length === 1;

    if (type.startsWith("array")) {
      if (!Array.isArray(value)) return false;
      const innerType = type.match(/^array<(.*)>$/)?.[1];
      return value.every((item) => isTypeValid(item, innerType));
    }

    return false;
  };

  const handleSave = () => {
    setError("");
    const finalObj = {};

    for (const arg of argumentsList) {
      const rawVal = inputValues[arg.name];
      const type = arg.type;
      let parsedVal = rawVal;

      try {
        if (type === "number") {
          parsedVal = Number(rawVal);
          if (isNaN(parsedVal)) throw new Error("Not a number");
        } else if (type === "boolean") {
          parsedVal = rawVal === "true";
        } else if (type.startsWith("array") || type.startsWith("object")) {
          if (!rawVal.trim()) throw new Error("Cannot be empty");
          parsedVal = JSON.parse(rawVal);
        }
      } catch (e) {
        setError(`❌ Error parsing '${arg.name}': ${e.message}`);
        return;
      }

      if (!isTypeValid(parsedVal, type)) {
        setError(`❌ Invalid type for '${arg.name}'. Expected ${type}.`);
        return;
      }

      finalObj[arg.name] = parsedVal;
    }

    // Return testcase to parent
    onSave(finalObj);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl relative">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6">Add Testcase</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md border border-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5 mb-8">
          {argumentsList.map((arg) => (
            <div key={arg.name}>
              <label className="block text-sm font-bold mb-1">
                {arg.name}
                <span className="text-gray-400 text-xs font-normal">
                  {" "}
                  ({arg.type})
                </span>
              </label>

              {arg.type === "boolean" ? (
                <select
                  value={inputValues[arg.name]}
                  onChange={(e) => handleChange(arg.name, e.target.value)}
                  className="w-full p-2.5 border rounded"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={inputValues[arg.name]}
                  onChange={(e) => handleChange(arg.name, e.target.value)}
                  placeholder={`e.g. ${getPlaceholder(arg.type)}`}
                  className="w-full p-2.5 border rounded font-mono text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-black text-white p-3 rounded-md text-lg"
        >
          Save Testcase
        </button>
      </div>
    </div>
  );
};

export default Test;

import { useState } from "react";

/* -------- Utils to detect inner array type ---------- */

const TYPE_OPTIONS = ["string", "number", "boolean", "array", "object"];

function extractArrayType(typeString) {
  const match = typeString?.match(/^array<(.*)>$/);
  return match ? match[1].trim() : null;
}

function getAllowedTypes(argType) {
  if (!argType) return TYPE_OPTIONS;

  // array<string>
  const inner = extractArrayType(argType);
  if (!inner) return TYPE_OPTIONS;

  // If inner is primitive
  if (["string", "number", "boolean", "object"].includes(inner)) {
    return [inner];
  }

  // If nested array like array<array<string>>
  if (inner.startsWith("array")) {
    return ["array"];
  }

  return TYPE_OPTIONS;
}

/* -------------------- POPUP ----------------------- */

const ArrayBuilderPopup = ({ arg, onClose, onSave }) => {
  const [items, setItems] = useState([]);

  const allowedTypes = getAllowedTypes(arg?.type);

  const updateItem = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value } : item)),
    );
  };

  const addItem = (type) => {
    const defaultValue =
      type === "string"
        ? ""
        : type === "number"
          ? 0
          : type === "boolean"
            ? false
            : type === "array"
              ? []
              : type === "object"
                ? {}
                : null;

    setItems((prev) => [...prev, { type, value: defaultValue }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNestedArraySave = (index, nestedValue) => {
    updateItem(index, nestedValue);
  };

  const handleObjectSave = (index, newObj) => {
    updateItem(index, newObj);
  };

  const saveArray = () => {
    onSave(items.map((item) => item.value));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-[480px] p-4 rounded shadow-lg">
        <h2 className="font-semibold text-lg mb-3">
          Build {arg?.name || "Array"}
          <span className="text-xs text-gray-500 ml-2">({arg?.type})</span>
        </h2>

        {/* Allowed Add Buttons */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {allowedTypes.map((t) => (
            <button
              key={t}
              className="px-2 py-1 border rounded text-xs"
              onClick={() => addItem(t)}
            >
              + {t}
            </button>
          ))}
        </div>

        {/* Items list */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="border p-2 rounded relative bg-gray-50">
              <span className="text-[10px] px-1 py-[2px] bg-gray-200 rounded uppercase">
                {item.type}
              </span>

              {item.type === "string" && (
                <input
                  className="border p-1 w-full text-sm mt-1"
                  placeholder="string value"
                  value={item.value}
                  onChange={(e) => updateItem(idx, e.target.value)}
                />
              )}

              {item.type === "number" && (
                <input
                  type="number"
                  className="border p-1 w-full text-sm mt-1"
                  value={item.value}
                  onChange={(e) => updateItem(idx, Number(e.target.value))}
                />
              )}

              {item.type === "boolean" && (
                <select
                  className="border p-1 w-full text-sm mt-1"
                  value={item.value}
                  onChange={(e) => updateItem(idx, e.target.value === "true")}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              )}

              {item.type === "array" && (
                <NestedArrayEditor
                  value={item.value}
                  expectedType={extractArrayType(arg.type)}
                  onSave={(v) => handleNestedArraySave(idx, v)}
                />
              )}

              {item.type === "object" && (
                <ObjectEditor
                  value={item.value}
                  onSave={(v) => handleObjectSave(idx, v)}
                />
              )}

              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                onClick={() => removeItem(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={saveArray}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Nested Array Editor ---------------- */
const NestedArrayEditor = ({ value, onSave }) => {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState(JSON.stringify(value));

  const saveNested = () => {
    try {
      onSave(JSON.parse(temp));
      setShow(false);
    } catch {
      alert("Invalid JSON for nested array!");
    }
  };

  return (
    <div className="mt-2">
      {!show ? (
        <button className="text-xs underline" onClick={() => setShow(true)}>
          Edit Nested Array
        </button>
      ) : (
        <div className="border p-2 rounded mt-2 bg-white">
          <textarea
            className="border p-1 w-full h-20 text-sm"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-1">
            <button className="text-xs" onClick={() => setShow(false)}>
              Close
            </button>
            <button
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
              onClick={saveNested}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Object Editor ---------------- */
const ObjectEditor = ({ value, onSave }) => {
  const [entries, setEntries] = useState(Object.entries(value || {}));

  const updateKey = (index, newKey) => {
    setEntries((prev) =>
      prev.map((pair, i) => (i === index ? [newKey, pair[1]] : pair)),
    );
  };

  const updateValue = (index, newVal) => {
    setEntries((prev) =>
      prev.map((pair, i) => (i === index ? [pair[0], newVal] : pair)),
    );
  };

  const addEntry = () => setEntries((prev) => [...prev, ["", ""]]);

  const saveObj = () => {
    const obj = {};
    for (let [k, v] of entries) obj[k] = v;
    onSave(obj);
  };

  return (
    <div className="mt-2 border p-2 rounded bg-white">
      {entries.map(([k, v], idx) => (
        <div key={idx} className="flex gap-1 mb-1">
          <input
            className="border p-1 text-xs w-1/2"
            placeholder="key"
            value={k}
            onChange={(e) => updateKey(idx, e.target.value)}
          />
          <input
            className="border p-1 text-xs w-1/2"
            placeholder="value"
            value={v}
            onChange={(e) => updateValue(idx, e.target.value)}
          />
        </div>
      ))}

      <button className="text-xs underline" onClick={addEntry}>
        + Add field
      </button>

      <div className="flex justify-end mt-1">
        <button
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
          onClick={saveObj}
        >
          Save Object
        </button>
      </div>
    </div>
  );
};

export default ArrayBuilderPopup;

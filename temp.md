import React, { useState, useEffect } from "react";
import TestcasePopup from "./Test";
import { Upload } from "lucide-react";
import Editor from "@monaco-editor/react";
import {
  validateValueAgainstType,
  buildDefaultTestcase,
} from "../../utils/type";

const ArgumentsTable = ({ argumentsList }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [testcases, setTestcases] = useState([]);
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [jsonValue, setJsonValue] = useState("");

  /* ---------------------------------------------
     SYNC EDITOR WITH STATE
     This ensures that if you add a case via the Button,
     the JSON Editor updates automatically.
  --------------------------------------------- */
  useEffect(() => {
    if (testcases.length > 0) {
      setJsonValue(JSON.stringify(testcases, null, 2));
    } else {
      // If empty, show a template so the user knows the format
      const template = [buildDefaultTestcase(argumentsList)];
      setJsonValue(JSON.stringify(template, null, 2));
    }

    console.log("e", testcases);
  }, [testcases, argumentsList]);

  /* ---------------------------------------------
     ADD SINGLE CASE (Popup)
  --------------------------------------------- */
  const handleAddTestcase = (newCase) => {
    // Appends to the list.
    // The useEffect above will catch this change and update the JSON editor.
    setTestcases((prev) => [...prev, newCase]);
    setShowPopup(false);
  };

  /* ---------------------------------------------
     VALIDATE & SAVE JSON
  --------------------------------------------- */
  const validateJsonAndApply = () => {
    try {
      const parsed = JSON.parse(jsonValue || "[]");

      if (!Array.isArray(parsed)) {
        alert("❌ JSON must be an array of testcases");
        return;
      }

      // Validate everything in the editor
      for (let i = 0; i < parsed.length; i++) {
        const tc = parsed[i];
        for (const arg of argumentsList) {
          const val = tc[arg.name];
          if (!validateValueAgainstType(val, arg.type)) {
            alert(
              `❌ Error in testcase #${i + 1}: Invalid type for '${arg.name}' (${arg.type})`,
            );
            return;
          }
        }
      }

      setTestcases(parsed);

      setShowJSONEditor(false);
    } catch (e) {
      alert("❌ Invalid JSON format");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* HEADER */}
      <div className="h-12 px-2 flex justify-between items-center">
        <h3 className="text-md font-semibold">Testcases</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJSONEditor(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-sm"
          >
            <Upload size={16} /> JSON Editor
          </button>
          <button
            onClick={() => setShowPopup(true)}
            className="px-3 py-1.5 bg-black text-white rounded text-sm"
          >
            + Add Testcase
          </button>
        </div>
      </div>

      {/* MAIN UI */}
      <div className="w-full flex h-[calc(100%-2.5rem)] gap-2 p-2">
        {/* TABLE */}
        <div className="flex-1 bg-white  rounded-md overflow-auto">
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <table className="w-full text-sm ">
              <thead className="bg-gray-100 font-medium text-gray-700 sticky top-0">
                <tr className="border-b border-gray-300">
                  {argumentsList.map((arg, idx) => (
                    <th key={idx} className="p-2 text-left">
                      {arg.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({arg.type})
                      </span>
                    </th>
                  ))}
                  <th className="p-2 text-left">Output</th>
                </tr>
              </thead>
              <tbody>
                {testcases.length === 0 ? (
                  <tr>
                    <td
                      className="p-3 text-center text-gray-600"
                      colSpan={argumentsList.length + 1}
                    >
                      No testcases yet
                    </td>
                  </tr>
                ) : (
                  testcases.map((tc, i) => {
                    console.log("s", tc);
                    return (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        {argumentsList.map((arg, idx) => (
                          <td key={idx} className="p-2 font-mono text-gray-800">
                            {typeof tc[arg.name] === "object"
                              ? JSON.stringify(tc[arg.name])
                              : String(tc[arg.name])}
                          </td>
                        ))}
                        <td className="p-2 text-gray-500 italic">
                          {JSON.stringify(tc.output) || "Pending..."}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showJSONEditor && (
          <div className="w-[36%] flex flex-col rounded-md border border-gray-300 overflow-hidden bg-white">
            <div className="h-[36px] px-2 flex items-center justify-between border-b bg-gray-50">
              <span className="font-medium text-sm">JSON Editor</span>
              <div className="flex gap-2">
                <button
                  onClick={validateJsonAndApply}
                  className="px-2 py-1 bg-black text-white rounded text-xs"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowJSONEditor(false)}
                  className="px-2 py-1 bg-gray-200 rounded text-xs"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-2  min-h-0 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={jsonValue}
                onChange={(v) => setJsonValue(v)}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  autoIndent: "brackets",
                  formatOnPaste: true,
                  formatOnType: true,
                  automaticLayout: true,
                  fontSize: 20,
                  lineNumbersMinChars: 2,
                  lineDecorationsWidth: 0,
                  glyphMargin: false,
                  tabSize: 4,
                  insertSpaces: true,
                  quickSuggestions: false,
                  folding: true,
                  detectIndentation: true,
                  trimAutoWhitespace: false,
                  lineHeight: 22,
                  fontFamily: "'Geist Mono', monospace",
                  fontLigatures: true,
                  contextmenu: false,
                  renderLineHighlight: "none",
                  renderLineHighlightOnlyWhenFocus: false,
                  suggestOnTriggerCharacters: false,
                  acceptSuggestionOnEnter: "off",
                  parameterHints: { enabled: false },
                  lightbulb: { enabled: false },
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* POPUP */}
      {showPopup && (
        <TestcasePopup
          argumentsList={argumentsList}
          onClose={() => setShowPopup(false)}
          onSave={handleAddTestcase}
        />
      )}
    </div>
  );
};

export default ArgumentsTable;

import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import RichTextEditor from "./RichTextEditor";
import CustomSelect from "../CustomSelect";
import { useContests } from "../../contexts/ContestContext";
import { Maximize, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import { AuthContext } from "../../contexts/adminAuthContext";
import { apiFetch } from "../../utils/fetch";
import { toast } from "sonner";

const JsonEditor = ({ value, onChange, placeholder }) => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const handleEditorDidMount = (editor) => {
    editor
      .getAction("editor.action.formatDocument")
      .run()
      .then(() => editor.focus());
    setIsEditorReady(true);
  };
  return (
    <div className="relative w-full border border-neutral-400 rounded-lg overflow-hidden h-full">
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Editor
        placeholder={placeholder}
        onChange={onChange}
        height="100%"
        language="json"
        theme="vs"
        fontSize={14}
        value={
          typeof value === "string" ? value : JSON.stringify(value, null, 2)
        }
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          autoIndent: "advanced",
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          lineNumbersMinChars: 2,
          glyphMargin: false,
          tabSize: 8,
          insertSpaces: true,
          quickSuggestions: true,
          folding: true,
          detectIndentation: false,
          trimAutoWhitespace: false,
          lineHeight: 22,
        }}
      />
    </div>
  );
};

const Problem = () => {
  const { admin } = useContext(AuthContext);
  const { data: contests, isLoading, isError } = useContests();
  const navigate = useNavigate();
  const location = useLocation();
  const { problem: editProblem } = location.state || {};
  const [selected, setSelected] = useState(null);

  const [fullscreenTest, setFullscreenTest] = useState(null);

  const [problem, setProblem] = useState({
    name: "",
    points: "",
    statement: "",
    visibleTests: "",
    hiddenTests: "",
    functionName: "",
    returnType: "",
    arguments: [{ name: "", type: "" }],
  });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave? Changes may not be saved.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (editProblem) {
      setProblem({
        ...editProblem,
        visibleTests: JSON.stringify(editProblem.visibleTests || [], null, 2),
        hiddenTests: JSON.stringify(editProblem.hiddenTests || [], null, 2),
      });
      setSelected({
        value: editProblem.contestId,
        label: editProblem.contestName || "Contest",
      });
    }
  }, [editProblem]);

  const handleChange = (field, value) =>
    setProblem((prev) => ({ ...prev, [field]: value }));

  const addArgument = () =>
    handleChange("arguments", [...problem.arguments, { name: "", type: "" }]);

  const removeArgument = (idx) =>
    handleChange(
      "arguments",
      problem.arguments.filter((_, i) => i !== idx),
    );

  const updateArgument = (idx, field, val) => {
    const newArgs = [...problem.arguments];
    newArgs[idx][field] = val;
    handleChange("arguments", newArgs);
  };

  const handleSubmit = async () => {
    if (!problem.name.trim()) {
      toast.error("Problem Name is required!");
      return;
    }
    if (!problem.points) {
      toast.error("Points are required!");
      return;
    }
    if (!problem.statement.trim()) {
      toast.error("Problem Statement is required!");
      return;
    }
    if (!problem.functionName.trim()) {
      toast.error("Function Name is required!");
      return;
    }
    if (!problem.returnType.trim()) {
      toast.error("Return Type is required!");
      return;
    }
    if (!selected) {
      toast.error("Please select a contest!");
      return;
    }
    // Check each argument
    for (let i = 0; i < problem.arguments.length; i++) {
      const arg = problem.arguments[i];
      if (!arg.name.trim()) {
        toast.error(`Argument ${i + 1} Name is required!`);
        return;
      }
      if (!arg.type.trim()) {
        toast.error(`Argument ${i + 1} Type is required!`);
        return;
      }
    }
    let visibleTestsArr = [];
    let hiddenTestsArr = [];

    try {
      visibleTestsArr = JSON.parse(problem.visibleTests || "[]");
    } catch {
      toast.error("Visible tests JSON is invalid!");
      return;
    }

    try {
      hiddenTestsArr = JSON.parse(problem.hiddenTests || "[]");
    } catch {
      toast.error("Hidden tests JSON is invalid!");
      return;
    }

    const problemToSubmit = {
      ...problem,
      visibleTests: visibleTestsArr,
      hiddenTests: hiddenTestsArr,
      submittedBy: admin?.id || null,
      contestId: selected?.value || null,
    };

    try {
      if (editProblem?._id) {
        await apiFetch(`/api/contest/admin/problem/update/${editProblem._id}`, {
          method: "PUT",
          body: problemToSubmit,
        });

        toast.success("Problem updated successfully!", {
          action: {
            label: "Go to Dashboard",
            onClick: () => navigate("/admin"),
          },
        });
      } else {
        await apiFetch(`/api/contest/admin/problem/new`, {
          method: "POST",
          body: problemToSubmit,
        });

        toast.success("Problem created successfully!", {
          action: {
            label: "Dashboard",
            onClick: () => navigate("/admin"),
          },
        });
      }
    } catch (error) {
      console.error("Error submitting problem:", error);
      toast.error("Failed to submit problem");
    }
  };

  if (isLoading) return <p>Loading contests...</p>;
  if (isError) return <p>Error loading contests.</p>;
  if (!contests || contests.length === 0) return <p>No contests available.</p>;

  const options = contests.map((c) => ({ value: c._id, label: c.name }));

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="w-full h-16 flex justify-between px-4 border-b border-neutral-300 bg-white">
        <div className="w-1/2 flex flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-900">
            {editProblem ? "Edit Problem" : "Add New Problem"}
          </h1>
          <p className="text-gray-600 text-xs">
            {editProblem
              ? "Modify details of the existing coding problem."
              : "Create and configure a new coding problem."}
          </p>
        </div>
        <div className="w-1/2 flex items-center justify-end gap-2">
          <div className="w-64">
            <CustomSelect
              options={options}
              value={selected}
              onChange={setSelected}
              placeholder="Select contest"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="p-2.5 rounded-md bg-black hover:bg-black/90 text-white font-medium"
          >
            {editProblem ? "Update Problem" : "Submit Problem"}
          </button>
        </div>
      </div>

      <div className="w-full h-[calc(100%-4rem)] flex">
        <div className="h-full w-[calc(100%-24rem)] flex flex-col">
          <div className="h-14  flex items-center px-2 py-1 gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder=" "
                value={problem.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="peer w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-px focus:ring-black focus:border-black transition"
              />
              <label className="absolute left-2 px-1 bg-white text-gray-500 text-xs transition-all peer-placeholder-shown:top-2 peer-focus:-top-2 peer-focus:text-black peer-focus:text-xs">
                Problem Name
              </label>
            </div>
            <div className="w-32 relative">
              <input
                type="number"
                min="0"
                placeholder=" "
                value={problem.points}
                onChange={(e) => handleChange("points", e.target.value)}
                className="peer w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-px focus:ring-black focus:border-black transition"
              />
              <label className="absolute left-2 px-1 bg-white text-gray-500 text-xs transition-all peer-placeholder-shown:top-2 peer-focus:-top-2 peer-focus:text-black peer-focus:text-xs">
                Points
              </label>
            </div>
          </div>
          <div className="h-[calc(100%-3.5rem)] px-2 pb-2">
            <RichTextEditor
              value={problem.statement}
              contestId={selected?.value ?? ""}
              onChange={(val) => handleChange("statement", val)}
            />
          </div>
        </div>

        {/* Right side (function + tests) */}
        <div className="h-full w-[24rem] py-1 pr-1 pt-0">
          <div className="w-full h-full border-l border-gray-200 text-black p-2 flex flex-col gap-3 overflow-y-auto">
            {/* Function signature */}
            <div className="overflow-y-auto h-[194px] flex flex-col gap-3 p-2 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                Function Signature
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Function Name
                  </label>
                  <input
                    type="text"
                    value={problem.functionName}
                    onChange={(e) =>
                      handleChange("functionName", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g., addNumbers"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Return Type
                  </label>
                  <input
                    type="text"
                    value={problem.returnType}
                    onChange={(e) => handleChange("returnType", e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g., int, string"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">
                    Arguments
                  </label>
                  <button
                    onClick={addArgument}
                    className="text-xs px-3 py-1 rounded bg-black/90 hover:bg-black text-white font-medium transition"
                  >
                    + Add Argument
                  </button>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {problem.arguments.map((arg, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white">
                      <input
                        type="text"
                        value={arg.type}
                        onChange={(e) =>
                          updateArgument(idx, "type", e.target.value)
                        }
                        className="w-1/2 px-2 py-1.5 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 outline-none"
                        placeholder="Type (e.g., int)"
                      />
                      <input
                        type="text"
                        value={arg.name}
                        onChange={(e) =>
                          updateArgument(idx, "name", e.target.value)
                        }
                        className="w-1/2 px-2 py-1.5 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 outline-none"
                        placeholder="Name (e.g., num)"
                      />
                      {problem.arguments.length > 1 && (
                        <button
                          onClick={() => removeArgument(idx)}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded transition"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test cases */}
            <div className="flex-1 flex flex-col gap-1">
              {["visible", "hidden"].map((type) => (
                <div key={type} className="h-1/2 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-neutral-800">
                      {type === "visible"
                        ? "Visible Test Cases"
                        : "Hidden Test Cases"}
                    </label>
                    <div className="flex gap-1 items-center">
                      <span
                        className={`text-xs px-2 py-0.5 ${
                          type === "visible"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        } rounded-full font-medium`}
                      >
                        JSON Format
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 ${
                          type === "visible"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        } rounded-full font-medium`}
                      >
                        {type === "visible" ? "Public" : "Private"}
                      </span>
                      <button
                        onClick={() => setFullscreenTest(type)}
                        className="ml-1 p-1 rounded hover:bg-neutral-200 transition-all"
                        title="Fullscreen"
                      >
                        <Maximize size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <JsonEditor
                      value={
                        type === "visible"
                          ? problem.visibleTests
                          : problem.hiddenTests
                      }
                      onChange={(val) =>
                        handleChange(
                          type === "visible" ? "visibleTests" : "hiddenTests",
                          val,
                        )
                      }
                      placeholder=""
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen JSON Modal */}
      {fullscreenTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-[800px] h-[600px] bg-white rounded shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-neutral-800 gap-1.5 flex items-center">
                {fullscreenTest === "visible"
                  ? "Visible Test Cases"
                  : "Hidden Test Cases"}
              </h2>
              <button
                onClick={() => setFullscreenTest(null)}
                className="top-2 right-2 p-1 rounded hover:bg-neutral-200 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <JsonEditor
              value={
                fullscreenTest === "visible"
                  ? problem.visibleTests
                  : problem.hiddenTests
              }
              onChange={(val) =>
                handleChange(
                  fullscreenTest === "visible" ? "visibleTests" : "hiddenTests",
                  val,
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Problem;

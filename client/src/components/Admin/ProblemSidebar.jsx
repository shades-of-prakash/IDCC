import React, { useState } from "react";
import { Maximize, X } from "lucide-react";
import Editor from "@monaco-editor/react";

// JsonEditor Component
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
        value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
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
          lineDecorationsWidth: 0,
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

// ProblemSidebar Component
const ProblemSidebar = ({
  functionName,
  returnType,
  arguments: args,
  visibleTests,
  hiddenTests,
  onFunctionNameChange,
  onReturnTypeChange,
  onArgumentsChange,
  onVisibleTestsChange,
  onHiddenTestsChange,
  onSubmitQuestion,
  currentQ,
}) => (
  <div className="h-full w-[24rem] py-1 pr-1 pt-0">
    <div className="w-full h-full border border-neutral-800/30 text-black rounded p-4 flex flex-col gap-3 overflow-y-auto">
      
      {/* Function Signature Section */}
      <FunctionSignatureSection
        functionName={functionName}
        returnType={returnType}
        args={args}
        onFunctionNameChange={onFunctionNameChange}
        onReturnTypeChange={onReturnTypeChange}
        onArgumentsChange={onArgumentsChange}
      />

      {/* Visible Test Cases */}
      <TestCasesSection
        title="Visible Test Cases"
        description="Shown to participants during contest. Use for sample test cases."
        formatColor="bg-blue-100 text-blue-700"
        formatText="JSON Format"
        value={visibleTests}
        onChange={onVisibleTestsChange}
        placeholder='[{"input": "1 2", "output": "3"}]'
      />

      {/* Hidden Test Cases */}
      <TestCasesSection
        title="Hidden Test Cases"
        description="Hidden from participants. Used for final evaluation."
        formatColor="bg-amber-100 text-amber-700"
        formatText="JSON Format"
        value={hiddenTests}
        onChange={onHiddenTestsChange}
        placeholder='[{"input": "100 200", "output": "300"}]'
      />

      {/* Submit */}
      <button
        onClick={onSubmitQuestion}
        className="w-full py-2 rounded bg-green-500 hover:bg-green-600 text-white font-medium"
      >
        Submit Question {currentQ + 1}
      </button>
    </div>
  </div>
);

// Function Signature Section
const FunctionSignatureSection = ({
  functionName,
  returnType,
  args,
  onFunctionNameChange,
  onReturnTypeChange,
  onArgumentsChange,
}) => {
  const addArgument = () => onArgumentsChange([...args, { name: "", type: "" }]);
  const removeArgument = (idx) => onArgumentsChange(args.filter((_, i) => i !== idx));
  const updateArgument = (idx, field, val) => {
    const newArgs = [...args];
    newArgs[idx][field] = val;
    onArgumentsChange(newArgs);
  };

  return (
    <div className="flex flex-col gap-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
        Function Signature
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Function Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="e.g., addNumbers"
            value={functionName}
            onChange={(e) => onFunctionNameChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Return Type</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="e.g., int, string"
            value={returnType}
            onChange={(e) => onReturnTypeChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">Arguments</label>
          <button
            onClick={addArgument}
            className="text-xs px-3 py-1 rounded bg-black/90 hover:bg-black text-white font-medium transition"
          >
            + Add Argument
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {args.map((arg, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 outline-none"
                  placeholder="Type (e.g., int)"
                  value={arg.type}
                  onChange={(e) => updateArgument(idx, "type", e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 outline-none"
                  placeholder="Name (e.g., num)"
                  value={arg.name}
                  onChange={(e) => updateArgument(idx, "name", e.target.value)}
                />
              </div>
              {args.length > 1 && (
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
  );
};

// Test Cases Section
const TestCasesSection = ({ title, description, formatColor, formatText, value, onChange, placeholder }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-800">{title}</label>
          <div className="flex gap-1 items-center">
            <span className={`text-xs px-2 py-0.5 ${formatColor} text-neutral-700 rounded-full font-medium`}>{formatText}</span>
            <span className={`text-xs px-2 py-0.5 ${formatColor} text-neutral-700 rounded-full font-medium`}>
              {title === "Visible Test Cases" ? "Public" : "Private"}
            </span>
            <button onClick={() => setIsFullscreen(true)} className="ml-1 p-1 rounded hover:bg-neutral-200 transition-all" title="Fullscreen">
              <Maximize size={18} />
            </button>
          </div>
        </div>
        <div className="h-[134px] w-full">
          <JsonEditor value={value} onChange={onChange} placeholder={placeholder} />
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-[800px] h-[600px] bg-white rounded shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-neutral-800 gap-1.5 flex items-center">{title}</h2>
              <button onClick={() => setIsFullscreen(false)} className="top-2 right-2 p-1 rounded hover:bg-neutral-200 transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="relative flex-1">
              <JsonEditor value={value} onChange={onChange} placeholder={placeholder} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemSidebar;

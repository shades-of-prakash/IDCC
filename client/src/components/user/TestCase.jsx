import { useState, useEffect } from "react";
import { SquareCheck, Terminal, Plus, X } from "lucide-react";

const TestCase = ({ visible, activeTab, setActiveTab, isRunning, result }) => {
  // Helper to parse the input into argument fields
  const parseCases = () => {
    if (!visible?.visibleTests?.length) return [];
    const args = visible?.arguments || [];

    return visible.visibleTests.map((c, i) => {
      // Split input string by space or newline
      const inputs = c.input.trim().split(/\n+/);

      const argInputs = {};
      args.forEach((arg, index) => {
        argInputs[arg.name || `arg${index + 1}`] = inputs[index] || "";
      });

      return {
        id: i + 1,
        input: argInputs,
        expected: c.output,
        editable: false,
      };
    });
  };

  const [cases, setCases] = useState(parseCases());
  const [selectedCase, setSelectedCase] = useState(() => parseCases()[0] || {});

  // Re-parse whenever visible problem changes
  useEffect(() => {
    const parsed = parseCases();
    setCases(parsed);
    setSelectedCase(parsed[0] || {});
  }, [visible]);

  const addCase = () => {
    if (cases.length < 7) {
      const blankInputs = {};
      (visible?.arguments || []).forEach((arg) => (blankInputs[arg.name] = ""));
      const newCase = {
        id: cases.length + 1,
        input: blankInputs,
        expected: "",
        editable: true,
      };
      setCases([...cases, newCase]);
      setSelectedCase(newCase);
    }
  };

  const updateInput = (key, value) => {
    setCases(
      cases.map((c) =>
        c.id === selectedCase.id
          ? { ...c, input: { ...c.input, [key]: value } }
          : c,
      ),
    );
  };

  const removeCase = (id) => {
    const filtered = cases.filter((c) => c.id !== id);
    setCases(filtered);
    if (selectedCase.id === id && filtered.length > 0) {
      setSelectedCase(filtered[0]);
    }
  };

  return (
    <div className="h-full w-full flex flex-col border border-gray-300 rounded-lg overflow-hidden">
      <TestCaseNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "testcase" ? (
        <>
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
          />
        </>
      ) : (
        <TestResult isRunning={isRunning} result={result} />
      )}
    </div>
  );
};

export default TestCase;

// ---------- Navbar ----------
const TestCaseNavbar = ({ activeTab, setActiveTab }) => (
  <div className="w-full gap-2 h-10 border-b border-neutral-800/30 flex">
    <button
      className={`flex items-center gap-1 px-3 text-sm font-medium transition-colors ${
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
      className={`flex items-center gap-1 px-3 text-sm font-medium transition-colors ${
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
  <div className="w-full h-14 flex items-center px-3 gap-2 overflow-x-auto">
    {cases.map((c) => (
      <div
        key={c.id}
        className={`text-sm rounded h-[30px] px-1.5 flex items-center gap-1 cursor-pointer ${
          selectedCase.id === c.id
            ? "bg-blue-50 border border-blue-300"
            : "hover:bg-neutral-200/50"
        }`}
      >
        <span onClick={() => setSelectedCase(c)}>Case {c.id}</span>
        {c.editable && (
          <button
            onClick={() => removeCase(c.id)}
            className="ml-1 text-red-500 hover:text-red-700"
          >
            <X size={14} />
          </button>
        )}
      </div>
    ))}
    {cases.length < 7 && (
      <button
        onClick={addCase}
        className="text-neutral-400 hover:text-neutral-800 rounded-md p-1"
      >
        <Plus size={16} />
      </button>
    )}
  </div>
);

// ---------- Test Case Arguments ----------
const TestCaseArguments = ({ selectedCase, updateInput }) => {
  if (!selectedCase || !selectedCase.input) return null;

  return (
    <div className="flex-1 overflow-auto px-3 pb-2 flex flex-col gap-3">
      {Object.entries(selectedCase.input).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1 min-w-0">
          <label className="text-sm font-medium text-black">{key}</label>
          <input
            type="text"
            value={value}
            disabled={!selectedCase.editable}
            onChange={(e) => updateInput(key, e.target.value)}
            className={`h-10 p-2 rounded-md border ${
              selectedCase.editable
                ? "border-neutral-400 bg-white"
                : "border-neutral-200 bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>
      ))}

      {"expected" in selectedCase && (
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-sm font-medium text-black">
            Expected Output
          </label>
          <input
            type="text"
            value={selectedCase.expected}
            disabled
            className="h-10 p-2 rounded-md border border-neutral-200 bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
};

// ---------- Test Result ----------
const TestResult = ({ isRunning, result }) => {
  if (isRunning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-pulse text-sm text-neutral-600">
        <div className="w-3/4 h-4 bg-neutral-200 rounded mb-2" />
        <div className="w-1/2 h-4 bg-neutral-200 rounded mb-2" />
        <div className="w-5/6 h-4 bg-neutral-200 rounded" />
        <p className="mt-4 text-xs text-neutral-500">Running your code...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-2 text-sm font-mono text-neutral-800">
      {result ? (
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        <p className="text-neutral-500">
          No results yet. Run your code to see output.
        </p>
      )}
    </div>
  );
};

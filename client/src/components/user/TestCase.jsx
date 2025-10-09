import { useState } from "react";
import { SquareCheck, Terminal, Plus, X } from "lucide-react";

const TestCase = () => {
  const sampleCases = [
    { id: 1, input: { name: "John", age: "30" ,gender:"male",no:"no",yes:"no"}, editable: false },
    { id: 2, input: { name: "Alice", age: "25" ,gender:"male",no:"no",yes:"no"}, editable: false },
    { id: 3, input: { name: "Bob", age: "40",gender:"male" ,no:"no",yes:"no"}, editable: false },
  ];

  const [cases, setCases] = useState(sampleCases);
  const [selectedCase, setSelectedCase] = useState(sampleCases[0]);

  const addCase = () => {
    if (cases.length < 7) {
      const newCase = {
        id: cases.length + 1,
        input: { ...selectedCase.input }, 
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
          : c
      )
    );
  };

  const removeCase = (id) => {
    const filteredCases = cases.filter((c) => c.id !== id);
    setCases(filteredCases);
    if (selectedCase.id === id && filteredCases.length > 0) {
      setSelectedCase(filteredCases[0]);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col gap-2 border border-gray-300 rounded-lg">
      <TestCaseNavbar />
      <TestCaseCases
        cases={cases}
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
        addCase={addCase}
        removeCase={removeCase}
      />
    <TestCaseArguments selectedCase={selectedCase} updateInput={updateInput} />
    </div>
  );
};

export default TestCase;

const TestCaseNavbar = () => (
  <div className="w-full h-10">
    <div className="w-full h-full flex gap-1 border-b border-neutral-800/30">
      <div className="flex p-1 items-center">
        <div className="p-2 flex items-center gap-1">
          <SquareCheck size={16} className="text-green-600" />
          <span>Testcase</span>
        </div>
        <div className="w-px h-4 bg-neutral-800/30" />
        <div className="p-2 flex items-center gap-1">
          <Terminal size={16} className="text-green-600" />
          <span>Test Result</span>
        </div>
      </div>
    </div>
  </div>
);

const TestCaseCases = ({ cases, selectedCase, setSelectedCase, addCase, removeCase }) => (
  <div className="w-full h-10 overflow-hidden px-3">
    <div className="flex w-full gap-2">
      {cases.map((c) => (
        <div
          key={c.id}
          className={`text-sm rounded-md px-2 py-1 flex items-center gap-1 cursor-pointer ${
            selectedCase.id === c.id ? "bg-blue-200" : "hover:bg-neutral-200/50"
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
          className="text-neutral-400 hover:text-neutral-800 rounded-md p-1 flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  </div>
);


const TestCaseArguments = ({ selectedCase, updateInput }) => {
  return (
    <div className="w-full flex-1 min-h-0 overflow-auto  px-3 pb-2 flex flex-col gap-3">
      {Object.entries(selectedCase.input).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1 min-w-0">
          <label className="text-sm font-medium text-black">{key}</label>
          <input
            type="text"
            value={value}
            disabled={!selectedCase.editable}
            onChange={(e) => updateInput(key, e.target.value)}
            className={`h-10 p-2 rounded-md border border-neutral-900 ${
              selectedCase.editable ? "bg-white" : "bg-gray-200 cursor-not-allowed"
            }`}
          />
        </div>
      ))}
    </div>
  );
};

import { List, Play, Send } from "lucide-react";

const ProblemNavbar = ({
  toggle,
  handlePrevious,
  handleNext,
  handleRunCode,
  handleSubmitCode, // NEW
}) => {
  return (
    <div className="w-full h-12 flex items-center justify-between p-2 pt-3 bg-white">
      <div className="flex gap-2 px-2 pl-0">
        <button
          onClick={toggle}
          className="flex gap-2 items-center bg-neutral-200/40 px-2 py-1 rounded-md hover:bg-neutral-300/70 transition"
        >
          <List size={16} />
          <span>Problem List</span>
        </button>
      </div>

      <div className="flex gap-1 ml-8">
        <button
          onClick={handleRunCode}
          className="flex bg-neutral-200/40 border border-gray-200 p-3 rounded-s-md items-center hover:bg-neutral-300/70 transition"
        >
          <Play size={16} />
        </button>
        <button
          onClick={handleSubmitCode}
          className="flex gap-2 items-center border border-gray-200 bg-neutral-200/40 p-2 rounded-e-md hover:bg-neutral-300/70 transition"
        >
          <Send size={16} className="text-green-600" />
          <span>Submit</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-neutral-100/10"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-neutral-100/10"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProblemNavbar;

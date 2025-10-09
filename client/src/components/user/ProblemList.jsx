import React from "react";
import { List } from "lucide-react";

const ProblemList = ({ isOpen, toggle, problems, active, setActive }) => {
  return (
    <>
      <div
        onClick={toggle}
        className={`fixed top-12 left-0 w-full h-[calc(100%-3rem)] bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-12 left-0 h-[calc(100%-3rem)] w-[450px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b p-3">
          <div className="flex gap-1 items-center">
            <List size={16} />
            <h2 className="font-semibold">Problem List</h2>
          </div>
          <button
            onClick={toggle}
            className="px-2 py-1 hover:bg-neutral-200 rounded"
          >
            ✕
          </button>
        </div>

        <div className="p-3 overflow-y-auto h-full flex flex-col gap-2">
          {problems.map((problem, i) => (
            <div
              key={problem.id}
              onClick={() => {
                setActive(i);
                toggle();
              }}
              className={`flex items-center justify-between gap-1 p-2 rounded cursor-pointer transition ${
                active === i
                  ? "bg-blue-100 border border-blue-400"
                  : "hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{i + 1}.</span>
                <span>{problem.slug}</span>
              </div>
              <div className="flex gap-1 text-sm text-gray-600">
                <span>{problem.points}</span>
                <span>pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProblemList;

import React from "react";
import { SquarePlus } from "lucide-react";

const ContestNavbar = ({ toggle }) => {
  return (
    <div className="w-full h-full  text-black px-1">
      <div className="w-full h-full flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Create Contest</h1>
          <p className="text-sm text-neutral-700">
            Set up a new contest with details, rules, and deadlines.
          </p>
        </div>

        <button
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2 bg-black/90 text-white  font-medium rounded hover:bg-black"
        >
          <SquarePlus size={16} /> Create Contest
        </button>
      </div>
    </div>
  );
};

export default ContestNavbar;

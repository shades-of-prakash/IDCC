import React from "react";
import CustomSelect from "../CustomSelect.jsx";

const ProblemHeader = ({ options, selected, setSelected, isLoading, isError }) => {
  return (
    <div className="w-full h-16 bg-white border border-gray-200 flex items-center justify-between px-4">
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900">Create Problem</span>
        <span className="text-sm text-gray-600">
          This section allows you to add a new problem to the contest
        </span>
      </div>

      <div className="w-64">
        <CustomSelect
          options={options}
          value={selected}
          onChange={setSelected}
          placeholder={isLoading ? "Loading contests..." : "Select context"}
          label=""
          loading={isLoading}
          disabled={isError}
        />
      </div>
    </div>
  );
};

export default ProblemHeader;

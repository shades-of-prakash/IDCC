import React, { useState } from "react";
import { X, Trash, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import InfoCard from "../InfoCard";
import Loader from "../Loader";

const AddedProblemsList = ({ close, contestId }) => {
  const [selectedProblem, setSelectedProblem] = useState(null);

  const {
    data: rawProblems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["finalized-problems", contestId],
    queryFn: async () =>
      apiFetch(
        `/api/contest/admin/getFinalizedProblemsByContest?contestId=${contestId}`,
      ),
    enabled: !!contestId,
  });

  const problems = rawProblems.map((problem, index) => ({
    ...problem,
    sno: index + 1,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gap-1.5 bg-black bg-opacity-50">
      <div className="bg-white rounded-md shadow-lg w-[600px] h-[600px] flex flex-col gap-1 transition-all duration-300">
        <div className="flex justify-between border-b border-t-slate-800 px-4 py-3">
          <div className="flex flex-col">
            <h1 className="text-base font-semibold">Problems List</h1>
            <span className="text-sm text-gray-600">
              List of finalized problems in this contest
            </span>
          </div>
          <button
            className="text-slate-500 hover:text-slate-800"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>

        <div className="w-full h-[calc(100%-7rem)] overflow-auto p-3">
          {isLoading ? (
            <Loader className="h-full" />
          ) : isError ? (
            <InfoCard
              title="Failed to load problems"
              description="Something went wrong while fetching the problems. Please try again."
            />
          ) : problems.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <table className="min-w-full">
                <thead className="uppercase text-xs">
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-4 text-left w-12">Sno</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Points</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {problems.map((problem, index) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedProblem(problem)}
                      className="transition-colors border-t  hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                      <td className="py-3 px-4">{problem.name}</td>
                      <td className="py-3 px-4">{problem.points}</td>

                      <td className="py-3  px-4 text-center flex items-center justify-center">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center bg-white justify-center gap-1 rounded-s-md border border-gray-300 border-r-0 hover:bg-red-50 hover:text-red-900 text-black px-3 py-2 text-sm transition"
                        >
                          <Trash size={16} />
                          <span className="font-medium m-0">Remove</span>
                        </button>
                        <button
                          onClick={() => setSelectedProblem(problem)}
                          className={`flex  items-center justify-center gap-1 rounded-e-md  text-black px-3 py-2.5 text-sm transition ${selectedProblem && selectedProblem.sno == index + 1 ? "bg-blue-50 border border-blue-300" : "bg-white border border-gray-300 hover:bg-neutral-200"}`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <InfoCard
              title="No finalized problems found!"
              description="You haven’t finalized any problems for this contest yet. Finalized problems will appear here once added."
            />
          )}
        </div>
      </div>

      <div
        className={`bg-white rounded-md shadow-lg overflow-hidden h-[600px] flex flex-col gap-1 transition-all duration-300 ease-in-out ${
          selectedProblem ? "w-[650px] opacity-100" : "w-0 opacity-0"
        }`}
      >
        {selectedProblem && (
          <div className="bg-white rounded-md p-2 w-full h-full flex flex-col gap-1">
            <div className="flex justify-between items-center pb-2 px-2">
              <h2 className="font-semibold text-gray-700">
                {selectedProblem.name}
              </h2>
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* <div
              className="text-gray-600 preview space-y-3 leading-6 w-full bg-neutral-100/30 h-full border border-gray-200 p-3 rounded-md text-base"
              dangerouslySetInnerHTML={{
                __html:
                  selectedProblem.statement || "<p>No statement available.</p>",
              }}
            ></div>*/}

            <div className="overflow-y-auto text-gray-600 preview space-y-3 leading-6 w-full bg-neutral-100/60 h-full border border-gray-200 p-3 rounded-md text-base">
              <div
                className="prose prose-neutral max-w-none
                           [&_p]:mb-3
                           [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6
                           [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6
                           [&_li]:my-1
                           [&_pre]:whitespace-pre-wrap
                           [&_*]:break-words
                           [&_img]:w-[420px] [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-10
                           "
                dangerouslySetInnerHTML={{ __html: selectedProblem.statement }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddedProblemsList;

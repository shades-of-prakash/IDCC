import React ,{ useState }from "react";
import { useParams } from "react-router";
import { Plus,Fullscreen,X} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";

const AddProblem = () => {
  const { contestId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contest-all-problems-to-add", contestId],
    queryFn: () =>
      apiFetch(
        `/api/contest/admin/getAllProblemsOfContest?contestId=${contestId}`
      ),
    enabled: !!contestId,
  });

  const contestDetails = data?.contestDetails;
  const problems = data?.problems || [];


  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [selectedProblem, setSelectedProblem] = useState(null);

  const openModal = (type, problem) => {
    setModalType(type);
    setSelectedProblem(problem);
    setModalOpen(true);
  };


  const closeModal = () => {
    setModalOpen(false);
    setSelectedProblem(null);
    setModalType(null);
  };

  if (isLoading)
    return <div className="p-4 text-gray-600">Loading contest problems...</div>;
  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Contest Info */}

      {/* Problems Header */}
      <div className="w-full px-2 h-16  text-black flex items-center justify-between text-lg border-b border-gray-200">
        <div className="w-1/2  flex flex-col">
          <span className="font-semibold">Problems List</span>
          <span className="text-sm text-gray-600">
            Problems added by volunteers and coordinators.
          </span>
        </div>
        {contestDetails && (
          <div className="w-full  flex flex-col  justify-between items-end  gap-2">
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-600">
                Conducted by {contestDetails.conductedBy} |{" "}
                {contestDetails.numberOfProblems} Problems | Duration:{" "}
                {contestDetails.durationMinutes} mins
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="w-full h-[calc(100%-7rem)] overflow-auto bg-gray-50 p-1">
        <div className="overflow-hidden rounded-md shadow-md border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead className="uppercase text-xs">
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left w-12">Sno</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Points</th>
                <th className="py-3 px-4 text-left">Submitted By</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.length > 0 ? (
                problems.map((problem, index) => (
                  <tr
                    key={problem._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                    onClick={() => openModal("delete", problem)}
                  >
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4">{problem.name}</td>
                    <td className="py-3 px-4">{problem.points}</td>
                    <td className="py-3 px-4">{problem.submittedBy}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          problem.status === "finalized"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {problem.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center flex items-center justify-center">
                      <button
                      onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1 rounded-s-md border border-gray-300 border-r-0 hover:bg-neutral-200  text-black px-3 py-1.5  text-sm transition"
                      >
                        <Plus size={16} />
                      </button>
                      <button
  
                        className="flex items-center justify-center gap-1 rounded-e-md border border-gray-300 hover:bg-neutral-200  text-black px-3 py-1.5  text-sm transition"
                      >
                        <Fullscreen size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No problems found for this contest.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md shadow-lg p-4 w-[800px] h-[600px] flex items-center gap-1">
            <div
              className="text-gray-600 preview space-y-3 leading-6 w-3/4 bg-neutral-100/30 h-full border border-gray-200 p-3 rounded-md text-base"
              dangerouslySetInnerHTML={{ __html: selectedProblem.statement }}
            ></div>
            <div className="w-2/4 h-full flex flex-col p-1 px-2 gap-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Preview</span>
                  <button className="text-gray-400 hover:text-gray-600" onClick={closeModal}><X size={16}/></button>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">Name</span>
                  <span className="text-neutral-600 text-base">{selectedProblem.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">Name</span>
                  <span className="text-neutral-600">{selectedProblem.name}</span>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProblem;


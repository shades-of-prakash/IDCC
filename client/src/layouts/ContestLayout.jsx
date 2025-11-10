import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import ContestNavbar from "../components/Admin/ContestNavbar";
import ContestModal from "../components/Admin/ContestModal";
import CreateUsers from "../components/Admin/CreateUsers";
import { Ellipsis } from "lucide-react";
import Loader from "../components/Loader";
import Logo from "../assets/images/logo.webp";
import { toast } from "sonner";
import InfoCard from "../components/InfoCard";

const Contest = () => {
  const [showModal, setShowModal] = useState(false);
  const [showCreateUsers, setShowCreateUsers] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const dropdownRef = useRef(null);

  const queryClient = useQueryClient();

  const toggleModal = () => setShowModal((prev) => !prev);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const res = await fetch("/api/contest/list");
      if (!res.ok) throw new Error("Failed to fetch contests");
      return res.json();
    },
  });

  const deleteContestMutation = useMutation({
    mutationFn: async (contestId) => {
      const res = await fetch(`/api/contest/delete/${contestId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete contest");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Contest deleted successfully");
      queryClient.invalidateQueries(["contests"]);
      setShowDeletePopup(false);
      setSelectedContest(null);
    },
    onError: (err) => {
      toast.error(err.message || "Error deleting contest");
    },
  });

  const getStatus = (contest) => {
    if (!contest.questions) return "Incomplete";
    return contest.questions.length === contest.numberOfProblems
      ? "Complete"
      : "Incomplete";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const handleCreateUsers = (contest) => {
    setSelectedContest(contest);
    setShowCreateUsers(true);
    setOpenDropdown(null);
  };

  const handleDeleteClick = (contest) => {
    setSelectedContest(contest);
    setShowDeletePopup(true);
    setOpenDropdown(null);
  };

  const confirmDelete = () => {
    if (selectedContest) {
      deleteContestMutation.mutate(selectedContest._id);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 relative">
      {/* Navbar */}
      <div className="h-16 border-b bg-white  flex items-center px-4">
        <ContestNavbar toggle={toggleModal} />
      </div>

      {showModal && <ContestModal close={setShowModal} />}

      {!isLoading && !isError && (!data?.data || data.data.length === 0) && (
        <div className="h-full w-full p-2  bg-white ">
          <InfoCard
            title="No Contests Found"
            className="border border-gray-200 rounded-md"
            description="Looks like there are no contests available right now. You can create a new one using create contest button above"
          />
        </div>
      )}

      {isLoading && (
        <Loader text="Loading Contests" className="w-full h-full" />
      )}

      {isError && (
        <div className="text-center py-6 text-red-600">{error.message}</div>
      )}

      {!isLoading && data?.data?.length > 0 && (
        <div className="flex-1 overflow-y-auto p-2 relative">
          <div className=" bg-white rounded-lg  border border-gray-300 relative flex flex-col">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-800 border-b border-gray-200 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center w-[5%]">S.No</th>
                  <th className="px-4 py-3 text-left w-[20%]">Contest Name</th>
                  <th className="px-4 py-3 text-left w-[20%]">Conducted By</th>
                  <th className="px-4 py-3 text-center w-[10%]">Problems</th>
                  <th className="px-4 py-3 text-center w-[10%]">Duration</th>
                  <th className="px-4 py-3 text-center w-[10%]">Team Size</th>
                  <th className="px-4 py-3 text-center w-[10%]">Banner</th>
                  <th className="px-4 py-3 text-center w-[10%]">Status</th>
                  <th className="w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.data.map((contest, index) => (
                  <tr
                    key={contest._id}
                    className="hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-4 py-3 text-center font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">{contest.name}</td>
                    <td className="px-4 py-3">{contest.conductedBy}</td>
                    <td className="px-4 py-3 text-center">
                      {contest.numberOfProblems}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {contest.durationMinutes}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {contest.teamSize}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {contest.bannerImage ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${contest.bannerImage}`}
                          alt="banner"
                          className="h-12 w-12 object-contain rounded-md mx-auto border"
                        />
                      ) : (
                        <img
                          src={Logo}
                          alt="banner"
                          className="h-14 w-14 object-contain overflow-hidden rounded-md mx-auto border"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStatus(contest) === "Complete"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getStatus(contest)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center relative">
                      <button
                        className="p-1 hover:bg-gray-200 rounded-full transition"
                        onClick={() => handleDropdownToggle(contest._id)}
                      >
                        <Ellipsis className="h-4 w-4 text-gray-600" />
                      </button>

                      {openDropdown === contest._id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-4 top-10 z-[9999] w-44 bg-white border border-gray-200 rounded-lg shadow-lg text-sm text-gray-700"
                        >
                          <div className="px-3 py-2 border-b font-semibold text-gray-900">
                            Actions
                          </div>
                          <ul className="py-1">
                            <li>
                              <Link
                                to={`add/${contest._id}`}
                                onClick={() => setOpenDropdown(null)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Add
                              </Link>
                            </li>
                            <li>
                              <button
                                onClick={() => handleCreateUsers(contest)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Create Users
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDeleteClick(contest)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && selectedContest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[99999]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[22rem] text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Contest
            </h2>
            <p className="text-gray-600 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {selectedContest.name}
              </span>
              ?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                disabled={deleteContestMutation.isPending}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteContestMutation.isPending}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteContestMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateUsers && selectedContest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-0">
          <CreateUsers
            onClose={() => setShowCreateUsers(false)}
            contestName={selectedContest.name}
            contestId={selectedContest._id}
          />
        </div>
      )}
    </div>
  );
};

export default Contest;

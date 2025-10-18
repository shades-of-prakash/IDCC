import React, { useState, useEffect, useRef } from "react"; 
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import ContestNavbar from "../components/Admin/ContestNavbar";
import ContestModal from "../components/Admin/ContestModal";
import CreateUsers from "../components/Admin/CreateUsers";
import { Ellipsis } from "lucide-react";
import Loader from "../components/Loader"; // import the Loader component

const Contest = () => {
  const [showModal, setShowModal] = useState(false);
  const [showCreateUsers, setShowCreateUsers] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleModal = () => setShowModal((prev) => !prev);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const res = await fetch("/api/contest/list");
      if (!res.ok) throw new Error("Failed to fetch contests");
      return res.json();
    },
  });

  const getStatus = (contest) => {
    if (!contest.questions) return "Incomplete";
    return contest.questions.length === contest.numberOfProblems
      ? "Complete"
      : "Incomplete";
  };

  // Close dropdown on outside click
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

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 relative">
      {/* Navbar - always visible */}
      <div className="h-16 border-b bg-white shadow-sm flex items-center px-4">
        <ContestNavbar toggle={toggleModal} />
      </div>

      {/* Create Contest Modal */}
      {showModal && <ContestModal close={setShowModal} />}

      {/* Table / Content area */}
      <div className="flex-1 overflow-y-auto p-2 relative">
        {isLoading && (
          <Loader text="Loading Contests" className="w-full h-full" />
        )}
        <div className="bg-white rounded-lg shadow border border-gray-200 relative  flex flex-col">


          {isError && (
            <div className="text-center py-6 text-red-600">{error.message}</div>
          )}

          {!isLoading && data?.data?.length > 0 && (
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-800 text-sm font-semibold">
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
                    <td className="px-4 py-3 text-center">{contest.teamSize}</td>
                    <td className="px-4 py-3 text-center">
                      {contest.bannerImage ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${contest.bannerImage}`}
                          alt="banner"
                          className="h-10 w-10 object-cover rounded-md mx-auto border"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          No Image
                        </span>
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

                    {/* Dropdown */}
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
                                to={`edit/${contest._id}`}
                                onClick={() => setOpenDropdown(null)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Edit
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
                                onClick={() => setOpenDropdown(null)}
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
          )}

          {!isLoading && !isError && (!data?.data || data.data.length === 0) && (
            <div className="text-center py-6 text-gray-500">No contests found.</div>
          )}
        </div>
      </div>

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

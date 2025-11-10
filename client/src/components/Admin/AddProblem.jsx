import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Timer,
  CircleQuestionMark,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import Logo from "../../assets/images/logo.webp";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import AddedProblemsList from "./AddedProblemsList";
import PreviewModal from "./PreviewModal";
import { toast } from "sonner";
import ProblemActions from "./ProblemActions";
import InfoCard from "../InfoCard";

const AddProblem = () => {
  const { contestId } = useParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAvatar = (username) =>
    createAvatar(botttsNeutral, { seed: username }).toDataUri();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contest-all-problems-to-add", contestId],
    queryFn: () =>
      apiFetch(
        `/api/contest/admin/getAllProblemsOfContest?contestId=${contestId}`,
      ),
    enabled: !!contestId,
    onError: (err) => toast.error(err?.message || "Failed to fetch problems"),
  });
  const contestDetails = data?.contestDetails;
  const problems = data?.problems || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [addedPModal, setAddedPModal] = useState(false);

  const openAddedPModal = () => setAddedPModal(true);
  const closeAddedPModal = () => setAddedPModal(false);

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

  if (isLoading) return <Loader />;

  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="w-full px-2 h-16 text-black flex items-center justify-between text-lg border-b border-gray-200">
        <div className="w-1/2 flex items-center gap-3 ">
          <div
            className="w-10 h-10 border-gray-200 border hover:bg-neutral-200/60 rounded flex justify-center items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Problems List</span>
            <span className="text-sm text-gray-600">
              Problems added by volunteers and coordinators.
            </span>
          </div>
        </div>
        {contestDetails && (
          <div className="w-full flex justify-end items-center gap-2">
            <div
              ref={dropdownRef}
              className=" relative border border-gray-200 rounded-md bg-white shadow-sm w-fit"
            >
              {/* Button */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between gap-2 px-4 py-2 w-full text-sm text-gray-700 font-semibold"
              >
                <span className="text-base font-semibold text-gray-800">
                  {contestDetails.name}
                </span>
                {open ? (
                  <ChevronUp size={18} className="text-gray-600" />
                ) : (
                  <ChevronDown size={18} className="text-gray-600" />
                )}
              </button>

              {/* Dropdown Panel */}
              {open && (
                <div className="absolute top-full -left-20 mt-2 w-max bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50">
                  <div className="flex gap-3 items-center">
                    {contestDetails.bannerImage && (
                      <img
                        src={Logo}
                        alt="Contest Banner"
                        className="w-24 h-24  object-contain rounded-md border"
                      />
                    )}

                    <div className=" h-24 text-sm text-gray-700  space-y-1 pr-3">
                      <p className="flex items-center gap-2">
                        <span className="font-medium  w-28">Contest</span>
                        <span className=" text-center w-2">:</span>
                        <span className="font-bold flex-1">
                          {contestDetails.name}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium  w-28">Conducted by</span>
                        <span className=" text-center w-2">:</span>
                        <span className="font-bold flex-1">
                          {contestDetails.conductedBy}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <span className="font-medium  w-28">Problems</span>
                        <span className=" text-center w-2">:</span>
                        <span className=" flex-1">
                          {contestDetails.numberOfProblems}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <span className="font-medium  w-28">Duration</span>
                        <span className=" text-center w-2">:</span>
                        <span className=" flex-1">
                          {contestDetails.durationMinutes}m
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openAddedPModal}
              className="text-base px-2 py-1.5 bg-black text-white rounded"
            >
              Added Problems
            </button>
          </div>
        )}
      </div>

      {problems.length > 0 ? (
        <div className="w-full h-[calc(100%-7rem)] overflow-auto bg-gray-50 p-2">
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <table className="min-w-full">
              <thead className="uppercase text-xs">
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 px-4 text-left w-12">Sno</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Points</th>
                  <th className="py-3 px-4 text-left">Submitted By</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <tr
                    key={problem._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 max-w-[250px]">
                      <div
                        className="truncate text-gray-800"
                        title={problem.name}
                      >
                        {problem.name}
                      </div>
                    </td>

                    <td className="py-3 px-4">{problem.points}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <div className="rounded w-6 h-6 overflow-hidden">
                          <img
                            src={getAvatar(problem.submittedBy.username)}
                            alt="avatar"
                          />
                        </div>
                        {problem.submittedBy.username}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`py-1.5 px-2 rounded-full text-sm ${
                          problem.submittedBy.role === "coordinator"
                            ? "bg-purple-100 text-purple-500"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {problem.submittedBy.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ProblemActions
                        problem={problem}
                        contestId={contestId}
                        openModal={openModal}
                        showEye={true}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <InfoCard
          title="No Problems Yet"
          description="It looks like there are no problems added to this contest yet. Please ask the volunteers or coordinators to add the problems!"
        />
      )}
      {modalOpen && (
        <PreviewModal
          selectedProblem={selectedProblem}
          closeModal={closeModal}
          add={AddedProblemsList}
          remove={() => {}}
        />
      )}

      {addedPModal && (
        <AddedProblemsList
          close={closeAddedPModal}
          contestId={contestId}
          remove={() => {}}
        />
      )}
    </div>
  );
};

export default AddProblem;

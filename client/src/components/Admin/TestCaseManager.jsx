import { ArrowLeft, Check, Settings, Upload } from "lucide-react";
import React, { useState } from "react";
import ConfigureArguments from "./ConfigureArguments";
import { useNavigate } from "react-router";
import InfoCard from "../InfoCard";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import ArgumentsTable from "./ArgumentsTable";

const TestCaseManager = () => {
  const [whichTab, setWhichTab] = useState("visible");
  const [showargconfig, setShowargconfig] = useState(false);

  const navigate = useNavigate();
  const { problemId } = useParams();

  const {
    data: problemData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problem", problemId],
    queryFn: () => apiFetch(`/api/contest/admin/problem/get/${problemId}`),
    enabled: !!problemId,
  });

  if (!problemId || isError) {
    return (
      <InfoCard
        title="No Problem Selected"
        description="Go to the dashboard to choose a problem before continuing."
        buttonText="Go to Dashboard"
        navigateTo="/admin"
        className="bg-white"
      />
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full h-full flex flex-col gap-2  z-50">
      <div className="flex flex-col w-full h-full rounded-md relative">
        <div className="h-16  flex justify-between items-start p-2 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate(-1)}
              className="text-gray-700 hover:text-black"
            >
              <ArrowLeft size={18} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold mb-1">Test Case Manager</h2>
              <p className="text-sm text-gray-600">
                Create and manage visible & hidden testcases for your coding
                problem
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex items-center gap-3 p-2">
              <button
                onClick={() => setShowargconfig(true)}
                className="flex px-2 items-center justify-center gap-1 h-8 rounded border border-gray-300"
              >
                <Settings size={16} />
                <span>Configuration Arguments</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-hidden ">
          <ArgumentsTable
            argumentsList={problemData.arguments}
            problemId={problemData._id}
          />
        </div>
      </div>

      {showargconfig && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="w-[450px] h-[450px] rounded-md overflow-hidden">
            <ConfigureArguments
              // onSaved={handleArgumentsSaved}
              initialArgs={problemData.arguments}
              problemId={problemData._id}
              submittedBy={problemData.submittedBy}
              close={() => setShowargconfig(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseManager;

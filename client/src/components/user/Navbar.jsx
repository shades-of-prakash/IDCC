import React, { useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import Timer from "./Timer";

const Navbar = () => {
  const { startSession, startSessionLoading } = useSession();

  useEffect(() => {
    startSession();
  }, []);

  return (
    <div className="w-full h-12  border-b border-gray-300 flex items-center justify-between">
      <div className="flex gap-2 px-4 items-center">
        <span className="font-semibold">Logiq</span>
        <div className="w-px bg-red-900 h-4" />
        <span className="font-semibold">IDCC</span>
      </div>

      <div className="flex gap-4 px-4 items-center">
        {!startSessionLoading && <Timer />}

        <button className="py-2 px-3 bg-red-900 rounded text-white hover:bg-red-800 transition">
          Finish
        </button>
      </div>
    </div>
  );
};

export default Navbar;

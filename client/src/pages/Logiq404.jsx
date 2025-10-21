import React from "react";
import Itachi from "../assets/itachi.jpg";
import { MoveLeft } from "lucide-react";
import Logiq from "../assets/logiq.svg?react";
import { useNavigate } from "react-router";
const Logiq404 = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen flex flex-col select-none">
      <div className="bg-white  w-full h-16 px-16 flex justify-between items-center">
        <div className="flex gap-1 items-center">
          <div alt="logiq logo">
            <Logiq className="w-5 h-6 text-primary" />
          </div>
          <span className="font-semibold text-xl text-text">Logiq</span>
        </div>
        <div className="flex gap-3">
          <div className="px-2 py-1 border border-borderWhi rounded-md flex gap-2 items-center">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-text">Information Technology</span>
          </div>
        </div>
      </div>
      <div className="h-56 flex flex-col items-center justify-end gap-4">
        <h1 className="text-5xl font-semibold">Page Not Found</h1>
        <p>Looks like this ninja couldn't find the page you're looking for.</p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded  px-4 py-2 bg-black text-white hover;bg-black/80"
        >
          <MoveLeft size={16} /> Back to home
        </button>
      </div>
      <div className="relative h-[calc(100%-18rem)] w-full">
        <img
          src={Itachi}
          alt="404 Image"
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-transparent to-white" />
      </div>
    </div>
  );
};
export default Logiq404;

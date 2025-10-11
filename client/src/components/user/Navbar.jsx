import { Timer } from "lucide-react";
import { useUser } from "../../contexts/UserContext";

const Navbar = () => {
  const { remainingTime } = useUser();

  const formatTime = (ms) => {
    if (typeof ms !== "number" || ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  

  return (
    <div className="w-full h-12 border-b border-neutral-800/30 flex items-center justify-between">
      <div className="flex gap-2 px-4 items-center">
        <span className="font-semibold">Logiq</span>
        <div className="w-px bg-red-900 h-4" />
        <span className="font-semibold">IDCC</span>
      </div>
      <div className="flex gap-4 px-4 items-center">
        {/* Timer */}
        <div className="flex items-center gap-1">
          <Timer className="w-5 h-5 text-red-900" />
          <span className="font-medium">{formatTime(remainingTime)}</span>
        </div>

        {/* Finish Button */}
        <div>
          <button className="py-2 px-3 bg-red-900 rounded text-white">
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

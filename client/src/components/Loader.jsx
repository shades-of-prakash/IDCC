import React from "react";

const Loader = ({ text, className = "h-screen", textClassName = "text-base" }) => (
  <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
    <div className="flex space-x-2">
      <span className="w-2 h-2 bg-black rounded-full animate-pulse-dot"></span>
      <span className="w-2 h-2 bg-black rounded-full animate-pulse-dot animation-delay-150"></span>
      <span className="w-2 h-2 bg-black rounded-full animate-pulse-dot animation-delay-300"></span>
    </div>
    {text && <p className={`text-gray-700 ${textClassName}`}>{text}</p>}
  </div>
);

export default Loader;


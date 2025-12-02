import React from "react";
import { useNavigate } from "react-router";
import Naruto from "../assets/naruto_empty.jpg";
const InfoCard = ({
  imgUrl = Naruto,
  title,
  description,
  buttonText,
  className,
  navigateTo,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center py-6 ${className}`}
    >
      <div className="flex flex-col gap-2 items-center">
        <img src={imgUrl} alt={title} className="w-[260px]" />
        <h1 className="text-2xl text-black font-semibold mt-3">{title}</h1>
        <span className="w-[500px] text-gray-600 text-center">
          {description}
        </span>
        {buttonText && (
          <button
            onClick={handleClick}
            className="mt-1 px-4 py-1 text-white bg-black rounded hover:bg-black/80 transition"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoCard;

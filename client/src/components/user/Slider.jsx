import React, { useRef, useEffect } from "react";
import { LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";

const Slider = ({ number, active }) => {
  const sliderRef = useRef(null);
  const itemRefs = useRef([]);

  const handleRight = () => {
    const slider = sliderRef.current;
    slider.scrollLeft += 48;
  };

  const handleLeft = () => {
    const slider = sliderRef.current;
    slider.scrollLeft -= 48;
  };

  useEffect(() => {
    if (itemRefs.current[active]) {
      itemRefs.current[active].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [active]);

  return (
    <div className="flex gap-2 select-none">
      <div className="flex gap-2">
        <div
          onClick={handleLeft}
          className="rounded w-10 h-10 bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft />
        </div>

        <div
          className="flex gap-2 w-[232px] overflow-hidden scroll-smooth"
          ref={sliderRef}
        >
          {Array.from({ length: number }, (_, i) => i).map((num, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`${
                active === index
                  ? "bg-black text-white"
                  : "bg-neutral-50 text-black"
              } flex-shrink-0 w-10 h-10 font-semibold border border-neutral-300 rounded flex items-center justify-center`}
            >
              {num + 1}
            </div>
          ))}
        </div>

        <div
          onClick={handleRight}
          className="rounded w-10 h-10 bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center cursor-pointer"
        >
          <ChevronRight />
        </div>
      </div>

      <div className="flex items-center gap-1 border border-neutral-300 rounded text-black px-2">
        <span className="text-xl pr-px font-semibold">{number}</span>
        <div className="w-px h-full bg-neutral-300" />
        <div className="pl-px">
          <LayoutGrid />
        </div>
      </div>
    </div>
  );
};

export default Slider;

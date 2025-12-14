// src/components/Admin/ContestHoverCard.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import Logo from "../../assets/images/logo.webp";
import Banner from "../../assets/banner.jpg";

const ContestHoverCard = ({ iconSrc, bannerSrc, name, conductedBy }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const resolvedIcon = iconSrc || Logo;
    const resolvedBanner = bannerSrc || Banner;

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
        setShow(true);
    };

    const handleMouseLeave = () => setShow(false);

    return (
        <>
            <img
                src={resolvedIcon}
                alt={name}
                className="h-12 w-12 object-contain rounded-md mx-auto border bg-white"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />

            {show &&
                createPortal(
                    <div
                        className="absolute z-[9999] w-72 rounded-lg border bg-white shadow-xl p-3"
                        style={{
                            top: position.y,
                            left: position.x - 144,
                        }}
                        onMouseEnter={() => setShow(true)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Banner (height increased) */}
                        <div className="h-32 w-full overflow-hidden rounded-md border bg-gray-100 mb-2">
                            <img
                                src={resolvedBanner}
                                className="w-full h-full object-cover"
                                alt={`${name} banner`}
                            />
                        </div>

                        {/* Icon + text */}
                        <div className="flex items-center gap-3">
                            <img
                                src={resolvedIcon}
                                className="h-10 w-10 rounded-md border object-contain bg-white"
                                alt={`${name} icon`}
                            />
                            <div className="min-w-0">
                                <div className="font-semibold text-sm leading-snug break-words">
                                    {name}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 break-words">
                                    Conducted by: {conductedBy || "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default ContestHoverCard;

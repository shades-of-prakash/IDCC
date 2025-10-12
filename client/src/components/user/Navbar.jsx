// src/components/Navbar.jsx
import React from "react";
import { Timer } from "lucide-react";
import { useUser } from "../../contexts/UserContext";

const Navbar = () => {
	const { remainingTime, formatTime, logout } = useUser();

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
					<span className="font-medium text-sm">
						{formatTime(remainingTime)}
					</span>
				</div>

				{/* Finish Button */}
				<button
					onClick={logout}
					className="py-2 px-3 bg-red-900 rounded text-white hover:bg-red-800 transition"
				>
					Finish
				</button>
			</div>
		</div>
	);
};

export default Navbar;

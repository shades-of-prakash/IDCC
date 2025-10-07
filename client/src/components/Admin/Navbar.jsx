import React from "react";
import Logo from "../../assets/images/logo.webp";
const Navbar = () => {
	return (
		<div className="w-full h-full bg-white text-black border-b border-neutral-800/30">
			<div className="w-full h-full flex items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<img src={Logo} alt="" className="w-6" />
					<div className="flex flex-col items-center">
						<span className="font-semibold text-2xl">Logiq</span>
						<span className="text-[10px] font-semibold">BY IDCC</span>
					</div>
				</div>
				<div className="flex gap-2">
					<span>Hi Prakash</span>
					<button>Logout</button>
				</div>
			</div>
		</div>
	);
};

export default Navbar;

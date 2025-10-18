import React from "react";
import Logo from "../assets/images/logo.webp";
import HomePagePattern from "../assets/images/homepattern.jpg";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import Logiq from "../assets/logiq.svg?react"
import ThemeToggle from "../components/ToggleTheme";
import { useTheme } from "../contexts/ThemeContext";
const Home = () => {
	return (
		<div className="relative w-screen h-screen overflow-hidden  text-black">
			<div className="absolute top-0 w-full h-16 px-16 flex justify-between items-center">
				<div className="flex gap-1 items-center">
					<div  alt="logiq logo">
						<Logiq className="w-5 h-6 text-primary"/>
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

			<div className="text-text w-full text-center z-20  absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2  flex flex-col items-center justify-center">
				<span className="text-[10vw] font-semibold leading-[0.8]">LOGIQ</span>

				<p className="mt-6 text-base">By Inter Departmental Coding Competition (IDCC)</p>

				<p className="mt-2 text-sm max-w-xl mx-auto">
				ChatGPT said:

Join others as you compete in exciting coding challenges and solve problems in a timed environment. Sharpen your skills and have fun!
				</p>

				<Link
					to="/user/login"
					className="flex items-center gap-2 text-base border border-border mt-6 px-4 py-2 bg-bg font-semibold rounded-lg hover:bg-gray-200 transition z-20 relative"
				>
					Get Started
					<ArrowRight size={16} />
				</Link>
				
			</div>

			<div className="absolute w-full h-[40vh] bottom-0">
			<img
				src={HomePagePattern}
				className="w-full h-full object-cover"
				alt="Home Background"
				/>
				<div
					className="absolute w-full h-56 bg-gradient-to-b 
                    from-white from-0% 
                    via-white via-40% 
                    to-transparent to-100% 
                    top-0"
				></div>
			</div>
		</div>
	);
};

export default Home;

import React from "react";
import UserLoginImage from "../assets/images/userloginimage.png";
const UserLogin = () => {
	return (
		<div className="w-screen h-dvh flex">
			<div className="w-1/2 h-dvh border-r border-neutral-600/30">
				<img
					src={UserLoginImage}
					alt="login-image"
					className="w-full h-full object-cover"
				/>
			</div>

			<form className="w-1/2 bg-white h-dvh">
				<div className="w-full h-full flex flex-col justify-center gap-4 px-24">
					<div className="flex flex-col items-center gap-3 mb-3">
						<div className="flex flex-col items-center gap-2">
							<span className="text-4xl font-semibold  leading-none">
								Logiq
							</span>
							<span className="text-xs font-bold">BY IDCC</span>
						</div>
						<span className="text-center text-base my-2">
							where algorithms meet adrenaline.
						</span>
					</div>

					<div className="flex flex-col text-xs gap-1">
						<span className="text-sm text-black font-medium">
							Participant 1
						</span>
						<div className="flex gap-2 text-sm ">
							<div className="flex flex-col flex-1 gap-1">
								<label>Name</label>
								<input
									type="text"
									className="px-4 py-2 text-base text-black border border-neutral-800/40 rounded"
								/>
							</div>
							<div className="flex flex-col flex-1 gap-1">
								<label>Reg.no</label>
								<input
									type="text"
									className="px-4 py-2 text-base text-black border border-neutral-800/40 rounded"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col text-xs gap-1">
						<span className="text-sm text-black font-medium">
							Participant 2
						</span>
						<div className="flex gap-2 text-sm">
							<div className="flex flex-col flex-1 gap-1">
								<label>Name</label>
								<input
									type="text"
									className="px-4 py-2 text-base text-black border border-neutral-800/40 rounded"
								/>
							</div>
							<div className="flex flex-col flex-1 gap-1">
								<label>Reg.no</label>
								<input
									type="text"
									className="px-4 py-2 text-base border border-neutral-800/40 rounded"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col text-sm gap-1">
						<label>Email</label>
						<input
							type="email"
							className="px-4 py-2 text-base border border-neutral-800/40 rounded"
						/>
					</div>

					<div className="flex flex-col text-sm gap-1">
						<label>Phone</label>
						<input
							type="tel"
							className="px-4 py-2 text-base border border-neutral-800/40 rounded"
						/>
					</div>

					<button
						type="submit"
						className="bg-black px-4 py-3 text-base text-white rounded mt-2 disabled:opacity-90"
					>
						<span>Continue</span>
					</button>
				</div>
			</form>
		</div>
	);
};

export default UserLogin;

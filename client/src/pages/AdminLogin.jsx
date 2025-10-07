import React, { useContext, useState } from "react";
import Logo from "../assets/images/logo.webp";
import { AuthContext } from "../contexts/adminAuthContext";
import { useNavigate } from "react-router";
const AdminLogin = () => {
	const { login, isLoading } = useContext(AuthContext);
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		try {
			await login({ username, password });
			navigate("/admin");
		} catch (err) {
			setError(err.message || "Login failed");
		}
	};

	return (
		<div className="w-screen h-dvh flex items-center justify-center">
			<div className="bg-white w-[450px] h-[500px] rounded-md border border-neutral-800/30 flex flex-col items-center justify-center gap-6">
				<div className="w-full flex flex-col gap-4 items-center justify-center">
					<img
						src={Logo}
						alt="logo-idcc"
						className="w-14"
						fetchPriority="high"
					/>
					<div className="flex flex-col items-center gap-1">
						<span className="text-4xl font-semibold">IDCC</span>
						<span className="text-gray-700 text-sm">
							Admin access only. Log in to continue.
						</span>
					</div>
				</div>

				<form
					className="px-6 w-full gap-6 flex flex-col items-center"
					onSubmit={handleSubmit}
				>
					<div className="w-full flex flex-col gap-2">
						<label className="text-sm">Username</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="px-4 py-2 border text-black border-neutral-800/30 rounded"
						/>
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-sm">Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="px-4 py-2 border text-black border-neutral-800/30 rounded"
						/>
					</div>

					{error && (
						<div className="w-full text-center text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
							{error || "Something went wrong"}
						</div>
					)}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full px-4 py-3 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isLoading ? <span>Logging in...</span> : <span>Login</span>}
					</button>
				</form>
			</div>
		</div>
	);
};

export default AdminLogin;

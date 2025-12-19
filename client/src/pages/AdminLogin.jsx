import React, { useContext, useState } from "react";
import Logo from "../assets/images/logo.webp";
import { AuthContext } from "../contexts/adminAuthContext";
import { useNavigate } from "react-router";
import CustomSelect from "../components/CustomSelect";
import { Eye, EyeOff } from "lucide-react";
import Loader from "../components/Loader";

const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "coordinator", label: "Co-ordinator" },
    { value: "volunteer", label: "Volunteer" },
];

const AdminLogin = () => {
    const { login, loginLoading, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(null);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!role) {
            setError("Please select a role before logging in.");
            return;
        }

        try {
            await login({ username, password, role: role.value });
            navigate("/admin");
        } catch (err) {
            setError(err.message || "Login failed");
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (loginLoading) {
        return <Loader text="Authenticating" />;
    }

    return (
        <div className="w-screen h-dvh flex items-center justify-center">
            <div className="bg-white z-[999] w-[450px] h-[600px] rounded-md  flex flex-col items-center justify-center gap-6">
                {/* Logo and Title */}
                <div className="w-full flex flex-col gap-4 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={Logo}
                            alt="logo-idcc"
                            className="w-10 h-14"
                            fetchPriority="high"
                        />
                        <div className="flex flex-col gap-1.5 items-center">
                            <span className="text-4xl font-semibold">
                                Logiq
                            </span>
                            <span className="text-xs font-bold">BY IDCC</span>
                        </div>
                    </div>
                    <span className="text-gray-700 text-base">
                        {/* Select your role and log in to continue.*/}
                        Restricted: Authorized access only.
                    </span>
                </div>

                <form
                    className="px-6 w-full gap-5 flex flex-col items-center"
                    onSubmit={handleSubmit}
                >
                    {/* Username Field */}
                    <div className="w-full flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            required
                            autoComplete="off"
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md
                                       focus:outline-none focus:ring-2 focus:ring-black focus:border-gray-300"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="w-full flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                required
                                autoComplete="off"
                                onChange={(e) => setPassword(e.target.value)}
                                className="p-2 w-full border border-gray-300 rounded-md
                                           focus:outline-none focus:ring-2 focus:ring-black   focus:border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <div>
                            <CustomSelect
                                className="py-2.5"
                                options={roleOptions}
                                value={role}
                                onChange={setRole}
                                placeholder="Select role"
                                error={!!error && !role}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="w-full text-center text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="text-lg w-full px-4 py-2.5 mt-3 rounded-md bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span>Login</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

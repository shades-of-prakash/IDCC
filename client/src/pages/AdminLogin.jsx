import React, { useContext, useState } from "react";
import Logo from "../assets/images/logo.webp";
import { AuthContext } from "../contexts/adminAuthContext";
import { useNavigate } from "react-router";
import CustomSelect from "../components/CustomSelect";
import { Eye, EyeOff } from "lucide-react";

const roleOptions = [
  { value: "admin", label: "Admin" },

  { value: "coordinator", label: "Co-ordinator" },

  { value: "volunteer", label: "Volunteer" }
];

const AdminLogin = () => {
  const { login, isLoading } = useContext(AuthContext);
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
      const data=await login({ username, password, role: role.value });
      if(data.role="admin"){navigate("/admin")};
      if(data.role="volunteer"){navigate("/volunteer")};
      if(data.role="coordinator"){navigate("/coordinator")};
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="w-screen h-dvh flex items-center justify-center">
      <div className="bg-white w-[450px] h-[600px] rounded-md border border-neutral-800/30 flex flex-col items-center justify-center gap-6">
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <img src={Logo} alt="logo-idcc" className="w-10 h-14" fetchPriority="high" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-semibold">IDCC</span>
            <span className="text-gray-700 text-sm">
              Select your role and log in to continue.
            </span>
          </div>
        </div>

        <form
          className="px-6 w-full gap-5 flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <div className="w-full flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 border text-black border-neutral-800/30 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="w-full flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 w-full border text-black border-neutral-800/30 rounded focus:outline-none focus:ring-1 focus:ring-black pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-black"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <CustomSelect
            label="Role"
            options={roleOptions}
            value={role}
            onChange={setRole}
            placeholder="Select role"
            error={!!error && !role}
          />

          {error && (
            <div className="w-full text-center text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 px-4 py-3 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

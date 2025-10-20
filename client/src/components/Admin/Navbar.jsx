import React, { useContext, useState, useRef, useEffect } from "react";
import Logo from "../../assets/images/logo.webp";
import { toast } from "sonner";
import { AuthContext } from "../../contexts/adminAuthContext";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

const Navbar = () => {
  const { admin, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const getAvatar = (username) =>
    createAvatar(botttsNeutral, { seed: username }).toDataUri();
 
  const handleLogout = async () => {
	try {
	  setIsPending(true);
	  await logout();
	  toast.success("Logout successful");
	  navigate("/admin/login", { replace: true });
	} catch (error) {
	  toast.error(error.message || "Logout failed");
	} finally {
	  setIsPending(false);
	}
  };

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full bg-white text-black border-b border-neutral-800/30">
      <div className="w-full h-full flex items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="w-6" />
          <div className="flex flex-col items-center">
            <span className="font-semibold text-2xl">Logiq</span>
            <span className="text-[10px] font-semibold">BY IDCC</span>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-neutral-100 border border-gray-200 p-2 rounded-md hover:bg-neutral-200 transition-all"
          >
            <img
              src={getAvatar(admin?.id || "guest")}
              alt="avatar"
              className="w-8 h-8 rounded-md"
            />
            <span className="font-medium text-base">
              {admin?.username
                ? admin.username.charAt(0).toUpperCase() + admin.username.slice(1)
                : "Guest"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-50">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center w-full gap-2 p-4 text-sm text-left hover:bg-gray-100 rounded-t-lg disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

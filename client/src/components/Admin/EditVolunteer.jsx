import { Eye, EyeOff, Info, ChevronDown, Check } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import CustomSelect from "../CustomSelect";
import { AuthContext } from "../../contexts/adminAuthContext";

const EditPopup = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  const { admin } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    role: user?.role || "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        role: user.role || "",
        password: "",
        confirmPassword: "",
      });
      setChangePassword(false);
      setErrors("");
    }
  }, [user]);

  const roleOptions =
    admin?.role === "admin"
      ? [
          { label: "Volunteer", value: "volunteer" },
          { label: "Coordinator", value: "coordinator" },
        ]
      : [];

  const getUrl = () => {
    if (admin?.role === "admin") return "/api/admin/auth/update/uvorc";
    return "/api/admin/auth/update/volunteer";
  };

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch(getUrl(), {
        method: "PUT",
        body: payload,
      }),
    onSuccess: () => {
      toast.success(`${user.role} updated successfully`);
      queryClient.invalidateQueries(["volunteers"]);
      queryClient.invalidateQueries(["vorc"]);
      onClose();
    },
    onError: (error) => {
      setErrors(error.message || "Failed to update user");
    },
  });

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    setErrors("");
    if (changePassword) {
      if (form.password.length < 6) {
        setErrors("Password must be at least 6 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrors("Passwords do not match");
        return;
      }
    }

    const payload = {
      username: form.username,
      name: form.name,
      ...(admin?.role === "admin" && form.role && { role: form.role }), // only admin can change roles
      ...(changePassword &&
        form.password && {
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
    };

    updateMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Edit {user.role}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter name"
            />
          </div>

          {admin?.role === "admin" && (
            <CustomSelect
              label="Role"
              options={roleOptions}
              value={form.role ? { label: form.role, value: form.role } : null}
              onChange={(option) => setForm({ ...form, role: option.value })}
            />
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 my-4">
            <Info className="w-4 h-4 text-gray-400" />
            <span>
              Click “Change Password” if you want to update the password.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setChangePassword(!changePassword)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  changePassword
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-100 text-gray-600 border-gray-400 hover:bg-gray-200"
                }`}
              >
                {changePassword && (
                  <span
                    className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] text-white transition-all duration-200 ${
                      changePassword
                        ? "bg-blue-500 scale-100 opacity-100"
                        : "scale-0 opacity-0"
                    }`}
                  >
                    ✓
                  </span>
                )}
                Change Password
              </button>
            </div>

            {changePassword && (
              <div className="space-y-3 mt-3">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter new password"
                  />
                  <div
                    className="absolute right-3 top-9 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {errors && (
          <div className="my-4 text-sm text-red-600 border border-red-300 bg-red-50 p-2 rounded">
            {errors}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-1.5 text-sm bg-black/90 text-white rounded-md hover:bg-black"
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;

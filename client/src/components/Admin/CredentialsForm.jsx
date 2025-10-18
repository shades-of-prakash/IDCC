import React, { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch"
import { toast } from "sonner"; 

const CredentialsForm = () => {
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) =>
      apiFetch("/api/admin/auth/create/volunteer", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      toast.success("Volunteer created successfully!");
      setForm({ username: "", name: "", password: "", confirmPassword: "" });
      setErrors({});
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create volunteer");
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!form.name) newErrors.name = "Name is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      mutate(form);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <UserPlus className="w-8 h-8" />
          <div>
            <h2 className="text-base font-bold text-gray-900">Add Volunteer</h2>
            <p className="text-xs text-gray-600">
              Create a new volunteer account
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {["username", "name", "password", "confirmPassword"].map((field) => {
          const isPasswordField =
            field === "password" || field === "confirmPassword";

          return (
            <div key={field} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {field === "password" || field === "confirmPassword"
                  ? "Password"
                  : field}
              </label>

              <input
                type={
                  isPasswordField
                    ? showPassword
                      ? "text"
                      : "password"
                    : "text"
                }
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={`Enter ${field
                  .replace("confirmPassword", "password")
                  .replace(/([A-Z])/g, " $1")
                  .toLowerCase()}`}
                className={`w-full border ${
                  errors[field]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent ${
                  field === "password" ? "pr-10" : ""
                }`}
              />

              {field === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              )}

              {errors[field] && (
                <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <button
            disabled={isPending}
            onClick={handleCreate}
            className={`w-full flex items-center justify-center gap-2 ${
              isPending ? "bg-gray-500" : "bg-black/90 hover:bg-black"
            } text-white px-4 py-3 rounded-lg transition-colors font-medium shadow-sm`}
          >
            {isPending ? "Creating..." : "Create Volunteer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsForm;

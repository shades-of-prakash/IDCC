import React, { useState } from "react";
import CredentialsHeader from "./CredentialsHeader";
import CredentialsForm from "./CredentialsForm";
import CredentialsTable from "./CredentialsTable"

const Credentials = () => {
  const [users, setUsers] = useState([
    { username: "uIDC1", name: "prakash", role: "volunteer", createdAt: "2024-01-15" },
    { username: "uIDC2", name: "vamsi", role: "volunteer", createdAt: "2024-02-20" },
    { username: "uIDC3", name: "sai sri kumar", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC4", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC5", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC6", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC7", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC8", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC9", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
    { username: "uIDC10", name: "sai mani", role: "volunteer", createdAt: "2024-02-22" },
  ]);

  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleCreate = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setUsers((prev) => [
      ...prev,
      {
        username: form.username,
        name: form.name,
        role: "volunteer",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setForm({ username: "", name: "", password: "", confirmPassword: "" });
    setErrors({});
  };

  const handleDelete = (username) => {
    if (window.confirm(`Delete user "${username}"?`)) {
      setUsers((prev) => prev.filter((u) => u.username !== username));
    }
  };

  const handleChangePassword = (username) => {
    const newPassword = prompt("Enter new password for " + username);
    if (newPassword && newPassword.length >= 6) {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, password: newPassword } : u
        )
      );
    } else if (newPassword) {
      alert("Password must be at least 6 characters!");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="select-none w-full h-full flex flex-col">
      <CredentialsHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="w-full h-[calc(100%-5rem)] p-2 flex gap-2">
        <div className="w-[70%] h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          <CredentialsTable
            users={filteredUsers}
            handleDelete={handleDelete}
            handleChangePassword={handleChangePassword}
          />
        </div>
        <div className="w-[30%] h-full">
          <CredentialsForm
            form={form}
            errors={errors}
            handleChange={handleChange}
            handleCreate={handleCreate}
          />
        </div>
      </div>
    </div>
  );
};

export default Credentials;

import React, { useState } from "react";
import { Download, X, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";

const CreateUsers = ({ onClose, contestId, contestName }) => {
  const [count, setCount] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (num) => {
      const res = await fetch("/api/contest/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: num, contestId, contestName }),
      });
      if (!res.ok) throw new Error("Failed to create users");
      const data=await res.json();
      console.log(data,"adatata")
      return data;
    },
    onSuccess: (res) => {
      if (!res.data.users || res.data.users.length === 0) return alert("No users returned");

      const csv = Papa.unparse(res.data.users, {
        header: true,
        columns: ["username", "password"],
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_${count}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose(); 
      }, 1000);
    },
    onError: (err) => alert(err.message),
  });

  const handleGenerate = () => {
    const num = parseInt(count);
    if (isNaN(num) || num <= 0) return alert("Enter a valid number!");
    mutation.mutate(num);
  };

  return (
    <div className="bg-white text-gray-900 border border-gray-200 rounded-xl shadow-md p-6 w-[360px] relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {contestName && (
          <span className="text-xs p-1 px-1.5 border border-gray-300 rounded-md font-semibold">
            {contestName}
          </span>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <UserPlus className="h-12 w-12 text-black" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold mb-2 text-center">Generate Users</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Generate a CSV of users with usernames and passwords.
      </p>

      {/* Input */}
      <input
        type="number"
        placeholder="Number of users"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none mb-3"
      />

      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={mutation.isPending}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-150 ${
          mutation.isPending
            ? "bg-gray-700 cursor-not-allowed text-white"
            : "bg-black hover:bg-gray-900 text-white"
        }`}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Success!
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Generate CSV
          </>
        )}
      </button>
    </div>
  );
};

export default CreateUsers;

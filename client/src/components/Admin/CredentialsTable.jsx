import React, { Suspense, useState, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { Trash2, SquarePen, Users } from "lucide-react";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import DeleteVolunteerPopUp from "./DeleteVolunteer";

const EditVolunteerPopup = lazy(() => import("./EditVolunteer"));

const CredentialsTable = () => {
  const { data: users = [], isLoading} = useQuery({
    queryKey: ["volunteers"],
    queryFn: () => apiFetch("/api/admin/auth/get/volunteers"),
    onError: (err) => toast.error(err.message || "Failed to fetch volunteers"),
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const getAvatar = (username) =>
    createAvatar(botttsNeutral, { seed: username }).toDataUri();

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditPopupOpen(true);
  };

  const openDeletePopup = (user) => {
    setSelectedUser(user);
    setIsDeletePopupOpen(true);
  };

  if (isLoading) return <Loader text="Loading Volunteers" className="h-full" />;

  if (!users.length)
    return (
      <div className="p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No users found</p>
      </div>
    );

  return (
    <>
      <table className="w-full border-collapse bg-white rounded-md border-b border-gray-200">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            {["Sno", "Username", "Name", "Role", "Created", "Actions"].map((h) => (
              <th
                key={h}
                className={`px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                  h === "Actions" ? "text-center" : "text-left"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.username}
              className={`hover:bg-gray-50 transition-colors ${
                index + 1 !== users.length ? "border-b border-gray-200" : ""
              }`}
            >
              <td className="px-6 py-3.5 text-sm text-gray-700">{index + 1}</td>
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatar(user.username)}
                    alt={user.username}
                    className="w-8 h-8 rounded-md"
                  />
                  <p className="font-medium text-gray-900">{user.username}</p>
                </div>
              </td>
              <td className="px-6 py-3.5 text-gray-800 font-medium">{user.name || "—"}</td>
              <td className="px-6 py-3.5 text-sm font-medium">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-3.5 text-sm text-gray-600">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "—"}
              </td>
              <td className="px-6 py-3.5">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors text-sm font-medium"
                  >
                    <SquarePen className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeletePopup(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Suspense fallback={<Loader />}>
        {isEditPopupOpen && (
          <EditVolunteerPopup
            isOpen={isEditPopupOpen}
            onClose={() => setIsEditPopupOpen(false)}
            user={selectedUser}
          />
        )}
      </Suspense>

      {isDeletePopupOpen && selectedUser && (
        <DeleteVolunteerPopUp
          user={selectedUser}
          onClose={() => setIsDeletePopupOpen(false)}
        />
      )}
    </>
  );
};

export default CredentialsTable;

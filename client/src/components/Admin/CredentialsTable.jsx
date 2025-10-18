import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import {Trash2, Key, Users} from "lucide-react";

const CredentialsTable = ({ users, handleDelete, handleChangePassword }) => {
  const getAvatar = (username) => {
    const avatar = createAvatar(botttsNeutral, { seed: username });
    return avatar.toDataUri();
  };

  if (users.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No users found</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse bg-white rounded-md border border-gray-200">
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
            <td className="px-6 py-3.5 text-sm text-gray-600">{user.createdAt}</td>
            <td className="px-6 py-3.5">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleChangePassword(user.username)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors text-sm font-medium"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
                <button
                  onClick={() => handleDelete(user.username)}
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
  );
};

export default CredentialsTable;
import React, { useState, useEffect } from "react";
import { Search, UserStar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const CredentialsHeader = () => {
  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 relative">
      <div className="flex items-center gap-3">
        <UserStar className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

    </div>
  );
};

export default CredentialsHeader;

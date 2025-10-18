import {  Search, UserStar, } from "lucide-react";
const CredentialsHeader = ({ searchTerm, setSearchTerm }) => (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <UserStar className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
      </div>
  
      <div className="w-1/3 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by username or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
    </div>
  );

export default CredentialsHeader;
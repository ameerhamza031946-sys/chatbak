import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
          alt={user.name}
          className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600/50 object-cover flex-shrink-0"
        />
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {user.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user.email}
          </span>
        </div>
      </div>
      
      <button
        onClick={logout}
        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-all duration-200 flex-shrink-0"
        title="Log Out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
};

export default UserProfile;

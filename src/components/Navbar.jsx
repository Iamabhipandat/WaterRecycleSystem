import { Droplets, LayoutDashboard, LogOut, Settings } from "lucide-react";
import ModeToggle from "./ModeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ liveMode, connected, error, onToggleMode, onOpenAdmin, view }) {
  const { profile, isAdmin, logout } = useAuth();
  const links = ["Water Flow", "System Status", "Analytics"];
  const ids = ["flow", "status", "analytics"];

  return (
    <nav className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center shadow-sm">
          <Droplets size={18} className="text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-gray-900 tracking-tight">JalLoop</span>
          <span className="ml-2 text-xs text-gray-400 font-medium hidden sm:inline">Smart Water Recycling</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {view === "dashboard" && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  const el = document.getElementById(ids[i]);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <ModeToggle
          liveMode={liveMode}
          connected={connected}
          error={error}
          onToggle={onToggleMode}
        />

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              view === "admin"
                ? "bg-green-700 text-white border-green-700"
                : "text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard size={14} />
            Admin
          </button>
        )}

        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs font-semibold text-gray-800">{profile?.name || "User"}</span>
          <span className="text-[10px] text-gray-400 capitalize">{profile?.role || "user"}</span>
        </div>

        <button
          onClick={logout}
          title="Log out"
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <LogOut size={16} />
        </button>

        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <Settings size={16} />
        </button>
      </div>
    </nav>
  );
}

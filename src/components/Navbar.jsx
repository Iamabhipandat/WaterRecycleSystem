import { useState } from "react";
import { Cloud, Droplets, LayoutDashboard, LogOut, Settings, Menu, X, Cpu, Activity, BarChart3 } from "lucide-react";
import ModeToggle from "./ModeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar({
  liveMode,
  connected,
  error,
  onToggleMode,
  onOpenAdmin,
  onOpenAwsCenter,
  onNavigate,
  view,
}) {
  const { profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "flow", label: "Water Flow", icon: Droplets },
    { id: "virtual-hardware", label: "Virtual Hardware", icon: Cpu },
    { id: "status", label: "System Status", icon: Activity },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleSelectPage = (id) => {
    if (onNavigate) onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleSelectPage("flow")}
          title="Go to Water Flow"
        >
          <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center shadow-xs group-hover:bg-green-800 transition-colors">
            <Droplets size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight">JalLoop</span>
            <span className="ml-2 text-xs text-gray-400 font-medium hidden sm:inline">Smart Water Recycling</span>
          </div>
        </div>

        {/* Desktop Navigation Page Links */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = view === id || (view === "dashboard" && id === "flow");
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectPage(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-green-700 text-white shadow-xs"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-gray-400"} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AWS Open Source & Cloud Center Trigger */}
          <button
            type="button"
            onClick={onOpenAwsCenter}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all shadow-2xs hover:scale-102 cursor-pointer"
            title="Open AWS Open Source & Cloud Architecture Center"
          >
            <Cloud size={13} className="text-amber-600" />
            <span className="hidden sm:inline">AWS Cloud</span>
            <span className="sm:hidden">AWS</span>
          </button>

          <ModeToggle
            liveMode={liveMode}
            connected={connected}
            error={error}
            onToggle={onToggleMode}
          />

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                view === "admin"
                  ? "bg-green-700 text-white border-green-700"
                  : "text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard size={13} />
              Admin
            </button>
          )}

          <div className="hidden sm:flex flex-col items-end leading-tight pl-1 border-l border-gray-200">
            <span className="text-xs font-semibold text-gray-800">{profile?.name || "User"}</span>
            <span className="text-[10px] text-gray-400 capitalize">{profile?.role || "user"}</span>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden cursor-pointer"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-gray-50 border-t border-gray-200 space-y-1.5 animate-fadeIn">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Pages</p>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = view === id || (view === "dashboard" && id === "flow");
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectPage(id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-green-700 text-white shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-green-700"} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (onOpenAdmin) onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <LayoutDashboard size={14} />
              <span>Admin Dashboard</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

import { useState } from "react";
import { Droplets, LayoutDashboard, LogOut, Settings, Menu, X, Cpu, Activity, BarChart3, Leaf, UserCheck } from "lucide-react";
import ModeToggle from "./ModeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar({
  liveMode,
  connected,
  error,
  onToggleMode,
  onOpenAdmin,
  onNavigate,
  onOpenAuth,
  view,
}) {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "explore", label: "Explore & Mission", icon: Leaf },
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
          onClick={() => handleSelectPage("explore")}
          title="Go to Explore & Mission"
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

          {!user ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Sign In / Sign Up</span>
            </button>
          ) : (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight pl-1 border-l border-gray-200">
                <span className="text-xs font-semibold text-gray-800">{profile?.name || "User"}</span>
                <span className="text-[10px] text-gray-400 capitalize">{profile?.role || "user"}</span>
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="hidden sm:flex p-1.5 sm:p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </>
          )}

          {/* Mobile Menu Toggle Button (Three Icon / Hamburger) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-200 lg:hidden cursor-pointer"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-gray-950/30 lg:hidden" />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(84vw,320px)] bg-white border-r border-gray-200 shadow-2xl lg:hidden animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700"><Droplets size={17} className="text-white" /></div>
                <div>
                  <p className="text-sm font-black text-gray-900">JalLoop</p>
                  <p className="text-[10px] text-gray-400">Water management</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Close menu"><X size={18} /></button>
            </div>
            <div className="space-y-1 px-3 py-5">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Workspace</p>
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = view === id || (view === "dashboard" && id === "flow");
                return (
                  <button key={id} type="button" onClick={() => handleSelectPage(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-all cursor-pointer ${isActive ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>
                    <Icon size={17} className={isActive ? "text-white" : "text-gray-400"} />
                    <span>{label}</span>
                  </button>
                );
              })}
              {isAdmin && (
                <button onClick={() => { if (onOpenAdmin) onOpenAdmin(); setMobileMenuOpen(false); }} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <LayoutDashboard size={17} className="text-gray-400" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {/* Mobile Auth / Profile in Drawer */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Account Access</p>
                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuth) onOpenAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white shadow-xs hover:bg-green-800 transition-colors cursor-pointer"
                  >
                    <UserCheck size={18} />
                    <span>Sign In / Sign Up</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-800">{profile?.name || "Logged In User"}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{profile?.role || "Citizen Member"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current workspace</p>
              <p className="mt-1 text-xs font-semibold text-gray-700">{liveMode ? "Hardware connection" : "Demo simulation"}</p>
            </div>
          </aside>
        </>
      )}
    </nav>
  );
}

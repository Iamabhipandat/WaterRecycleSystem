import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { ArrowLeft, Cpu, Users, Wifi } from "lucide-react";
import { db } from "../services/firebase";

function formatTime(ts) {
  const n = typeof ts === "number" ? ts : Number(ts);
  if (!n) return "—";
  return new Date(n).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminDashboard({ onBack, hardwareConnected }) {
  const [users, setUsers] = useState({});
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (!db) return undefined;
    const unsubUsers = onValue(ref(db, "users"), (snap) => setUsers(snap.val() || {}));
    const unsubPresence = onValue(ref(db, "presence"), (snap) => setPresence(snap.val() || {}));
    return () => {
      unsubUsers();
      unsubPresence();
    };
  }, []);

  const rows = useMemo(() => {
    return Object.entries(users)
      .map(([uid, u]) => {
        const p = presence[uid] || {};
        const online = p.online === true || u.online === true;
        return {
          uid,
          name: u.name || "—",
          email: u.email || p.email || "—",
          role: u.role === "admin" ? "admin" : "user",
          online,
          lastSeen: p.lastSeen || u.lastSeen,
        };
      })
      .sort((a, b) => Number(b.online) - Number(a.online) || String(a.name).localeCompare(b.name));
  }, [users, presence]);

  const total = rows.length;
  const onlineCount = rows.filter((r) => r.online).length;
  const adminCount = rows.filter((r) => r.role === "admin").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin overview</h1>
          <p className="text-sm text-gray-500 mt-1">Accounts using JalLoop and live hardware status.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <Users size={14} /> Registered users
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <Wifi size={14} /> Online now
            </div>
            <p className="text-3xl font-bold text-green-700 mt-2">{onlineCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <Cpu size={14} /> Hardware
            </div>
            <p className={`text-3xl font-bold mt-2 ${hardwareConnected ? "text-blue-700" : "text-gray-400"}`}>
              {hardwareConnected ? "Live" : "Offline"}
            </p>
            <p className="text-xs text-gray-400 mt-1">{adminCount} admin{adminCount === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No accounts yet.</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.uid} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.name}</td>
                      <td className="px-5 py-3 text-gray-600">{r.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.role === "admin" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {r.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          r.online ? "text-green-700" : "text-gray-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.online ? "bg-green-500" : "bg-gray-300"}`} />
                          {r.online ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatTime(r.lastSeen)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { CheckCircle2, Cpu, ExternalLink, X } from "lucide-react";

export default function HardwareConnectionModal({ isOpen, onClose, onConnect, connected }) {
  const [deviceName, setDeviceName] = useState(() => localStorage.getItem("jalloop.hardwareDeviceName") || "JalLoop ESP32");

  if (!isOpen) return null;

  function handleConnect() {
    const name = deviceName.trim() || "JalLoop ESP32";
    localStorage.setItem("jalloop.hardwareDeviceName", name);
    onConnect(name);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Cpu size={21} /></div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Connect physical hardware</h2>
              <p className="text-xs text-gray-500">Connect an ESP32 to the JalLoop Firebase channel.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Device name</span>
            <input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="JalLoop ESP32" />
          </label>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
            <p className="font-bold">Before connecting</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Flash the JalLoop firmware to your ESP32.</li>
              <li>Use the same Firebase Realtime Database configuration in the firmware.</li>
              <li>Keep the ESP32 online so it can publish sensor data and receive commands.</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a href="https://wokwi.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"><ExternalLink size={14} /> Test in Wokwi</a>
            <button type="button" onClick={handleConnect} className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-800"><CheckCircle2 size={14} /> {connected ? "Connected" : "Connect hardware"}</button>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">The app shows <strong>ESP32 Synced</strong> only after live sensor data arrives. Connecting here does not start pumps or water collection.</p>
        </div>
      </div>
    </div>
  );
}
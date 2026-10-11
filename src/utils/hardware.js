/** Distinct Phase Color Definitions for Hardware Diagram & Indicators */
export const PHASE_COLORS = {
  COLLECTION: {
    name: "Collection Phase",
    primary: "#F59E0B",   // Yellow / Amber
    secondary: "#FEF3C7", // Amber light bg
    border: "#FBBF24",
    text: "#92400E",
    pulse: "animate-pulse",
  },
  RECYCLING: {
    name: "Recycling / Filtration Phase",
    primary: "#06B6D4",   // Blue / Cyan
    secondary: "#E0F2FE", // Cyan light bg
    border: "#38BDF8",
    text: "#075985",
    pulse: "animate-pulse",
  },
  DISTRIBUTION: {
    name: "Reused / Distribution Phase",
    primary: "#10B981",   // Green / Emerald
    secondary: "#D1FAE5", // Green light bg
    border: "#34D399",
    text: "#065F46",
    pulse: "animate-pulse",
  },
  IDLE: {
    name: "System Standby",
    primary: "#9CA3AF",   // Neutral Gray
    secondary: "#F3F4F6",
    border: "#E5E7EB",
    text: "#4B5563",
    pulse: "",
  }
};

/** Resolves the current active process phase based on hardware state */
export function getActivePhase(s) {
  if (!s) return "IDLE";
  if (s.reuseActive) return "DISTRIBUTION";
  if (s.pumpRunning || (Number(s.filtrationStage) || 0) > 0) return "RECYCLING";
  if (s.roActive || s.washingActive || s.rainActive) return "COLLECTION";
  return "IDLE";
}

/** Map dashboard water-flow state to ESP32 LED flags. */
export function ledsFromState(s) {
  const stage = Number(s?.filtrationStage) || 0;
  const reuse = !!s?.reuseActive;
  const hasCollectionSpace = (Number(s?.collectionLiters) || 0) < (Number(s?.collectionCapacity) || 0);
  const hasCollectionWater = (Number(s?.collectionLiters) || 0) > 0;
  const hasRecycledWater = (Number(s?.recycledLiters) || 0) > 0;
  const sources = !!(s?.roActive || s?.washingActive || s?.rainActive) && hasCollectionSpace;
  const recycling = (Boolean(s?.pumpRunning) || stage > 0) && hasCollectionWater;
  const distribution = reuse && hasRecycledWater;

  return {
    ro: false,
    washing: false,
    rain: false,
    collection: sources,
    filter1: stage >= 1,
    filter2: stage >= 2,
    filter3: stage >= 3,
    pump: recycling,
    recycled: recycling,
    reuse: distribution,
    reuseToilet: distribution,
    reuseGarden: distribution,
    reuseCleaning: distribution,
  };
}

export const LED_LABELS = [
  { key: "collection", label: "Water Collection" },
  { key: "recycled", label: "Water Recycling" },
  { key: "reuse", label: "Water Reuse" },
];

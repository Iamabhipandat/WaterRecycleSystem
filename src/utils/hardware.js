/** Map dashboard water-flow state to ESP32 LED flags. */
export function ledsFromState(s) {
  const stage = Number(s.filtrationStage) || 0;
  const reuse = !!s.reuseActive;
  const sources = !!(s.roActive || s.washingActive || s.rainActive);

  return {
    ro: !!s.roActive,
    washing: !!s.washingActive,
    rain: !!s.rainActive,
    collection: sources,
    filter1: stage >= 1,
    filter2: stage >= 2,
    filter3: stage >= 3,
    pump: !!s.pumpRunning,
    recycled: (Number(s.recycledLiters) || 0) > 0 || (Number(s.recycledPct) || 0) > 0,
    reuse,
    reuseToilet: reuse,
    reuseGarden: reuse,
    reuseCleaning: reuse,
  };
}

export const LED_LABELS = [
  { key: "ro", label: "RO wastewater" },
  { key: "washing", label: "Washing machine" },
  { key: "rain", label: "Rainwater" },
];

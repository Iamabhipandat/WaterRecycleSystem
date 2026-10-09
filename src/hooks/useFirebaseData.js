import { useCallback, useEffect, useRef, useState } from "react";
import { onValue, ref, set, update } from "firebase/database";
import { db, isFirebaseReady } from "../services/firebase";

const STALE_MS = 8000;

export function useFirebaseData(liveMode) {
  const [liveData, setLiveData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const lastHeard = useRef(0);

  useEffect(() => {
    if (!liveMode || !isFirebaseReady) {
      setConnected(false);
      setLiveData(null);
      setError(null);
      lastHeard.current = 0;
      return undefined;
    }

    const connectionRef = ref(db, ".info/connected");
    const sensorRef = ref(db, "sensorData");

    const unsubscribeConnection = onValue(
      connectionRef,
      (snapshot) => {
        if (snapshot.val() === true) setError(null);
      },
      (err) => {
        setError(err.message);
        setConnected(false);
      }
    );

    const unsubscribeSensor = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setLiveData(null);
          setConnected(false);
          return;
        }
        lastHeard.current = Date.now();
        setLiveData(data);
        setConnected(true);
      },
      (err) => {
        setError(err.message);
        setConnected(false);
      }
    );

    const staleTimer = setInterval(() => {
      if (!lastHeard.current) {
        setConnected(false);
        return;
      }
      setConnected(Date.now() - lastHeard.current < STALE_MS);
    }, 2000);

    return () => {
      unsubscribeConnection();
      unsubscribeSensor();
      clearInterval(staleTimer);
    };
  }, [liveMode]);

  const sendCommand = useCallback((command) => {
    if (!liveMode || !isFirebaseReady) return;
    update(ref(db, "commands"), { ...command, updatedAt: Date.now() }).catch((err) => {
      console.error("[Firebase] Command failed:", err);
    });
  }, [liveMode]);

  const syncLeds = useCallback((leds) => {
    if (!liveMode || !isFirebaseReady) return;
    const payload = { ...leds, updatedAt: Date.now() };
    set(ref(db, "hardware/leds"), payload).catch((err) => {
      console.error("[Firebase] LED sync failed:", err);
    });
    update(ref(db, "commands"), { leds: payload, updatedAt: Date.now() }).catch(() => {});
  }, [liveMode]);

  return { liveData, connected, error, sendCommand, syncLeds };
}

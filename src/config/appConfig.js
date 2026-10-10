/** Emails that always get the admin dashboard (lowercase). */
export const ADMIN_EMAILS = ["admin@jalloop.com"];

/** Optional signup field — users who enter this become admins. */
export const ADMIN_INVITE_CODE = "JALLOOP-ADMIN";

/** Water Collection & Inflow Simulation Parameters (Tunable) */
export const COLLECTION_INTERVAL_MS = 5000; // 5 seconds per update tick
export const RO_INFLOW_RATE = 0.08;          // Liters per tick for RO wastewater
export const WASHING_INFLOW_RATE = 0.12;     // Liters per tick for Washing machine
export const RAIN_INFLOW_RATE = 0.05;        // Liters per tick for Rainwater catchment

/** Water Filtration / Pump Simulation Parameters (Tunable) */
export const PUMP_INTERVAL_MS = 2500;        // 2.5 seconds per pump cycle
export const PUMP_FLOW_RATE_PER_TICK = 1.2;  // Liters transferred per cycle

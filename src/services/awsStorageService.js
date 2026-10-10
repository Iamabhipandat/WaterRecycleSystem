/**
 * AWS Open Source Storage Service
 * Tracks and visualizes where water storage data is persisted across AWS Open Source services:
 * 1. DynamoDB (LocalStack / Open engine) -> Table: JalLoopWaterMetrics
 * 2. OpenSearch 2.x (Open Source Search & Telemetry) -> Index: jalloop-water-telemetry
 * 3. Amazon S3 / MinIO (LocalStack Object Store) -> Bucket: s3://jalloop-water-archive-default
 * 4. AWS Cedar Policy Engine -> Safety Invariant Store: policies/jalloop.cedar
 * 5. AWS EventBridge -> Event Bus: default / Rules: WaterAlertEventRule
 * 6. AWS Strands Agents SDK -> Autonomous storage telemetry analysis
 */

export function getCollectionTankAwsStorage(state) {
  const liters = Math.round((state?.collectionLiters ?? 55) * 10) / 10;
  const capacity = state?.collectionCapacity ?? 100;
  const pct = Math.round((liters / capacity) * 100);
  const now = Date.now();
  const iso = new Date(now).toISOString();

  return {
    id: "collection",
    title: "Collection Tank (Greywater Storage)",
    badge: "Greywater Inflow Buffer",
    color: "blue",
    volumeLiters: liters,
    capacityLiters: capacity,
    percent: pct,
    status: liters >= 90 ? "Full" : liters < 10 ? "Low" : "Collecting",
    sensor: "HC-SR04 Ultrasonic Sonar (Trig: GPIO 5, Echo: GPIO 18)",
    distanceCm: Math.round(30 - (pct / 100) * 25),

    // 1. DynamoDB Storage (LocalStack)
    dynamoDb: {
      service: "Amazon DynamoDB (LocalStack / NoSQL Engine)",
      openSourceTrack: "Serverless (SAM CLI & LocalStack)",
      table: "JalLoopWaterMetrics",
      billingMode: "PAY_PER_REQUEST",
      partitionKey: "deviceId (String) = \"ESP32_COLLECTION_TANK_01\"",
      sortKey: `timestamp (Number) = ${now}`,
      payload: {
        deviceId: "ESP32_COLLECTION_TANK_01",
        timestamp: now,
        isoTimestamp: iso,
        tank_id: "COLLECTION_TANK_01",
        tank_type: "GREYWATER_COLLECTION",
        volume_liters: liters,
        capacity_liters: capacity,
        fill_percentage: pct,
        inflow_sources: {
          ro_wastewater: state?.roActive ?? true,
          washing_machine: state?.washingActive ?? true,
          rainwater: state?.rainActive ?? true,
        },
        sensor_reading: {
          sensor_type: "HC-SR04_ULTRASONIC",
          distance_cm: Math.round(30 - (pct / 100) * 25),
          echo_latency_ms: 1.15,
        },
        system_status: state?.pumpRunning ? "PUMPING_OUT" : "COLLECTING",
        ttl_retention_days: 90,
      },
    },

    // 2. OpenSearch Storage
    openSearch: {
      service: "OpenSearch 2.x (Open Source Search & Telemetry)",
      openSourceTrack: "Data and Search (OpenSearch / S3)",
      index: "jalloop-water-telemetry",
      docId: `doc_col_tank_${now}`,
      cluster: "http://localhost:9200 (Active Cluster)",
      payload: {
        _index: "jalloop-water-telemetry",
        _id: `doc_col_tank_${now}`,
        "@timestamp": iso,
        tank: "collection",
        tankType: "Greywater Buffer",
        volumeLiters: liters,
        capacityLiters: capacity,
        fillPercent: pct,
        waterQuality: "Raw Greywater",
        turbidityNTU: 24.5,
        phase: "COLLECTION",
        inflowActive: Boolean(state?.roActive || state?.washingActive || state?.rainActive),
        queryTags: ["storage_tank", "greywater", "collection_buffer"],
      },
    },

    // 3. Amazon S3 Cold Storage
    s3: {
      service: "Amazon S3 / MinIO (Object Storage via LocalStack)",
      openSourceTrack: "Storage & Archival",
      bucket: "s3://jalloop-water-archive-default",
      objectKey: `telemetry/collection-tank/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getDate()).padStart(2, "0")}/col-tank-${now}.json`,
      storageClass: "INTELLIGENT_TIERING / STANDARD",
      encrypted: "AES-256 (SSE-S3)",
      retentionPolicy: "7-Year Environmental Audit Log",
    },

    // 4. AWS Cedar Policy Safety Invariant
    cedarPolicy: {
      service: "AWS Cedar Policy Engine",
      openSourceTrack: "Security & Safety Invariants",
      policyFile: "policies/jalloop.cedar",
      ruleId: "policy_dry_run_prevention",
      policyText: `permit (principal, action == Action::"PumpWater", resource == Resource::"CollectionTank")\nwhen {\n  resource.volume > 5\n};`,
      status: liters > 5 ? "PERMITTED (Safe: > 5 Litres)" : "FORBIDDEN (Dry-Run Lockout Armed)",
      isSafe: liters > 5,
    },

    // 5. AWS EventBridge Alert Route
    eventBridge: {
      service: "AWS EventBridge (Open Event Bus via LocalStack)",
      openSourceTrack: "Event-Driven Architecture",
      busName: "default",
      ruleName: "CollectionTankLowAlert",
      eventPattern: {
        source: ["jalloop.water.system"],
        "detail-type": ["CollectionTankLevelAlert"],
      },
      currentTrigger: liters < 10 ? "TRIGGERED: Low greywater buffer (< 10 L)" : "ARMED / NORMAL",
    },
  };
}

export function getRecycledTankAwsStorage(state) {
  const liters = Math.round(state?.recycledLiters ?? 72);
  const capacity = state?.recycledCapacity ?? 200;
  const pct = Math.round(state?.recycledPct ?? 36);
  const now = Date.now();
  const iso = new Date(now).toISOString();

  return {
    id: "recycled",
    title: "Recycled Tank (Clean Treated Storage)",
    badge: "Non-Potable Treated Reservoir",
    color: "emerald",
    volumeLiters: liters,
    capacityLiters: capacity,
    percent: pct,
    status: pct >= 90 ? "Near Full" : liters <= 5 ? "Empty" : "Storing",
    sensor: "HC-SR04 Ultrasonic Sonar (Trig: GPIO 19, Echo: GPIO 21)",
    distanceCm: Math.round(35 - (pct / 100) * 30),

    // 1. DynamoDB Storage (LocalStack)
    dynamoDb: {
      service: "Amazon DynamoDB (LocalStack / NoSQL Engine)",
      openSourceTrack: "Serverless (SAM CLI & LocalStack)",
      table: "JalLoopWaterMetrics",
      billingMode: "PAY_PER_REQUEST",
      partitionKey: "deviceId (String) = \"ESP32_RECYCLED_TANK_02\"",
      sortKey: `timestamp (Number) = ${now}`,
      payload: {
        deviceId: "ESP32_RECYCLED_TANK_02",
        timestamp: now,
        isoTimestamp: iso,
        tank_id: "RECYCLED_TANK_02",
        tank_type: "TREATED_RECYCLED_WATER",
        volume_liters: liters,
        capacity_liters: capacity,
        fill_percentage: pct,
        fresh_water_saved_liters: Math.round(state?.freshWaterSaved ?? 72),
        water_quality: "FILTERED_NON_POTABLE",
        hardware_led_indicator: {
          led_name: "LED 1: Recycled Storing",
          gpio_pin: 15,
          color: "Sky Blue",
          is_lit: pct > 0 || state?.pumpRunning,
        },
        distribution_led_indicator: {
          led_name: "LED 2: Reused Distribution",
          gpio_pins: [2, 17, 13],
          color: "Emerald Green",
          is_lit: state?.reuseActive,
        },
        reuse_endpoints: {
          toilet_flushing: state?.reuseActive ?? false,
          gardening: state?.reuseActive ?? false,
          floor_cleaning: state?.reuseActive ?? false,
        },
        sensor_reading: {
          sensor_type: "HC-SR04_ULTRASONIC",
          distance_cm: Math.round(35 - (pct / 100) * 30),
          echo_latency_ms: 1.05,
        },
        storage_status: pct >= 90 ? "OVERFLOW_LOCKOUT" : "STORING_SAFE",
        ttl_retention_days: 90,
      },
    },

    // 2. OpenSearch Storage
    openSearch: {
      service: "OpenSearch 2.x (Open Source Search & Telemetry)",
      openSourceTrack: "Data and Search (OpenSearch / S3)",
      index: "jalloop-water-telemetry",
      docId: `doc_rec_tank_${now}`,
      cluster: "http://localhost:9200 (Active Cluster)",
      payload: {
        _index: "jalloop-water-telemetry",
        _id: `doc_rec_tank_${now}`,
        "@timestamp": iso,
        tank: "recycled",
        tankType: "Treated Recycled Storage",
        volumeLiters: liters,
        capacityLiters: capacity,
        fillPercent: pct,
        freshWaterSaved: Math.round(state?.freshWaterSaved ?? 72),
        waterQuality: "Good (Non-Potable)",
        turbidityNTU: 0.8,
        phase: state?.reuseActive ? "DISTRIBUTION" : state?.pumpRunning ? "RECYCLING" : "STANDBY",
        reuseActive: state?.reuseActive ?? false,
        queryTags: ["storage_tank", "recycled_water", "clean_storage", "water_savings"],
      },
    },

    // 3. Amazon S3 Cold Storage
    s3: {
      service: "Amazon S3 / MinIO (Object Storage via LocalStack)",
      openSourceTrack: "Storage & Archival",
      bucket: "s3://jalloop-water-archive-default",
      objectKey: `telemetry/recycled-tank/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getDate()).padStart(2, "0")}/rec-tank-${now}.json`,
      storageClass: "INTELLIGENT_TIERING / STANDARD",
      encrypted: "AES-256 (SSE-S3)",
      retentionPolicy: "Permanent Environmental ESG Water Credit Ledger",
    },

    // 4. AWS Cedar Policy Safety Invariant
    cedarPolicy: {
      service: "AWS Cedar Policy Engine",
      openSourceTrack: "Security & Safety Invariants",
      policyFile: "policies/jalloop.cedar",
      ruleId: "policy_overflow_prevention",
      policyText: `forbid (principal, action == Action::"PumpWater", resource)\nwhen {\n  context.recycledTankPct >= 90\n};`,
      status: pct >= 90 ? "FORBIDDEN (Overflow Lockout Active: >= 90%)" : "PERMITTED (Safe: < 90% Threshold)",
      isSafe: pct < 90,
    },

    // 5. AWS EventBridge Alert Route
    eventBridge: {
      service: "AWS EventBridge (Open Event Bus via LocalStack)",
      openSourceTrack: "Event-Driven Architecture",
      busName: "default",
      ruleName: "WaterAlertEventRule",
      eventPattern: {
        source: ["jalloop.water.system"],
        "detail-type": ["WaterAlert"],
      },
      currentTrigger: pct >= 90 ? "TRIGGERED: Recycled Tank at Maximum Capacity" : "ARMED / NORMAL",
    },
  };
}

export function getFiltrationUnitAwsStorage(state) {
  const stage = state?.filtrationStage ?? 0;
  const now = Date.now();
  const iso = new Date(now).toISOString();

  return {
    id: "filtration",
    title: "Multi-Stage Filtration Bank",
    badge: "Intermediate Treatment Unit",
    color: "cyan",
    currentStage: stage,
    stageName: stage === 1 ? "Pre-Filter (Particles)" : stage === 2 ? "Sediment Screen" : stage === 3 ? "Activated Carbon Treatment" : "Standby",
    turbidityNTU: stage > 0 ? 0.8 : 22.0,

    dynamoDb: {
      service: "Amazon DynamoDB (LocalStack)",
      table: "JalLoopWaterMetrics",
      partitionKey: "deviceId (String) = \"ESP32_FILTER_BANK_01\"",
      sortKey: `timestamp (Number) = ${now}`,
      payload: {
        deviceId: "ESP32_FILTER_BANK_01",
        timestamp: now,
        isoTimestamp: iso,
        filtration_stage: stage,
        submersible_pump_relay: state?.pumpRunning ? "ACTIVE_LOW_ON" : "OFF",
        pre_filter_solenoid_gpio25: stage >= 1 ? "OPEN" : "CLOSED",
        sediment_solenoid_gpio33: stage >= 2 ? "OPEN" : "CLOSED",
        carbon_treatment_gpio32: stage >= 3 ? "ACTIVE" : "STANDBY",
      },
    },

    openSearch: {
      service: "OpenSearch 2.x",
      index: "jalloop-water-telemetry",
      docId: `doc_filter_bank_${now}`,
      payload: {
        _index: "jalloop-water-telemetry",
        "@timestamp": iso,
        filtrationStage: stage,
        turbidityNTU: stage > 0 ? 0.8 : 22.0,
        pumpRunning: Boolean(state?.pumpRunning),
        filterLifespanHealthPct: 98,
      },
    },

    strandsAgent: {
      service: "AWS Strands Agents SDK (ReAct AI)",
      role: "Autonomous Water Quality & Pump Scheduling Agent",
      status: "MONITORING",
      insight: stage > 0 ? "Filtration cycle active. Turbidity dropping from 24 NTU to 0.8 NTU. Flow rate nominal." : "Filtration idle. Pre-filter ready for next cycle.",
    },
  };
}

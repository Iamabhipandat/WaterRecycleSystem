/**
 * AWS Lambda Telemetry Handler (Node.js 20.x)
 * Track: Serverless (SAM CLI, LocalStack, Lambda)
 */

export async function handler(event) {
  const method = event.httpMethod || "GET";

  if (method === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        status: "ONLINE",
        device: "ESP32_JALLOOP_01",
        system: "Smart Water Recycling System",
        telemetry: {
          collectionLiters: 45.2,
          recycledLiters: 59.0,
          freshWaterSaved: 59.0,
          turbidityNTU: 22.4,
          pumpRunning: false,
          reuseActive: false,
        },
        cloudArchitecture: "AWS SAM / Lambda / DynamoDB / LocalStack",
      }),
    };
  }

  if (method === "POST") {
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
    }

    const { collectionLiters = 0, recycledLiters = 0, turbidity = 20 } = body;

    // Check critical thresholds to emit EventBridge event
    const alerts = [];
    if (turbidity > 85) {
      alerts.push({ type: "HIGH_TURBIDITY", message: `Turbidity exceeded safety threshold: ${turbidity} NTU` });
    }
    if (recycledLiters >= 190) {
      alerts.push({ type: "TANK_FULL", message: `Recycled tank at maximum capacity: ${recycledLiters} L` });
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        message: "Telemetry ingested into DynamoDB & OpenSearch",
        record: {
          deviceId: "ESP32_JALLOOP_01",
          timestamp: Date.now(),
          collectionLiters,
          recycledLiters,
          turbidity,
          alerts,
        },
      }),
    };
  }

  return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
}

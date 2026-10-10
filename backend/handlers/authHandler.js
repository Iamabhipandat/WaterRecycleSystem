/**
 * AWS Lambda Auth & Cedar Policy Evaluation Handler
 * Track: Auth and policy (Cedar / Cognito)
 */

export async function handler(event) {
  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { role = "user", action = "ViewTelemetry", resource = {} } = body;
  const turbidity = Number(resource.turbidity || 0);
  const recycledLiters = Number(resource.recycledLiters || 0);

  // Evaluate Cedar Safety Invariants (Policy 4 and Policy 5)
  if (action === "StartRecycling" && turbidity > 85) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        decision: "DENY",
        reason: `Safety Invariant: Turbidity ${turbidity} NTU exceeds 85 NTU limit. Membrane protection active.`,
        policy: "policy-4-forbid-high-turbidity",
      }),
    };
  }

  if (action === "UseRecycledWater" && recycledLiters < 5) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        decision: "DENY",
        reason: `Cavitation Invariant: Recycled water (${recycledLiters} L) is below 5 L safety reserve.`,
        policy: "policy-5-forbid-low-reserve",
      }),
    };
  }

  // Permit evaluation
  const isAdmin = role.toLowerCase() === "admin";
  const isOperator = role.toLowerCase() === "operator";
  const allowed =
    isAdmin ||
    (isOperator && ["ViewTelemetry", "StartRecycling", "UseRecycledWater", "ExportAnalytics"].includes(action)) ||
    ["ViewTelemetry", "ViewAnalytics"].includes(action);

  return {
    statusCode: allowed ? 200 : 403,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      decision: allowed ? "ALLOW" : "DENY",
      role,
      action,
      reason: allowed
        ? `Authorized by Cedar policy for role '${role}'`
        : `Denied: Role '${role}' lacks permit policy for action '${action}'`,
    }),
  };
}

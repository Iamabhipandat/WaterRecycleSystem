/**
 * AWS Cedar Policy Evaluator Service
 * Open Source: https://www.cedarpolicy.com
 * Category: Auth and policy (Cedar / Cognito)
 *
 * Implements role-based access control and safety invariants
 * matching policies/jalloop.cedar.
 */

export const CEDAR_POLICIES_TEXT = `// JalLoop AWS Cedar Policies
permit (principal in JalLoop::Role::"Admin", action, resource);

permit (
    principal in JalLoop::Role::"Operator",
    action in [
        JalLoop::Action::"ViewTelemetry",
        JalLoop::Action::"StartRecycling",
        JalLoop::Action::"UseRecycledWater",
        JalLoop::Action::"ToggleInflowSources",
        JalLoop::Action::"ExportAnalytics"
    ],
    resource
);

permit (
    principal in JalLoop::Role::"Viewer",
    action in [
        JalLoop::Action::"ViewTelemetry",
        JalLoop::Action::"ViewAnalytics"
    ],
    resource
);

forbid (
    principal,
    action == JalLoop::Action::"StartRecycling",
    resource
) when { resource.turbidity > 85 };

forbid (
    principal,
    action == JalLoop::Action::"UseRecycledWater",
    resource
) when { resource.recycledLiters < 5 };
`;

/**
 * Evaluates an authorization request against the Cedar policy set.
 *
 * @param {Object} params
 * @param {string} params.role - "admin" | "operator" | "user" | "guest"
 * @param {string} params.action - e.g. "StartRecycling", "UseRecycledWater", "ViewTelemetry"
 * @param {Object} params.resource - Resource attributes e.g. { turbidity: 45, recycledLiters: 50 }
 * @returns {Object} { decision: "ALLOW" | "DENY", reason: string, policyId: string }
 */
export function evaluateCedarPolicy({ role = "user", action, resource = {} }) {
  const normRole = (role || "").toLowerCase();
  const turbidity = Number(resource.turbidity || 0);
  const recycledLiters = Number(resource.recycledLiters || 0);

  // 1. Check Explicit Forbid Policies (Safety Invariants take precedence over permits in Cedar)
  if (action === "StartRecycling" && turbidity > 85) {
    return {
      decision: "DENY",
      reason: `Safety Invariant Violation (Policy 4): Raw inflow turbidity (${turbidity} NTU) exceeds safe filtration limit of 85 NTU.`,
      policyId: "policy-4-forbid-high-turbidity",
      diagnostic: "Cedar 'forbid' rule overrides all permits to prevent membrane degradation.",
    };
  }

  if (action === "UseRecycledWater" && recycledLiters < 5) {
    return {
      decision: "DENY",
      reason: `Cavitation Prevention (Policy 5): Recycled storage volume (${recycledLiters} L) is below 5 L safety reserve.`,
      policyId: "policy-5-forbid-low-reserve",
      diagnostic: "Cedar 'forbid' rule active: pump dry-run protection.",
    };
  }

  // 2. Check Permit Policies by Role
  if (normRole === "admin") {
    return {
      decision: "ALLOW",
      reason: "Principal matches JalLoop::Role::'Admin' (Policy 1: full system privileges).",
      policyId: "policy-1-permit-admin",
      diagnostic: "Permit granted by Policy 1 wildcard action matching.",
    };
  }

  if (normRole === "operator") {
    const operatorActions = [
      "ViewTelemetry",
      "StartRecycling",
      "UseRecycledWater",
      "ToggleInflowSources",
      "ExportAnalytics",
    ];
    if (operatorActions.includes(action)) {
      return {
        decision: "ALLOW",
        reason: `Principal matches JalLoop::Role::'Operator' with permitted action '${action}' (Policy 2).`,
        policyId: "policy-2-permit-operator",
        diagnostic: "Permit granted by Policy 2 explicit action array.",
      };
    }
  }

  if (normRole === "user" || normRole === "viewer") {
    const viewerActions = ["ViewTelemetry", "ViewAnalytics"];
    if (viewerActions.includes(action)) {
      return {
        decision: "ALLOW",
        reason: `Principal matches JalLoop::Role::'Viewer' with permitted action '${action}' (Policy 3).`,
        policyId: "policy-3-permit-viewer",
        diagnostic: "Permit granted by Policy 3 read-only privileges.",
      };
    }
  }

  // 3. Default Cedar Behavior: Implicit Deny if no permit rule matched
  return {
    decision: "DENY",
    reason: `Access Denied: Role '${role}' does not have permit rule for action '${action}'.`,
    policyId: "default-implicit-deny",
    diagnostic: "Cedar authorization model defaults to deny unless an explicit permit policy applies.",
  };
}

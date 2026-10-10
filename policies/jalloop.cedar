// ==============================================================================
// JalLoop Smart Water Recycling System - AWS Cedar Authorization Policies
// Language: AWS Cedar (Open Source: https://www.cedarpolicy.com)
// Track: Auth and policy (Cedar / Cognito)
// ==============================================================================

// Namespace Definition
namespace JalLoop {
    entity User in [Role];
    entity Role;
    entity WaterSystem;
}

// ------------------------------------------------------------------------------
// Policy 1: Admin Superuser Access
// Admins have full access to all system actions and hardware operations
// ------------------------------------------------------------------------------
permit (
    principal in JalLoop::Role::"Admin",
    action,
    resource
);

// ------------------------------------------------------------------------------
// Policy 2: Operator Capabilities
// Operators can monitor telemetry, start recycling, distribute water, and export logs
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
// Policy 3: Viewer Capabilities
// General users and guests can view telemetry and historical savings
// ------------------------------------------------------------------------------
permit (
    principal in JalLoop::Role::"Viewer",
    action in [
        JalLoop::Action::"ViewTelemetry",
        JalLoop::Action::"ViewAnalytics"
    ],
    resource
);

// ------------------------------------------------------------------------------
// Policy 4: CRITICAL SAFETY INVARIANT (Safety Guardrail)
// FORBID starting filtration pump if raw inflow turbidity is too high (> 85 NTU)
// To prevent permanent damage to carbon/sediment filter membranes.
// ------------------------------------------------------------------------------
forbid (
    principal,
    action == JalLoop::Action::"StartRecycling",
    resource
) when {
    resource.turbidity > 85
};

// ------------------------------------------------------------------------------
// Policy 5: DRY-RUN PROTECTION (Safety Guardrail)
// FORBID water distribution if recycled storage volume is critically low (< 5 Liters)
// To prevent cavitation in distribution booster pumps.
// ------------------------------------------------------------------------------
forbid (
    principal,
    action == JalLoop::Action::"UseRecycledWater",
    resource
) when {
    resource.recycledLiters < 5
};

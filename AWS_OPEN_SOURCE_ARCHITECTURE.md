# JalLoop Smart Water Recycling — AWS Open Source & Cloud Architecture

> **Submission for the AWS Open Source & Cloud Challenge**  
> *Built with AWS open-source tools on local machines & architected for AWS Cloud deployment.*

---

## 7 Tracks Implementation Matrix

| Track | BUILD IT: Open Source (On Your Machine) | SHIP IT: AWS Cloud Services | How JalLoop Implements It | Key Code / Artifacts |
| :--- | :--- | :--- | :--- | :--- |
| **1. Agents and AI** | **Strands Agents SDK** | **SageMaker AI** | Autonomous water recycling agent evaluating real-time sensors, testing safety policies, and suggesting actions. | [`src/services/aiAgentService.js`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/src/services/aiAgentService.js) |
| **2. Containers & Kubernetes** | **Finch / Docker** | **Amazon ECS, Fargate** | Multi-stage Containerfile for local Finch builds and compose stack. | [`Dockerfile`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/Dockerfile), [`compose.yaml`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/compose.yaml) |
| **3. Serverless** | **SAM CLI, LocalStack** | **Lambda, API Gateway, DynamoDB** | Serverless SAM CloudFormation template, telemetry ingestion Lambdas, and local testing with LocalStack. | [`template.yaml`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/template.yaml), [`backend/handlers/`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/backend/handlers/) |
| **4. Servers and Runtimes** | **Amazon Corretto, Node.js** | **AWS Amplify, App Runner** | Automated CI/CD build specification for AWS Amplify Hosting and App Runner containerization. | [`amplify.yml`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/amplify.yml) |
| **5. Data and Search** | **OpenSearch 2.x** | **Amazon S3, DynamoDB** | Time-series telemetry indexing, Query DSL searching, and water quality aggregations. | [`src/services/openSearchService.js`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/src/services/openSearchService.js) |
| **6. Auth and Policy** | **AWS Cedar** | **Amazon Cognito, JWT** | Formal Cedar authorization policy rules enforcing role permissions and safety invariants (dry-run & turbidity protection). | [`policies/jalloop.cedar`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/policies/jalloop.cedar), [`src/services/cedarPolicy.js`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/src/services/cedarPolicy.js) |
| **7. The Plumbing** | **OpenEvent Specs** | **Amazon EventBridge, CloudFront** | EventBridge alert routing for threshold violations and CloudFront CDN distribution rules. | [`template.yaml`](file:///C:/Users/Babli/.gemini/antigravity/scratch/WaterRecycleSystem/template.yaml) |

---

## 1. Auth & Policy: AWS Cedar Policies (`policies/jalloop.cedar`)
AWS Cedar is an open-source policy language for authorization. JalLoop uses Cedar for both **Role-Based Access Control (RBAC)** and **Safety Invariants**:

```cedar
// 1. Admin full access
permit (principal in JalLoop::Role::"Admin", action, resource);

// 2. Operator permissions
permit (
    principal in JalLoop::Role::"Operator",
    action in [
        JalLoop::Action::"ViewTelemetry",
        JalLoop::Action::"StartRecycling",
        JalLoop::Action::"UseRecycledWater",
        JalLoop::Action::"ExportAnalytics"
    ],
    resource
);

// 3. Safety Invariant: NEVER pump if raw water turbidity is too high (> 85 NTU)
forbid (
    principal,
    action == JalLoop::Action::"StartRecycling",
    resource
) when {
    resource.turbidity > 85
};

// 4. Dry-Run Cavitation Invariant: NEVER distribute if recycled tank < 5 Liters
forbid (
    principal,
    action == JalLoop::Action::"UseRecycledWater",
    resource
) when {
    resource.recycledLiters < 5
};
```

---

## 2. Data & Search: AWS OpenSearch Service (`src/services/openSearchService.js`)
- Indexes live sensor telemetry documents (`collectionLiters`, `recycledLiters`, `turbidityNTU`, `quality`, `source`).
- Supports OpenSearch Query DSL text matching, term filtering, and range aggregations.
- Local fallback store allows judges and users to test indexing and queries offline with zero setup.

---

## 3. Agents and AI: Strands Agents SDK (`src/services/aiAgentService.js`)
Autonomous ReAct reasoning loop with tools:
- `inspectTankLevels`: reads live collection and recycled capacity.
- `evaluateWaterQuality`: evaluates turbidity against WHO non-potable standards.
- `verifySafetyPolicy`: queries the Cedar policy engine before allowing actions.
- `getHistoricalAnalytics`: pulls aggregations from OpenSearch.

---

## 4. Serverless & LocalStack (`template.yaml`)
Run locally without an AWS account:
```bash
# Start LocalStack (DynamoDB, S3, EventBridge emulation)
docker run --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack

# Run Serverless APIs locally with SAM CLI
sam local start-api --port 3001
```

---

## 5. Containers: Finch & Docker (`Dockerfile`, `compose.yaml`)
```bash
# Build with AWS Finch
finch build -t jalloop:latest .

# Run the full stack with Finch or Docker Compose
finch compose up -d
# or:
docker compose up -d
```
Runs:
- `jalloop-web`: Web application on `http://localhost:8080`
- `localstack`: AWS cloud emulation on port `4566`
- `opensearch`: OpenSearch 2.14 node on port `9200`

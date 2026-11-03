# Architecture Deep Dive: Kubernetes Deployment & CI/CD
**Document ID:** ARCH-K8S-004 | **Status:** DRAFT | **Author:** DevOps Team

## 1. Container Orchestration (Kubernetes)
The entire backend ecosystem is containerized using Docker and orchestrated via Kubernetes (Amazon EKS or Google GKE).

### 1.1 Node Pools
To optimize costs and performance, the cluster utilizes multiple Node Pools:
- **Stateless Pool (Spot Instances):** Runs `MenuSvc` and `AnalyticsSvc`. If a node is preempted (terminated by AWS/GCP to save money), K8s simply spins up the pod on another node. No data is lost.
- **Stateful Pool (On-Demand Instances):** Runs `OrderSvc`, `GeoSvc`, and Kafka/Redis components. Requires high CPU and memory guarantees.

### 1.2 Horizontal Pod Autoscaler (HPA) Configurations
Every microservice is governed by an HPA to handle traffic spikes autonomously.

**OrderSvc HPA YAML Snippet:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-svc-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-svc
  minReplicas: 3
  maxReplicas: 100 # Can scale massively during lunch rushes
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70 # Trigger scale-out when CPU hits 70%
```

---

## 2. CI/CD & Deployment Strategy

### 2.1 ArgoCD (GitOps)
We utilize a GitOps methodology. The infrastructure state is strictly defined in a separate GitHub repository containing Helm charts. ArgoCD constantly monitors this repo. If a change is merged to `main`, ArgoCD automatically synchronizes the Kubernetes cluster to match the repository state.

### 2.2 Blue/Green Deployments
To ensure **Zero Downtime Deployments**:
1. **Blue Environment:** The currently live production version (e.g., v1.0).
2. **Green Environment:** The new version (v1.1) is deployed alongside Blue.
3. Tests are run against the Green environment.
4. The API Gateway (Istio) is instructed to instantly switch 100% of traffic to the Green environment.
5. If errors spike, the Gateway instantly rolls back traffic to Blue (Mean Time to Recovery < 1 second).

---

## 3. Observability & Monitoring

### 3.1 Prometheus & Grafana
- **Metrics Scraping:** Prometheus scrapes metrics (CPU, Memory, Request Latency, Kafka Consumer Lag) from all pods every 10 seconds.
- **AlertManager:** If the 99th percentile (p99) latency of `/api/v1/orders/place` exceeds 300ms, a P1 alert is sent to the DevOps Slack channel and PagerDuty to wake up the on-call engineer.

### 3.2 Distributed Tracing (Jaeger / OpenTelemetry)
Because a single user action (placing an order) touches the API Gateway, OrderSvc, Kafka, and Postgres, we inject a `Trace-ID` at the Gateway. OpenTelemetry passes this ID between all microservices. 
This allows engineers to view a visual "waterfall" graph of exactly how many milliseconds the request spent in every specific microservice to easily identify bottlenecks.

*End of Document.*

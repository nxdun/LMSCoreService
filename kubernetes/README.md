# LMS Core Service Kubernetes Deployment

This folder contains all the necessary Kubernetes manifests to deploy the Learning Management System microservices.

## Prerequisites

- Kubernetes cluster (Minikube, Kind, or a cloud-based Kubernetes service)
- kubectl installed and configured
- Docker images for all services

## Image Preparation

Before deploying to Kubernetes, build and push your Docker images:

```bash
# From the root directory
docker build -t authentication-service:latest ./backend/authentication-service/
docker build -t api-gateway:latest ./backend/api-gateway/
# ... repeat for all services
```

For a production environment, tag and push these images to a container registry.

## Deployment Steps

1. Create a namespace for your application:

```bash
kubectl create namespace lms
```

2. Apply all Kubernetes manifests:

```bash
kubectl apply -k ./kubernetes -n lms
```

3. Create the Google Cloud Storage key secret:

```bash
kubectl create secret generic gcloud-key --from-file=key.json=./key.json -n lms
```

## Accessing the Services

- API Gateway: Access through the Ingress at http://lms.local
- Prometheus: http://lms.local/prometheus
- Grafana: http://lms.local/grafana

## Monitoring

The monitoring stack consists of:
- Prometheus for metrics collection
- Grafana for visualization

Default Grafana credentials:
- Username: admin
- Password: admin

## Scaling

To scale a service:

```bash
kubectl scale deployment authentication-service --replicas=3 -n lms
```

## Troubleshooting

Check pod status:

```bash
kubectl get pods -n lms
```

View logs for a specific pod:

```bash
kubectl logs -f <pod-name> -n lms
```

## Notes

- Ensure all services have appropriate health checks and readiness/liveness probes for production
- Secure sensitive data using Kubernetes Secrets management
- Consider implementing a service mesh like Istio for advanced traffic management

#!/bin/bash
# Script to deploy LMS microservices to local Kubernetes

# Set the namespace
NAMESPACE="lms"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed. Please install it and try again."
    exit 1
fi

# Check if Kubernetes is running
if ! kubectl cluster-info &> /dev/null; then
    echo "Kubernetes cluster is not running. Please start it and try again."
    exit 1
fi

# Create namespace if it doesn't exist
kubectl get namespace $NAMESPACE &> /dev/null || kubectl create namespace $NAMESPACE

echo "Building Docker images..."

# Build Docker images
docker build -t lms/authentication-service:latest ../backend/authentication-service/
docker build -t lms/api-gateway:latest ../backend/api-gateway/
docker build -t lms/lecturer-service:latest ../backend/lecturer-service/
docker build -t lms/payment-service:latest ../backend/payment-service-py/
docker build -t lms/coursemanagement-service:latest ../backend/coursemanagement-service/
docker build -t lms/storage-service:latest ../backend/storage-service/
docker build -t lms/notification-service:latest ../backend/notify-by-udeesha/
docker build -t lms/support-backend:latest ../backend/supportbackend/
docker build -t lms/email-service:latest ../backend/email-service/
docker build -t lms/certificate-service:latest ../backend/certificate-issue-service/

echo "Images built successfully!"

# Check if key.json exists for Google Cloud Storage
if [ -f "../key.json" ]; then
    echo "Creating GCloud key secret..."
    kubectl create secret generic gcloud-key --from-file=key.json=../key.json -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
fi

echo "Deploying infrastructure services first..."
kubectl apply -f postgres.yaml -n $NAMESPACE

echo "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres-db -n $NAMESPACE --timeout=120s

echo "Deploying application services..."
kubectl apply -f authentication-service.yaml -n $NAMESPACE
kubectl apply -f lecturer-service.yaml -n $NAMESPACE
kubectl apply -f payment-service.yaml -n $NAMESPACE
kubectl apply -f coursemanagement-service.yaml -n $NAMESPACE
kubectl apply -f storage-service.yaml -n $NAMESPACE
kubectl apply -f notification-service.yaml -n $NAMESPACE
kubectl apply -f support-backend.yaml -n $NAMESPACE
kubectl apply -f email-service.yaml -n $NAMESPACE
kubectl apply -f certificate-service.yaml -n $NAMESPACE

echo "Waiting for services to be ready..."
kubectl wait --for=condition=available deployments --all -n $NAMESPACE --timeout=180s

echo "Deploying monitoring..."
kubectl apply -f monitoring/prometheus.yaml -n $NAMESPACE
kubectl apply -f monitoring/grafana.yaml -n $NAMESPACE

echo "Deploying API Gateway..."
kubectl apply -f api-gateway.yaml -n $NAMESPACE
kubectl apply -f ingress.yaml -n $NAMESPACE

echo "Deployment completed!"
echo "You can port-forward the API Gateway with:"
echo "kubectl port-forward service/api-gateway 5001:5001 -n $NAMESPACE"

echo "To view all pods:"
echo "kubectl get pods -n $NAMESPACE"

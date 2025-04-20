# Script to deploy LMS microservices to local Kubernetes using PowerShell

# Set the namespace
$NAMESPACE = "lms"

# Check if kubectl is installed
try {
    kubectl | Out-Null
} catch {
    Write-Error "kubectl is not installed. Please install it and try again."
    exit 1
}

# Check if Kubernetes is running
try {
    kubectl cluster-info
} catch {
    Write-Error "Kubernetes cluster is not running. Please start it and try again."
    exit 1
}

# Create namespace if it doesn't exist
if (!(kubectl get namespace $NAMESPACE 2>$null)) {
    Write-Output "Creating namespace $NAMESPACE..."
    kubectl create namespace $NAMESPACE
}

Write-Output "Building Docker images..."

# Build Docker images
docker build -t lms/authentication-service:latest ..\backend\authentication-service\
docker build -t lms/api-gateway:latest ..\backend\api-gateway\
docker build -t lms/lecturer-service:latest ..\backend\lecturer-service\
docker build -t lms/payment-service:latest ..\backend\payment-service-py\
docker build -t lms/coursemanagement-service:latest ..\backend\coursemanagement-service\
docker build -t lms/storage-service:latest ..\backend\storage-service\
docker build -t lms/notification-service:latest ..\backend\notify-by-udeesha\
docker build -t lms/support-backend:latest ..\backend\supportbackend\
docker build -t lms/email-service:latest ..\backend\email-service\
docker build -t lms/certificate-service:latest ..\backend\certificate-issue-service\

Write-Output "Images built successfully!"

# Check if key.json exists for Google Cloud Storage
if (Test-Path "..\key.json") {
    Write-Output "Creating GCloud key secret..."
    kubectl create secret generic gcloud-key --from-file=key.json=..\key.json -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
}

Write-Output "Deploying infrastructure services first..."
kubectl apply -f postgres.yaml -n $NAMESPACE

Write-Output "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres-db -n $NAMESPACE --timeout=120s

Write-Output "Deploying application services..."
kubectl apply -f authentication-service.yaml -n $NAMESPACE
kubectl apply -f lecturer-service.yaml -n $NAMESPACE
kubectl apply -f payment-service.yaml -n $NAMESPACE
kubectl apply -f coursemanagement-service.yaml -n $NAMESPACE
kubectl apply -f storage-service.yaml -n $NAMESPACE
kubectl apply -f notification-service.yaml -n $NAMESPACE
kubectl apply -f support-backend.yaml -n $NAMESPACE
kubectl apply -f email-service.yaml -n $NAMESPACE
kubectl apply -f certificate-service.yaml -n $NAMESPACE

Write-Output "Waiting for services to be ready..."
kubectl wait --for=condition=available deployments --all -n $NAMESPACE --timeout=180s

Write-Output "Deploying monitoring..."
kubectl apply -f monitoring/prometheus.yaml -n $NAMESPACE
kubectl apply -f monitoring/grafana.yaml -n $NAMESPACE

Write-Output "Deploying API Gateway..."
kubectl apply -f api-gateway.yaml -n $NAMESPACE
kubectl apply -f ingress.yaml -n $NAMESPACE

Write-Output "Deployment completed!"
Write-Output "You can port-forward the API Gateway with:"
Write-Output "kubectl port-forward service/api-gateway 5001:5001 -n $NAMESPACE"

Write-Output "To view all pods:"
Write-Output "kubectl get pods -n $NAMESPACE"

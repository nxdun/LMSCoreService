# Testing Kubernetes Locally with Docker and kubeadm

This document provides step-by-step instructions for testing the LMS microservices on your local machine using Docker with kubeadm.

## Prerequisites

- Docker Desktop with Kubernetes enabled (kubeadm)
- `kubectl` configured to work with your local cluster
- Git (to clone the repository if needed)

## Step 1: Prepare Your Environment

Ensure that your Kubernetes cluster is up and running:

```bash
kubectl cluster-info
```

This should display your cluster's details. If you see an error, make sure Kubernetes is enabled in Docker Desktop settings.

## Step 2: Build Docker Images Locally

From the root directory of the project, build all the necessary Docker images:

```bash
# Authentication Service
docker build -t lms/authentication-service:latest ./backend/authentication-service/

# API Gateway
docker build -t lms/api-gateway:latest ./backend/api-gateway/

# Lecturer Service
docker build -t lms/lecturer-service:latest ./backend/lecturer-service/

# Payment Service
docker build -t lms/payment-service:latest ./backend/payment-service-py/

# Course Management Service
docker build -t lms/coursemanagement-service:latest ./backend/coursemanagement-service/

# Storage Service
docker build -t lms/storage-service:latest ./backend/storage-service/

# Notification Service
docker build -t lms/notification-service:latest ./backend/notify-by-udeesha/

# Support Backend
docker build -t lms/support-backend:latest ./backend/supportbackend/

# Email Service
docker build -t lms/email-service:latest ./backend/email-service/

# Certificate Service
docker build -t lms/certificate-service:latest ./backend/certificate-issue-service/
```

## Step 3: Create a Namespace for Your Application

Create a dedicated namespace to isolate your LMS deployment:

```bash
kubectl create namespace lms
```

## Step 4: Update Kubernetes Manifests for Local Images

If you're using locally built images, you need to update the image references in your Kubernetes manifests.

### For Linux/Mac Users

```bash
# Navigate to the kubernetes directory
cd kubernetes

# Authentication Service
sed -i 's|image: authentication-service:latest|image: lms/authentication-service:latest|g' authentication-service.yaml

# API Gateway
sed -i 's|image: api-gateway:latest|image: lms/api-gateway:latest|g' api-gateway.yaml

# Lecturer Service
sed -i 's|image: lecturer-service:latest|image: lms/lecturer-service:latest|g' lecturer-service.yaml

# Payment Service
sed -i 's|image: payment-service:latest|image: lms/payment-service:latest|g' payment-service.yaml

# Course Management Service
sed -i 's|image: coursemanagement-service:latest|image: lms/coursemanagement-service:latest|g' coursemanagement-service.yaml

# Storage Service
sed -i 's|image: storage-service:latest|image: lms/storage-service:latest|g' storage-service.yaml

# Notification Service
sed -i 's|image: notification-service:latest|image: lms/notification-service:latest|g' notification-service.yaml

# Support Backend
sed -i 's|image: support-backend:latest|image: lms/support-backend:latest|g' support-backend.yaml

# Email Service
sed -i 's|image: email-service:latest|image: lms/email-service:latest|g' email-service.yaml

# Certificate Service
sed -i 's|image: certificate-service:latest|image: lms/certificate-service:latest|g' certificate-service.yaml
```

### For Windows PowerShell Users

```powershell
# Navigate to the kubernetes directory
cd kubernetes

# Authentication Service
(Get-Content authentication-service.yaml) -replace 'image: authentication-service:latest', 'image: lms/authentication-service:latest' | Set-Content authentication-service.yaml

# API Gateway
(Get-Content api-gateway.yaml) -replace 'image: api-gateway:latest', 'image: lms/api-gateway:latest' | Set-Content api-gateway.yaml

# Lecturer Service
(Get-Content lecturer-service.yaml) -replace 'image: lecturer-service:latest', 'image: lms/lecturer-service:latest' | Set-Content lecturer-service.yaml

# Payment Service
(Get-Content payment-service.yaml) -replace 'image: payment-service:latest', 'image: lms/payment-service:latest' | Set-Content payment-service.yaml

# Course Management Service
(Get-Content coursemanagement-service.yaml) -replace 'image: coursemanagement-service:latest', 'image: lms/coursemanagement-service:latest' | Set-Content coursemanagement-service.yaml

# Storage Service
(Get-Content storage-service.yaml) -replace 'image: storage-service:latest', 'image: lms/storage-service:latest' | Set-Content storage-service.yaml

# Notification Service
(Get-Content notification-service.yaml) -replace 'image: notification-service:latest', 'image: lms/notification-service:latest' | Set-Content notification-service.yaml

# Support Backend
(Get-Content support-backend.yaml) -replace 'image: support-backend:latest', 'image: lms/support-backend:latest' | Set-Content support-backend.yaml

# Email Service
(Get-Content email-service.yaml) -replace 'image: email-service:latest', 'image: lms/email-service:latest' | Set-Content email-service.yaml

# Certificate Service
(Get-Content certificate-service.yaml) -replace 'image: certificate-service:latest', 'image: lms/certificate-service:latest' | Set-Content certificate-service.yaml
```

Alternatively, you can modify the image fields manually in each YAML file.

## Step 5: Create Required Secrets

This step is necessary because the storage-service is configured to use Google Cloud Storage via a service account key. However, for local development, you have several options:

### Option 1: Use a Mock or Dummy key.json (Recommended for Local Development)

For local development, you don't need a real Google Cloud Storage key if you modify the storage service to use local storage or mock the cloud storage functionality.

```bash
# Create a dummy key.json file
echo '{"type": "service_account", "project_id": "dummy", "client_email": "dummy@example.com", "client_id": "123", "private_key": "-----BEGIN PRIVATE KEY-----\nMIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEA0zDOUBpO4CywOgQg\n5SrcJX6wY1GSdHUCnbM15gJEDL48bhyQGdDrj+HzZO3QDB9MzOTiVcWCpKjuwjxp\nnfXSdQIDAQABAkBCJZo8rdtsdX1WwXoSWqF2QmqmTVJ4UkqpCUZ7rDSqQNAI1Ukt\n5atgZJGJRuYRZNVvz8cOXOI+u7ZEPw4G1EGhAiEA+PNglilfeHcXU0rjPPx42QiL\nZDlNFgTKJdnS0eMPdwcCIQDZW4xt6jNBi3H9eWfJmLCsYRuLOKwSDIIFszGZYM4I\nEwIgHdkVY9cmRkbE+ydvyAGjNOWGBWOGOd+wGBJvLaSPrpECIQDLPZImHMqFpPLa\nfhpc6Z5Grh5Zhn7D8X0P+6a0NAeY8wIhAJnlLUo5X2wQ2T5R4iqXnBYD9J/gDw0q\n1aa/7k6H2N/7\n-----END PRIVATE KEY-----\n"}'  > dummy-key.json

# Create a secret from the dummy key
kubectl create secret generic gcloud-key --from-file=key.json=./dummy-key.json -n lms
```

### Option 2: Modify the storage-service.yaml

Alternatively, you can modify the storage-service deployment to not require the key.json file:

```yaml
# Modified section in storage-service.yaml
spec:
  containers:
  - name: storage-service
    image: lms/storage-service:latest
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 2345
    volumeMounts:
    - name: app-volume
      mountPath: /app
    # Remove the key.json volume mount
    env:
    - name: STORAGE_LOCAL_MODE
      value: "true"  # Add this env variable to your service to switch to local mode
  volumes:
  - name: app-volume
    emptyDir: {}
  # Remove the key-volume
```

### Option 3: Use a Real Google Cloud Storage Key

If you need the actual Google Cloud Storage functionality during local development:

```bash
# Assuming you have a real key.json file in the project root
kubectl create secret generic gcloud-key --from-file=key.json=./key.json -n lms
```

Note that for this option, you need to:
1. Create a Google Cloud service account
2. Grant it appropriate permissions
3. Download the service account key as key.json

For most local development and testing scenarios, Options 1 or 2 are recommended to avoid dependencies on external services.

## Step 6: Apply Kubernetes Manifests

Apply all manifests using kustomize:

```bash
kubectl apply -k ./kubernetes -n lms
```

Or apply them individually:

```bash
kubectl apply -f kubernetes/postgres.yaml -n lms
# Wait for the database to be ready
kubectl apply -f kubernetes/authentication-service.yaml -n lms
kubectl apply -f kubernetes/lecturer-service.yaml -n lms
# Continue with other services
kubectl apply -f kubernetes/api-gateway.yaml -n lms
```

## Step 7: Verify Deployment

Check that all pods are running:

```bash
kubectl get pods -n lms
```

Check the services:

```bash
kubectl get svc -n lms
```

## Step 8: Port Forwarding for Testing

To access the API Gateway locally:

```bash
kubectl port-forward service/api-gateway 5001:5001 -n lms
```

For monitoring:

```bash
# Prometheus
kubectl port-forward service/prometheus 9090:9090 -n lms

# Grafana
kubectl port-forward service/grafana 9010:9010 -n lms
```

## Step 9: Set up Local DNS (Optional)

Add the following to your hosts file (`/etc/hosts` on Linux/Mac or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1 lms.local
```

## Step 10: Test the Application

Open your browser and navigate to:
- API Gateway: http://localhost:5001 or http://lms.local:5001
- Prometheus: http://localhost:9090 or http://lms.local:9090
- Grafana: http://localhost:9010 or http://lms.local:9010

## Troubleshooting

### View Pod Logs

```bash
# List pods
kubectl get pods -n lms

# View logs for a specific pod
kubectl logs -f <pod-name> -n lms
```

### Check Pod Details

```bash
kubectl describe pod <pod-name> -n lms
```

### Restart a Deployment

```bash
kubectl rollout restart deployment <deployment-name> -n lms
```

### Access a Pod's Shell

```bash
kubectl exec -it <pod-name> -n lms -- /bin/sh
```

## Clean Up

When you're done testing, delete the namespace to clean up all resources:

```bash
kubectl delete namespace lms
```

## Stopping All Services

### Option 1: Delete the Namespace (Complete Cleanup)
The most straightforward way to stop all services is to delete the namespace as shown above. This completely removes all resources associated with the LMS application.

### Option 2: Scale Down Deployments (Preserving Configuration)
If you want to temporarily stop the services without deleting everything:

```bash
# Get all deployments
kubectl get deployments -n lms

# Scale down all deployments to 0 replicas
kubectl scale deployment --all --replicas=0 -n lms
```

### Option 3: Using a Script

#### For Linux/Mac:
Create a file `kubernetes/stop-lms.sh`:

```bash
#!/bin/bash
echo "Scaling down all deployments in the lms namespace..."
kubectl scale deployment --all --replicas=0 -n lms
echo "All services stopped. Resources still exist but no pods are running."
echo "To completely remove all resources, run: kubectl delete namespace lms"
```

Make it executable:
```bash
chmod +x kubernetes/stop-lms.sh
```

#### For Windows PowerShell:
Create a file `kubernetes/stop-lms.ps1`:

```powershell
Write-Output "Scaling down all deployments in the lms namespace..."
kubectl scale deployment --all --replicas=0 -n lms
Write-Output "All services stopped. Resources still exist but no pods are running."
Write-Output "To completely remove all resources, run: kubectl delete namespace lms"
```

### Option 4: For Docker Desktop with Kubernetes
If you're using Docker Desktop with Kubernetes enabled:

1. You can use Docker Desktop's interface to disable Kubernetes completely
2. Or keep Kubernetes running but stop the specific services using Option 2 or 3 above

## Additional Tips for kubeadm

### Check kubeadm Status

```bash
kubectl cluster-info
kubectl get nodes
```

### Dashboard Setup

Deploy the Kubernetes dashboard for easier management:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
kubectl proxy
```

Then access the dashboard at: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

### Resource Constraints

If you encounter resource issues, consider limiting the resources for each deployment:

```yaml
resources:
  limits:
    cpu: "100m"
    memory: "128Mi"
  requests:
    cpu: "50m"
    memory: "64Mi"
```

Add these constraints to your deployment manifests where needed.

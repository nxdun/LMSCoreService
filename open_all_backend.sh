#!/bin/bash
# filepath: /Users/udeesharukshan/Documents/CTSE/Assignment1/LMSCoreService/open_all_backend.sh

# Define base directory
BASE_DIR="/Users/udeesharukshan/Documents/CTSE/Assignment1/LMSCoreService"

# Function to start a service
start_service() {
  local dir=$1
  echo "Starting service in $dir"
  cd "$BASE_DIR/$dir" || exit
  npm install
  npm start &
}

# Start each service
start_service "backend/API-gateway"
start_service "backend/authentication-service"
start_service "backend/storage-service"
start_service "backend/certificate-issue-service"
start_service "backend/coursemanagement-service"
start_service "backend/email-service"
start_service "backend/lecturer-service"
start_service "backend/notify-by-udeesha"
start_service "backend/payment-service-py"
start_service "backend/supportbackend"

# Wait for all background jobs
wait
echo "All services started."
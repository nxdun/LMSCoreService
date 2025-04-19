#!/bin/bash
# filepath: /Users/udeesharukshan/Documents/CTSE/Assignment1/LMSCoreService/open_all_backend.sh

# Start API gateway
cd ./backend/API-gateway/ && npm start &

# Start authentication service 
cd ../../backend/authentication-service/ && npm start &

# Start storage service
cd ../../backend/storage-service/ && npm start &

# Keep the script running (prevent immediate termination)
wait
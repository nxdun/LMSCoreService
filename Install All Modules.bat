@echo off

rem Start API gateway
start cmd /k "cd .\backend\API-gateway\ & npm install"

rem Start authentication service
start cmd /k "cd .\backend\authentication-service\ & npm install"

rem Start course-management service
start cmd /k "cd .\backend\coursemanagement-service\ & npm install"

rem Start storage service
start cmd /k "cd .\backend\storage-service\ & npm install"

rem Start Payment service
start cmd /k "cd .\backend\payment-service-py\ & venv\Scripts\activate & pip install -r requirements.txt"

rem Start Frontend
start cmd /k "cd .\frontend\ & npm install"
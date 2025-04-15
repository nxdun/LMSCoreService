@echo off

rem Start API gateway
start cmd /k "cd .\backend\API-gateway\ & npm start"

rem Start authentication service
start cmd /k "cd .\backend\authentication-service\ & npm start"

rem Start course-management service
start cmd /k "cd .\backend\coursemanagement-service\ & npm start"

rem Start storage service
start cmd /k "cd .\backend\storage-service\ & npm start"

rem Start Payment service
start cmd /k "cd .\backend\payment-service-py\ & venv\Scripts\activate & python app.py"
# lms-microservice
Development of an Educational Platform for Online Learning Using Microservices

# intro

try to run open all backends seprately for dev


# storage service workflow

1. Create a Google Cloud service account and a JSON key.
2. Place key.json at the repository root.
3. Create a new bucket and grant the service account access.
4. Set SERVICE_NAME_BUCKET and SERVICE_CAPTCHA_CODE environment variables.

## TEST User email & Passwords
- Admin admin1@gmail.com    |PWD Tu1234567@
- Lec  lecturer@gmail.com   |PWD  Tu1234567@
- Student student@gmail.com |PWD Tu1234567@

# Payment Service
1. venv\Scripts\activate
2. pip install -r requirements.txt
3. python app.py


# Start & Build All containers.
```
docker-compose up --build
```
# Run the containers
```
docker-compose up
```
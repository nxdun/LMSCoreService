# 🎓 Learning Management System (LMS) - Microservice Architecture

📅 **Project Proposal**  
The Learning Management System (LMS) is a microservice-driven application designed to simulate the full functionality of a modern online education platform. It emphasizes modular development, scalability, and cloud-native principles using containerized microservices. This architecture supports agile DevOps, high availability, and security across various educational operations, including course handling, payments, assessments, and more.

---

## 🛠️ System Architecture Components

### 1. 🔐 Authentication Service
- Handles user registration and login (students, instructors, admins)
- Implements JWT-based session management
- Manages user roles and permissions
- Stores credentials securely (e.g., bcrypt hashing)

### 2. 📚 Course Management Service
- Enables CRUD operations for courses
- Manages categories, prerequisites, and course metadata
- Associates courses with instructors
- Supports publishing/unpublishing of courses

### 3. 🎥 Lecture Service
- Manages video/audio/text lectures for courses
- Supports CRUD operations for lecture content
- Tracks lecture order and linkage with specific courses
- Supports time-stamped annotations and progress tracking

### 4. 💳 Payment Service
- Handles course payments and refunds
- Integrates with third-party payment gateways
- Generates payment receipts
- Tracks user purchases and billing history

### 5. 🗄️ Storage Service
- Manages file uploads for lecture materials, assignments, certificates
- Provides secure access to downloadable resources
- Handles file versioning and metadata tracking

### 6. 🔔 Notification Service
- Sends notifications via email, SMS, or in-app alerts
- Triggers updates for assignment deadlines, course releases, etc.
- Supports event-driven communication across services

### 7. 📝 Assessment Service
- Manages quizzes, tests, and exams
- Supports auto-grading and manual evaluation
- Handles attempt limits, timing, and scoring
- Links assessments to specific course modules

### 8. 🛠️ Support Service
- Offers ticket-based or live chat student support
- Tracks issue status, response times, and resolutions
- Allows FAQs and community-based troubleshooting

### 9. 🏅 Certification Issue Service
- Generates certificates upon course completion
- Verifies achievement against assessment scores
- Includes instructor signatures and completion date
- Supports digital and printable certificate formats

---

## 📊 ER Diagram (Text Representation)

```text
[User]
 ├─ user_id (PK)
 ├─ username
 ├─ email
 ├─ password_hash
 ├─ role (student/instructor/admin)

[Course]
 ├─ course_id (PK)
 ├─ instructor_id (FK → User.user_id)
 ├─ title
 ├─ description
 ├─ category
 ├─ status (published/unpublished)

[Lecture]
 ├─ lecture_id (PK)
 ├─ course_id (FK → Course.course_id)
 ├─ title
 ├─ content_url
 ├─ duration

[Assessment]
 ├─ assessment_id (PK)
 ├─ course_id (FK → Course.course_id)
 ├─ title
 ├─ type (quiz/exam)
 ├─ total_marks

[Payment]
 ├─ payment_id (PK)
 ├─ user_id (FK → User.user_id)
 ├─ course_id (FK → Course.course_id)
 ├─ amount
 ├─ timestamp

[Certificate]
 ├─ certificate_id (PK)
 ├─ user_id (FK → User.user_id)
 ├─ course_id (FK → Course.course_id)
 ├─ issue_date
 ├─ certificate_url

```

## 🛠️ System Diagram

![CTSE Assignment drawio (3)](https://github.com/user-attachments/assets/2daba94b-db57-46fe-b721-43bbfa8f90bf)


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
## how to run on mac
- chmod +x open_all_backend.
- ./open_all_backend.sh


# Start & Build All containers.
```
docker-compose up --build
```
# Run the containers
```
docker-compose up
```

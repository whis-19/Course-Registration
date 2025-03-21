# Course-Registration

## Project Overview

This project is a web application for course registration and management. It allows students to register for courses, view available courses, and manage their registrations. Administrators can manage courses, view reports, and handle user registrations.

## Features

- User authentication (student and admin)
- Course management (create, update, delete courses)
- Course registration for students
- Reports on course enrollment, available courses, and prerequisite issues
- Middleware for authentication and authorization
- Initial data seeding for admin and student accounts

## Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Testing:** Postman

## Project Structure

```
.env
package.json
README.md
server.js
config/
    db.js
controllers/
    courseController.js
    registrationController.js
    reportController.js
    seedController.js
    userController.js
middleware/
    auth.js
models/
    course.js
    registration.js
    user.js
postman_testing/
    22F_3722_Web_Assignment_2_testing.json
public/
    index.html
    css/
    images/
    js/
        auth.js
        admin/
        student/
routes/
    index.js
    api/
        courses.js
        registrations.js
        reports.js
        seed.js
        users.js
views/
    error.ejs
    admin/
    auth/
        login.ejs
    student/

```

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/whis-19/Course-Registration.git
    cd Course-Registration
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```
    MONGO_URI=mongodb://127.0.0.1:27017
    PORT=3000
    ```

4. Start the server:
    ```sh
    npm start
    ```

## API Endpoints

### User Routes

- `POST /api/users/login` - Login as a student
- `POST /api/users/admin/login` - Login as an admin
- `GET /api/users/profile` - Get user profile (protected)
- `POST /api/users/create-student` - Create a student user (admin only)
- `POST /api/users/create-admin` - Create an admin user (admin only)

### Course Routes

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a new course (admin only)
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update a course (admin only)
- `DELETE /api/courses/:id` - Delete a course (admin only)
- `POST /api/courses/:id/subscribe` - Subscribe to course notifications (protected)

### Registration Routes

- `GET /api/registrations` - Get all registrations (admin only)
- `POST /api/registrations` - Register for a course (protected)
- `GET /api/registrations/my` - Get current student's registrations (protected)
- `PUT /api/registrations/:id` - Update registration status (admin only)
- `DELETE /api/registrations/:id` - Cancel registration (protected)

### Report Routes

- `GET /api/reports/course-enrollment/:courseId` - Get course enrollment report (admin only)
- `GET /api/reports/available-courses` - Get available courses report (admin only)
- `GET /api/reports/prerequisite-issues` - Get prerequisite issues report (admin only)

### Seed Routes

- `POST /api/seed` - Seed initial data


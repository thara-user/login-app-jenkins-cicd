# Login Application – Jenkins CI/CD Pipeline

## 1. Project Overview

This project demonstrates how to build and deploy a login application using Jenkins CI/CD, Docker, Docker Compose, Node.js, and PostgreSQL.

The application uses a frontend built with HTML, CSS, and JavaScript, a backend built with Node.js and Express, and PostgreSQL to store application data.

Jenkins automates the process of checking out the source code, validating Docker Compose configuration, building the Docker image, deploying the application, and checking backend health.

## 2. Objectives

* Understand Jenkins CI/CD pipeline automation.
* Containerize the backend using Docker.
* Run application services using Docker Compose.
* Connect the backend to a PostgreSQL database.
* Preserve database data using a Docker named volume.
* Manage the database password through Jenkins credentials and an environment file.
* Verify deployment using a backend health endpoint.

## 3. Technologies Used

| Technology     | Purpose                                   |
| -------------- | ----------------------------------------- |
| HTML           | Builds the application structure          |
| CSS            | Styles the user interface                 |
| JavaScript     | Adds frontend interactions                |
| Node.js        | Runs the backend                          |
| Express.js     | Handles HTTP requests and API routes      |
| PostgreSQL     | Stores application data                   |
| Docker         | Packages the backend into a container     |
| Docker Compose | Manages the database and backend services |
| Jenkins        | Automates the CI/CD pipeline              |
| Git            | Tracks source-code changes                |
| GitHub         | Hosts the source code                     |

## 4. Project Architecture

```text
Developer
   |
   v
GitHub Repository
   |
   v
Jenkins Pipeline
   |
   +--> Checkout Source Code
   |
   +--> Validate Docker Compose
   |
   +--> Build Backend Docker Image
   |
   +--> Deploy Using Docker Compose
   |
   +--> Check Application Health
                |
                v
        Backend Container
        Node.js + Express
                |
                v
        PostgreSQL Container
                |
                v
        Docker Named Volume
        Persistent Database Data
```

## 5. Project Structure

```text
login-app/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       └── server.js
├── database/
│   └── init.sql
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .dockerignore
├── .gitignore
├── .env
├── Dockerfile
├── docker-compose.yml
└── Jenkinsfile
```

**Important:** The `.env` file contains the database password and must not be committed to GitHub. The `.gitignore` file excludes it from Git tracking.

## 6. How the Application Works

### Frontend

The frontend uses HTML, CSS, and JavaScript to display the user interface and handle browser-side interactions.

### Backend

The backend uses Node.js and Express to process HTTP requests and communicate with PostgreSQL.

Health-check endpoint:

```text
http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "message": "Login application backend is running"
}
```

### PostgreSQL Database

PostgreSQL stores application data. Docker Compose starts the database service and waits for its health check before starting the backend.

### Persistent Storage

A Docker named volume stores PostgreSQL data so that recreating containers does not normally erase the database.

**Database safety:** Avoid running `docker compose down -v` because it can remove the project's named volumes and their stored data.

## 7. Dockerfile Explanation

The Dockerfile defines how to build the backend image.

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "start"]
```

* `FROM node:22-alpine` – uses a lightweight Node.js base image.
* `WORKDIR /app` – sets the working directory.
* `COPY backend/package*.json ./` – copies the backend package files.
* `RUN npm install --omit=dev` – installs production dependencies.
* `COPY backend/ ./backend/` – copies backend source code.
* `COPY frontend/ ./frontend/` – copies frontend files.
* `WORKDIR /app/backend` – sets the backend working directory.
* `EXPOSE 3000` – documents the port used by the backend inside the container.
* `CMD ["npm", "start"]` – starts the Node.js application.

## 8. Docker Compose

Docker Compose defines the database and backend services.

The configuration uses:

* PostgreSQL as the database service.
* The locally built Docker image for the backend.
* Environment variables for database connection settings.
* A health check to verify database readiness.
* A named volume for persistent database storage.
* Port mapping to expose the backend on port `3001` on the host.

The database password is supplied through the `DB_PASSWORD` environment variable. The real password should never be written directly into the README or committed to GitHub.

## 9. Jenkins CI/CD Pipeline

The `Jenkinsfile` defines the automated deployment process.

### Stage 1: Checkout

Jenkins retrieves the source code from the GitHub repository.

### Stage 2: Validate Docker Compose

Jenkins validates the Docker Compose configuration before attempting deployment.

### Stage 3: Build Docker Image

Jenkins builds the backend Docker image using the Dockerfile.

### Stage 4: Deploy Application

Jenkins uses Docker Compose to start or recreate the backend and database containers.

The pipeline uses the Compose project name `login-app` to target the intended application resources and existing database volume.

### Stage 5: Check Application Health

Jenkins checks the backend endpoint:

```text
http://localhost:3001/api/health
```

The pipeline uses `curl.exe` to verify that the endpoint returns a successful HTTP response. A successful health check allows the pipeline to finish successfully.

### Post-build actions

The pipeline prints a success message when deployment and the health check pass. If a stage fails, Jenkins reports a failed build for troubleshooting.

## 10. Jenkins Credentials

The database password is stored in Jenkins as a **Secret text** credential.

* Credential ID: `login-app-db-password`
* Credential type: Secret text
* Purpose: Supplies `DB_PASSWORD` to the pipeline when validating, building, and deploying.

The password itself is not included in the Jenkinsfile or README.

## 11. How to Run the Project

### Prerequisites

Install and configure:

* Git
* Docker Desktop
* Jenkins
* Node.js is useful for local development, but the Docker image runs the backend inside a container.

### Run with Docker Compose

Open Command Prompt in the project folder:

```cmd
cd C:\Users\ittth\login-app
```

Validate the Compose configuration:

```cmd
docker compose -p login-app config --quiet
```

Build the backend image:

```cmd
docker compose -p login-app build backend
```

Start the application:

```cmd
docker compose -p login-app up -d --build
```

Check running containers:

```cmd
docker ps
```

Check the backend health endpoint:

```cmd
curl.exe http://localhost:3001/api/health
```

View backend logs:

```cmd
docker logs --tail 50 login-app-backend-1
```

## 12. Jenkins Setup

1. Open Jenkins at `http://localhost:8080`.
2. Create a Pipeline job named `login-app-cicd`.
3. Select **Pipeline script from SCM**.
4. Select **Git** as the source control system.
5. Enter the repository URL.
6. Select the `main` branch.
7. Set the script path to `Jenkinsfile`.
8. Add the database password as a Jenkins Secret text credential with ID `login-app-db-password`.
9. Save the job and click **Build Now**.
10. Open **Console Output** to review the pipeline stages and deployment result.

Jenkins must be able to access Docker and execute the required commands on its agent.

## 13. Verification and Testing

The project was tested by running the Jenkins pipeline and checking the backend health endpoint.

Example successful response:

```text
HTTP/1.1 200 OK

{"status":"healthy","message":"Login application backend is running"}
```

The successful HTTP response confirms that the backend health endpoint is reachable.

A successful Jenkins build confirms that the configured pipeline stages completed, including deployment and the health check.

## 14. Useful Docker Commands

Check running containers:

```cmd
docker ps
```

View all containers:

```cmd
docker ps -a
```

View backend logs:

```cmd
docker logs login-app-backend-1
```

View database logs:

```cmd
docker logs login-app-db-1
```

List Docker volumes:

```cmd
docker volume ls
```

List services for the intended Compose project:

```cmd
docker compose -p login-app ps
```

## 15. Key Learning Outcomes

* Creating a Jenkins declarative pipeline.
* Integrating GitHub with Jenkins.
* Building a Docker image for a Node.js backend.
* Running multi-container applications with Docker Compose.
* Connecting a backend application to PostgreSQL.
* Using health checks to manage service startup order.
* Preserving database data using Docker volumes.
* Managing sensitive values through Jenkins credentials.
* Troubleshooting deployment and HTTP health-check failures.

## 16. Conclusion

This project demonstrates an automated CI/CD workflow for a containerized login application. Jenkins retrieves the source code, validates the Compose configuration, builds the backend image, deploys the services, and verifies backend health.

The project provides practical experience with Jenkins, GitHub, Docker, Docker Compose, Node.js, PostgreSQL, environment variables, persistent storage, and deployment troubleshooting.

## Repository

GitHub: https://github.com/thara-user/login-app-jenkins-cicd

pipeline {
agent any

```
options {
    timestamps()
    disableConcurrentBuilds()
}

stages {
    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Validate Docker Compose') {
        steps {
            withCredentials([string(credentialsId: 'login-app-db-password', variable: 'DB_PASSWORD')]) {
                bat 'docker compose -p login-app config --quiet'
            }
        }
    }

    stage('Build Docker Image') {
        steps {
            withCredentials([string(credentialsId: 'login-app-db-password', variable: 'DB_PASSWORD')]) {
                bat 'docker compose -p login-app build backend'
            }
        }
    }

    stage('Deploy Application') {
        steps {
            withCredentials([string(credentialsId: 'login-app-db-password', variable: 'DB_PASSWORD')]) {
                bat 'docker compose -p login-app up -d --build'
            }
        }
    }

    stage('Check Application Health') {
        steps {
            bat 'curl.exe --fail --silent --show-error http://localhost:3001/api/health'
        }
    }
}

post {
    success {
        echo 'Login application deployed and health check passed.'
    }
    failure {
        echo 'Pipeline failed. Review the console output.'
    }
}
```

}


pipeline {
    agent any

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
                bat 'docker compose config --quiet'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker compose build backend'
            }
        }

        stage('Deploy Application') {
            steps {
                bat 'docker compose up -d --build'
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
}
pipeline {
    agent any

    environment {
        AWS_REGION   = "us-east-1"
        ACCOUNT_ID   = "163511166008"
        ECR_FRONTEND = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/flower-shop-frontend"
        ECR_BACKEND  = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/flower-shop-backend"
        CLUSTER_NAME = "flower-shop-cluster"
        K8S_NAMESPACE = "flower-shop"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/saifelmasry1/flower-shop.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                echo Building Frontend...
                docker build -t flower-shop-frontend:latest ./client

                echo Building Backend...
                docker build -t flower-shop-backend:latest ./server
                '''
            }
        }

        stage('AWS ECR Login') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION \
                  | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Tag & Push Images') {
            steps {
                sh '''
                docker tag flower-shop-frontend:latest $ECR_FRONTEND:latest
                docker tag flower-shop-backend:latest  $ECR_BACKEND:latest

                docker push $ECR_FRONTEND:latest
                docker push $ECR_BACKEND:latest
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                aws eks update-kubeconfig \
                  --name $CLUSTER_NAME \
                  --region $AWS_REGION

                kubectl apply -f k8s/flower-shop-app-node.yaml -n $K8S_NAMESPACE

                kubectl rollout restart deployment flower-shop-frontend -n $K8S_NAMESPACE
                kubectl rollout restart deployment flower-shop-backend  -n $K8S_NAMESPACE
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Completed Successfully ✔"
        }
        failure {
            echo "Deployment Failed ❌"
        }
    }
}

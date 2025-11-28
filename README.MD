🌸 Flower Shop – Complete DevOps Project

(Terraform + EKS + ECR + Jenkins + Docker + Ansible + Grafana)

This project is a comprehensive DevOps graduation project that aims to build an end-to-end solution demonstrating the following steps:

A Full Web Application (Frontend + Backend + Database).

Infrastructure as Code (IaC) using Terraform.

Containerization with Docker.

Kubernetes on Amazon EKS.

Container Registry on Amazon ECR.

Continuous Integration/Continuous Delivery (CI/CD) using Jenkins running in Docker on a Bastion Host.

(Planned) Configuration Management with Ansible.

(Planned) Observability & Dashboards with Grafana.

The goal is to simulate a realistic, production-style pipeline:

GitHub → Jenkins → Docker & ECR → EKS → (ALB) → User

1. 🧩 Application Architecture

The Flower Shop application consists of three core components:

Components:

Frontend

React/Vite SPA.

Built into static files and served by Nginx.

Dockerized (client/Dockerfile).

Backend

Node.js application (Express or similar).

Exposes a REST API for products, orders, etc.

Connects to MongoDB via environment variables.

Dockerized (server/Dockerfile).

Database (MongoDB)

Runs as a Kubernetes Deployment + Service.

Used as the persistent datastore for the backend.

Kubernetes Manifests (K8s Manifests)

The combined Kubernetes manifests are located in:

k8s/flower-shop-app-node.yaml


This file defines:

Namespace: flower-shop

Service + Deployment for:

mongodb

backend

flower-shop-frontend

2. 📁 Repository Structure

flower-shop/
├── client/                     # Frontend app (React/Vite) + Dockerfile
├── server/                     # Backend app (Node.js) + Dockerfile
├── k8s/
│   ├── flower-shop-app-node.yaml      # Namespace + Deployments + Services (frontend, backend, MongoDB)
│   └── setup-alb-controller-and-ingress.sh  # Script to install ALB Controller + create Ingress
├── terraform/
│   ├── bastion.tf              # Bastion EC2 instance + Jenkins user_data
│   ├── app-on-faregate.yaml    # Experimental Fargate manifest (not used in final setup)
│   └── ...                     # Other Terraform files: VPC, EKS, ECR, IAM, etc.
├── jenkins-image/
│   └── Dockerfile              # Custom Jenkins image (includes awscli + kubectl + docker CLI)
├── ansible/                    # (Planned) Ansible playbooks and roles
├── monitoring/                 # (Planned) Grafana dashboards / Prometheus configs
├── Jenkinsfile                 # Jenkins pipeline definition (CI/CD)
├── eks-bastion-access-steps.yaml  # Notes for re-establishing bastion/EKS access after terraform apply
└── README.md                   # This file


3. 🌱 Infrastructure as Code (Terraform)

All core AWS resources are provisioned using Terraform in the terraform/ directory.

3.1 Networking (VPC)

Terraform creates:

A custom VPC in the us-east-1 region.

Public subnets (for Bastion, ALB).

Private subnets (for EKS worker nodes and internal workloads).

An Internet Gateway for outgoing traffic.

NAT Gateway(s) to allow private nodes internet access (e.g., for pulling images).

Security Groups for: Bastion, EKS nodes, and ALB.

3.2 Amazon EKS Cluster

Terraform provisions:

An EKS Cluster named (flower-shop-cluster).

A Managed Node Group (worker nodes in private subnets).

IAM Roles for: the EKS Control Plane, and the Node Group (to pull from ECR, communicate with EKS, CloudWatch, etc.).

The cluster is private, with access routed via the Bastion Host.

3.3 Amazon ECR

Terraform creates ECR repositories for:

flower-shop-frontend

flower-shop-backend

jenkins-eks (custom Jenkins image)

These repositories are used by the CI/CD pipeline.

3.4 Bastion Host + IAM

Terraform also provisions an EC2 Bastion Instance in a public subnet:

With a public IP (for SSH / Jenkins access).

Attached to an IAM Instance Profile allowing:

Read/write to ECR.

Access to EKS (via aws eks update-kubeconfig).

A Security Group permitting:

SSH (port 22) from your IP.

HTTP (port 8080) for the Jenkins UI (or via SSH tunnel).

This Bastion is used as both:

A Jump Host to access the private EKS Cluster.

A Jenkins build agent/master (inside a Docker container).

3.5 Basic Terraform Usage

From inside the terraform/ directory:

cd terraform

terraform init
terraform plan -out plan.out
terraform apply plan.out


4. 🛠 Custom Jenkins Image (jenkins-image/Dockerfile)

The custom Jenkins image is built on top of the official jenkins/jenkins:lts-jdk17 image.

4.1 Multi-Stage Build

Stage 1 (Builder): ubuntu:22.04

Installs curl and unzip.

Downloads and unpacks AWS CLI v2 and kubectl.

Stage 2 (Final Jenkins image): jenkins/jenkins:lts-jdk17

Copies AWS CLI and kubectl from the builder stage.

Installs Docker CLI (docker.io).

Adds the jenkins user to the docker group (to communicate with /var/run/docker.sock).

Continues running as the non-root jenkins user for improved security.

4.2 Building and Pushing the Jenkins Image

From your local machine:

cd jenkins-image

AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<AWS_ACCOUNT_ID>
ECR_REPO=jenkins-eks

# ECR login
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build image
docker build -t $ECR_REPO .

# Tag
docker tag $ECR_REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_[REGION.amazonaws.com/$ECR_REPO:latest](https://REGION.amazonaws.com/$ECR_REPO:latest)

# Push
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_[REGION.amazonaws.com/$ECR_REPO:latest](https://REGION.amazonaws.com/$ECR_REPO:latest)


The Bastion EC2 will pull and run this image via its user_data script.

5. 🏰 Bastion Host: Jenkins Bootstrap (user_data in bastion.tf)

The Bastion's user_data script handles the automatic startup of Jenkins:

Install Docker:

sudo apt-get update -y
sudo apt-get install -y docker.io

sudo systemctl enable docker
sudo systemctl start docker

sudo usermod -aG docker ubuntu || true


Login to ECR:

AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<AWS_ACCOUNT_ID>
ECR_REPO=jenkins-eks

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com


Prepare Jenkins Home on Host:

sudo mkdir -p /opt/jenkins_home
sudo chown -R 1000:1000 /opt/jenkins_home  # 1000 = jenkins user UID inside container


Run Jenkins Container:

docker run -d \
  --name jenkins \
  --restart=always \
  -p 8080:8080 \
  -v /opt/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_[REGION.amazonaws.com/$ECR_REPO:latest](https://REGION.amazonaws.com/$ECR_REPO:latest)


Result: Jenkins is automatically up and running on the Bastion after terraform apply completes.

6. 🔗 Access Patterns (Laptop ↔ Bastion ↔ EKS)

The Bastion Host is used as a jump point to reach the private cluster from your local machine.

Accessing the Bastion:

ssh -i your-key.pem ubuntu@<bastion-public-ip>


Accessing EKS from within the Bastion:

aws eks update-kubeconfig --name flower-shop-cluster --region us-east-1
kubectl get nodes


Accessing the Frontend via SSH Tunnel (Port-Forward):

On the Bastion: Forward the Frontend service locally.

kubectl port-forward -n flower-shop svc/flower-shop-frontend 3000:80


On your Local Machine (Laptop): Create an SSH tunnel.

ssh -i your-key.pem -L 3000:127.0.0.1:3000 ubuntu@<bastion-public-ip>


Open in Browser:

http://localhost:3000


The file eks-bastion-access-steps.yaml acts as a cheat sheet for these access steps.

7. 🔄 CI/CD with Jenkins (Jenkinsfile)

7.1 Pipeline Overview

The Jenkins Declarative Pipeline covers the following stages:

Checkout SCM

Build Docker images (Frontend + Backend)

Login to ECR

Tag and Push images

Deploy to EKS

Rollout Restart Deployments

7.2 Core Environment Variables (Groovy Example)

environment {
    AWS_REGION     = "us-east-1"
    AWS_ACCOUNT_ID = "<AWS_ACCOUNT_ID>"
    ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    CLUSTER_NAME   = "flower-shop-cluster"
    NAMESPACE      = "flower-shop"
}


7.3 Key Stages (Groovy Summary)

Build Docker Images:

stage('Build Docker Images') {
    steps {
        sh '''
        echo "Building Frontend..."
        docker build -t flower-shop-frontend:latest ./client

        echo "Building Backend..."
        docker build -t flower-shop-backend:latest ./server
        '''
    }
}


ECR Login:

stage('AWS ECR Login') {
    steps {
        sh '''
        aws ecr get-login-password --region ${AWS_REGION} | \
          docker login --username AWS --password-stdin ${ECR_REGISTRY}
        '''
    }
}


Tag and Push Images:

stage('Tag & Push Images') {
    steps {
        sh '''
        docker tag flower-shop-frontend:latest ${ECR_REGISTRY}/flower-shop-frontend:latest
        docker tag flower-shop-backend:latest  ${ECR_REGISTRY}/flower-shop-backend:latest

        docker push ${ECR_REGISTRY}/flower-shop-frontend:latest
        docker push ${ECR_REGISTRY}/flower-shop-backend:latest
        '''
    }
}


Deploy to EKS:

stage('Deploy to EKS') {
    steps {
        sh '''
        aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}

        kubectl apply -f k8s/flower-shop-app-node.yaml -n ${NAMESPACE}

        kubectl rollout restart deployment flower-shop-frontend -n ${NAMESPACE}
        kubectl rollout restart deployment backend -n ${NAMESPACE}
        '''
    }
}


8. 🔐 IAM and EKS Access (aws-auth ConfigMap)

Jenkins (inside its container) uses the IAM Role of the Bastion EC2 Instance. To grant it access to the EKS Cluster, this role must be added to the aws-auth ConfigMap:

Example Entry in aws-auth ConfigMap:

mapRoles:
  - rolearn: arn:aws:iam::<AWS_ACCOUNT_ID>:role/<BastionOrJenkinsRole>
    username: jenkins-bastion
    groups:
      - system:masters # Grants full administrative permissions within the cluster


Applying the change:

kubectl edit configmap aws-auth -n kube-system


After this, aws eks update-kubeconfig and kubectl commands will work inside the Jenkins Pipeline.

9. 🌐 ALB and Ingress (k8s/setup-alb-controller-and-ingress.sh)

The helper script k8s/setup-alb-controller-and-ingress.sh performs the following:

Checks for required tools (kubectl, helm, aws).

Identifies the AWS Account ID and VPC ID.

Creates a ServiceAccount with the necessary IAM Role for the aws-load-balancer-controller.

Installs/upgrades the AWS Load Balancer Controller via Helm into the kube-system namespace.

Creates k8s/flower-shop-ingress.yaml with ALB settings (e.g., ingress.class: alb, internet-facing).

Applies the Ingress and waits for the ALB DNS hostname to be provisioned.

Access via:

http://<ALB-DNS-Hostname>/


Next Planned Step: Integrate this script into the Jenkins Pipeline as a separate stage for ALB and Ingress configuration.

10. 🧪 Experimental Fargate Path

The repository contains an older, experimental manifest:

terraform/app-on-faregate.yaml


This was used for testing AWS Fargate as an alternative for running the application. The final design utilizes Managed EKS Node Groups and the k8s/flower-shop-app-node.yaml manifest.

11. 📝 (Planned) Ansible Integration

The ansible/ directory will be used for future integration, including:

Configuration Management on: the Bastion Host and EKS worker nodes (if needed).

Playbooks for: installing dependencies, applying OS-level hardening, and preparing monitoring agents.

Target Structure:

ansible/
├── inventories/
├── roles/
├── playbooks/
└── group_vars/


12. 📊 (Planned) Grafana and Monitoring

The monitoring/ directory will contain monitoring configuration settings:

Grafana dashboards (JSON exports).

Prometheus configurations (or Helm values).

Planned Monitoring Setup:

EKS metrics scraped by Prometheus (or AWS Managed Prometheus).

Grafana deployed on EKS (or as a managed service).

Dashboards displaying: Pod and Node CPU/Memory, HTTP traffic and errors, and application latency.

Target Structure:

monitoring/
├── grafana-dashboards/
└── prometheus-configs/


13. ▶️ End-to-End Flow Summary

Step

Responsibility

Action

1. Provision Infrastructure

Terraform

terraform apply → VPC, EKS, ECR, Bastion

2. Build Jenkins Image

User/Local Machine

docker build and docker push of the custom Jenkins image to ECR.

3. Bootstrap Jenkins

Bastion user_data

Installs Docker, logs into ECR, runs Jenkins container.

4. Configure EKS Access

User/kubectl

Add Bastion's IAM Role to aws-auth as system:masters.

5. Create Pipeline

User/Jenkins UI

Point Jenkins to this repository and use the Jenkinsfile.

6. Run Pipeline

Jenkins

Build images, push to ECR, deploy to EKS, restart Deployments.

7. (Optional) ALB & Ingress

User/Bash

Run k8s/setup-alb-controller-and-ingress.sh to get the ALB DNS.

8. (Planned) Add Ansible & Grafana

Ansible / Prometheus / Grafana

Add configuration management and observability for enhanced stability and monitoring.
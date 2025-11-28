# 🌸 Flower Shop – Complete DevOps Project

**(Terraform + EKS + ECR + Jenkins + Docker + Ansible + Grafana)**

This project is a comprehensive DevOps graduation project that builds an end-to-end solution demonstrating a full web application with Infrastructure as Code, Containerization, Orchestration, and CI/CD.

## 🎯 Goal
Simulate a realistic, production-style pipeline:
`GitHub → Jenkins → Docker & ECR → EKS → (ALB) → User`

## 🧩 Application Architecture

The application consists of three core components:

*   **Frontend**: React/Vite SPA, Dockerized, served by Nginx.
*   **Backend**: Node.js (Express) REST API, Dockerized.
*   **Database**: MongoDB running as a Kubernetes Deployment.

### Kubernetes Manifests
Located in `k8s/flower-shop-app-node.yaml`, defining the `flower-shop` namespace and resources for MongoDB, Backend, and Frontend.

## 📁 Repository Structure

```text
flower-shop/
├── client/                     # Frontend app (React/Vite) + Dockerfile
├── server/                     # Backend app (Node.js) + Dockerfile
├── k8s/
│   ├── flower-shop-app-node.yaml      # K8s Manifests
│   └── setup-alb-controller-and-ingress.sh  # ALB Setup Script
├── terraform/
│   ├── bastion.tf              # Bastion EC2 + Jenkins user_data
│   └── ...                     # VPC, EKS, ECR, IAM resources
├── jenkins-image/              # Custom Jenkins Dockerfile
├── ansible/                    # (Planned) Configuration Management
├── monitoring/                 # (Planned) Grafana/Prometheus
├── Jenkinsfile                 # CI/CD Pipeline
└── eks-bastion-access-steps.yaml  # Access Cheat Sheet
```

## 🌱 Infrastructure as Code (Terraform)

Provisioned in `terraform/`:

*   **Networking (VPC)**: Custom VPC, Public/Private subnets, IGW, NAT Gateway, Security Groups.
*   **Amazon EKS**: Private Cluster (`flower-shop-cluster`), Managed Node Group, IAM Roles.
*   **Amazon ECR**: Repositories for frontend, backend, and custom jenkins image.
*   **Bastion Host**: EC2 in public subnet acting as Jump Host and Jenkins Server.

### Usage
```bash
cd terraform
terraform init
terraform plan -out plan.out
terraform apply plan.out
```

## 🛠 Custom Jenkins Image

Built from `jenkins/jenkins:lts-jdk17` with AWS CLI, kubectl, and Docker CLI installed.
Located in `jenkins-image/`.

## 🏰 Bastion Host & Jenkins Bootstrap

The Bastion Host automatically starts Jenkins via `user_data`:
1.  Installs Docker.
2.  Logs into ECR.
3.  Runs the custom Jenkins container on port 8080.

## 🔗 Access Patterns

*   **Bastion SSH**: `ssh -i key.pem ubuntu@<bastion-ip>`
*   **EKS Access**: `aws eks update-kubeconfig ...` (inside Bastion)
*   **Frontend Access**: SSH Tunnel via Bastion to `localhost:3000`.

## 🔄 CI/CD Pipeline (Jenkinsfile)

Stages:
1.  **Build**: Docker images for Frontend & Backend.
2.  **Login**: AWS ECR Login.
3.  **Push**: Tag and push images to ECR.
4.  **Deploy**: Apply K8s manifests and rollout restart deployments.

## 🌐 ALB and Ingress

Helper script `k8s/setup-alb-controller-and-ingress.sh` installs AWS Load Balancer Controller and creates Ingress.
Access application via the provisioned ALB DNS hostname.

## 🚀 Future Plans

*   **Ansible**: Configuration management for Bastion and Nodes.
*   **Observability**: Grafana dashboards and Prometheus metrics.

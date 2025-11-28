# 🌸 Flower Shop – Complete DevOps Project

**(Terraform + EKS + ECR + Jenkins + Docker + Ansible + Grafana)**

This project is a comprehensive DevOps graduation project that builds an end-to-end solution demonstrating a full web application with Infrastructure as Code, Containerization, Orchestration, and CI/CD.

## 🎯 Goal
Simulate a realistic, production-style pipeline:
`GitHub → Jenkins → Docker & ECR → EKS → (ALB) → User`

### 1️⃣ High-Level CI/CD Flow
```text
+-------------------+        git push        +-----------------------------+
|  Dev Laptop       |----------------------->|  GitHub: flower-shop repo   |
|  (VSCode, etc.)   |                        +-----------------------------+
+-------------------+                                   |
                                                        | Poll SCM / Webhook
                                                        v
                                            +------------------------------+
                                            | Bastion EC2 (public subnet)  |
                                            |------------------------------|
                                            | - Docker                     |
                                            | - Jenkins container          |
                                            |    * awscli                  |
                                            |    * kubectl                 |
                                            |    * docker CLI              |
                                            +------------------------------+
                                                        |
                         +------------------------------+----------------------------+
                         |                                                              
                         | docker build/tag/push (frontend + backend images)           
                         v                                                              
                +-------------------------------+                                       
                |       Amazon ECR              |                                       
                |  flower-shop-frontend image   |                                       
                |  flower-shop-backend image    |                                       
                |  jenkins-eks image            |                                       
                +-------------------------------+                                       
                         |                                                              
                         | kubectl apply / rollout restart                              
                         v                                                              
                +-------------------------------+                                       
                |     Amazon EKS Cluster        |                                       
                |   (flower-shop-cluster)       |                                       
                +-------------------------------+
```

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

### 2️⃣ AWS VPC + Bastion + EKS + ALB
```text
+==========================================================================+
|                     AWS VPC  (us-east-1, Terraform)                      |
|==========================================================================|
|                                                                          |
|  Public Subnet(s):                                                       |
|                                                                          |
|    +------------------------+        +--------------------------------+  |
|    | Bastion EC2            |        |    ALB (AWS Load Balancer)     |  |
|    |------------------------|        |  (created via ALB Controller)  |  |
|    | - Jenkins in Docker    |        +--------------------------------+  |
|    | - Ansible (planned)    |                      ^                    |
|    |   * ssh to nodes       |                      | HTTP/HTTPS         |
|    +------------------------+                      |                    |
|                                                   Users / Browser       |
|                                                                          |
|  Private Subnet(s):                                                      |
|                                                                          |
|    +---------------------------------------------------------------+    |
|    |      Amazon EKS: flower-shop-cluster                         |    |
|    |---------------------------------------------------------------|    |
|    |  Node Group (EC2 worker nodes)                               |    |
|    |                                                               |    |
|    |   +----------------------+   +-----------------------------+  |    |
|    |   |  K8s Namespace       |   |  (Planned) monitoring ns    |  |    |
|    |   |  flower-shop         |   |-----------------------------|  |    |
|    |   |----------------------|   | - Grafana                   |  |    |
|    |   | - Deployment:        |   | - Prometheus / metrics      |  |    |
|    |   |    flower-shop-      |   +-----------------------------+  |    |
|    |   |    frontend          |                                   |    |
|    |   | - Service: frontend  |                                   |    |
|    |   |                      |                                   |    |
|    |   | - Deployment:        |                                   |    |
|    |   |    backend           |                                   |    |
|    |   | - Service: backend   |                                   |    |
|    |   |                      |                                   |    |
|    |   | - Deployment:        |                                   |    |
|    |   |    mongodb           |                                   |    |
|    |   | - Service: mongodb   |                                   |    |
|    |   +----------------------+                                   |    |
|    |                                                               |    |
|    |  ALB Ingress:                                                |    |
|    |    - Ingress object: flower-shop-ingress                     |    |
|    |    - ingress.class: alb                                      |    |
|    |    - Targets: frontend Service (port 80)                     |    |
|    +---------------------------------------------------------------+    |
|                                                                          |
+==========================================================================+
```

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

### 3️⃣ App Request Path (User → ALB → K8s → DB)
```text
[ User Browser ]
        |
        |  http(s)://<ALB-DNS-or-Domain>/
        v
+------------------------------+
|  AWS ALB (internet-facing)   |
+------------------------------+
        |
        | routes HTTP traffic (Ingress rules)
        v
+------------------------------+
| K8s Ingress: flower-shop-    |
|            ingress           |
+------------------------------+
        |
        | path "/" -> Service: flower-shop-frontend (port 80)
        v
+------------------------------+
| Service: flower-shop-        |
|           frontend           |
+------------------------------+
        |
        | ClusterIP to pods
        v
+------------------------------+        +------------------------------+
| Deployment: frontend pods    |<------>| Service: backend             |
+------------------------------+        +------------------------------+
                                               |
                                               | ClusterIP
                                               v
                                     +------------------------------+
                                     | Deployment: backend pods     |
                                     +------------------------------+
                                               |
                                               | MongoDB connection
                                               v
                                     +------------------------------+
                                     | Deployment + Service:        |
                                     | mongodb                      |
                                     +------------------------------+
```

## 🚀 Future Plans

*   **Ansible**: Configuration management for Bastion and Nodes.
*   **Observability**: Grafana dashboards and Prometheus metrics.

### 4️⃣ Where Ansible & Grafana Fit
```text
                 +--------------------------------------+
                 |  Dev Laptop / Ansible Control Node   |
                 |--------------------------------------|
                 | - Run Ansible playbooks (planned)    |
                 |   * Configure bastion                |
                 |   * Configure monitoring agents      |
                 +-------------------------+------------+
                                           |
                                           | ssh / API
                                           v
+------------------------+      +--------------------------------------+
| Bastion EC2           |      |  EKS Nodes / Other Targets (future) |
|------------------------|      |--------------------------------------|
| - Jenkins container    |      | - node exporters / agents (future)  |
| - Ansible (CLI)        |      +--------------------------------------+
+------------------------+


                (Monitoring Stack inside EKS - planned)

+-------------------------------------------------------------+
| Namespace: monitoring                                       |
|-------------------------------------------------------------|
|  - Prometheus (metrics)                                     |
|  - Grafana (dashboards)                                     |
|    * Dashboards for:                                        |
|       - Cluster (EKS)                                       |
|       - Flower Shop app                                     |
|       - Jenkins pipeline (if integrated)                    |
+-------------------------------------------------------------+
```

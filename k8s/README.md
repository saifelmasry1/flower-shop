# Flower Shop App on EKS – Frontend/Backend Testing & MongoDB Seeding

This document explains how to:

- Test the **backend API** (Node/Express) running on EKS  
- Test the **frontend** (React + Vite + Nginx) running on EKS  
- Seed **MongoDB** with initial product data  
- Reproduce the same behavior as the original **local docker-compose setup**

---

## 1. Architecture Overview

The Flower Shop application is a simple 3-tier app:

1. **Frontend**
   - React + Vite, served by Nginx
   - Packaged as a Docker image and deployed as a Kubernetes `Deployment`
   - Kubernetes `Service`: `flower-shop-frontend` (ClusterIP, port `80`)

2. **Backend**
   - Node.js + Express
   - Exposes a REST API on port `5000`
   - Main endpoint:
     - `GET /api/products` – returns a list of products from MongoDB
   - Kubernetes `Service`: `backend` (ClusterIP, port `5000`)

3. **MongoDB**
   - Docker image: `mongo:7`
   - Database: `flower-shop`
   - Collection: `products`
   - Kubernetes `Service`: `mongodb` (ClusterIP, port `27017`)

The cluster runs on **Amazon EKS with Fargate**, and access is provided through a **bastion host** created by Terraform.  

Docker images are stored in **Amazon ECR** (example):

- `163511166008.dkr.ecr.us-east-1.amazonaws.com/flower-shop-frontend:latest`
- `163511166008.dkr.ecr.us-east-1.amazonaws.com/flower-shop-backend:latest`

---

## 2. Prerequisites

- `terraform` applied (bastion + EKS created)
- `kubectl` configured to talk to the EKS cluster
- SSH access to the bastion host (for example, using `azza.pem`)
- `kubectl` and `aws` CLI installed on your local machine

From the Terraform directory you can get bastion info:

```bash
terraform output bastion_public_dns
terraform output bastion_public_ip

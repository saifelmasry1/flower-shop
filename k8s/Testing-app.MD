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

### Architecture Diagram

```ascii
                                     +---------------------------+
                                     |      AWS Cloud (EKS)      |
                                     |                           |
   +-------------+    SSH Tunnel     |   +-------------------+   |
   | Local User  | <===============> |   |   Bastion Host    |   |
   +-------------+                   |   +---------+---------+   |
          |                          |             |             |
          | (Browser / Curl)         |             | (kubectl    |
          v                          |             v  port-fwd)  |
   +-------------+                   |   +-------------------+   |
   |  Localhost  |                   |   | Kubernetes Cluster|   |
   |  Port 3000  | ----------------> |   |                   |   |
   |  Port 5000  |                   |   |  [Frontend Pod]   |   |
   +-------------+                   |   |  (React/Nginx)    |   |
                                     |   |        ^          |   |
                                     |   |        | HTTP     |   |
                                     |   |        v          |   |
                                     |   |  [Backend Pod]    |   |
                                     |   |  (Node/Express)   |   |
                                     |   |        ^          |   |
                                     |   |        | TCP      |   |
                                     |   |        v          |   |
                                     |   |  [MongoDB Pod]    |   |
                                     |   |  (mongo:7)        |   |
                                     |   +-------------------+   |
                                     +---------------------------+
```

---

## 2. Prerequisites

- `terraform` applied (bastion + EKS created)
- `kubectl` configured to talk to the EKS cluster
- SSH access to the bastion host (for example, using `azza.pem`)
- `kubectl` and `aws` CLI installed on your local machine
 Build & Push Docker Images to Amazon ECR
---

## 3. Get Bastion Host Information

From the Terraform directory:

```bash
terraform output bastion_public_dns
terraform output bastion_public_ip
```

Example:

```text
"ec2-3-83-36-52.compute-1.amazonaws.com"
"3.83.36.52"
```


### 3.1 (Optional) Update Application Images

**Build & Push Docker Images to Amazon ECR**

> **Note:** Replace:
> - `<AWS_ACCOUNT_ID>` → with your AWS Account ID (12 digits)
> - `<AWS_REGION>` → with your working region (e.g., `us-east-1`)

---

#### 1. Login to ECR

```bash
aws ecr get-login-password --region <AWS_REGION> \
  | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com

aws ecr create-repository --repository-name flower-shop-frontend --region <AWS_REGION>
aws ecr create-repository --repository-name flower-shop-backend  --region <AWS_REGION>

docker tag flower-shop-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/flower-shop-frontend:latest
docker tag flower-shop-backend:latest  <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/flower-shop-backend:latest

docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/flower-shop-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/flower-shop-backend:latest
```

- Ensure that the ECR repositories for `frontend` and `backend` exist and are active.
- If you modified the code:
  1. Build a new image for the frontend / backend.
  2. Push the image to ECR (with the same tag or a new tag).
  3. If you changed the tag in the YAML:
     ```bash
     kubectl apply -f k8s/flower-shop-app-node.yaml
     ```
kubectl get pods -n flower-shop
kubectl get svc  -n flower-shop
```

Example output:

```text
NAME                                  READY   STATUS    RESTARTS   AGE
backend-59fb4f88d5-88khn              1/1     Running   0          16m
flower-shop-frontend-7dd57d99-dp6d9   1/1     Running   0          16m
mongodb-855c85f5d6-7ljkx              1/1     Running   0          16m

NAME                   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)     AGE
backend                ClusterIP   172.20.x.x       <none>        5000/TCP    16m
flower-shop-frontend   ClusterIP   172.20.y.y       <none>        80/TCP      16m
mongodb                ClusterIP   172.20.z.z       <none>        27017/TCP   16m
```

Namespace used: `flower-shop`

## 5. Backend Testing Inside the Cluster

### 5.1 Create a temporary curl-test pod

Create once (if not already created):

```bash
kubectl run curl-test -n flower-shop \
  --image=public.ecr.aws/amazonlinux/amazonlinux:2 \
  --command -- sleep 3600
```

Exec into the pod:

```bash
kubectl exec -it -n flower-shop curl-test -- sh
```

### 5.2 Test the backend Service from inside the cluster

Inside the curl-test pod:

```bash
curl http://backend:5000/api/products
```

- If you see `[]` → backend is working but MongoDB has no products yet.
- If you see an array of product objects → backend + MongoDB are working and seeded.

Exit the pod:

```bash
exit
```

## 6. Backend Testing from the Local Machine

### 6.1 Port-forward backend on the bastion

On the bastion:

```bash
kubectl port-forward -n flower-shop svc/backend 5000:5000
```

Keep this terminal open.

### 6.2 SSH from the local machine with an SSH tunnel

On your local machine:

```bash
ssh -i azza.pem \
  -L 5000:127.0.0.1:5000 \
  ubuntu@<BASTION_PUBLIC_DNS>
```

Example:

```bash
ssh -i azza.pem \
  -L 5000:127.0.0.1:5000 \
  ubuntu@ec2-3-83-36-52.compute-1.amazonaws.com
```

### 6.3 Test the API from the local machine

From another terminal on your local machine:

```bash
curl http://127.0.0.1:5000/api/products
```

You should get the same JSON as in section 5.

This confirms:
- Backend pod is running
- Kubernetes Service `backend` works
- Bastion port-forward + SSH tunnel are configured correctly

## 7. Frontend Testing from the Local Machine

### 7.1 (Optional) Test frontend Service from inside the cluster

From inside curl-test:

```bash
curl http://flower-shop-frontend
```

You should see the HTML for the React app (`index.html`).

### 7.2 Port-forward frontend on the bastion

On the bastion:

```bash
kubectl port-forward -n flower-shop svc/flower-shop-frontend 3000:80
```

Keep this terminal open.

### 7.3 SSH with tunnels for both frontend and backend

On your local machine:

```bash
ssh -i azza.pem \
  -L 3000:127.0.0.1:3000 \
  -L 5000:127.0.0.1:5000 \
  ubuntu@<BASTION_PUBLIC_DNS>
```

Now the mappings are:
- `http://127.0.0.1:3000` → frontend
- `http://127.0.0.1:5000` → backend API

### 7.4 Open the app in the browser

On the local machine, open:

```text
http://127.0.0.1:3000
```

The home page should load (The Garden landing page).

Then open the products page:

```text
http://127.0.0.1:3000/products
```

If MongoDB is seeded, you should see the full list of flower product cards with images and prices.

### 7.5 Verify frontend → backend traffic

Open DevTools → Network → Fetch/XHR and enable “Disable cache”.
Reload `/products`.

You should see a request like:

```text
GET /api/products  → Status 200
```

The response should be an array of products.
Images should load from:

```text
/images/<image-name>.png
```

(for example `/images/tropical-flowers.png`), which are served by Nginx from the built React app.

## 8. MongoDB Seeding (Initial Data)

To make the `/products` page look exactly like the local docker-compose setup, we seed MongoDB with 12 products matching the images under `client/public/images`.

### 8.1 Create a temporary mongo-client pod

On the bastion:

```bash
kubectl run mongo-client -n flower-shop \
  --image=mongo:7 \
  --command -- sleep 3600
```

Check that it is running:

```bash
kubectl get pods -n flower-shop
```

You should see `mongo-client` in `Running` state.

### 8.2 Connect to MongoDB with mongosh

```bash
kubectl exec -it -n flower-shop mongo-client -- mongosh "mongodb://mongodb:27017/flower-shop"
```

You should see a mongosh prompt like:

```text
flower-shop>
```

### 8.3 Seed the products collection

Paste this script into mongosh:

```javascript
db.products.deleteMany({});

db.products.insertMany([
  {
    name: "Tropical Paradise",
    price: 82.99,
    category: "Tropical",
    description: "Exotic tropical flowers including birds of paradise, orchids, and anthuriums.",
    image: "/images/tropical-flowers.png",
    imageUrl: "/images/tropical-flowers.png",
    featured: true,
    inStock: true
  },
  {
    name: "Spring Tulip Mix",
    price: 48.99,
    category: "Tulips",
    description: "Colorful assortment of tulips in red, yellow, pink, and white.",
    image: "/images/tulip-mix.png",
    imageUrl: "/images/tulip-mix.png",
    featured: false,
    inStock: true
  },
  {
    name: "Autumn Harvest Bouquet",
    price: 54.99,
    category: "Bouquet",
    description: "Warm autumn tones featuring orange roses and carnations.",
    image: "/images/autumn-bouquet.png",
    imageUrl: "/images/autumn-bouquet.png",
    featured: false,
    inStock: true
  },
  {
    name: "Spring Tulip Arrangement",
    price: 46.99,
    category: "Tulips",
    description: "Vibrant pink and white tulips arranged in a clear vase.",
    image: "/images/spring-tulips.png",
    imageUrl: "/images/spring-tulips.png",
    featured: true,
    inStock: true
  },
  {
    name: "Sunny Day Sunflowers",
    price: 44.99,
    category: "Sunflowers",
    description: "Cheerful sunflower bouquet to brighten anyone's day.",
    image: "/images/sunflowers.png",
    imageUrl: "/images/sunflowers.png",
    featured: true,
    inStock: true
  },
  {
    name: "Elegant Orchid Plant",
    price: 59.99,
    category: "Orchids",
    description: "Sophisticated white and purple orchids in a ceramic pot.",
    image: "/images/orchids.png",
    imageUrl: "/images/orchids.png",
    featured: false,
    inStock: true
  },
  {
    name: "Wildflower Meadow Mix",
    price: 38.99,
    category: "Wildflowers",
    description: "Rustic mix of colorful wildflowers for a natural look.",
    image: "/images/wildflowers.png",
    imageUrl: "/images/wildflowers.png",
    featured: false,
    inStock: true
  },
  {
    name: "Pure White Lilies",
    price: 55.99,
    category: "Lilies",
    description: "Elegant white lilies symbolizing purity and grace.",
    image: "/images/white-lilies.png",
    imageUrl: "/images/white-lilies.png",
    featured: false,
    inStock: true
  },
  {
    name: "Romantic Pink Roses",
    price: 52.99,
    category: "Roses",
    description: "Soft pink roses, perfect for romantic occasions.",
    image: "/images/pink-roses.png",
    imageUrl: "/images/pink-roses.png",
    featured: false,
    inStock: true
  },
  {
    name: "Lavender Dreams",
    price: 41.99,
    category: "Lavender",
    description: "Calming lavender bouquet with greenery.",
    image: "/images/lavender.png",
    imageUrl: "/images/lavender.png",
    featured: false,
    inStock: false
  },
  {
    name: "Garden Rose Delight",
    price: 57.99,
    category: "Roses",
    description: "Lush garden roses in pastel tones.",
    image: "/images/garden-roses.png",
    imageUrl: "/images/garden-roses.png",
    featured: false,
    inStock: true
  },
  {
    name: "Classic Red Roses",
    price: 62.99,
    category: "Roses",
    description: "12 premium red roses bouquet.",
    image: "/images/red-roses.png",
    imageUrl: "/images/red-roses.png",
    featured: true,
    inStock: true
  }
]);
```

Verify:

```javascript
db.products.countDocuments();  // should return 12
```

Then exit:

```javascript
exit
```

### 8.4 Clean up the mongo-client pod (optional)

```bash
kubectl delete pod -n flower-shop mongo-client
```

## 9. Final Check – “Same as Local docker-compose”

After seeding and with port-forward + SSH tunnels in place:

### Backend check (from local machine)

```bash
curl http://127.0.0.1:5000/api/products
```

You should see 12 products with image paths like `/images/...`.

### Frontend check

Open `http://127.0.0.1:3000/products`

The page should display all 12 product cards with:
- Images
- Name, description, price
- “ADD TO CART” buttons

At this point, the EKS deployment reproduces the same behavior as the local docker-compose setup, with a full 3-tier architecture (Frontend → Backend → MongoDB) running on AWS infrastructure.

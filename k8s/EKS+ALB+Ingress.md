# 📘 Flower Shop — Deployment Guide (EKS + ALB + Ingress)

This README documents all the steps required to deploy, test, and expose the Flower-Shop application on AWS EKS using:

- **Bastion host**
- **EKS cluster** (Terraform)
- **MongoDB** inside the cluster
- **Backend + Frontend apps**
- **AWS Load Balancer Controller**
- **ALB + Ingress** for internet exposure

*Only the Kubernetes manifests applied manually are included here.*

---

## 🏗️ 6. Install AWS Load Balancer Controller (Helm)

**Add repo:**
```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

**Install controller:**
```bash
helm install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=flower-shop-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

---

## 🔑 7. Apply ServiceAccount (Manually Applied File)

**File:** `k8s/aws-load-balancer-controller-sa.yaml`

**Apply:**
```bash
kubectl apply -f k8s/aws-load-balancer-controller-sa.yaml
```

---

## 🌍 8. Create Ingress + ALB

**File:** `k8s/flower-shop-ingress.yaml`

**Apply:**
```bash
kubectl apply -f k8s/flower-shop-ingress.yaml
```

---

## ✔️ 9. Confirm ALB Creation

```bash
kubectl get ingress -n flower-shop
```

**Expected result:**
```text
NAME                  ADDRESS                                                  
flower-shop-ingress   flower-shop-alb-xxxx.elb.amazonaws.com
```

**Access the app publicly:**
```text
http://flower-shop-alb-xxxx.elb.amazonaws.com/
```

---

## 🎉 Deployment Complete

Your full Flower Shop application is now:
- Running on **EKS**
- **MongoDB** seeded
- **Backend** serving API
- **Frontend** accessible
- **ALB + Ingress** exposing the app to the internet.

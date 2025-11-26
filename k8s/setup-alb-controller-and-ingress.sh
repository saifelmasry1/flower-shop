#!/usr/bin/env bash
set -euo pipefail

############################################
# Basic config (edit these if needed)
############################################

CLUSTER_NAME="flower-shop-cluster"
AWS_REGION="us-east-1"

# Names (can stay as-is if your app matches)
IAM_ROLE_NAME="AWSLoadBalancerControllerRole"
K8S_DIR="k8s"
KUBE_SYSTEM_NS="kube-system"
APP_NAMESPACE="flower-shop"
INGRESS_NAME="flower-shop-ingress"
FRONTEND_SERVICE_NAME="flower-shop-frontend"
ALB_NAME="flower-shop-alb"

log() {
  echo
  echo "==== $* ===="
}

############################################
# Tool checks
############################################

for cmd in kubectl helm aws; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ $cmd is not in PATH"
    exit 1
  fi
done

############################################
# Discover AWS Account ID & VPC ID
############################################

log "Detecting AWS account ID"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)
if [[ -z "${ACCOUNT_ID}" || "${ACCOUNT_ID}" == "None" ]]; then
  echo "❌ Failed to detect AWS account ID. Make sure AWS CLI is configured (aws configure)."
  exit 1
fi
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${IAM_ROLE_NAME}"
log "Using IAM Role ARN: ${ROLE_ARN}"

log "Detecting VPC ID for EKS cluster ${CLUSTER_NAME} in region ${AWS_REGION}"
VPC_ID=$(aws eks describe-cluster \
  --name "${CLUSTER_NAME}" \
  --region "${AWS_REGION}" \
  --query "cluster.resourcesVpcConfig.vpcId" \
  --output text 2>/dev/null || true)

if [[ -z "${VPC_ID}" || "${VPC_ID}" == "None" ]]; then
  echo "❌ Failed to detect VPC ID for cluster ${CLUSTER_NAME} in region ${AWS_REGION}"
  exit 1
fi
log "Using VPC ID: ${VPC_ID}"

############################################
# Check cluster connectivity
############################################

log "Checking Kubernetes cluster connectivity (kubectl)"
kubectl cluster-info >/dev/null

############################################
# 1) Create ServiceAccount bound to IAM Role
############################################

log "Creating and applying ServiceAccount for AWS Load Balancer Controller"

mkdir -p "${K8S_DIR}"

cat > "${K8S_DIR}/aws-load-balancer-controller-sa.yaml" <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: aws-load-balancer-controller
  namespace: ${KUBE_SYSTEM_NS}
  annotations:
    eks.amazonaws.com/role-arn: ${ROLE_ARN}
EOF

kubectl apply -f "${K8S_DIR}/aws-load-balancer-controller-sa.yaml"

############################################
# 2) Install AWS Load Balancer Controller via Helm
############################################

log "Adding/ensuring 'eks' Helm repository"
if ! helm repo list 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "eks"; then
  helm repo add eks https://aws.github.io/eks-charts
fi

log "Updating Helm repositories"
helm repo update

log "Installing/upgrading AWS Load Balancer Controller (Helm upgrade --install)"
helm upgrade --install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  -n "${KUBE_SYSTEM_NS}" \
  --set clusterName="${CLUSTER_NAME}" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region="${AWS_REGION}" \
  --set vpcId="${VPC_ID}"

############################################
# 3) Wait for Deployment and pods to be ready
############################################

log "Waiting for aws-load-balancer-controller Deployment to be created"

for i in {1..30}; do
  if kubectl get deployment aws-load-balancer-controller -n "${KUBE_SYSTEM_NS}" >/dev/null 2>&1; then
    echo "Deployment has been created."
    break
  fi
  echo "Deployment not created yet... (attempt #$i)"
  sleep 5
done

if ! kubectl get deployment aws-load-balancer-controller -n "${KUBE_SYSTEM_NS}" >/dev/null 2>&1; then
  echo "❌ Deployment aws-load-balancer-controller was not found after waiting."
  exit 1
fi

log "Waiting for Deployment rollout to complete (timeout 5 minutes)"
if ! kubectl rollout status deployment/aws-load-balancer-controller -n "${KUBE_SYSTEM_NS}" --timeout=5m; then
  echo "❌ Deployment rollout failed. Showing controller logs:"
  kubectl logs -n "${KUBE_SYSTEM_NS}" deploy/aws-load-balancer-controller || true
  exit 1
fi

log "Current aws-load-balancer-controller pods"
kubectl get pods -n "${KUBE_SYSTEM_NS}" | grep aws-load-balancer-controller || true

############################################
# 4) Create and apply Ingress for the Flower Shop app
############################################

log "Creating and applying Ingress for Flower Shop application"

cat > "${K8S_DIR}/flower-shop-ingress.yaml" <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${INGRESS_NAME}
  namespace: ${APP_NAMESPACE}
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80}]'
    alb.ingress.kubernetes.io/healthcheck-path: /healthz
    alb.ingress.kubernetes.io/load-balancer-name: ${ALB_NAME}
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${FRONTEND_SERVICE_NAME}
                port:
                  number: 80
EOF

kubectl apply -f "${K8S_DIR}/flower-shop-ingress.yaml"

############################################
# 5) Wait for ALB to be provisioned and fetch DNS
############################################

log "Waiting for Ingress to obtain an external address (ALB DNS)"

INGRESS_HOSTNAME=""

for i in {1..30}; do
  INGRESS_HOSTNAME=$(kubectl get ingress "${INGRESS_NAME}" -n "${APP_NAMESPACE}" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
  if [[ -n "${INGRESS_HOSTNAME}" ]]; then
    echo "ALB hostname became available after approximately $((i * 10)) seconds."
    break
  fi
  echo "ALB hostname not available yet... (attempt #$i)"
  sleep 10
done

log "Current Ingress status:"
kubectl get ingress -n "${APP_NAMESPACE}"

if [[ -n "${INGRESS_HOSTNAME}" ]]; then
  echo
  echo "✅ ALB is ready."
  echo "Open the application using:"
  echo "  http://${INGRESS_HOSTNAME}/"
else
  echo
  echo "⚠️ ALB DNS is still not present in Ingress status after 5 minutes."
  echo "You can check again later with:"
  echo "  kubectl get ingress ${INGRESS_NAME} -n ${APP_NAMESPACE}"
fi

############################################
# 6) Quick troubleshooting tips
############################################

log "Quick troubleshooting tips if ALB does not appear:"

cat <<TIPS
- Check that the controller pods are running:
    kubectl get pods -n ${KUBE_SYSTEM_NS} | grep aws-load-balancer-controller

- Verify the IAM Role:
    ${IAM_ROLE_NAME} should have the AWSLoadBalancerControllerIAMPolicy attached.

- Verify tags on your public subnets:
    kubernetes.io/cluster/${CLUSTER_NAME} = shared
    kubernetes.io/role/elb = 1
TIPS

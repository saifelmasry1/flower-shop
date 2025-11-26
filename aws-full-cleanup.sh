#!/bin/bash
set -e

REGION="us-east-1"
echo "🚨 WARNING: This script will delete EVERYTHING in AWS region: $REGION"
read -p "Type 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 1
fi

# ===========================
# 🔹 ECR
# ===========================
echo "🧹 Cleaning up ECR Repositories..."
for repo in $(aws ecr describe-repositories --region $REGION --query "repositories[].repositoryName" --output text 2>/dev/null); do
  echo "🗑️ Deleting ECR repository: $repo"
  aws ecr delete-repository --repository-name "$repo" --force --region $REGION
done

# ===========================
# 🔹 S3
# ===========================
echo "🧹 Cleaning up S3 Buckets..."
for bucket in $(aws s3 ls | awk '{print $3}'); do
  echo "🗑️ Deleting S3 bucket: $bucket"
  aws s3 rb "s3://$bucket" --force
done

# ===========================
# 🔹 EKS
# ===========================
echo "🧹 Cleaning up EKS Clusters..."
for cluster in $(aws eks list-clusters --region $REGION --query "clusters[]" --output text 2>/dev/null); do
  echo "🗑️ Deleting EKS cluster: $cluster"
  aws eks delete-cluster --name "$cluster" --region $REGION
done

# ===========================
# 🔹 EC2 + Elastic IPs + NAT + IGW
# ===========================
echo "🧹 Cleaning up EC2 Instances..."
for instance in $(aws ec2 describe-instances --region $REGION --query "Reservations[].Instances[].InstanceId" --output text 2>/dev/null); do
  echo "🗑️ Terminating EC2 instance: $instance"
  aws ec2 terminate-instances --instance-ids "$instance" --region $REGION
done

echo "🧹 Releasing Elastic IPs..."
for eip in $(aws ec2 describe-addresses --region $REGION --query "Addresses[].AllocationId" --output text 2>/dev/null); do
  echo "🗑️ Releasing Elastic IP: $eip"
  aws ec2 release-address --allocation-id "$eip" --region $REGION
done

echo "🧹 Deleting NAT Gateways..."
for nat in $(aws ec2 describe-nat-gateways --region $REGION --query "NatGateways[].NatGatewayId" --output text 2>/dev/null); do
  echo "🗑️ Deleting NAT Gateway: $nat"
  aws ec2 delete-nat-gateway --nat-gateway-id "$nat" --region $REGION
done

echo "🧹 Detaching and Deleting Internet Gateways..."
for igw in $(aws ec2 describe-internet-gateways --region $REGION --query "InternetGateways[].InternetGatewayId" --output text 2>/dev/null); do
  vpc_id=$(aws ec2 describe-internet-gateways --internet-gateway-ids "$igw" --region $REGION --query "InternetGateways[].Attachments[].VpcId" --output text)
  if [ -n "$vpc_id" ]; then
    echo "🔗 Detaching IGW $igw from VPC $vpc_id"
    aws ec2 detach-internet-gateway --internet-gateway-id "$igw" --vpc-id "$vpc_id" --region $REGION || true
  fi
  echo "🗑️ Deleting IGW: $igw"
  aws ec2 delete-internet-gateway --internet-gateway-id "$igw" --region $REGION
done

echo "🧹 Deleting non-default VPCs..."
for vpc in $(aws ec2 describe-vpcs --region $REGION --query "Vpcs[?IsDefault==\`false\`].VpcId" --output text 2>/dev/null); do
  echo "🗑️ Deleting VPC: $vpc"

  # Delete subnets
  for subnet in $(aws ec2 describe-subnets --region $REGION --filters Name=vpc-id,Values=$vpc --query "Subnets[].SubnetId" --output text); do
    echo "   🧱 Deleting Subnet: $subnet"
    aws ec2 delete-subnet --subnet-id "$subnet" --region $REGION
  done

  # Delete route tables
  for rt in $(aws ec2 describe-route-tables --region $REGION --filters Name=vpc-id,Values=$vpc --query "RouteTables[].RouteTableId" --output text); do
    echo "   🗺️ Deleting Route Table: $rt"
    aws ec2 delete-route-table --route-table-id "$rt" --region $REGION || true
  done

  # Delete security groups (except default)
  for sg in $(aws ec2 describe-security-groups --region $REGION --filters Name=vpc-id,Values=$vpc --query "SecurityGroups[?GroupName!='default'].GroupId" --output text); do
    echo "   🔒 Deleting Security Group: $sg"
    aws ec2 delete-security-group --group-id "$sg" --region $REGION || true
  done

  # Finally delete the VPC itself
  aws ec2 delete-vpc --vpc-id "$vpc" --region $REGION
done

# ===========================
# 🔹 Load Balancers
# ===========================
echo "🧹 Cleaning up Load Balancers..."
for elb in $(aws elb describe-load-balancers --region $REGION --query "LoadBalancerDescriptions[].LoadBalancerName" --output text 2>/dev/null); do
  echo "🗑️ Deleting Classic ELB: $elb"
  aws elb delete-load-balancer --load-balancer-name "$elb" --region $REGION
done

for alb in $(aws elbv2 describe-load-balancers --region $REGION --query "LoadBalancers[].LoadBalancerArn" --output text 2>/dev/null); do
  echo "🗑️ Deleting ALB/NLB: $alb"
  aws elbv2 delete-load-balancer --load-balancer-arn "$alb" --region $REGION
done

# ===========================
# 🔹 IAM
# ===========================
echo "🧹 Cleaning up IAM Roles related to Terraform/EKS..."
for role in $(aws iam list-roles --query "Roles[?contains(RoleName, 'eks') || contains(RoleName, 'terraform')].RoleName" --output text 2>/dev/null); do
  echo "🗑️ Deleting IAM role: $role"
  policies=$(aws iam list-attached-role-policies --role-name "$role" --query "AttachedPolicies[].PolicyArn" --output text)
  for policy in $policies; do
    aws iam detach-role-policy --role-name "$role" --policy-arn "$policy"
  done
  aws iam delete-role --role-name "$role"
done

echo "✅ Cleanup complete! All AWS resources removed from region $REGION."



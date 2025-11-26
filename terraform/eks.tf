############################################
# IAM Role for EKS Fargate Pods
############################################
resource "aws_iam_role" "eks_fargate_pod_role" {
  name = "${var.cluster_name}-fargate-pod-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "eks-fargate-pods.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project = "flower-shop"
  }
}

resource "aws_iam_role_policy_attachment" "eks_fargate_pod_role_attach" {
  role       = aws_iam_role.eks_fargate_pod_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"
}

############################################
# EKS Cluster (Terraform AWS Module v19.0.4)
############################################
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.4"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  # VPC & Networking
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Endpoint access: Private only
  cluster_endpoint_public_access  = false
  cluster_endpoint_private_access = true

  # IRSA – IAM Roles for Service Accounts
  enable_irsa = true

  # مهم: علشان ما يحصلش dependency cycle مع kubernetes provider
  manage_aws_auth_configmap = false

  # Fargate Profiles
  fargate_profiles = {
    default = {
      name = "default"
      selectors = [
        {
          namespace = "default"
        }
      ]
      pod_execution_role_arn = aws_iam_role.eks_fargate_pod_role.arn
    }

    flower = {
      name = "flower"
      selectors = [
        {
          namespace = "flower-shop"
        }
      ]
      pod_execution_role_arn = aws_iam_role.eks_fargate_pod_role.arn
    }

    kube_system = {
      name = "kube-system"
      selectors = [
        {
          namespace = "kube-system"
        }
      ]
      pod_execution_role_arn = aws_iam_role.eks_fargate_pod_role.arn
    }
  }

  tags = {
    Project = "flower-shop"
  }
}

############################################
# Security Group for ALB Ingress
############################################
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Security group for AWS ALB Ingress"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = "flower-shop"
  }
}
############################################
############################################################
# 🔥 Static Ubuntu 22.04 AMI (NO AUTO SELECT)
############################################################

# Ubuntu 22.04 LTS (Jammy) - Stable AMI in us-east-1
locals {
  ubuntu_2204_ami = "ami-0c398cb65a93047f2"
}

############################################################
# 1) Security Group
############################################################
resource "aws_security_group" "bastion_sg" {
  name        = "bastion-sg"
  description = "Security group for bastion host"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.bastion_allowed_cidr]
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

###########################################
# 🔐 Attach EKS Access Policy - الحل المؤقت المضمون (AdministratorAccess)
###########################################
resource "aws_iam_role_policy_attachment" "bastion_eks_access" {
  role = aws_iam_role.bastion_role.name
  # ✅ الحل النهائي: استخدام AdministratorAccess للسماح بالوصول الكامل
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
############################################################
# 2) IAM Role for Bastion
############################################################
resource "aws_iam_role" "bastion_role" {
  name = "bastion-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Project = "flower-shop"
  }
}

resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "bastion_eks_describe" {
  name = "bastion-eks-describe"
  role = aws_iam_role.bastion_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["eks:DescribeCluster"],
      Resource = module.eks.cluster_arn
    }]
  })
}

resource "aws_iam_instance_profile" "bastion_profile" {
  name = "bastion-instance-profile"
  role = aws_iam_role.bastion_role.name
}

############################################################
# 3) User Data for Ubuntu 22.04
############################################################
locals {
  user_data = <<-EOF
    #!/bin/bash
    set -xe

    #########################################
    # 1) Update system and install basics
    #########################################
    sudo apt-get update -y
    sudo apt-get install -y unzip curl jq tar gzip

    #########################################
    # 2) Install AWS CLI v2
    #########################################
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    sudo unzip awscliv2.zip
    sudo ./aws/install --update
    sudo rm -rf aws awscliv2.zip

    # Force AWS CLI v2 to be the default
    sudo ln -sf /usr/local/bin/aws /usr/bin/aws

    #########################################
    # 3) Install kubectl (EKS 1.29)
    #########################################
    sudo curl -o /usr/local/bin/kubectl \
      https://s3.us-west-2.amazonaws.com/amazon-eks/1.29.0/2024-01-04/bin/linux/amd64/kubectl
    sudo chmod +x /usr/local/bin/kubectl

    #########################################
    # 4) Install Helm 3
    #########################################
    curl -fsSL -o get_helm.sh \
      https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
    chmod 700 get_helm.sh
    sudo ./get_helm.sh
    rm get_helm.sh

    #########################################
    # 5) Configure kubeconfig for ubuntu user
    #########################################
    sudo mkdir -p /home/ubuntu/.kube

    sudo /usr/local/bin/aws eks update-kubeconfig \
      --name ${var.cluster_name} \
      --region ${var.region} \
      --kubeconfig /home/ubuntu/.kube/config

    sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube

    #########################################
    # 6) Cleanup
    #########################################
    sudo apt-get autoremove -y
    sudo apt-get clean
  EOF
}

############################################################
# 4) EC2 Instance (Ubuntu 22.04 Bastion)
############################################################
resource "aws_instance" "bastion" {
  ami                         = local.ubuntu_2204_ami
  instance_type               = "t3.micro"
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  associate_public_ip_address = true

  key_name             = var.bastion_key_name
  iam_instance_profile = aws_iam_instance_profile.bastion_profile.name
  user_data            = local.user_data

  tags = {
    Name    = "bastion-host"
    Project = "flower-shop"
  }
}

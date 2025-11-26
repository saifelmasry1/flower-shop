############################################
# ✅ Fix: Allow Bastion Host to talk to EKS API
############################################
resource "aws_security_group_rule" "allow_bastion_to_eks_api" {
  # SG بتاع EKS Control Plane اللي الموديول بيطلعه
  security_group_id = module.eks.cluster_security_group_id

  # SG بتاع الباستيون
  source_security_group_id = aws_security_group.bastion_sg.id

  type        = "ingress"
  from_port   = 443
  to_port     = 443
  protocol    = "tcp"
  description = "Allow Bastion Host SG to access EKS API on 443"
}
############################################
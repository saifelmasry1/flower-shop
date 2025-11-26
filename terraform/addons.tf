############################################
# 🔥 EKS Addons (CoreDNS, kube-proxy, VPC CNI)
############################################

resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = module.eks.cluster_name
  addon_name                  = "vpc-cni"
  resolve_conflicts_on_update = "OVERWRITE"

  tags = {
    Project = "flower-shop"
  }
}
##CORE-DNS## already exists in the cluster without adding it as a resource"Addons", so please uncomment if you want to manage it via Terraform incase you will manage your EKS cluster from your laptop directly.
# resource "aws_eks_addon" "coredns" {
#   cluster_name                = module.eks.cluster_name
#   addon_name                  = "coredns"
#   resolve_conflicts_on_update = "OVERWRITE"

#   tags = {
#     Project = "flower-shop"
#   }
# }

resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = module.eks.cluster_name
  addon_name                  = "kube-proxy"
  resolve_conflicts_on_update = "OVERWRITE"

  tags = {
    Project = "flower-shop"
  }
}

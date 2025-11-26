resource "aws_iam_policy" "alb_policy" {
  name   = "AWSLoadBalancerControllerIAMPolicy"
  policy = file("${path.module}/iam_policy.json")
}

resource "aws_iam_role" "alb_role" {
  name = "AWSLoadBalancerControllerRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = "sts:AssumeRoleWithWebIdentity",
      Principal = {
        Federated = module.eks.oidc_provider_arn
      },
      Condition = {
        StringEquals = {
          "${module.eks.oidc_provider}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller",
          "${module.eks.oidc_provider}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = {
    Project = "flower-shop"
  }
}

resource "aws_iam_role_policy_attachment" "alb_attach" {
  role       = aws_iam_role.alb_role.name
  policy_arn = aws_iam_policy.alb_policy.arn
}

/*
# ⛔ جزء الـ Helm لتنزيل AWS Load Balancer Controller يتعمل من جوه الباستيون
# بعد ما الكلاستر يطلع، مثال:
#
# 1) ServiceAccount:
#    kubectl create sa aws-load-balancer-controller -n kube-system
#    kubectl annotate sa aws-load-balancer-controller -n kube-system \
#      eks.amazonaws.com/role-arn=arn:aws:iam::<ACCOUNT_ID>:role/AWSLoadBalancerControllerRole
#
# 2) تثبيت الـ Helm chart من جوه الباستيون.
*/

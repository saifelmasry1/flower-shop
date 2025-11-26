## نشر التطبيق على الإنترنت باستخدام AWS ALB (AWS Load Balancer Controller + Ingress)

### المتطلبات قبل ما تبدأ

قبل ما تشتغل على الـ ALB لازم تكون الحاجات دي جاهزة:

- الكلاستر EKS متأنشئ (بالـ Terraform) وبيشتغل:
  - اسم الكلاستر: `flower-shop-cluster`
- تطبيق الـ Flower Shop (frontend + backend + services) متطبق في Namespace:
  - `flower-shop`
- الـ VPC والـ Public Subnets متعملين بالـ Terraform وعليهم التاجز المطلوبة للـ ALB:
  - `kubernetes.io/cluster/flower-shop-cluster = shared`
  - `kubernetes.io/role/elb = 1`
- IAM Role للـ AWS Load Balancer Controller معمول بالـ Terraform:
  - `AWSLoadBalancerControllerRole`
  - ومعاه IAM Policy اسمها: `AWSLoadBalancerControllerIAMPolicy`

---

### 1️⃣ إنشاء ServiceAccount مربوط بالـ IAM Role

أول خطوة: نعمل ServiceAccount في Namespace `kube-system` مربوط بالـ IAM Role بتاع ALB Controller.

الملف: `k8s/aws-load-balancer-controller-sa.yaml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::163511166008:role/AWSLoadBalancerControllerRole

تطبيق الملف:

kubectl apply -f aws-load-balancer-controller-sa.yaml


مهم: لازم ServiceAccount يتطبق قبل ما نسطّب الـ AWS Load Balancer Controller بالـ Helm،
لأننا مستخدمين: serviceAccount.create=false.

2️⃣ تثبيت AWS Load Balancer Controller باستخدام Helm
إضافة ريبو الـ Helm (مرة واحدة بس لكل كلاستر)
helm repo add eks https://aws.github.io/eks-charts
helm repo update

تثبيت AWS Load Balancer Controller
helm install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=flower-shop-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

3️⃣ التأكد إن الكنترولر شغّال

بعد شوية ثواني، نتأكد إن البودات بتاعة ALB Controller شغّالة:

kubectl get pods -n kube-system | grep aws-load-balancer-controller


المفروض تشوف بود أو اتنين في حالة:

Running


لو مش Running، ممكن تشوف تفاصيل أكتر:

kubectl describe deployment aws-load-balancer-controller -n kube-system
kubectl logs -n kube-system deploy/aws-load-balancer-controller

 ##  #### 4️⃣ إنشاء Ingress للتطبيق (Flower Shop)

الملف: k8s/flower-shop-ingress.yaml

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flower-shop-ingress
  namespace: flower-shop
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80}]'
    alb.ingress.kubernetes.io/healthcheck-path: /healthz
    alb.ingress.kubernetes.io/load-balancer-name: flower-shop-alb
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: flower-shop-frontend
                port:
                  number: 80


تطبيق الملف:

kubectl apply -f k8s/flower-shop-ingress.yaml

5️⃣ التأكد من إنشاء الـ ALB والوصول للتطبيق

نشوف حالة الـ Ingress:

kubectl get ingress -n flower-shop


بعد شوية (دقيقة تقريبًا)، المفروض يبقى شكلها قريب من كده:

NAME                  CLASS    HOSTS   ADDRESS                                                PORTS   AGE
flower-shop-ingress   <none>   *       flower-shop-alb-xxxx.us-east-1.elb.amazonaws.com      80      5m


عمود ADDRESS هو اسم الـ ALB اللي اتعمل في AWS.

تقدر تفتح التطبيق من أي متصفح:

http://flower-shop-alb-xxxx.us-east-1.elb.amazonaws.com/

6️⃣ ملاحظات و Troubleshooting سريع

لو لقيت إن عمود ADDRESS فاضي لفترة طويلة أو الـ Ingress مش بيجيب ALB:

تأكد إن بودات ALB Controller شغّالة:

kubectl get pods -n kube-system | grep aws-load-balancer-controller


راجع صلاحيات IAM Role:

AWSLoadBalancerControllerRole لازم يكون عليه الـ Policy AWSLoadBalancerControllerIAMPolicy.

اتأكد إن الـ Public Subnets عليها التاجز:

kubernetes.io/cluster/flower-shop-cluster = shared

kubernetes.io/role/elb = 1

لو الحاجات دي تمام، غالبًا الـ ALB هيظهر وتقدر تفتح التطبيق عادي من الإنترنت.
1️⃣ High-Level CI/CD Flow
+-------------------+        git push        +-----------------------------+
|  Dev Laptop       |----------------------->|  GitHub: flower-shop repo   |
|  (VSCode, etc.)   |                        +-----------------------------+
+-------------------+                                   |
                                                        | Poll SCM / Webhook
                                                        v
                                            +------------------------------+
                                            | Bastion EC2 (public subnet)  |
                                            |------------------------------|
                                            | - Docker                     |
                                            | - Jenkins container          |
                                            |    * awscli                  |
                                            |    * kubectl                 |
                                            |    * docker CLI              |
                                            +------------------------------+
                                                        |
                         +------------------------------+----------------------------+
                         |                                                              
                         | docker build/tag/push (frontend + backend images)           
                         v                                                              
                +-------------------------------+                                       
                |       Amazon ECR              |                                       
                |  flower-shop-frontend image   |                                       
                |  flower-shop-backend image    |                                       
                |  jenkins-eks image            |                                       
                +-------------------------------+                                       
                         |                                                              
                         | kubectl apply / rollout restart                              
                         v                                                              
                +-------------------------------+                                       
                |     Amazon EKS Cluster        |                                       
                |   (flower-shop-cluster)       |                                       
                +-------------------------------+

2️⃣ AWS VPC + Bastion + EKS + ALB
+==========================================================================+
|                     AWS VPC  (us-east-1, Terraform)                      |
|==========================================================================|
|                                                                          |
|  Public Subnet(s):                                                       |
|                                                                          |
|    +------------------------+        +--------------------------------+  |
|    | Bastion EC2            |        |    ALB (AWS Load Balancer)     |  |
|    |------------------------|        |  (created via ALB Controller)  |  |
|    | - Jenkins in Docker    |        +--------------------------------+  |
|    | - Ansible (planned)    |                      ^                    |
|    |   * ssh to nodes       |                      | HTTP/HTTPS         |
|    +------------------------+                      |                    |
|                                                   Users / Browser       |
|                                                                          |
|  Private Subnet(s):                                                      |
|                                                                          |
|    +---------------------------------------------------------------+    |
|    |      Amazon EKS: flower-shop-cluster                         |    |
|    |---------------------------------------------------------------|    |
|    |  Node Group (EC2 worker nodes)                               |    |
|    |                                                               |    |
|    |   +----------------------+   +-----------------------------+  |    |
|    |   |  K8s Namespace       |   |  (Planned) monitoring ns    |  |    |
|    |   |  flower-shop         |   |-----------------------------|  |    |
|    |   |----------------------|   | - Grafana                   |  |    |
|    |   | - Deployment:        |   | - Prometheus / metrics      |  |    |
|    |   |    flower-shop-      |   +-----------------------------+  |    |
|    |   |    frontend          |                                   |    |
|    |   | - Service: frontend  |                                   |    |
|    |   |                      |                                   |    |
|    |   | - Deployment:        |                                   |    |
|    |   |    backend           |                                   |    |
|    |   | - Service: backend   |                                   |    |
|    |   |                      |                                   |    |
|    |   | - Deployment:        |                                   |    |
|    |   |    mongodb           |                                   |    |
|    |   | - Service: mongodb   |                                   |    |
|    |   +----------------------+                                   |    |
|    |                                                               |    |
|    |  ALB Ingress:                                                |    |
|    |    - Ingress object: flower-shop-ingress                     |    |
|    |    - ingress.class: alb                                      |    |
|    |    - Targets: frontend Service (port 80)                     |    |
|    +---------------------------------------------------------------+    |
|                                                                          |
+==========================================================================+

3️⃣ App Request Path (User → ALB → K8s → DB)
[ User Browser ]
        |
        |  http(s)://<ALB-DNS-or-Domain>/
        v
+------------------------------+
|  AWS ALB (internet-facing)   |
+------------------------------+
        |
        | routes HTTP traffic (Ingress rules)
        v
+------------------------------+
| K8s Ingress: flower-shop-    |
|            ingress           |
+------------------------------+
        |
        | path "/" -> Service: flower-shop-frontend (port 80)
        v
+------------------------------+
| Service: flower-shop-        |
|           frontend           |
+------------------------------+
        |
        | ClusterIP to pods
        v
+------------------------------+        +------------------------------+
| Deployment: frontend pods    |<------>| Service: backend             |
+------------------------------+        +------------------------------+
                                               |
                                               | ClusterIP
                                               v
                                     +------------------------------+
                                     | Deployment: backend pods     |
                                     +------------------------------+
                                               |
                                               | MongoDB connection
                                               v
                                     +------------------------------+
                                     | Deployment + Service:        |
                                     | mongodb                      |
                                     +------------------------------+

4️⃣ Where Ansible & Grafana Fit
                 +--------------------------------------+
                 |  Dev Laptop / Ansible Control Node   |
                 |--------------------------------------|
                 | - Run Ansible playbooks (planned)    |
                 |   * Configure bastion                |
                 |   * Configure monitoring agents      |
                 +-------------------------+------------+
                                           |
                                           | ssh / API
                                           v
+------------------------+      +--------------------------------------+
| Bastion EC2           |      |  EKS Nodes / Other Targets (future) |
|------------------------|      |--------------------------------------|
| - Jenkins container    |      | - node exporters / agents (future)  |
| - Ansible (CLI)        |      +--------------------------------------+
+------------------------+


                (Monitoring Stack inside EKS - planned)

+-------------------------------------------------------------+
| Namespace: monitoring                                       |
|-------------------------------------------------------------|
|  - Prometheus (metrics)                                     |
|  - Grafana (dashboards)                                     |
|    * Dashboards for:                                        |
|       - Cluster (EKS)                                       |
|       - Flower Shop app                                     |
|       - Jenkins pipeline (if integrated)                    |
+-------------------------------------------------------------+
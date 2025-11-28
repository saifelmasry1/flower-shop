# #############################################
#   Stage 1: Build utilities (temp layer)   #
# #############################################
FROM ubuntu:22.04 AS builder

# تثبيت أدوات التحميل
RUN apt-get update && apt-get install -y curl unzip

# 1. Download AWS CLI v2
RUN curl -Lo awscliv2.zip "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" && \
    unzip awscliv2.zip && \
    mv aws /aws-cli

# 2. Download kubectl (Stable version)
RUN curl -Lo kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl

# #############################################
#      Stage 2: Final Jenkins Image         #
# #############################################
FROM jenkins/jenkins:lts-jdk17

# التحويل للرووت مؤقتاً لتثبيت البرامج
USER root

# 1. Copy AWS CLI & kubectl from builder
COPY --from=builder /aws-cli /tmp/aws-cli
COPY --from=builder /kubectl /usr/local/bin/kubectl

# 2. Install AWS CLI
RUN /tmp/aws-cli/install && rm -rf /tmp/aws-cli

# 3. Install Docker CLI (مهم جداً عشان جينكنز يقدر يكلم الدوكر سوكيت)
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# 4. Add jenkins user to docker group
RUN usermod -aG docker jenkins

# 5. الرجوع لمستخدم جينكنز الرسمي (الأمان)
USER jenkins
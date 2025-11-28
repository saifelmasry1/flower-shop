# #############################################
#   Stage 1: Build utilities (temp layer)   #
# #############################################
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y curl unzip

RUN curl -Lo awscliv2.zip "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" && \
    unzip awscliv2.zip && \
    mv aws /aws-cli

RUN curl -Lo kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl

# #############################################
#      Stage 2: Final Jenkins Image         #
# #############################################
FROM jenkins/jenkins:lts-jdk17

USER root

COPY --from=builder /aws-cli /tmp/aws-cli
COPY --from=builder /kubectl /usr/local/bin/kubectl


RUN /tmp/aws-cli/install && rm -rf /tmp/aws-cli

RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

RUN usermod -aG docker jenkins

USER jenkins
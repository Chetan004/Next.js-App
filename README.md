Perfect 👍 — here’s your **final and complete `README.md`** file, now updated with your actual GitHub repository URL (`git@github.com:Chetan004/Next.js-App.git`) and the correct folder name (`cd Next.js-App`).

You can copy-paste this directly into your project as `README.md`.

---

# Next.js Docker & Kubernetes Deployment

This project demonstrates how to **containerize a Next.js application**, **automate Docker image builds using GitHub Actions**, and **deploy the application on Kubernetes (Minikube)** with optional **EBS-backed storage**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup & Local Run](#setup--local-run)
3. [Dockerization](#dockerization)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [Kubernetes Deployment (Minikube)](#kubernetes-deployment-minikube)
6. [Accessing the Application](#accessing-the-application)
7. [Notes](#notes)

---

## Prerequisites

Make sure the following tools are installed on your system:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [Docker](https://www.docker.com/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download)
* [GitHub Account](https://github.com/) with GHCR permissions

---

## Setup & Local Run

1. **Clone the repository**

```bash
git clone git@github.com:Chetan004/Next.js-App.git
cd Next.js-App
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the Next.js app locally**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Dockerization

**Dockerfile used in this project:**

```dockerfile
# Use Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Build the Next.js app (App Router)
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
```

**Build and run locally:**

```bash
docker build -t nextjs-app:latest .
docker run -p 3000:3000 nextjs-app:latest
```

---

## GitHub Actions CI/CD

**Workflow file:** `.github/workflows/docker-build.yml`

```yaml
name: Build and Push to GHCR

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # Checkout repository
      - name: Checkout code
        uses: actions/checkout@v4

      # Set up Docker Buildx
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Login to GHCR
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ secrets.GHCR_USERNAME }}
          password: ${{ secrets.GHCR_TOKEN }}

      # Build and push Docker image
      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ secrets.GHCR_USERNAME }}/nextjs-app:latest
            ghcr.io/${{ secrets.GHCR_USERNAME }}/nextjs-app:${{ github.sha }}
          platforms: linux/amd64,linux/arm64
```

> This workflow builds and pushes the Docker image to **GitHub Container Registry (GHCR)** whenever code is pushed to the `master` branch.

---

## Kubernetes Deployment (Minikube)

### 🧩 Step 1: Install Minikube (Linux)

Run the following commands to install Minikube on Linux (x86-64):

```bash
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64
```

> For other installation methods, refer to the [official Minikube installation guide](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download).

---

### 🧩 Step 2: Start Minikube

```bash
minikube start
```

This starts a local Kubernetes cluster.

---

### 🧩 Step 3: Create Kubernetes manifests

Create a folder named `k8s/` and add the following file `nextjs-deployment.yaml`:

```yaml
# 1️⃣ StorageClass for dynamic EBS provisioning
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2         # EBS volume type (gp2, gp3, etc.)
  fsType: ext4
  encrypted: "true"
reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
---
# 2️⃣ PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nextjs-app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-sc
  resources:
    requests:
      storage: 5Gi
---
# 3️⃣ Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
        - name: nextjs-app
          image: ghcr.io/chetan004/nextjs-app:latest
          ports:
            - containerPort: 3000
          volumeMounts:
            - mountPath: /app/data
              name: nextjs-app-storage
          imagePullPolicy: Always
      volumes:
        - name: nextjs-app-storage
          persistentVolumeClaim:
            claimName: nextjs-app-pvc
---
# 4️⃣ Service (NodePort)
apiVersion: v1
kind: Service
metadata:
  name: nextjs-app-service
spec:
  selector:
    app: nextjs-app
  type: NodePort
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30080
```

---

### 🧩 Step 4: Apply the manifests

```bash
kubectl apply -f k8s/nextjs-deployment.yaml
```

---

### 🧩 Step 5: Verify deployment and services

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

---

## Accessing the Application

To access the deployed Next.js app in Minikube, run:

```bash
minikube service nextjs-app-service
```

This will open the app in your browser.

---

## Notes

* The **StorageClass** and **PVC** are included to demonstrate **dynamic provisioning** using **EBS** when deploying on **AWS EKS**.

  > In Minikube, these objects are non-functional placeholders since Minikube runs locally and does not support AWS EBS volumes.
* The deployment uses the latest image from GHCR (`ghcr.io/chetan004/nextjs-app:latest`).
* Add readiness and liveness probes for production resilience.
* Ensure that your GitHub Actions secrets `GHCR_USERNAME` and `GHCR_TOKEN` are configured correctly.

---

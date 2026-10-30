"""Domain 5: Cloud / DevOps Roadmaps (13 Roadmaps)"""

CLOUD_DEVOPS_ROADMAPS = [
    {
        "title": "DevOps Engineering & Site Reliability (SRE)",
        "slug": "devops-engineering-site-reliability",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "12 Weeks",
        "description": "Master DevOps practices and Google Site Reliability Engineering (SRE) principles. Learn infrastructure automation, continuous integration/continuous delivery (CI/CD), Linux systems operations, container orchestration with Kubernetes, observability, and managing error budgets and SLAs.",
        "skills_covered": ["CI/CD Pipeline Design", "Infrastructure as Code (Terraform)", "Docker Containerization", "Kubernetes Management", "Linux Systems Administration", "SLOs, SLIs & Error Budgets", "Incident Management & Postmortems"],
        "prerequisites": ["Basic understanding of Linux command line and networking (TCP/IP, DNS)", "Familiarity with at least one scripting language (Bash, Python, or Go)"],
        "career_outcomes": ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Platform Engineer", "Infrastructure Automation Engineer"],
        "tech_stack": ["Linux", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "AWS"],
        "tags": ["devops", "sre", "ci-cd", "kubernetes", "terraform", "cloud", "docker", "observability"],
        "capstone_projects": [
            {
                "title": "Zero-Downtime Multi-Region Production Cloud Platform",
                "description": "Architect a production cloud infrastructure using Terraform, provision an Amazon EKS Kubernetes cluster, configure blue-green ArgoCD deployments, and implement Prometheus alerting.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Canary Deployment & Rollback Controller",
                "description": "Build an automated canary release pipeline with Flagger and Prometheus that gradually shifts live user traffic, analyzes error rates, and rolls back automatically if SLOs degrade.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Google Site Reliability Engineering (SRE) Books (Free)", "url": "https://sre.google/books/", "type": "Classic SRE Books"},
            {"title": "The DevOps Handbook by Gene Kim, Jez Humble et al.", "url": "https://itrevolution.com/product/the-devops-handbook/", "type": "Book"},
            {"title": "DevOps Roadmap by roadmap.sh", "url": "https://roadmap.sh/devops", "type": "Community Roadmap"}
        ],
        "is_featured": True,
        "popularity_rank": 15,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Linux Systems Operations & Networking Foundations",
                "description": "Master the Linux command line, process management, file permissions, systemd services, SSH keys, DNS, and network packet flow.",
                "topics_covered": ["File System Hierarchy & Permissions (chmod, chown)", "Process Monitoring with ps, top, htop, and kill", "Systemd Service Units, Timers & Journalctl Logs", "Networking Essentials: DNS Resolution, Subnets, Routing, IPTables", "SSH Configuration, Key Generation & Bastion Hosts"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Containerization Mastery with Docker",
                "description": "Build efficient, lightweight, and secure container images using multi-stage Dockerfiles, Docker Compose, and image security scanners.",
                "topics_covered": ["Namespaces & Cgroups Container Isolation Mechanics", "Writing Optimized Multi-Stage Dockerfiles", "Image Layer Caching & Minimizing Image Sizes", "Docker Networking Models (Bridge, Host, Overlay)", "Vulnerability Scanning with Trivy"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Continuous Integration & Delivery (CI/CD)",
                "description": "Automate testing, linting, building, and deployment pipelines using GitHub Actions, self-hosted runners, and secret managers.",
                "topics_covered": ["Pipeline Workflows, Jobs, Steps & Matrix Strategies", "Caching Dependencies & Build Artifacts in CI", "Managing Secrets with Vault & GitHub Environment Secrets", "Automated Semantic Versioning & Release Generation", "Deployment Strategies: Rolling Updates, Blue-Green, Canary"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Infrastructure as Code (IaC) with Terraform",
                "description": "Provision reproducible cloud infrastructure with Terraform: providers, state management, modules, and automated drift detection.",
                "topics_covered": ["Declarative HCL Syntax & Resource Dependencies", "Remote State Storage & Locking with S3 and DynamoDB", "Reusable Terraform Modules Best Practices", "Variables, Outputs & Dynamic Blocks", "Terraform Plan, Apply & Drift Detection"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Container Orchestration with Kubernetes",
                "description": "Deploy resilient microservices into Kubernetes: Pods, Deployments, Services, Ingress, ConfigMaps, and PersistentVolumes.",
                "topics_covered": ["K8s Architecture: Control Plane vs Worker Nodes", "Pods, ReplicaSets & Declarative Deployments", "ClusterIP, NodePort & LoadBalancer Services", "Ingress Controllers & Ingress Routing Rules", "Liveness, Readiness & Startup Health Probes"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Site Reliability Engineering (SRE): SLOs & Incident Response",
                "description": "Implement Google SRE practices: defining SLIs and SLOs, managing error budgets, designing alert policies, and conducting blameless postmortems.",
                "topics_covered": ["Service Level Indicators (SLIs) & Service Level Objectives (SLOs)", "Error Budget Policies & Feature Freeze Triggers", "Alert Fatigue Reduction & On-Call Runbooks", "Blameless Postmortem Facilitation & Root Cause Analysis", "Chaos Engineering Experiments with Chaos Mesh"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "AWS Cloud Solutions Architecture",
        "slug": "aws-cloud-solutions-architecture",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Master Amazon Web Services (AWS) cloud architecture and prepare for the AWS Certified Solutions Architect credential. Learn multi-AZ high availability, VPC networking, compute (EC2, Lambda, ECS), databases (RDS, DynamoDB), storage (S3), and security with IAM.",
        "skills_covered": ["AWS Well-Architected Framework", "Virtual Private Cloud (VPC) Networking", "Identity & Access Management (IAM)", "Compute: EC2, Auto Scaling & AWS Lambda", "Storage: S3, EBS & EFS", "Databases: RDS, Aurora & DynamoDB", "CloudWatch Monitoring & Cost Optimization"],
        "prerequisites": ["Basic understanding of networking (IP addresses, subnets, DNS)", "Familiarity with web servers and databases"],
        "career_outcomes": ["AWS Cloud Architect", "Cloud Solutions Engineer", "AWS Infrastructure Consultant", "Senior Cloud Engineer"],
        "tech_stack": ["AWS (VPC, EC2, S3, RDS, Lambda, IAM, ECS)", "AWS CLI", "CloudFormation", "Terraform", "CloudWatch"],
        "tags": ["aws", "cloud", "solutions-architect", "vpc", "ec2", "s3", "lambda", "iam"],
        "capstone_projects": [
            {
                "title": "Highly Available Fault-Tolerant Enterprise Web Application on AWS",
                "description": "Design and provision a multi-AZ VPC with public and private subnets, an Application Load Balancer, an Auto Scaling EC2 fleet, a multi-AZ Aurora PostgreSQL database, and CloudFront CDN.",
                "difficulty": "Advanced"
            },
            {
                "title": "Serverless Event-Driven Document Processing Pipeline",
                "description": "Build an event-driven serverless architecture using S3 bucket events, SNS notifications, SQS message buffering, and Lambda functions to process and index uploaded files.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "AWS Well-Architected Framework Whitepapers", "url": "https://aws.amazon.com/architecture/well-architected/", "type": "Official Architecture Papers"},
            {"title": "AWS Skill Builder Free Official Training", "url": "https://explore.skillbuilder.aws/", "type": "Official Courses"},
            {"title": "Adrian Cantrill AWS Certified Solutions Architect Course", "url": "https://learn.cantrill.io/", "type": "Comprehensive Course"}
        ],
        "is_featured": True,
        "popularity_rank": 14,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "AWS Global Infrastructure, IAM & Security Core",
                "description": "Understand Regions, Availability Zones, and secure access using Identity & Access Management (IAM) users, groups, roles, and policies.",
                "topics_covered": ["AWS Global Infrastructure (Regions, AZs, Edge Locations)", "IAM Policies (JSON Structure, Allow/Deny Evaluation Logic)", "IAM Roles & Temporary Security Credentials (STS)", "Multi-Factor Authentication (MFA) & Root Account Security", "AWS Organizations & Service Control Policies (SCPs)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Virtual Private Cloud (VPC) & Hybrid Networking",
                "description": "Design isolated software-defined networks with CIDR blocks, public/private subnets, Route Tables, Internet Gateways, and NAT Gateways.",
                "topics_covered": ["IPv4 CIDR Calculation & Subnet Sizing", "Public Subnets, Internet Gateways & Route Tables", "Private Subnets & High-Availability NAT Gateways", "Security Groups (Stateful) vs Network ACLs (Stateless)", "VPC Peering, Transit Gateway & Direct Connect Basics"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Compute: EC2, Auto Scaling & Elastic Load Balancing",
                "description": "Deploy scalable compute instances with EC2 instance types, AMI creation, Application Load Balancers (ALB), and Auto Scaling Groups (ASG).",
                "topics_covered": ["EC2 Pricing Models (On-Demand, Reserved, Spot, Savings Plans)", "EBS Volume Types (gp3, io2) & Snapshots", "Application Load Balancer (ALB) vs Network Load Balancer (NLB)", "Target Groups & Path-Based Routing Rules", "Auto Scaling Groups (ASG) Scaling Policies & Health Checks"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Object & File Storage: S3, EFS & Glacier",
                "description": "Store petabytes of unstructured data with S3 bucket policies, versioning, lifecycle transitions, replication, and shared EFS filesystems.",
                "topics_covered": ["S3 Storage Classes (Standard, Intelligent-Tiering, Glacier)", "S3 Bucket Policies, ACLs & Block Public Access", "S3 Versioning, Object Locking & Cross-Region Replication", "S3 Lifecycle Rules & Automated Archiving", "Elastic File System (EFS) POSIX Shared Storage across Instances"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Relational & NoSQL Databases: RDS, Aurora & DynamoDB",
                "description": "Select and configure managed database services: RDS Multi-AZ failover, read replicas, Aurora clusters, and DynamoDB single-digit ms NoSQL.",
                "topics_covered": ["Amazon RDS Multi-AZ Synchronous Replication for High Availability", "RDS Read Replicas Asynchronous Offloading", "Amazon Aurora Distributed Storage Architecture", "Amazon DynamoDB Partition Keys, Sort Keys & Secondary Indexes (GSI)", "DynamoDB Auto-Scaling & On-Demand Capacity Mode"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Serverless, Event-Driven Architecture & CloudWatch",
                "description": "Build event-driven serverless architectures with AWS Lambda, API Gateway, SQS queues, SNS topics, and monitor with CloudWatch.",
                "topics_covered": ["AWS Lambda Execution Environment, Concurrency & Cold Starts", "Amazon API Gateway REST & HTTP APIs", "Amazon SQS Decoupled Queues & Dead-Letter Queues (DLQ)", "Amazon SNS Pub/Sub Fan-Out Architecture", "Amazon CloudWatch Metrics, Alarms, Logs Insights & X-Ray"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Docker Containers & Microservices Foundation",
        "slug": "docker-containers-microservices",
        "category": "Cloud / DevOps",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "6 Weeks",
        "description": "Master containerization from the ground up with Docker. Learn Linux namespaces, cgroups, image building best practices, Docker Compose for local multi-service development, persistent volumes, bridge networks, and container security scanning.",
        "skills_covered": ["Container Fundamentals vs Virtual Machines", "Writing Production Dockerfiles", "Multi-Stage Docker Builds", "Docker Compose Multi-Container Orchestration", "Volume Mounts & Data Persistence", "Container Networking", "Docker Security Best Practices"],
        "prerequisites": ["Basic familiarity with the terminal / command line", "General understanding of software development workflows"],
        "career_outcomes": ["Junior DevOps Engineer", "Containerization Specialist", "Cloud Application Developer", "Software Engineer - Infrastructure"],
        "tech_stack": ["Docker", "Docker Compose", "Docker Hub", "Linux", "Trivy", "Bash"],
        "tags": ["docker", "containers", "docker-compose", "devops", "microservices", "linux"],
        "capstone_projects": [
            {
                "title": "Multi-Service Containerized Web Stack with Docker Compose",
                "description": "Build and orchestrate a complete multi-container production stack (React Frontend, FastAPI Backend, PostgreSQL Database, Redis Cache, NGINX Reverse Proxy) with automated health checks and persistent volumes.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Minimalist Hardened Docker Base Image Pipeline",
                "description": "Create an ultra-minimal, unprivileged non-root scratch/distroless container image pipeline that passes zero-vulnerability Trivy scans.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Docker Official Getting Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Official Documentation"},
            {"title": "Docker Deep Dive by Nigel Poulton", "url": "https://nigelpoulton.com/books/", "type": "Book"},
            {"title": "Play with Docker - Free Interactive Sandbox", "url": "https://labs.play-with-docker.com/", "type": "Interactive Sandbox"}
        ],
        "is_featured": False,
        "popularity_rank": 26,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Container Theory & Linux Isolation Mechanics",
                "description": "Understand how containers differ from virtual machines: Linux kernel namespaces, cgroups, chroot, and the Docker daemon.",
                "topics_covered": ["Virtual Machines (Hypervisors) vs Containers (Shared Kernel)", "Linux Namespaces for Process, Network & Mount Isolation", "Control Groups (Cgroups) for CPU and Memory Throttling", "Docker Client, Daemon (dockerd), and Containerd Architecture", "Running Your First Container (docker run, exec, stop, rm)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Crafting Efficient Production Dockerfiles",
                "description": "Master Dockerfile instructions (FROM, RUN, COPY, ADD, CMD, ENTRYPOINT), image layering, and the build context.",
                "topics_covered": ["Understanding Immutable Image Layers & Union File Systems", "COPY vs ADD Best Practices & .dockerignore Configuration", "CMD vs ENTRYPOINT Syntax Nuances", "Minimizing Layer Counts & Combining RUN Commands", "Running Containers as Non-Root Users (USER instruction)"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Multi-Stage Builds & Distroless Images",
                "description": "Slash image sizes from 1GB to 20MB using multi-stage builds that discard compiler tools and build artifacts from production images.",
                "topics_covered": ["Multi-Stage Build Pattern (Build Stage vs Run Stage)", "Targeting Specific Stages for Development & Testing", "Alpine Linux vs Debian Slim vs Google Distroless Images", "Compiling Go / Rust / Node.js into Scratch Images", "Benchmarking Image Pull Speeds & Security Attack Surfaces"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Container Data Persistence & Volumes",
                "description": "Manage state in ephemeral containers using named volumes, bind mounts, and tmpfs in-memory mounts.",
                "topics_covered": ["Ephemeral Container Lifecycles & Data Loss Risks", "Named Docker Volumes Managed by the Daemon", "Host Bind Mounts for Local Live-Reload Development", "Tmpfs In-Memory Mounts for Sensitive Temporary Data", "Volume Backups & Migrations"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Container Networking & Multi-Container Systems",
                "description": "Connect containers safely with bridge networks, DNS service discovery, and port mappings.",
                "topics_covered": ["Default Bridge Network vs User-Defined Bridge Networks", "Automatic DNS Name Resolution between Containers", "Exposing & Publishing Ports (-p host:container)", "Host Network & None Network Modes", "Inspecting Network Packets with docker network inspect"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Local Orchestration with Docker Compose & Security",
                "description": "Define multi-container applications in declarative compose.yaml, configure health checks, and scan for CVEs with Trivy.",
                "topics_covered": ["Declarative docker-compose.yml File Structure", "Defining Services, Networks, Volumes & Environment Variables", "Service Dependencies (depends_on with condition: service_healthy)", "Container Health Checks (HEALTHCHECK instruction)", "Vulnerability Scanning with Trivy & Docker Scout"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Production Kubernetes (K8s) Cluster Orchestration",
        "slug": "production-kubernetes-orchestration",
        "category": "Cloud / DevOps",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Master production-grade Kubernetes (K8s) architecture and prepare for CKA certification. Learn control plane internals (etcd, API server, scheduler), worker components (kubelet, kube-proxy, CNI), Helm packaging, operators, ingress, network policies, and horizontal autoscaling.",
        "skills_covered": ["Kubernetes Architecture & Control Plane Internals", "Declarative Workloads (Deployments, StatefulSets, DaemonSets)", "Helm 3 Chart Packaging", "Kubernetes Networking & CNI Plugins", "Network Policies & Zero-Trust Pod Security", "Horizontal Pod Autoscaler (HPA) & KEDA", "Troubleshooting & Debugging K8s"],
        "prerequisites": ["Proficiency with Docker containerization and image building", "Strong Linux and networking (IP routing, DNS) fundamentals"],
        "career_outcomes": ["Kubernetes Administrator (CKA)", "Cloud Platform Engineer", "DevOps Infrastructure Architect", "Site Reliability Engineer"],
        "tech_stack": ["Kubernetes 1.30+", "Helm", "kubectl", "Minikube / Kind", "Calico", "Prometheus", "K9s"],
        "tags": ["kubernetes", "k8s", "cka", "helm", "orchestration", "cloud-native", "devops"],
        "capstone_projects": [
            {
                "title": "High-Availability Multi-Tier Kubernetes Production Cluster",
                "description": "Deploy a multi-tier microservice architecture with Helm, featuring NGINX Ingress with TLS certificates (cert-manager), Calico NetworkPolicies, StatefulSet PostgreSQL with volume claims, and Prometheus monitoring.",
                "difficulty": "Advanced"
            },
            {
                "title": "Custom Kubernetes Operator for Database Automated Provisioning",
                "description": "Build a custom Kubernetes Operator using the Operator SDK in Go / Python that manages custom database resources (CRDs), reconciles state, and automates backups.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Kubernetes Official Documentation & Interactive Tutorials", "url": "https://kubernetes.io/docs/home/", "type": "Official Documentation"},
            {"title": "Kubernetes in Action (2nd Ed) by Marko Lukša", "url": "https://www.manning.com/books/kubernetes-in-action-second-edition", "type": "Book"},
            {"title": "Mumshad Mannambeth CKA Certification Course", "url": "https://kodekloud.com/courses/certified-kubernetes-administrator-cka/", "type": "Interactive Labs"}
        ],
        "is_featured": True,
        "popularity_rank": 21,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Kubernetes Control Plane & Worker Architecture",
                "description": "Understand the distributed brain of Kubernetes: kube-apiserver, etcd key-value store, kube-scheduler, kube-controller-manager, kubelet, and CRI.",
                "topics_covered": ["Control Plane Architecture: API Server, Etcd, Scheduler, Controller Manager", "Worker Node Components: Kubelet, Kube-Proxy, Container Runtime (containerd)", "The Declarative State Reconcile Loop Paradigm", "Etcd Raft Consensus, Quorum & Backups", "Setting up Local Development Clusters with Kind / Minikube"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Core Workloads: Deployments, StatefulSets & DaemonSets",
                "description": "Model stateless and stateful applications using Pods, ReplicaSets, Deployments, StatefulSets, DaemonSets, and CronJobs.",
                "topics_covered": ["Pods Anatomy, Init Containers & Sidecar Containers", "Deployments: Rolling Updates, Rollbacks & MaxSurge/MaxUnavailable", "StatefulSets: Stable Network IDs & Persistent Volume Claims", "DaemonSets for Node-Level Logging & Monitoring Daemons", "Batch Workloads: Jobs and Scheduled CronJobs"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Config, Secrets, Storage & Persistent Volumes",
                "description": "Inject configuration and secrets into pods and manage storage volumes via PersistentVolumes, PersistentVolumeClaims, and StorageClasses.",
                "topics_covered": ["ConfigMaps & Secrets Decoupling Configuration from Images", "Mounting Secrets as Environment Variables vs File Volumes", "StorageClasses & Dynamic Volume Provisioning via CSI Drivers", "PersistentVolumes (PV) & PersistentVolumeClaims (PVC) Lifecycle", "Access Modes: ReadWriteOnce (RWO), ReadWriteMany (RWX)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Networking, Ingress & Calico Network Policies",
                "description": "Master the Pod-to-Pod networking model, Service proxies (ClusterIP, NodePort, LoadBalancer), Ingress controllers, and NetworkPolicies.",
                "topics_covered": ["Container Network Interface (CNI) & IP-per-Pod Model", "Kube-Proxy Modes (IPTables vs IPVS)", "Ingress Controllers (NGINX / Traefik) & Path Routing", "Automating TLS Certificates with Cert-Manager & Let's Encrypt", "Zero-Trust Pod Isolation with Calico NetworkPolicies"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Packaging & Templating with Helm 3",
                "description": "Package complex multi-manifest applications into parameterized, version-controlled Helm charts.",
                "topics_covered": ["Helm Chart Anatomy: Chart.yaml, values.yaml, templates/", "Go Template Syntax & Built-in Functions", "Managing Chart Dependencies & Subcharts", "Helm Release Lifecycle: install, upgrade, rollback", "Authoring Reusable Enterprise Helm Charts"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Autoscaling, Security & Production Troubleshooting",
                "description": "Configure Horizontal Pod Autoscalers (HPA), Cluster Autoscaler, RBAC security, and master troubleshooting broken clusters.",
                "topics_covered": ["Resource Requests & Limits (CPU, Memory) & OOMKilled Debugging", "Horizontal Pod Autoscaler (HPA) with Metrics Server", "Event-Driven Autoscaling with KEDA", "Role-Based Access Control (RBAC): Roles, RoleBindings, ServiceAccounts", "Cluster Debugging Playbook: CrashLoopBackOff, ImagePullBackOff, Pending"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Terraform & Infrastructure as Code (IaC)",
        "slug": "terraform-infrastructure-as-code",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master enterprise Infrastructure as Code (IaC) with HashiCorp Terraform. Learn declarative HashiCorp Configuration Language (HCL), remote state locking with S3 and DynamoDB, modular architecture, dynamic blocks, Terraform Cloud, and automated drift management.",
        "skills_covered": ["Declarative HCL Programming", "Remote State Management & State Locking", "Reusable Terraform Modules", "Multi-Environment Architecture (Terragrunt / Workspaces)", "Terraform Plan & Apply Lifecycle", "Resource Drift Detection & Import", "Automated Policy as Code with OPA/Sentinel"],
        "prerequisites": ["Basic understanding of cloud concepts (AWS, Azure, or GCP)", "Familiarity with the command line and version control with Git"],
        "career_outcomes": ["Infrastructure Engineer", "Cloud Automation Engineer", "Terraform Specialist", "DevOps Engineer"],
        "tech_stack": ["Terraform 1.8+", "AWS / Azure", "Terragrunt", "OpenTofu", "Git", "TFLint", "Checkov"],
        "tags": ["terraform", "iac", "infrastructure-as-code", "hashicorp", "opentofu", "cloud", "automation"],
        "capstone_projects": [
            {
                "title": "Enterprise Multi-Region AWS Infrastructure Module Suite",
                "description": "Build an open-source quality collection of reusable Terraform modules for provisioning multi-tier VPCs, EKS clusters, and RDS databases with automated tflint and checkov security scans.",
                "difficulty": "Advanced"
            },
            {
                "title": "Multi-Environment Cloud Architecture with Terragrunt",
                "description": "Architect a DRY, scalable infrastructure repository across Dev, Staging, and Production environments using Terragrunt, remote backend generation, and cross-module dependency graphs.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "HashiCorp Terraform Official Documentation & Tutorials", "url": "https://developer.hashicorp.com/terraform/docs", "type": "Official Documentation"},
            {"title": "Terraform: Up & Running (3rd Ed) by Yevgeniy Brikman", "url": "https://www.terraformupandrunning.com/", "type": "Book"},
            {"title": "Anton Babenko's Terraform Best Practices", "url": "https://www.terraform-best-practices.com/", "type": "Best Practices Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 33,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "HCL Syntax, Providers & The Terraform Workflow",
                "description": "Understand declarative infrastructure: HCL syntax, provider configurations, terraform init, plan, apply, and destroy.",
                "topics_covered": ["The Imperative vs Declarative Infrastructure Paradigms", "Terraform Core vs Cloud Provider Plugins (Providers)", "Writing Basic Resources & Data Sources in HCL", "The Core Workflow: init, validate, plan, apply, destroy", "Resource Dependencies: Implicit vs Explicit (depends_on)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Variables, Outputs, Expressions & Dynamic Blocks",
                "description": "Parameterize infrastructure with input variables, validation rules, output values, local values, for expressions, and dynamic blocks.",
                "topics_covered": ["Input Variables, Types & Custom Validation Blocks", "Sensitive Variables & Suppressing Output Logs", "Local Values (locals) for Clean Reusable Expressions", "For Expressions & Splat Syntax (*)", "Dynamic Blocks for Iterating Nested Configurations"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "State File Internals, Remote Backends & Locking",
                "description": "Protect the single source of truth: terraform.tfstate mapping, state locking with DynamoDB, and state manipulation commands.",
                "topics_covered": ["Terraform State Architecture & Resource Mapping", "Remote State Storage with AWS S3", "Distributed State Locking with DynamoDB", "State Inspection & Management (state list, state show, state mv)", "Resolving Merge Conflicts & Recovering Corrupted State"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Architecting Reusable Terraform Modules",
                "description": "Structure enterprise-grade reusable modules with clear input contracts, comprehensive outputs, and semantic versioning.",
                "topics_covered": ["Module Anatomy: main.tf, variables.tf, outputs.tf", "Calling Child Modules from Root Modules", "Publishing Modules to Git Repositories & Terraform Registry", "Module Version Pinning Best Practices", "Designing Opinionated Yet Flexible Infrastructure Abstractions"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Multi-Environment Strategies & Terragrunt",
                "description": "Manage Dev, Staging, and Production environments cleanly without copying code using Workspaces and Terragrunt.",
                "topics_covered": ["Terraform Workspaces: Pros, Cons & Pitfalls", "File-Layout-Based Environment Separation", "Keeping Code DRY with Terragrunt (terragrunt.hcl)", "Dependency Passing between Terragrunt Modules", "Automated Backend & Provider Generation"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Security, Testing, Drift Detection & CI/CD",
                "description": "Enforce security standards with Checkov, lint with TFLint, detect configuration drift, and automate pipelines in GitHub Actions.",
                "topics_covered": ["Static Code Analysis with TFLint & Trivy", "Infrastructure Security Auditing with Checkov", "Detecting Out-of-Band Cloud Drift with terraform plan -detailed-exitcode", "Importing Existing Infrastructure with terraform import & import blocks", "Automated PR Plan Previews with Atlantis / GitHub Actions"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "CI/CD Automation with GitHub Actions & ArgoCD",
        "slug": "cicd-automation-github-actions-argocd",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master automated software delivery and GitOps continuous delivery. Learn to build enterprise CI pipelines with GitHub Actions, reusable workflows, custom actions, composite actions, containerized runners, and automated GitOps Kubernetes deployment with ArgoCD.",
        "skills_covered": ["GitHub Actions Workflow Engineering", "Reusable Workflows & Composite Actions", "Self-Hosted Runners & Security", "Artifact & Dependency Caching", "GitOps Principles & Repository Layout", "ArgoCD Application Declarations", "Sync Waves & Automated Rollbacks"],
        "prerequisites": ["Solid understanding of Git version control (branches, pull requests, tags)", "Basic familiarity with Docker and Kubernetes concepts"],
        "career_outcomes": ["CI/CD Pipeline Engineer", "GitOps Engineer", "DevOps Automation Specialist", "Release Engineer"],
        "tech_stack": ["GitHub Actions", "ArgoCD", "Kubernetes", "Helm", "Docker", "Kustomize"],
        "tags": ["ci-cd", "github-actions", "argocd", "gitops", "kubernetes", "automation", "devops"],
        "capstone_projects": [
            {
                "title": "Production GitOps Delivery Pipeline with GitHub Actions & ArgoCD",
                "description": "Build an end-to-end delivery pipeline where code commits trigger GitHub Actions tests, build and scan Docker images, update a GitOps deployment repo via Kustomize, and ArgoCD automatically syncs to Kubernetes.",
                "difficulty": "Advanced"
            },
            {
                "title": "Enterprise Reusable GitHub Actions CI Library",
                "description": "Author an enterprise-grade library of reusable workflow templates and composite actions for security scanning, multi-architecture container builds, and Slack notifications.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "GitHub Actions Official Documentation", "url": "https://docs.github.com/en/actions", "type": "Documentation"},
            {"title": "ArgoCD Official GitOps Documentation", "url": "https://argo-cd.readthedocs.io/en/stable/", "type": "Documentation"},
            {"title": "GitOps and Kubernetes by Billy Yuen et al.", "url": "https://www.manning.com/books/gitops-and-kubernetes", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 37,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "GitHub Actions Core Architecture & Workflow Syntax",
                "description": "Understand workflow triggers, jobs, steps, environment variables, contexts, and runner environments.",
                "topics_covered": ["Workflow Triggers (push, pull_request, workflow_dispatch, schedule)", "Job Concurrency & Dependency Execution (needs keyword)", "Contexts: github, env, secrets, matrix, steps", "Artifact Uploads & Downloads Across Jobs", "Job Summary Generation using $GITHUB_STEP_SUMMARY"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Matrix Builds, Caching & Performance Optimization",
                "description": "Speed up test suites using matrix strategies across OS/versions and cache dependencies with actions/cache.",
                "topics_covered": ["Matrix Testing Strategies (Node/Python versions, OS matrices)", "Caching npm / pip / Cargo Dependencies with actions/cache", "Docker Layer Caching using GitHub Actions Cache Backend", "Fast-Fail Mechanics & Continue-On-Error Policies", "Slashing Pipeline Execution Times from Minutes to Seconds"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Reusable Workflows, Composite Actions & Security",
                "description": "Standardize pipelines across enterprise organizations using reusable workflows, composite actions, and OIDC tokens.",
                "topics_covered": ["Authoring Reusable Workflows (workflow_call trigger)", "Building Custom Composite Actions in action.yml", "Secure Cloud Authentication with OpenID Connect (OIDC) - No Long-Lived Keys", "Hardening Runners against Script Injection", "Branch Protection Rules & Required Status Checks"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "GitOps Principles & Repository Architecture",
                "description": "Embrace GitOps: Git as the single source of truth, separating application code from environment configuration repositories.",
                "topics_covered": ["The 4 Principles of GitOps", "Separation of Concerns: App Repo vs Infrastructure / GitOps Repo", "Environment Branching vs Folder-Based GitOps Structures", "Templating with Kustomize (Overlays for Dev, Staging, Prod)", "Automating Git Commit Bumps from CI to GitOps Repositories"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "ArgoCD Installation, Declarations & Sync Loops",
                "description": "Deploy ArgoCD into Kubernetes and manage declarative applications with automatic synchronization and self-healing.",
                "topics_covered": ["ArgoCD Architecture (API Server, Repository Server, Application Controller)", "Declarative Application CRDs (Kind: Application)", "Automated Sync Policy, Pruning & Self-Healing", "ArgoCD CLI Operations & Web UI Navigation", "Managing Multi-Cluster Deployments with ArgoCD"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Advanced GitOps: Sync Waves, Hooks & Rollbacks",
                "description": "Orchestrate complex deployment sequences using sync waves, database migration hooks, and automated rollbacks on failure.",
                "topics_covered": ["Controlling Order of Execution with ArgoCD Sync Waves", "Resource Hooks (PreSync for DB Migrations, PostSync for Smoke Tests)", "Sync Windows for Production Freeze Periods", "Automated Rollbacks on Health Check Degradation", "Enterprise Role-Based Access Control (RBAC) in ArgoCD"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Google Cloud Platform (GCP) Cloud Architect",
        "slug": "google-cloud-platform-architect",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master Google Cloud Platform (GCP) architecture and prepare for the Google Professional Cloud Architect certification. Learn GCP global networking, Google Kubernetes Engine (GKE), serverless Cloud Run, BigQuery analytics, Cloud IAM, and Cloud Spanner.",
        "skills_covered": ["GCP Global VPC & Networking", "Google Kubernetes Engine (GKE)", "Serverless with Cloud Run", "Cloud IAM & Resource Hierarchy", "Storage: Cloud Storage & Persistent Disks", "Databases: Cloud SQL & Cloud Spanner", "BigQuery Enterprise Architecture"],
        "prerequisites": ["Basic understanding of cloud computing and networking", "Familiarity with containerized applications"],
        "career_outcomes": ["Google Cloud Architect", "GCP Solutions Engineer", "Cloud Infrastructure Specialist", "Enterprise Platform Architect"],
        "tech_stack": ["Google Cloud (GKE, Cloud Run, BigQuery, IAM, VPC)", "gcloud CLI", "Terraform", "Docker"],
        "tags": ["gcp", "google-cloud", "gke", "cloud-run", "bigquery", "cloud-architect", "cloud"],
        "capstone_projects": [
            {
                "title": "Enterprise Global GKE & Cloud Run Architecture with Global Load Balancing",
                "description": "Architect a globally distributed platform using Google Cloud Global External HTTP(S) Load Balancer, a multi-zone GKE Autopilot cluster, Cloud Armor DDoS defense, and Cloud Run microservices.",
                "difficulty": "Advanced"
            },
            {
                "title": "Event-Driven Big Data Ingestion Pipeline on GCP",
                "description": "Construct a real-time data pipeline streaming messages through Pub/Sub, processing with Cloud Run, and streaming directly into BigQuery with partitioned tables.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Google Cloud Architecture Center Guides", "url": "https://cloud.google.com/architecture", "type": "Official Architecture Guides"},
            {"title": "Google Cloud Professional Cloud Architect Certification Guide", "url": "https://cloud.google.com/learn/certification/cloud-architect", "type": "Official Guide"},
            {"title": "GCP Coursera Specialization by Google Cloud", "url": "https://www.coursera.org/professional-certificates/gcp-cloud-architect", "type": "Comprehensive Course"}
        ],
        "is_featured": False,
        "popularity_rank": 46,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "GCP Resource Hierarchy, Cloud IAM & Projects",
                "description": "Understand Organizations, Folders, Projects, and granular permissions with Google Cloud IAM roles and Service Accounts.",
                "topics_covered": ["Organization, Folder, Project Resource Hierarchy", "Primitive vs Predefined vs Custom IAM Roles", "Service Accounts & Workload Identity Federation", "IAM Policy Inheritance & Deny Policies", "Billing Account Budgets & Cost Alerting"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Global VPC Networking, Cloud Routers & Interconnect",
                "description": "Master Google's software-defined global network: Global VPCs, subnets across regions, Cloud NAT, and Cloud Interconnect.",
                "topics_covered": ["Global VPC Default Topology vs Custom Mode VPCs", "Subnet Creation Across Global Regions", "Firewall Rules & Service Account Tagging", "Cloud NAT for Outbound Internet in Private Subnets", "VPC Network Peering & Shared VPC Architecture"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Compute Engine & Serverless Cloud Run",
                "description": "Deploy virtual machines with Compute Engine, manage Managed Instance Groups (MIGs), and host containers with Cloud Run.",
                "topics_covered": ["Compute Engine Machine Families (General, Compute, Memory)", "Managed Instance Groups (MIGs) & Regional Auto-Scaling", "Cloud Run Container Execution Environment", "Traffic Splitting & Canary Revisions in Cloud Run", "Serverless VPC Access Connectors for Database Access"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Google Kubernetes Engine (GKE) Enterprise",
                "description": "Deploy production Kubernetes on GKE: Autopilot vs Standard clusters, Workload Identity, and ingress networking.",
                "topics_covered": ["GKE Standard vs GKE Autopilot Managed Modes", "Workload Identity: Linking K8s ServiceAccounts to Google IAM", "Private GKE Clusters & Authorized Networks", "GKE Multi-Cluster Ingress & Service Networking", "Node Auto-Provisioning & Cost Optimization"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Storage & Databases: Cloud Storage, Cloud SQL & Spanner",
                "description": "Store data across object storage and transactional engines: Cloud Storage, Cloud SQL High Availability, and global Cloud Spanner.",
                "topics_covered": ["Cloud Storage (GCS) Classes: Standard, Nearline, Coldline, Archive", "Cloud Storage Signed URLs & Lifecycle Management", "Cloud SQL High Availability Failover & Read Replicas", "Cloud Spanner TrueTime API & Global ACID Transactions", "Firestore Document Database for Mobile and Web"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Global Load Balancing, Cloud Armor & Observability",
                "description": "Route worldwide traffic through Google's single Anycast IP Global Load Balancer, defend with Cloud Armor, and monitor with Cloud Logging.",
                "topics_covered": ["Global External Application Load Balancer & Single Anycast IP", "SSL Certificates Management & URL Routing Maps", "Cloud Armor WAF Rules & DDoS Mitigation", "Cloud Logging, Cloud Monitoring & Alerting", "Disaster Recovery (RTO/RPO) Strategies on GCP"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Microsoft Azure Enterprise Cloud Engineering",
        "slug": "azure-enterprise-cloud-engineering",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master enterprise Microsoft Azure cloud infrastructure and prepare for AZ-104 and AZ-305 certifications. Learn Azure Virtual Networks (VNet), Azure Active Directory (Entra ID), Azure Kubernetes Service (AKS), App Services, Azure SQL, and governance with Azure Policy.",
        "skills_covered": ["Microsoft Entra ID (Azure AD)", "Azure Virtual Networks (VNet) & Peering", "Compute: Virtual Machines & Azure App Service", "Azure Kubernetes Service (AKS)", "Databases: Azure SQL & Cosmos DB", "Governance: Azure Policy & Management Groups", "Azure Monitor & Log Analytics"],
        "prerequisites": ["Basic understanding of networking, operating systems, and virtualization", "Familiarity with enterprise IT environments"],
        "career_outcomes": ["Azure Cloud Engineer", "Azure Solutions Architect", "Enterprise Cloud Administrator", "DevOps Engineer - Azure"],
        "tech_stack": ["Microsoft Azure (AKS, VNets, App Service, Cosmos DB)", "Azure CLI", "Bicep / Terraform", "Entra ID", "PowerShell"],
        "tags": ["azure", "microsoft-azure", "entra-id", "aks", "cloud-engineering", "az-104", "cloud"],
        "capstone_projects": [
            {
                "title": "Enterprise Hub-and-Spoke Azure Virtual Network Architecture",
                "description": "Architect a production Hub-and-Spoke VNet topology in Azure featuring Azure Firewall, Bastion access, VPN gateway, spoke network peering, and strict Network Security Groups.",
                "difficulty": "Advanced"
            },
            {
                "title": "High-Availability Multi-Tier Web App with Azure App Service & SQL",
                "description": "Deploy an enterprise web application across primary and secondary Azure regions using Azure Traffic Manager / Front Door, App Service, and Azure SQL geo-replication.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Microsoft Learn: Azure Architecture Center", "url": "https://learn.microsoft.com/en-us/azure/architecture/", "type": "Official Architecture Center"},
            {"title": "AZ-104 Azure Administrator Study Guide by Microsoft", "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", "type": "Official Certification Guide"},
            {"title": "John Savill's Azure Master Class (YouTube Series)", "url": "https://www.youtube.com/playlist?list=PLlVtbbG169nGywtVGgDUa-ZioAqdYg0zG", "type": "Video Series"}
        ],
        "is_featured": False,
        "popularity_rank": 48,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Azure Identity & Governance with Microsoft Entra ID",
                "description": "Master identity management: Entra ID users, groups, Role-Based Access Control (RBAC), Conditional Access, and Azure Policy.",
                "topics_covered": ["Management Groups, Subscriptions & Resource Groups Hierarchy", "Microsoft Entra ID (Formerly Azure AD) Tenant Architecture", "Built-in & Custom Role-Based Access Control (RBAC) Roles", "Conditional Access Policies & Multi-Factor Authentication", "Governance with Azure Policy & Management Locks"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Azure Virtual Networks (VNet) & Hybrid Connectivity",
                "description": "Design secure cloud networks using VNets, subnets, Network Security Groups (NSGs), VNet Peering, and Azure Bastion.",
                "topics_covered": ["VNet Address Spaces & Subnet Planning", "Network Security Groups (NSG) Rules & Application Security Groups", "Virtual Network Peering Across Subscriptions & Regions", "Azure Bastion for Secure RDP/SSH Management", "Virtual Network NAT & Public IP Addresses"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Azure Compute: Virtual Machines & App Services",
                "description": "Deploy scalable workloads using Virtual Machine Scale Sets (VMSS) and fully managed containerized Azure App Services.",
                "topics_covered": ["Azure VM Sizing, Storage Disks (Premium SSD) & Availability Zones", "Virtual Machine Scale Sets (VMSS) with Auto-Scaling", "Azure App Service Plans & Deployment Slots for Zero Downtime", "Custom Domains & Managed SSL Certificates in App Service", "Container Instances & Azure Container Apps Basics"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Enterprise Container Orchestration with Azure Kubernetes Service (AKS)",
                "description": "Deploy managed Kubernetes clusters on Azure with Azure CNI, Entra ID integration, and Azure Container Registry (ACR).",
                "topics_covered": ["AKS Cluster Architecture: System vs User Node Pools", "Azure CNI vs Kubenet Networking Models", "Integrating AKS with Azure Container Registry (ACR)", "Entra ID (Azure AD) Workload Identity in AKS", "Cluster Autoscaler & Virtual Nodes with ACI"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Azure Storage & Managed Databases",
                "description": "Manage blob storage, files, and relational/NoSQL databases with Azure SQL Database and globally distributed Azure Cosmos DB.",
                "topics_covered": ["Azure Storage Accounts (Blob, File, Queue, Table)", "Storage Redundancy: LRS, ZRS, GRS, GZRS", "Azure SQL Database Single Databases & Elastic Pools", "Active Geo-Replication & Failover Groups in Azure SQL", "Azure Cosmos DB Global Distribution & Multi-Model APIs"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Monitoring, Backup & Disaster Recovery",
                "description": "Gain end-to-end operational visibility with Azure Monitor, Log Analytics (KQL queries), and configure Azure Backup.",
                "topics_covered": ["Azure Monitor Metrics & Log Analytics Workspaces", "Kusto Query Language (KQL) for Troubleshooting Logs", "Application Insights for APM Distributed Tracing", "Azure Backup & Recovery Services Vaults", "Azure Site Recovery (ASR) Business Continuity Plans"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Linux Systems Administration & Kernel Internals",
        "slug": "linux-systems-administration-kernel",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master enterprise Linux administration and deep operating system internals. Learn systemd, storage management with LVM and ZFS, process scheduling, memory allocation, network stack tuning, kernel parameters with sysctl, and troubleshooting with eBPF and perf.",
        "skills_covered": ["Linux Command Line Mastery", "Systemd Services & Timers", "Logical Volume Management (LVM)", "Linux Networking & Firewalling (iptables/nftables)", "Kernel Parameters & Sysctl Tuning", "Performance Diagnostics (perf, eBPF)", "Shell Scripting Automation"],
        "prerequisites": ["Basic familiarity with Linux or Unix-like operating systems", "General interest in operating systems and systems infrastructure"],
        "career_outcomes": ["Linux Systems Administrator", "Senior Systems Engineer", "Linux Platform Engineer", "Infrastructure Reliability Engineer"],
        "tech_stack": ["Linux (Ubuntu, Debian, RHEL)", "Bash", "Systemd", "LVM", "BPFtrace", "Perf", "WireGuard"],
        "tags": ["linux", "sysadmin", "systemd", "kernel", "ebpf", "networking", "performance"],
        "capstone_projects": [
            {
                "title": "Production Hardened Linux Server with Automated Compliance Auditing",
                "description": "Build an automated Ansible playbook that provisions and hardens a Linux server according to CIS Benchmarks, configuring automated security patching, auditd monitoring, and custom systemd watchdogs.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Kernel-Level Real-Time Performance Diagnostic Suite with eBPF",
                "description": "Develop a lightweight diagnostic suite using BPFtrace to monitor disk I/O latency distributions, trace process execution anomalies, and detect network drops in the Linux kernel.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "UNIX and Linux System Administration Handbook by Evi Nemeth et al.", "url": "https://www.admin.com/", "type": "Classic Sysadmin Book"},
            {"title": "BPF Performance Tools by Brendan Gregg", "url": "https://www.brendangregg.com/bpf-performance-tools-book.html", "type": "Book"},
            {"title": "Linux Kernel Documentation", "url": "https://www.kernel.org/doc/html/latest/", "type": "Official Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 41,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Linux Boot Process, Initialization & Systemd",
                "description": "Trace execution from BIOS/UEFI to Kernel, initramfs, and master Systemd service units, targets, timers, and journalctl.",
                "topics_covered": ["Boot Sequence: UEFI -> GRUB2 -> Kernel -> Initramfs -> Systemd", "Systemd Unit Types: Service, Target, Timer, Socket, Mount", "Writing Custom Systemd Service Files with Restart Policies", "Replacing Cron with Systemd Timers", "Analyzing Logs with Journalctl Filtering"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Storage Architecture: LVM, File Systems & RAID",
                "description": "Manage disks and file systems dynamically using Logical Volume Manager (LVM), Ext4, XFS, and ZFS pools.",
                "topics_covered": ["Partitioning Disks with fdisk and parted", "LVM Architecture: Physical Volumes, Volume Groups, Logical Volumes", "Dynamically Growing File Systems Online", "File System Features: Ext4 vs XFS vs ZFS Copy-on-Write", "Mounting Options (/etc/fstab) & Disk Quotas"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Process Scheduling, Memory Management & Swapping",
                "description": "Understand the Completely Fair Scheduler (CFS), virtual memory pages, buffer cache, swapping behavior, and the OOM killer.",
                "topics_covered": ["Process Lifecycles, Priorities (nice, renice) & CFS", "Virtual Memory, Page Tables & Resident Set Size (RSS)", "Dirty Page Buffers & Writeback Mechanisms", "Swap Mechanics & Swappiness Tuning (vm.swappiness)", "Out of Memory (OOM) Killer Logic & oom_score_adj"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Networking Stack, Sockets & Packet Filtering",
                "description": "Configure static IP routing, VLAN interfaces, DNS resolution, and secure servers with iptables and nftables.",
                "topics_covered": ["IP Routing Tables (ip route) & Network Interfaces (ip link/addr)", "Network Sockets & Port Status with ss and netstat", "Packet Flow through Netfilter", "Writing Firewall Rules with Nftables and UFW", "Setting up Secure Mesh VPNs with WireGuard"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Kernel Tuning with Sysctl & Performance Profiling",
                "description": "Tune Linux kernel network buffers, file descriptor limits, and diagnose bottlenecks using Brendan Gregg's USE method.",
                "topics_covered": ["Dynamic Kernel Parameters with /proc/sys and /etc/sysctl.conf", "Tuning TCP Buffers (tcp_rmem, tcp_wmem) & backlog Queues", "File Descriptor Limits (ulimit, /etc/security/limits.conf)", "The USE Method (Utilization, Saturation, Errors)", "Diagnosing CPU & I/O Spikes with vmstat, iostat, and sar"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Modern Kernel Observability with eBPF & Perf",
                "description": "Inspect kernel behavior without recompilation using Extended Berkeley Packet Filter (eBPF), bpftrace, and Linux perf.",
                "topics_covered": ["eBPF Architecture & In-Kernel Virtual Machine", "Profiling CPU On-CPU & Off-CPU Cycles with Linux Perf", "Generating Interactive CPU Flamegraphs", "Writing Real-Time Trace Scripts with BPFtrace", "Auditing Security System Calls with Auditd"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Observability, Telemetry & SRE with Prometheus & OpenTelemetry",
        "slug": "observability-telemetry-prometheus-opentelemetry",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master modern full-stack observability. Learn the three pillars of observability (Metrics, Logs, Traces), instrumentation with OpenTelemetry (OTel), metrics collection with Prometheus, Grafana visualization dashboards, distributed tracing with Jaeger, and log aggregation with Loki.",
        "skills_covered": ["The 3 Pillars of Observability", "OpenTelemetry (OTel) SDK & Collector", "Prometheus Metrics & PromQL", "Grafana Dashboard Design", "Distributed Tracing with Jaeger / Tempo", "Log Aggregation with Grafana Loki", "Alerting Rules & Notification Routing"],
        "prerequisites": ["Basic familiarity with Linux, Docker, and distributed applications", "Understanding of HTTP requests and basic networking"],
        "career_outcomes": ["Observability Engineer", "Site Reliability Engineer", "Platform Operations Engineer", "Cloud Monitoring Specialist"],
        "tech_stack": ["Prometheus", "Grafana", "OpenTelemetry", "Jaeger", "Grafana Loki", "Alertmanager", "Docker"],
        "tags": ["observability", "prometheus", "opentelemetry", "grafana", "sre", "tracing", "metrics"],
        "capstone_projects": [
            {
                "title": "Enterprise End-to-End Observability Stack with OpenTelemetry & Grafana",
                "description": "Deploy an end-to-end telemetry stack capturing traces from microservices via OpenTelemetry Collector, exporting metrics to Prometheus, logs to Loki, and traces to Tempo, visualized in a unified Grafana dashboard.",
                "difficulty": "Advanced"
            },
            {
                "title": "Production PromQL Alerting & SLO Dashboard Suite",
                "description": "Construct high-fidelity Prometheus alerting rules that calculate multi-window multi-burn-rate error budget consumption for microservice latency and error rate SLOs.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "OpenTelemetry Official Documentation & Getting Started", "url": "https://opentelemetry.io/docs/", "type": "Documentation"},
            {"title": "Prometheus: Up & Running by Brian Brazil", "url": "https://www.oreilly.com/library/view/prometheus-up/9781492034131/", "type": "Book"},
            {"title": "Observability Engineering by Charity Majors, Liz Fong-Jones et al.", "url": "https://www.oreilly.com/library/view/observability-engineering/9781492056430/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 51,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Observability Principles & The Three Pillars",
                "description": "Understand telemetry: why monitoring is not observability, the 3 pillars (Metrics, Logs, Traces), and the RED/USE methods.",
                "topics_covered": ["Monitoring (Known Unknowns) vs Observability (Unknown Unknowns)", "The 3 Pillars: Metrics, Logs & Distributed Traces", "The RED Method (Rate, Errors, Duration) for Services", "The USE Method (Utilization, Saturation, Errors) for Resources", "High Cardinality Challenges in Modern Telemetry"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Metrics Collection & Storage with Prometheus",
                "description": "Collect metrics using pull-based scraping, understand Prometheus metric types (Counter, Gauge, Histogram, Summary), and storage engines.",
                "topics_covered": ["Pull Model vs Push Model Trade-offs", "Prometheus Metric Types: Counter, Gauge, Histogram, Summary", "Service Discovery & Scrape Configurations (prometheus.yml)", "Exporters Ecosystem (Node Exporter, Blackbox Exporter)", "Time-Series Database (TSDB) Storage & Compaction"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "PromQL Query Language & Alertmanager",
                "description": "Query multi-dimensional time series using PromQL, calculate rates and percentiles, and route alerts via Alertmanager.",
                "topics_covered": ["Instant Vectors vs Range Vectors in PromQL", "Rate(), Increase(), and Irank() Functions on Counters", "Calculating P50, P90, P99 Latency with histogram_quantile()", "Vector Matching (on, ignoring, group_left/right)", "Alerting Rules Configuration & Alertmanager Routing (Slack, PagerDuty)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Visualization & Dashboard Engineering with Grafana",
                "description": "Design actionable, performant Grafana dashboards using variables, dynamic repeating panels, and visual alerting.",
                "topics_covered": ["Connecting Data Sources (Prometheus, Loki, Postgres)", "Designing Single-Stat Gauges, Time-Series Charts & Heatmaps", "Dashboard Template Variables for Multi-Cluster/Service Dropdowns", "Dynamic Repeating Panels Based on Label Values", "Grafana Alerting Rules & Unified Alerting"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Distributed Tracing with OpenTelemetry & Jaeger",
                "description": "Trace requests across distributed microservice boundaries using OpenTelemetry context propagation, Spans, and Jaeger.",
                "topics_covered": ["Trace Anatomy: TraceID, SpanID, ParentSpan, Attributes, Events", "Context Propagation over HTTP (W3C Trace Context Standard)", "Auto-Instrumentation vs Manual Tracing with OpenTelemetry SDK", "Deploying the OpenTelemetry Collector Pipeline (Receivers, Processors, Exporters)", "Visualizing Tracing Bottlenecks & Waterfalls in Jaeger / Tempo"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Log Aggregation with Grafana Loki & LogQL",
                "description": "Aggregate container and system logs cost-effectively using Grafana Loki, Promtail/FluentBit, and query with LogQL.",
                "topics_covered": ["Loki Indexing Strategy: Index Labels, Not Full Text", "Ingesting Logs from Kubernetes with Promtail / FluentBit", "LogQL Syntax: Log Stream Selectors & Search Filters", "Extracting Metrics from Unstructured Logs with LogQL", "Correlating Logs, Metrics, and Traces in a Single Click in Grafana"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Distributed Systems Design & High Availability",
        "slug": "distributed-systems-design-high-availability",
        "category": "Cloud / DevOps",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Master the architectural foundations of distributed computing. Learn the CAP Theorem, PACELC, distributed consensus algorithms (Raft, Paxos), consistent hashing, gossip protocols, distributed locks, database replication models, and resilient system design.",
        "skills_covered": ["Distributed Systems Fallacies", "CAP Theorem & PACELC Trade-offs", "Distributed Consensus (Raft)", "Consistent Hashing & Partitioning", "Distributed Caching & Locks (Redlock)", "Replication Models (Leaderless, Multi-Leader)", "Fault Tolerance (Circuit Breakers & Retries)"],
        "prerequisites": ["Strong understanding of networking, databases, and multi-threading", "Experience building backend web services"],
        "career_outcomes": ["Principal Software Engineer", "Distributed Systems Architect", "Core Infrastructure Engineer", "Staff Backend Engineer"],
        "tech_stack": ["Go / Python / Java", "Redis", "Apache Kafka", "Etcd", "Docker", "Consul"],
        "tags": ["distributed-systems", "high-availability", "raft", "cap-theorem", "system-design", "consensus", "scalability"],
        "capstone_projects": [
            {
                "title": "Custom Distributed Key-Value Store with Raft Consensus",
                "description": "Implement a distributed, replicated key-value storage engine in Go from scratch using the Raft consensus algorithm, featuring leader elections, log replications, and heartbeats.",
                "difficulty": "Advanced"
            },
            {
                "title": "Consistent Hashing Distributed Load Balancer with Virtual Nodes",
                "description": "Build an in-memory distributed reverse proxy that distributes client requests across dynamically scaling backend nodes using a consistent hashing ring with virtual nodes.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Designing Data-Intensive Applications by Martin Kleppmann", "url": "https://dataintensive.net/", "type": "Classic Textbook"},
            {"title": "The Raft Consensus Algorithm Interactive Visualization", "url": "https://raft.github.io/", "type": "Interactive Visualizer"},
            {"title": "Distributed Systems Course by Chris Colohan (YouTube)", "url": "https://www.youtube.com/playlist?list=PLOE1GTZ5AZbvzXjZ44pQ_q9i4mIuJ0rK1", "type": "Lecture Series"}
        ],
        "is_featured": True,
        "popularity_rank": 22,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Distributed Systems Foundations & Fallacies",
                "description": "Examine the 8 fallacies of distributed computing: latency, bandwidth, reliability, topology, and unreliable physical clocks.",
                "topics_covered": ["The 8 Fallacies of Distributed Computing", "Unreliable Networks & Network Partitions", "Physical Clocks vs Logical Clocks (Lamport Timestamps, Vector Clocks)", "Synchronous vs Asynchronous System Models", "Crash-Stop vs Byzantine Failure Models"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "CAP Theorem, PACELC & Consistency Models",
                "description": "Understand trade-offs between consistency and availability: Strong Consistency, Eventual Consistency, Read-Your-Writes, and Monotonic Reads.",
                "topics_covered": ["CAP Theorem Proof & Misconceptions", "PACELC Theorem (Latency vs Consistency under Normal Operations)", "Linearizability (Strong Consistency)", "Eventual Consistency & Causal Consistency", "Session Guarantees (Read-Your-Writes, Monotonic Reads)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Replication Strategies & Quorum Consensus",
                "description": "Explore Single-Leader, Multi-Leader, and Leaderless (Dynamo-style) replication, split-brain dangers, and Quorum reads/writes (R + W > N).",
                "topics_covered": ["Single-Leader Replication & Synchronous vs Asynchronous Replicas", "Leader Failover & Preventing Split-Brain Scenarios", "Multi-Leader Replication & Conflict Resolution (LWW, CRDTs)", "Leaderless Replication (Dynamo-Style) & Quorum Math (R + W > N)", "Sloppy Quorums & Hinted Handoff"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Partitioning, Sharding & Consistent Hashing",
                "description": "Distribute data across multiple storage nodes: range-based partitioning, hash-based partitioning, and consistent hashing rings.",
                "topics_covered": ["Range Partitioning vs Hash Partitioning", "Data Skew & Hotspot Problems", "Consistent Hashing Algorithm Mechanics", "Virtual Nodes for Uniform Load Distribution", "Rebalancing Partitions when Nodes Join or Leave"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Distributed Consensus Algorithms: Raft & Paxos",
                "description": "Understand how multiple nodes agree on state: Leader Election, Log Replication, Safety Invariants, and Membership Changes in Raft.",
                "topics_covered": ["Why Consensus is Hard in Asynchronous Networks", "Paxos Algorithm Overview & Difficulties", "Raft State Machine: Follower, Candidate, Leader", "Raft Leader Election & Randomized Election Timeouts", "Raft Log Replication, Commit Index & Log Matching Invariant"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Resilience Patterns: Circuit Breakers, Retries & Distributed Locks",
                "description": "Design bulletproof distributed systems using Circuit Breakers, Exponential Backoffs with Jitter, Bulkheads, and Distributed Locks.",
                "topics_covered": ["Cascading Failures in Distributed Call Graphs", "Circuit Breaker Pattern (Closed, Open, Half-Open States)", "Exponential Backoff & Full Jitter Algorithms", "Bulkhead Isolation to Protect Shared Resources", "Distributed Locks with Redis (Redlock) & Etcd Leases"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Cloud Cost Optimization & FinOps Engineering",
        "slug": "cloud-cost-optimization-finops",
        "category": "Cloud / DevOps",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master cloud financial operations and cost optimization. Learn FinOps cultural frameworks, cost allocation tagging, right-sizing compute, Spot/Preemptible instance strategies, reservation commitments (Savings Plans), storage lifecycle policies, and automated cost anomaly alerts.",
        "skills_covered": ["FinOps Framework & Lifecycle", "Cost Allocation Tagging & Chargebacks", "Compute Right-Sizing", "Reserved Instances & Savings Plans", "Spot / Preemptible Instance Architecture", "Storage Lifecycle Cost Policies", "Infracost IaC Cost Estimates"],
        "prerequisites": ["Experience using AWS, Azure, or GCP cloud platforms", "Basic understanding of cloud billing and compute resources"],
        "career_outcomes": ["FinOps Engineer", "Cloud Financial Analyst", "Cloud Cost Optimization Specialist", "DevOps Operations Architect"],
        "tech_stack": ["AWS Cost Explorer", "Infracost", "Terraform", "Kubecost", "AWS Budgets", "Python / Boto3"],
        "tags": ["finops", "cloud-cost", "cost-optimization", "aws-cost", "infracost", "savings-plans", "devops"],
        "capstone_projects": [
            {
                "title": "Automated Pull Request Cloud Cost Impact Gate with Infracost",
                "description": "Build a GitHub Actions CI pipeline that calculates exact monthly dollar cost differences on every Terraform pull request using Infracost, blocking PRs exceeding cost limits.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Automated Serverless Orphaned Cloud Resource Janitor",
                "description": "Develop an automated Python/Boto3 AWS Lambda function that detects unattached EBS volumes, idle elastic IPs, and obsolete snapshots, notifying Slack and auto-terminating resources.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "FinOps Foundation Official Framework & Guidelines", "url": "https://www.finops.org/framework/", "type": "Industry Framework"},
            {"title": "Cloud FinOps (2nd Ed) by J.R. Storment & Mike Fuller", "url": "https://www.oreilly.com/library/view/cloud-finops-2nd/9781492098355/", "type": "Book"},
            {"title": "Infracost Documentation & Guides", "url": "https://www.infracost.io/docs/", "type": "Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 75,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "FinOps Culture, Phases & The Inform Stage",
                "description": "Understand the FinOps journey: Inform, Optimize, Operate, building cost accountability across engineering teams.",
                "topics_covered": ["The FinOps Operating Model & Core Principles", "The 3 Phases: Inform, Optimize, Operate", "Total Cost of Ownership (TCO) Calculations", "Understanding Cloud Billing Invoices & CSV Dumps", "Unit Cost Economics (Cost per Active User, Cost per Transaction)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Cost Allocation Tagging & Chargeback Accounting",
                "description": "Implement enterprise tag policies to attribute 100% of cloud spending back to specific teams, services, and environments.",
                "topics_covered": ["Defining Mandatory Tagging Schemas (Owner, Environment, CostCenter)", "Enforcing Tags via AWS Organizations & Azure Policy", "Cost Allocation Tags in AWS Billing", "Chargeback vs Showback Accounting Models", "Handling Untaggable Shared Cloud Costs (Data Transfer, NAT Gateways)"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Compute Optimization: Right-Sizing & Modern Architectures",
                "description": "Eliminate compute waste by right-sizing over-provisioned instances, adopting Graviton/ARM CPUs, and auto-stopping dev servers.",
                "topics_covered": ["Analyzing CPU & Memory Utilization Metrics with AWS Compute Optimizer", "Right-Sizing Instance Families without Downtime", "Migrating x86 Workloads to ARM64 (AWS Graviton) for 20-40% Savings", "Automating Scheduled Start/Stop of Staging Environments", "Downscaling Idle Kubernetes Development Clusters"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Commitment Pricing: Savings Plans & Reserved Instances",
                "description": "Save up to 72% using 1-year and 3-year commitments: Compute Savings Plans, EC2 Instance Savings Plans, and Reserved Instances.",
                "topics_covered": ["On-Demand vs Committed Use Pricing Mechanics", "Compute Savings Plans vs EC2 Instance Savings Plans vs RIs", "Calculating Break-Even Points for Commitments", "Managing Commitment Utilization & Coverage Percentages", "Reservation Expiration Tracking & Reinvestment Cycles"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Spot Instances & Storage Tiering Strategies",
                "description": "Run fault-tolerant stateless workloads on Spot/Preemptible instances for up to 90% savings and automate S3 lifecycle archiving.",
                "topics_covered": ["Spot Instance Pricing & 2-Minute Interruption Warnings", "Spot-Friendly Workloads: Batch Jobs, CI Runners, Stateless APIs", "Karpenter / Cluster Autoscaler Spot Fleet Orchestration", "S3 Storage Class Transitions & Intelligent-Tiering", "Cleaning up Orphaned EBS Volumes, Elastic IPs & Snapshots"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Shift-Left FinOps: Infracost & Kubernetes Kubecost",
                "description": "Bring cost visibility into developer pull requests with Infracost and monitor containerized costs with Kubecost.",
                "topics_covered": ["Shift-Left FinOps Philosophy", "Integrating Infracost into GitHub Actions for PR Cost Diffs", "Setting Cost Guardrails & Approval Gates on IaC Pull Requests", "Kubecost Deployment for Kubernetes Pod-Level Cost Allocation", "Building Automated Cost Anomaly Detection Alerts"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Service Mesh & Zero-Trust Cloud Networking (Istio & Envoy)",
        "slug": "service-mesh-istio-envoy-networking",
        "category": "Cloud / DevOps",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Master microservice traffic management, mutual TLS, and zero-trust security inside Kubernetes. Learn the Envoy high-performance C++ proxy, Istio control plane, VirtualServices, DestinationRules, distributed tracing headers, and canary traffic shifting.",
        "skills_covered": ["Service Mesh Architecture & Data Plane", "Envoy Proxy Internals & Filter Chains", "Istio Control Plane (istiod)", "Mutual TLS (mTLS) Encryption Everywhere", "Advanced Traffic Shifting & Canary Releases", "Fault Injection & Chaos Testing", "AuthorizationPolicies & Zero-Trust Access"],
        "prerequisites": ["Proficiency in Kubernetes administration (Pods, Services, Ingress)", "Solid understanding of TCP/IP, TLS certificates, and HTTP headers"],
        "career_outcomes": ["Service Mesh Architect", "Cloud Security Engineer", "Platform Infrastructure Engineer", "Senior SRE"],
        "tech_stack": ["Istio 1.22+", "Envoy Proxy", "Kubernetes", "Kiali", "Jaeger", "Prometheus"],
        "tags": ["service-mesh", "istio", "envoy", "zero-trust", "mtls", "kubernetes", "traffic-management"],
        "capstone_projects": [
            {
                "title": "Zero-Trust Secure Microservice Mesh with Istio & Mutual TLS",
                "description": "Deploy an enterprise microservice mesh where all pod-to-pod communication is strictly encrypted with auto-rotated mTLS, enforced by Istio AuthorizationPolicies.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Canary Traffic Splitting & Resilience Dashboard",
                "description": "Configure intelligent traffic management routing 10% of traffic to v2 Canary versions, injecting artificial latency faults, and visualizing topology in Kiali.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Istio Official Documentation & Interactive Tasks", "url": "https://istio.io/latest/docs/", "type": "Official Documentation"},
            {"title": "Envoy Proxy Official Architecture Guide", "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview", "type": "Documentation"},
            {"title": "Istio in Action by Christian Posta & Rinor Maloku", "url": "https://www.manning.com/books/istio-in-action", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 71,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The Service Mesh Imperative & Architecture",
                "description": "Understand why large microservice architectures need a service mesh: cross-cutting concerns, control plane vs data plane separation.",
                "topics_covered": ["Microservice Operational Challenges: Observability, Security, Traffic", "Control Plane vs Data Plane Architecture", "The Sidecar Proxy Pattern (Envoy Injection)", "Istio vs Linkerd vs Ambient Mesh (Sidecarless) Approaches", "Installing Istio on Kubernetes with istioctl"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Envoy Proxy Fundamentals & Filter Chains",
                "description": "Deconstruct the ultra-fast C++ Envoy proxy: listeners, clusters, routes, dynamic discovery services (xDS), and filters.",
                "topics_covered": ["Envoy Threading Model & Event Loop", "Listeners, Filter Chains & Clusters Architecture", "Dynamic Configuration via xDS APIs (LDS, RDS, CDS, EDS)", "HTTP Connection Manager & Header Modifications", "Access Logs & Envoy Admin Interface Debugging"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Traffic Management: VirtualServices & DestinationRules",
                "description": "Control network traffic declaratively using Istio VirtualService routing, weight-based splitting, and DestinationRule subsets.",
                "topics_covered": ["VirtualService Routing Rules (Path, Headers, Query Params)", "DestinationRule Subsets & Load Balancing Algorithms", "Percentage-Based Canary Traffic Shifting (90/10)", "HTTP Request Retries & Timeout Enforcement", "Cross-Service Mirroring (Shadow Traffic)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Zero-Trust Security & Automatic Mutual TLS (mTLS)",
                "description": "Eliminate cleartext network communication within the cluster using transparent mTLS and cryptographic SPIFFE identities.",
                "topics_covered": ["The Zero-Trust Network Security Architecture", "SPIFFE / SPIRE Verifiable Identity Standard", "PeerAuthentication Modes: PERMISSIVE vs STRICT", "Automatic Key and Certificate Rotation by Istiod", "Verifying mTLS Encryption with OpenSSL & Tcpdump"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Fine-Grained Authorization Policies & Ingress Gateways",
                "description": "Enforce strict least-privilege access using Istio AuthorizationPolicies, JWT validation, and the Istio Ingress Gateway.",
                "topics_covered": ["AuthorizationPolicy Rules (ALLOW vs DENY)", "Role-Based Access Control Based on Source Identity (ServiceAccount)", "End-User JWT Validation at the Gateway Level", "Configuring the Istio Ingress Gateway with Custom TLS", "Restricting Egress Traffic via ServiceEntries"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Resilience, Fault Injection & Topology Visualizations (Kiali)",
                "description": "Test application resilience using chaos fault injection, circuit breaking, and visualize service dependency graphs in Kiali.",
                "topics_covered": ["Injecting Faults: Delays & HTTP Abort Status Codes", "Circuit Breaking with Outlier Detection in DestinationRules", "Propagating W3C / B3 Tracing Headers across Microservices", "Visualizing Live Traffic & Health in Kiali Dashboard", "Extracting Service Mesh Golden Metrics into Prometheus"],
                "duration": "1 Week"
            }
        ]
    }
]

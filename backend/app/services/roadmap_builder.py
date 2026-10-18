"""Service for synthesizing personalized career roadmaps from user career goals."""

import re
import uuid
from typing import Any
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.models.learning_path import LearningPath
from app.models.skill import Skill
from app.models.user_roadmap import UserGeneratedRoadmap
from app.schemas.roadmap_builder import (
    GeneratedRoadmapData,
    ProjectSpec,
    RoadmapCourseRef,
    RoadmapDetailResponse,
    RoadmapGenerateResponse,
    RoadmapMilestone,
    RoadmapPhase,
)

# Rich curriculum templates designed to bridge catalog data into structured phases
CAREER_BLUEPRINTS: dict[str, dict[str, Any]] = {
    "full_stack": {
        "title": "Full Stack Developer Roadmap",
        "target_role": "Full Stack Developer",
        "summary": "Master modern full-stack web engineering from semantic DOM foundations and reactive clients to distributed backend APIs, relational databases, and cloud deployments.",
        "estimated_duration": "18 Weeks",
        "keywords": ["full stack", "fullstack", "web developer", "web dev", "website", "websites", "software engineer", "mern"],
        "phases": [
            {
                "phase_number": 1,
                "title": "Phase 1: Web Foundations",
                "description": "Establish structural web standards, responsive layout architecture, and version control workflows.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "HTML5 & Semantic Web",
                        "description": "Semantic markup, accessibility (a11y) standards, and SEO document structures.",
                        "duration": "2 Weeks",
                        "category": "Web Dev",
                        "skills": ["HTML5", "Accessibility", "Forms", "SEO"],
                        "search_term": "HTML",
                        "action_items": [
                            "Build semantic document layouts using header, nav, main, article, and footer tags",
                            "Implement accessible forms with aria attributes, labels, and validation states",
                            "Structure metadata and OpenGraph tags for search engine discoverability",
                        ],
                    },
                    {
                        "title": "Modern CSS & Responsive Design",
                        "description": "Flexbox, CSS Grid layouts, mobile-first breakpoints, and modern utility styling.",
                        "duration": "2 Weeks",
                        "category": "Web Dev",
                        "skills": ["CSS3", "Flexbox", "CSS Grid", "Responsive Design", "Tailwind CSS"],
                        "search_term": "CSS",
                        "action_items": [
                            "Master 2D positioning and alignment using CSS Flexbox and Grid",
                            "Construct fluid typography using clamp() and mobile-first media queries",
                            "Architect modular styles using Tailwind utility tokens",
                        ],
                    },
                ],
            },
            {
                "phase_number": 2,
                "title": "Phase 2: Frontend Engineering",
                "description": "Transform static interfaces into reactive, state-driven client applications with modern component patterns.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "JavaScript (ES6+) & Async Programming",
                        "description": "DOM events, closures, prototypes, Promises, fetch APIs, and asynchronous data streams.",
                        "duration": "2 Weeks",
                        "category": "Programming",
                        "skills": ["JavaScript", "ES6+", "Async/Await", "DOM API", "REST"],
                        "search_term": "JavaScript",
                        "action_items": [
                            "Handle asynchronous server communication using fetch with try/catch error handling",
                            "Write modular ES6 modules with clean export/import separation",
                            "Manipulate browser DOM state reactively with event listeners and debouncing",
                        ],
                    },
                    {
                        "title": "React Component Architecture",
                        "description": "Functional components, Hooks state management, reactive lifecycles, and client routing.",
                        "duration": "3 Weeks",
                        "category": "Frontend",
                        "skills": ["React", "Custom Hooks", "State Management", "Vite", "React Router"],
                        "search_term": "React",
                        "action_items": [
                            "Decompose user interfaces into reusable, decoupled functional components",
                            "Manage local and global state with useState, useReducer, and Context APIs",
                            "Configure performant client-side routing and protected view boundaries",
                        ],
                    },
                ],
            },
            {
                "phase_number": 3,
                "title": "Phase 3: Backend Development & Databases",
                "description": "Build high-performance RESTful APIs, authentication workflows, and relational database persistence.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Backend Services & REST APIs",
                        "description": "Server runtimes, HTTP routing, request validation, middleware, and JWT authentication.",
                        "duration": "3 Weeks",
                        "category": "Backend",
                        "skills": ["FastAPI", "Python", "Node.js", "REST APIs", "JWT Auth"],
                        "search_term": "FastAPI",
                        "action_items": [
                            "Implement CRUD endpoints with strict Pydantic/Zod request validation",
                            "Secure user authentication with salted bcrypt password hashing and signed JWT tokens",
                            "Create reusable request middlewares for logging, CORS, and rate limiting",
                        ],
                    },
                    {
                        "title": "PostgreSQL & Database Architecture",
                        "description": "Relational schema design, indexes, foreign key constraints, migrations, and ORMs.",
                        "duration": "2 Weeks",
                        "category": "Database",
                        "skills": ["PostgreSQL", "SQL", "SQLAlchemy", "Alembic", "Data Modeling"],
                        "search_term": "PostgreSQL",
                        "action_items": [
                            "Design normalized relational entity relationships (1:1, 1:N, N:M)",
                            "Write migration scripts using Alembic to track schema evolutions",
                            "Execute performant join queries and optimize execution with b-tree indexes",
                        ],
                    },
                ],
            },
            {
                "phase_number": 4,
                "title": "Phase 4: Production Engineering & Deployment",
                "description": "Containerize full-stack services, configure CI/CD pipelines, and deploy to modern cloud infrastructure.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Docker Containerization",
                        "description": "Multi-stage Dockerfiles, image optimization, and Docker Compose local orchestration.",
                        "duration": "2 Weeks",
                        "category": "DevOps",
                        "skills": ["Docker", "Containers", "Docker Compose", "Multi-stage Builds"],
                        "search_term": "Docker",
                        "action_items": [
                            "Write lightweight multi-stage Dockerfiles for frontend SPA and backend API",
                            "Orchestrate local web, API, and database services via Docker Compose",
                            "Persist database volumes and manage container environment secrets",
                        ],
                    },
                    {
                        "title": "Cloud Deployment & CI/CD Pipelines",
                        "description": "Automated testing, continuous deployment, HTTPS certificates, and edge caching.",
                        "duration": "2 Weeks",
                        "category": "Cloud",
                        "skills": ["GitHub Actions", "CI/CD", "AWS", "Vercel", "Monitoring"],
                        "search_term": "CI/CD",
                        "action_items": [
                            "Create automated GitHub Actions workflows running linting, tests, and build checks",
                            "Deploy production client to edge CDN and containerized backend to cloud clusters",
                            "Configure health check endpoints and error logging instrumentation",
                        ],
                    },
                ],
            },
        ],
        "capstone": {
            "title": "Production SaaS Platform Capstone",
            "description": "Architect and deploy an end-to-end multi-tenant SaaS application with client dashboard, REST API, authenticated user sessions, and Stripe subscription billing.",
            "tech_stack": ["React", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS", "GitHub Actions"],
            "key_features": [
                "End-to-end JWT auth with session persistence and email validation",
                "Interactive SaaS dashboard with dynamic charts and progress tracking",
                "Relational PostgreSQL persistence with automated Alembic migrations",
                "Automated CI/CD deployment with Docker Compose orchestration",
            ],
            "difficulty": "Advanced",
        },
    },
    "ai_ml": {
        "title": "AI & Machine Learning Engineer Roadmap",
        "target_role": "AI & Machine Learning Engineer",
        "summary": "Master mathematical foundations, Scikit-Learn predictive modeling, PyTorch deep neural networks, vector databases, and generative AI agent systems.",
        "estimated_duration": "20 Weeks",
        "keywords": ["ai", "machine learning", "ml", "deep learning", "neural network", "llm", "data science", "pytorch", "artificial intelligence"],
        "phases": [
            {
                "phase_number": 1,
                "title": "Phase 1: Python & Mathematical Foundations",
                "description": "Master numerical computing with NumPy, vectorized operations, linear algebra, and data wrangling.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Python for Scientific Computing",
                        "description": "Object-oriented programming, data structures, algorithm efficiency, and modular code.",
                        "duration": "2 Weeks",
                        "category": "Programming",
                        "skills": ["Python", "NumPy", "OOP", "Data Structures"],
                        "search_term": "Python",
                        "action_items": [
                            "Implement vectorized matrix operations and broadcasting with NumPy",
                            "Build clean modular classes with typing annotations and unit tests",
                            "Manipulate multidimensional arrays for tensor computation",
                        ],
                    },
                    {
                        "title": "Data Exploration & Feature Engineering",
                        "description": "Pandas dataframes, data imputation, categorical encoding, and distribution visualization.",
                        "duration": "2 Weeks",
                        "category": "Data",
                        "skills": ["Pandas", "Matplotlib", "Seaborn", "Feature Engineering"],
                        "search_term": "Data Analysis",
                        "action_items": [
                            "Clean messy real-world datasets with missing and anomalous values",
                            "Engineer high-signal features with standard scaling and one-hot encoding",
                            "Plot correlation heatmaps and feature distributions for modeling insights",
                        ],
                    },
                ],
            },
            {
                "phase_number": 2,
                "title": "Phase 2: Classical Machine Learning",
                "description": "Train and evaluate supervised and unsupervised algorithms with Scikit-Learn pipelines.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Supervised Learning Algorithms",
                        "description": "Linear regression, logistic classification, decision trees, random forests, and gradient boosting.",
                        "duration": "3 Weeks",
                        "category": "AI & ML",
                        "skills": ["Scikit-Learn", "Regression", "Classification", "Random Forest", "XGBoost"],
                        "search_term": "Machine Learning",
                        "action_items": [
                            "Train baseline classification and regression models on stratified datasets",
                            "Tune hyperparameters using cross-validated GridSearchCV pipelines",
                            "Evaluate models using ROC-AUC, precision-recall curves, and confusion matrices",
                        ],
                    },
                    {
                        "title": "Unsupervised Learning & Clustering",
                        "description": "K-Means clustering, PCA dimensionality reduction, and anomaly detection.",
                        "duration": "2 Weeks",
                        "category": "AI & ML",
                        "skills": ["K-Means", "PCA", "Clustering", "Dimensionality Reduction"],
                        "search_term": "Machine Learning",
                        "action_items": [
                            "Reduce high-dimensional feature spaces with Principal Component Analysis",
                            "Segment unlabelled data clusters with elbow method optimization",
                            "Detect data anomalies using isolation forests",
                        ],
                    },
                ],
            },
            {
                "phase_number": 3,
                "title": "Phase 3: Deep Learning with PyTorch",
                "description": "Construct neural architectures, loss optimization, convolutional networks, and backpropagation.",
                "duration": "6 Weeks",
                "milestones": [
                    {
                        "title": "PyTorch Neural Foundations",
                        "description": "Tensors, autograd computational graphs, custom nn.Module architectures, and training loops.",
                        "duration": "3 Weeks",
                        "category": "Deep Learning",
                        "skills": ["PyTorch", "Neural Networks", "Autograd", "Optimizers", "Loss Functions"],
                        "search_term": "PyTorch",
                        "action_items": [
                            "Write custom PyTorch training loops with forward pass, loss calculation, and backprop",
                            "Implement custom Dataset and DataLoader pipelines with batch collation",
                            "Optimize training with AdamW, learning rate schedulers, and dropout regularization",
                        ],
                    },
                    {
                        "title": "Computer Vision & Sequence Models",
                        "description": "Convolutional neural nets (CNNs), transfer learning, and recurrent sequence models.",
                        "duration": "3 Weeks",
                        "category": "Deep Learning",
                        "skills": ["CNN", "Transfer Learning", "ResNet", "Image Classification"],
                        "search_term": "Deep Learning",
                        "action_items": [
                            "Fine-tune pre-trained Vision Transformers or ResNet backbones on custom images",
                            "Apply data augmentations (flips, crops, affine transforms) to prevent overfitting",
                            "Benchmark model inference latency on GPU vs CPU runtimes",
                        ],
                    },
                ],
            },
            {
                "phase_number": 4,
                "title": "Phase 4: LLMs, RAG & AI Agent Engineering",
                "description": "Deploy large language models, retrieval augmented generation, vector search, and autonomous agents.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Vector Databases & Retrieval Augmented Generation (RAG)",
                        "description": "Text embedding models, vector indexing (Chroma/Pinecone), semantic search, and context augmentation.",
                        "duration": "2 Weeks",
                        "category": "Gen AI",
                        "skills": ["RAG", "Embeddings", "Vector DB", "LangChain", "Semantic Search"],
                        "search_term": "Vector",
                        "action_items": [
                            "Chunk and embed technical documentation using sentence transformer models",
                            "Store high-dimensional vectors and execute fast cosine similarity search",
                            "Synthesize grounded responses using context-augmented LLM prompts",
                        ],
                    },
                    {
                        "title": "Autonomous AI Agents & Production Deployment",
                        "description": "Tool-calling agents, function orchestration, multi-agent frameworks, and model serving.",
                        "duration": "3 Weeks",
                        "category": "Gen AI",
                        "skills": ["AI Agents", "Tool Calling", "FastAPI Serving", "Docker", "Model Evaluation"],
                        "search_term": "AI",
                        "action_items": [
                            "Build autonomous reasoning agents equipped with search and database query tools",
                            "Serve low-latency model inference behind an asynchronous FastAPI streaming gateway",
                            "Evaluate generation quality using automated hallucination metrics and benchmarks",
                        ],
                    },
                ],
            },
        ],
        "capstone": {
            "title": "Intelligent Multimodal RAG Agent System",
            "description": "Design and deploy a full-scale AI assistant that indexes documentation repositories, executes autonomous reasoning loops, retrieves verified facts, and serves responses via a streaming web interface.",
            "tech_stack": ["Python", "PyTorch", "FastAPI", "Vector DB", "React", "Docker"],
            "key_features": [
                "Automated document ingestion and hybrid vector + keyword semantic retrieval",
                "ReAct autonomous agent loop with custom tool execution",
                "Streaming token response over server-sent events (SSE)",
                "Complete Dockerized container setup with GPU acceleration support",
            ],
            "difficulty": "Advanced",
        },
    },
    "devops": {
        "title": "Cloud & DevOps Engineer Roadmap",
        "target_role": "Cloud & DevOps Engineer",
        "summary": "Master Linux systems, containerization, Infrastructure as Code, Kubernetes orchestration, CI/CD automation, and cloud observability.",
        "estimated_duration": "18 Weeks",
        "keywords": ["devops", "cloud", "aws", "docker", "kubernetes", "k8s", "infrastructure", "sre", "terraform", "ci/cd"],
        "phases": [
            {
                "phase_number": 1,
                "title": "Phase 1: Linux & Networking Foundations",
                "description": "Linux operating system mastery, shell scripting, TCP/IP networking, and secure SSH tunnels.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Linux Systems Administration",
                        "description": "Filesystem hierarchy, user permissions, systemd services, process management, and bash automation.",
                        "duration": "2 Weeks",
                        "category": "Systems",
                        "skills": ["Linux", "Bash Scripting", "Systemd", "Permissions", "SSH"],
                        "search_term": "Linux",
                        "action_items": [
                            "Write automated bash cron utilities for log rotation and system health monitoring",
                            "Manage systemd service daemon lifecycles and journalctl log inspection",
                            "Configure hardened SSH access with ed25519 key authentication",
                        ],
                    },
                    {
                        "title": "Networking & Protocols for Cloud Engineers",
                        "description": "TCP/IP 4-layer model, DNS resolution, TLS certificates, load balancing, and reverse proxies.",
                        "duration": "2 Weeks",
                        "category": "Networking",
                        "skills": ["Networking", "DNS", "Nginx", "HTTPS/TLS", "Reverse Proxy"],
                        "search_term": "Network",
                        "action_items": [
                            "Set up Nginx as an edge reverse proxy with SSL/TLS termination",
                            "Inspect network packets and socket connections with curl, netstat, and tcpdump",
                            "Configure custom DNS records (A, CNAME, TXT) and subnet routing",
                        ],
                    },
                ],
            },
            {
                "phase_number": 2,
                "title": "Phase 2: Containers & Orchestration",
                "description": "Docker container virtualization and production Kubernetes cluster management.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Docker & Container Architecture",
                        "description": "Linux cgroups/namespaces, multi-stage Docker builds, image scanning, and compose networks.",
                        "duration": "2 Weeks",
                        "category": "DevOps",
                        "skills": ["Docker", "Containers", "Docker Compose", "Image Optimization"],
                        "search_term": "Docker",
                        "action_items": [
                            "Construct secure non-root Docker images utilizing minimal Alpine/distroless bases",
                            "Orchestrate multi-tier container networks with health checks in Docker Compose",
                            "Scan container images for vulnerabilities using automated CVE scanners",
                        ],
                    },
                    {
                        "title": "Kubernetes Cluster Orchestration",
                        "description": "Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, and Helm package management.",
                        "duration": "3 Weeks",
                        "category": "DevOps",
                        "skills": ["Kubernetes", "K8s", "Helm", "Ingress", "Cluster Management"],
                        "search_term": "Kubernetes",
                        "action_items": [
                            "Deploy zero-downtime rolling update workloads using Kubernetes Deployments",
                            "Package complex multi-service applications into declarative Helm charts",
                            "Route external traffic securely with Nginx Ingress controllers and TLS cert-manager",
                        ],
                    },
                ],
            },
            {
                "phase_number": 3,
                "title": "Phase 3: Infrastructure as Code (IaC) & Cloud Architecture",
                "description": "Provision cloud infrastructure declaratively using Terraform and architect scalable AWS solutions.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Terraform Infrastructure as Code",
                        "description": "HCL syntax, state management, modules, input variables, and cloud provider provisioning.",
                        "duration": "2 Weeks",
                        "category": "Cloud",
                        "skills": ["Terraform", "IaC", "HCL", "State Locking", "Cloud Provisioning"],
                        "search_term": "Terraform",
                        "action_items": [
                            "Write modular Terraform configurations provisioning VPCs, subnets, and compute instances",
                            "Configure remote backend state locking with S3 buckets and DynamoDB",
                            "Execute automated plan and apply pipelines with strict dry-run verification",
                        ],
                    },
                    {
                        "title": "AWS Cloud Architecture & Security",
                        "description": "VPC networking, EC2 autoscaling, IAM least-privilege, RDS databases, and S3 storage.",
                        "duration": "3 Weeks",
                        "category": "Cloud",
                        "skills": ["AWS", "VPC", "IAM", "EC2", "RDS", "S3"],
                        "search_term": "AWS",
                        "action_items": [
                            "Architect highly available multi-Availability Zone VPC topology",
                            "Enforce strict IAM security boundaries with zero-trust least-privilege policies",
                            "Configure automated database snapshots and multi-region replication",
                        ],
                    },
                ],
            },
            {
                "phase_number": 4,
                "title": "Phase 4: CI/CD Pipelines & Site Reliability",
                "description": "Continuous integration pipelines, Prometheus metrics, Grafana dashboards, and incident alerting.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Automated CI/CD Delivery Pipelines",
                        "description": "GitHub Actions, automated test suites, artifact registries, and GitOps deployments with ArgoCD.",
                        "duration": "2 Weeks",
                        "category": "DevOps",
                        "skills": ["GitHub Actions", "ArgoCD", "GitOps", "CI/CD", "Automated Testing"],
                        "search_term": "CI/CD",
                        "action_items": [
                            "Build declarative CI workflows compiling code, running tests, and publishing Docker images",
                            "Implement GitOps deployment synchronization to Kubernetes via ArgoCD",
                            "Configure automated blue-green and canary deployment strategies",
                        ],
                    },
                    {
                        "title": "Observability, Monitoring & Alerting",
                        "description": "Prometheus metric scraping, PromQL queries, Grafana dashboards, distributed tracing, and alerts.",
                        "duration": "2 Weeks",
                        "category": "SRE",
                        "skills": ["Prometheus", "Grafana", "PromQL", "Observability", "Alertmanager"],
                        "search_term": "Prometheus",
                        "action_items": [
                            "Instrument application microservices with Prometheus client metrics (RED method)",
                            "Design real-time Grafana monitoring dashboards for latency, error rates, and saturation",
                            "Configure Slack and PagerDuty alert rules triggered by SLO threshold breaches",
                        ],
                    },
                ],
            },
        ],
        "capstone": {
            "title": "GitOps Automated Cloud Infrastructure Capstone",
            "description": "Architect and deploy an enterprise-grade cloud platform featuring Terraform IaC provisioning, multi-tenant Kubernetes clusters, ArgoCD GitOps pipelines, and Prometheus observability.",
            "tech_stack": ["AWS", "Terraform", "Kubernetes", "Helm", "ArgoCD", "Prometheus", "Grafana"],
            "key_features": [
                "100% declarative Terraform cloud infrastructure with remote state management",
                "Kubernetes cluster autoscaling with automated cert-manager TLS",
                "GitOps automated continuous delivery synchronized with GitHub commits",
                "Full-stack observability with live Grafana metrics and alerting",
            ],
            "difficulty": "Advanced",
        },
    },
    "cybersecurity": {
        "title": "Cybersecurity & Ethical Hacking Roadmap",
        "target_role": "Cybersecurity Specialist",
        "summary": "Master security fundamentals, network defense, penetration testing, web application vulnerabilities (OWASP), and security incident triage.",
        "estimated_duration": "18 Weeks",
        "keywords": ["cyber", "security", "cybersecurity", "ethical hacking", "hacker", "pentest", "penetration testing", "infosec", "soc"],
        "phases": [
            {
                "phase_number": 1,
                "title": "Phase 1: Security Fundamentals & Networking",
                "description": "Threat modeling, the CIA triad, packet analysis with Wireshark, firewalls, and cryptographic basics.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Cyber Foundations & Cryptography",
                        "description": "Symmetric vs asymmetric encryption, hashing algorithms, public key infrastructure (PKI), and threat actors.",
                        "duration": "2 Weeks",
                        "category": "Security",
                        "skills": ["Cryptography", "PKI", "Hashing", "CIA Triad", "Threat Modeling"],
                        "search_term": "Cyber",
                        "action_items": [
                            "Implement AES encryption and RSA key exchange mechanics in Python",
                            "Verify digital signatures and cryptographic certificates using OpenSSL",
                            "Model threat vectors and defense boundaries using STRIDE methodology",
                        ],
                    },
                    {
                        "title": "Network Defense & Packet Analysis",
                        "description": "TCP/IP 3-way handshake dissection, Wireshark deep packet inspection, and firewall rules.",
                        "duration": "2 Weeks",
                        "category": "Networking",
                        "skills": ["Wireshark", "Packet Analysis", "Firewalls", "TCP/IP", "Nmap"],
                        "search_term": "Network Security",
                        "action_items": [
                            "Capture and dissect suspicious HTTP, DNS, and TCP packets with Wireshark",
                            "Execute passive and active reconnaissance scans using Nmap stealth flags",
                            "Write iptables and pfSense firewall rules blocking malicious subnet ranges",
                        ],
                    },
                ],
            },
            {
                "phase_number": 2,
                "title": "Phase 2: Linux Security & System Hardening",
                "description": "Linux operating system security, file permissions, auditd logging, and vulnerability assessment.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Linux Hardening & Privilege Escalation",
                        "description": "SUID binaries, sudo misconfigurations, cron job exploits, and kernel hardening.",
                        "duration": "2 Weeks",
                        "category": "Security",
                        "skills": ["Linux Security", "Privilege Escalation", "SELinux", "Auditd", "Hardening"],
                        "search_term": "Linux Security",
                        "action_items": [
                            "Enforce Mandatory Access Control using SELinux or AppArmor profiles",
                            "Audit system vulnerabilities using LinPEAS and manual command inspection",
                            "Remediate insecure SUID binary permissions and cron job writable paths",
                        ],
                    },
                    {
                        "title": "Vulnerability Scanning & Assessment",
                        "description": "CVE tracking, Nessus vulnerability scans, patch management, and remediation reporting.",
                        "duration": "2 Weeks",
                        "category": "Security",
                        "skills": ["Vulnerability Scanning", "Nessus", "CVE", "Risk Scoring", "CVSS"],
                        "search_term": "Security",
                        "action_items": [
                            "Conduct automated vulnerability audits against enterprise test servers using Nessus",
                            "Calculate and prioritize remediation timelines using CVSS v3 severity metrics",
                            "Draft executive security assessment reports with actionable technical fixes",
                        ],
                    },
                ],
            },
            {
                "phase_number": 3,
                "title": "Phase 3: Web Application Penetration Testing",
                "description": "Exploit and defend the OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, SSRF, IDOR).",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "OWASP Top 10 & Web Attacks",
                        "description": "SQL Injection, Cross-Site Scripting (XSS), Insecure Direct Object References (IDOR), and Burp Suite.",
                        "duration": "3 Weeks",
                        "category": "AppSec",
                        "skills": ["OWASP Top 10", "Burp Suite", "SQL Injection", "XSS", "IDOR"],
                        "search_term": "Web Security",
                        "action_items": [
                            "Intercept and tamper HTTP requests using Burp Suite proxy and repeater",
                            "Execute and mitigate blind and error-based SQL Injection vulnerabilities",
                            "Remediate stored and reflected Cross-Site Scripting (XSS) with context encoding",
                        ],
                    },
                    {
                        "title": "API & Authentication Security",
                        "description": "JWT algorithm confusion, broken object level authorization (BOLA), and rate limiting bypasses.",
                        "duration": "2 Weeks",
                        "category": "AppSec",
                        "skills": ["API Security", "BOLA", "JWT Exploitation", "OAuth2", "Rate Limiting"],
                        "search_term": "Security",
                        "action_items": [
                            "Audit REST and GraphQL endpoints for broken authorization and data leaks",
                            "Test token signing validation vulnerabilities (None algorithm, key confusion)",
                            "Implement strict RBAC checks validating resource ownership before access",
                        ],
                    },
                ],
            },
            {
                "phase_number": 4,
                "title": "Phase 4: SOC Analysis, SIEM & Incident Response",
                "description": "Log correlation with Splunk/Elastic, intrusion detection, memory forensics, and threat containment.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "SIEM Log Analysis & Threat Detection",
                        "description": "Splunk queries, anomaly detection, Snort IDS rules, and MITRE ATT&CK mapping.",
                        "duration": "3 Weeks",
                        "category": "Blue Team",
                        "skills": ["SIEM", "Splunk", "Suricata", "MITRE ATT&CK", "Log Correlation"],
                        "search_term": "Security",
                        "action_items": [
                            "Ingest Windows Event logs and Sysmon telemetry into Splunk for analysis",
                            "Write custom alert correlation rules detecting lateral movement and brute force",
                            "Map observed adversary tactics and techniques to the MITRE ATT&CK framework",
                        ],
                    },
                    {
                        "title": "Incident Response & Digital Forensics",
                        "description": "Memory acquisition with Volatility, disk imaging, artifact analysis, and containment protocols.",
                        "duration": "2 Weeks",
                        "category": "Blue Team",
                        "skills": ["Incident Response", "Volatility", "Forensics", "Malware Triage", "Containment"],
                        "search_term": "Security",
                        "action_items": [
                            "Extract memory dump processes and network sockets using Volatility 3",
                            "Analyze malicious scripts and phishing payloads in isolated sandboxes",
                            "Execute incident containment: host isolation, credential resets, and post-mortems",
                        ],
                    },
                ],
            },
        ],
        "capstone": {
            "title": "Enterprise Security Audit & SOC Defense Capstone",
            "description": "Conduct a comprehensive security audit of a simulated corporate infrastructure, execute ethical web penetration tests, configure automated SIEM log alerts, and author an executive remediation report.",
            "tech_stack": ["Kali Linux", "Burp Suite", "Wireshark", "Splunk", "Python", "Nmap"],
            "key_features": [
                "Full reconnaissance and vulnerability assessment of network perimeter",
                "Exploitation and patch verification of OWASP Top 10 vulnerabilities",
                "SIEM dashboard configuration with real-time detection alerts",
                "Professional vulnerability remediation and compliance report",
            ],
            "difficulty": "Advanced",
        },
    },
    "data_science": {
        "title": "Data Scientist & Analytics Engineer Roadmap",
        "target_role": "Data Scientist",
        "summary": "Master SQL database querying, exploratory analysis, statistics, predictive machine learning, and executive business intelligence dashboards.",
        "estimated_duration": "18 Weeks",
        "keywords": ["data", "data scientist", "data analyst", "analytics", "data science", "sql", "power bi", "tableau", "bi"],
        "phases": [
            {
                "phase_number": 1,
                "title": "Phase 1: Advanced SQL & Data Extraction",
                "description": "Relational querying, multi-table joins, window functions, CTEs, and database normalization.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Relational SQL Mastery",
                        "description": "Multi-table INNER/LEFT joins, GROUP BY aggregations, subqueries, and set operations.",
                        "duration": "2 Weeks",
                        "category": "Database",
                        "skills": ["SQL", "PostgreSQL", "Data Queries", "Joins", "Aggregations"],
                        "search_term": "SQL",
                        "action_items": [
                            "Write complex multi-table queries combining transactions, customers, and inventory",
                            "Aggregate metrics with GROUP BY, HAVING, and conditional CASE statements",
                            "Optimize query execution with index-friendly WHERE clauses",
                        ],
                    },
                    {
                        "title": "Advanced Window Functions & CTEs",
                        "description": "ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD time offsets, running totals, and Common Table Expressions.",
                        "duration": "2 Weeks",
                        "category": "Database",
                        "skills": ["Window Functions", "CTEs", "Time-series SQL", "Analytics"],
                        "search_term": "SQL",
                        "action_items": [
                            "Calculate rolling 7-day revenue averages and month-over-month growth rates",
                            "Partition customer data to identify repeat retention and churn cohorts",
                            "Structure readable multi-stage queries using nested Common Table Expressions",
                        ],
                    },
                ],
            },
            {
                "phase_number": 2,
                "title": "Phase 2: Python Data Analysis & Statistics",
                "description": "Pandas wrangling, NumPy vectorized math, probability distributions, and hypothesis testing.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Data Wrangling with Pandas",
                        "description": "DataFrame transformations, handling missing data, string methods, and datetime indexing.",
                        "duration": "3 Weeks",
                        "category": "Data",
                        "skills": ["Python", "Pandas", "Data Cleaning", "NumPy"],
                        "search_term": "Data Analysis",
                        "action_items": [
                            "Clean and transform multi-gigabyte CSV datasets with high memory efficiency",
                            "Reshape messy tables using pivot_table, melt, and group-by transformations",
                            "Extract seasonal trends and moving averages from datetime time-series data",
                        ],
                    },
                    {
                        "title": "Applied Statistics & A/B Testing",
                        "description": "Normal distributions, confidence intervals, t-tests, p-values, and experiment design.",
                        "duration": "2 Weeks",
                        "category": "Statistics",
                        "skills": ["Statistics", "Hypothesis Testing", "A/B Testing", "Probability"],
                        "search_term": "Data",
                        "action_items": [
                            "Design statistically rigorous A/B experiment sample sizes and metrics",
                            "Run two-sample t-tests and chi-square tests evaluating feature impact",
                            "Calculate confidence intervals and control false positive error rates",
                        ],
                    },
                ],
            },
            {
                "phase_number": 3,
                "title": "Phase 3: Machine Learning & Predictive Modeling",
                "description": "Supervised learning, regression, classification, random forests, and model interpretability.",
                "duration": "5 Weeks",
                "milestones": [
                    {
                        "title": "Predictive ML with Scikit-Learn",
                        "description": "Feature scaling, logistic regression, decision trees, gradient boosting, and cross-validation.",
                        "duration": "3 Weeks",
                        "category": "Machine Learning",
                        "skills": ["Scikit-Learn", "Regression", "Classification", "XGBoost", "Model Evaluation"],
                        "search_term": "Machine Learning",
                        "action_items": [
                            "Train predictive models forecasting customer churn and lifetime value",
                            "Tune hyperparameters using automated cross-validated grid search pipelines",
                            "Explain individual model predictions using SHAP values and feature importance",
                        ],
                    },
                    {
                        "title": "Time-Series Forecasting",
                        "description": "ARIMA, Prophet, seasonality decomposition, and forecasting future business demand.",
                        "duration": "2 Weeks",
                        "category": "Data Science",
                        "skills": ["Time Series", "Prophet", "Forecasting", "Trend Analysis"],
                        "search_term": "Data",
                        "action_items": [
                            "Decompose seasonal variations, holidays, and long-term trend lines",
                            "Train baseline Prophet forecasting models with confidence intervals",
                            "Benchmark forecast accuracy using MAPE and RMSE error metrics",
                        ],
                    },
                ],
            },
            {
                "phase_number": 4,
                "title": "Phase 4: Business Intelligence & Executive Dashboards",
                "description": "Interactive data storytelling, dimensional modeling (Star Schema), Power BI, and Tableau reporting.",
                "duration": "4 Weeks",
                "milestones": [
                    {
                        "title": "Dimensional Modeling & Data Warehousing",
                        "description": "Fact and dimension tables, Star Schema, slowly changing dimensions, and cloud warehouses.",
                        "duration": "2 Weeks",
                        "category": "BI",
                        "skills": ["Data Modeling", "Star Schema", "Snowflake", "dbt"],
                        "search_term": "Data",
                        "action_items": [
                            "Architect normalized Star Schema data marts for business domain reporting",
                            "Define consistent business metrics (MRR, CAC, LTV) across dimension tables",
                            "Transform raw warehouse tables into clean analytical views with dbt",
                        ],
                    },
                    {
                        "title": "Executive Dashboards & Data Storytelling",
                        "description": "Interactive filters, KPI cards, drill-through reports, and storytelling for stakeholders.",
                        "duration": "2 Weeks",
                        "category": "BI",
                        "skills": ["Power BI", "Tableau", "Data Storytelling", "Dashboards"],
                        "search_term": "Data Analytics",
                        "action_items": [
                            "Build interactive executive dashboards with drill-downs and real-time filters",
                            "Format high-signal visual charts prioritizing cognitive clarity and business takeaways",
                            "Present analytical findings and recommendations to non-technical stakeholders",
                        ],
                    },
                ],
            },
        ],
        "capstone": {
            "title": "End-to-End Enterprise Predictive Analytics System",
            "description": "Extract raw transactions from PostgreSQL, clean and transform features in Python, train predictive customer retention models, and visualize real-time insights in an executive dashboard.",
            "tech_stack": ["Python", "SQL", "Pandas", "Scikit-Learn", "PostgreSQL", "Power BI / Tableau"],
            "key_features": [
                "Automated SQL ETL extraction from relational production tables",
                "Statistical A/B testing framework evaluating product experiments",
                "Production churn prediction pipeline with SHAP interpretability",
                "Executive business intelligence dashboard with interactive KPI filters",
            ],
            "difficulty": "Advanced",
        },
    },
}


class RoadmapBuilderService:
    """Intelligent roadmap generation, customization, persistence, and tracking service."""

    @staticmethod
    def identify_blueprint_key(query: str) -> str:
        """Map user's input prompt to the most tailored career blueprint."""
        q = query.lower()
        best_key = "full_stack"
        max_matches = 0

        for key, bp in CAREER_BLUEPRINTS.items():
            matches = sum(1 for kw in bp["keywords"] if kw in q)
            if matches > max_matches:
                max_matches = matches
                best_key = key

        return best_key

    @staticmethod
    def extract_role_title(query: str, default_role: str) -> str:
        """Derive an attractive, human-readable career role title."""
        q = query.strip()
        # Check common patterns: "become a/an X", "be a/an X", "want to be X", "roadmap for X"
        match = re.search(r"\b(?:become|be|learn|to\s+be|want\s+to\s+become)\s+(?:an?\s+)?([a-zA-Z\s\+\-\#\.\/]+)", q, re.I)
        if match:
            extracted = match.group(1).strip()
            # Clean trailing punctuation or filler words
            extracted = re.sub(r"\b(developer|engineer|specialist|architect|analyst)\b.*$", r"\1", extracted, flags=re.I)
            if len(extracted) >= 3 and len(extracted) <= 45:
                return extracted.title()
        return default_role

    async def generate_roadmap(
        self,
        db: AsyncSession,
        goal: str,
        experience_level: str = "Beginner",
        current_level: str | None = None,
        available_time: str | None = None,
        main_goal: str | None = None,
        preferred_style: str | None = None,
    ) -> RoadmapGenerateResponse:
        """Construct an exhaustive, catalog-connected roadmap from user's career goal and onboarding profile."""
        blueprint_key = self.identify_blueprint_key(goal)
        bp = CAREER_BLUEPRINTS[blueprint_key]

        effective_level = current_level or experience_level or "Beginner"
        effective_goal = main_goal or "Job"
        effective_time = available_time or "1 hour/day"
        effective_style = preferred_style or "Projects"

        target_role = self.extract_role_title(goal, bp["target_role"])
        roadmap_title = f"{target_role} Roadmap"

        # Calculate tailored duration based on time availability
        raw_duration = bp.get("estimated_duration", "18 Weeks")
        duration_num_match = re.search(r"\d+", raw_duration)
        base_weeks = int(duration_num_match.group(0)) if duration_num_match else 16

        if "30 min" in effective_time.lower():
            adjusted_weeks = round(base_weeks * 1.4)
            tailored_duration = f"{adjusted_weeks} Weeks (Self-Paced)"
        elif "2+" in effective_time.lower():
            adjusted_weeks = max(8, round(base_weeks * 0.7))
            tailored_duration = f"{adjusted_weeks} Weeks (Intensive)"
        else:
            tailored_duration = f"{base_weeks} Weeks (Standard)"

        # Query all existing catalog paths & courses in advance for fast, intelligent linkage
        catalog_paths_res = await db.execute(
            select(LearningPath).options(selectinload(LearningPath.roadmap_steps))
        )
        all_paths = list(catalog_paths_res.scalars().all())

        catalog_courses_res = await db.execute(
            select(Course).options(selectinload(Course.lessons))
        )
        all_courses = list(catalog_courses_res.scalars().all())

        constructed_phases: list[RoadmapPhase] = []
        milestone_counter = 0
        total_courses_count = 0

        for raw_phase in bp["phases"]:
            phase_milestones: list[RoadmapMilestone] = []

            for raw_m in raw_phase["milestones"]:
                milestone_counter += 1
                m_id = f"m{raw_phase['phase_number']}-{len(phase_milestones) + 1}"
                search_term = raw_m.get("search_term", raw_m["title"]).lower()

                # Find best matching catalog learning path
                matched_path: LearningPath | None = None
                for lp in all_paths:
                    if (
                        search_term in lp.title.lower()
                        or any(search_term in k.lower() for k in (lp.search_terms or []))
                        or search_term in lp.category.lower()
                    ):
                        matched_path = lp
                        break

                # Find best matching courses for this milestone
                matched_courses_refs: list[RoadmapCourseRef] = []
                for c in all_courses:
                    c_title_low = c.title.lower()
                    if (
                        search_term in c_title_low
                        or (matched_path and c.learning_path_id == matched_path.id)
                    ):
                        matched_courses_refs.append(
                            RoadmapCourseRef(
                                id=c.id,
                                title=c.title,
                                instructor=c.instructor,
                                platform=c.platform,
                                url=c.youtube_url or c.playlist_url,
                                duration=c.duration,
                                lesson_count=len(c.lessons) if c.lessons else 0,
                            )
                        )
                        if len(matched_courses_refs) >= 2:
                            break

                total_courses_count += len(matched_courses_refs)

                # Generate hands-on milestone project spec tailored to style
                project_diff = "Intermediate" if raw_phase["phase_number"] >= 3 else "Beginner"
                if effective_level == "Intermediate":
                    project_diff = "Intermediate" if raw_phase["phase_number"] <= 2 else "Advanced"

                milestone_project = ProjectSpec(
                    title=f"{raw_m['title']} Practice Lab",
                    description=f"Construct a hands-on practical deliverable demonstrating proficiency in {', '.join(raw_m['skills'][:3])}.",
                    tech_stack=raw_m["skills"][:4],
                    key_features=[
                        f"Implement clean, modular architecture utilizing {raw_m['skills'][0]}",
                        f"Write structured unit and integration tests verifying implementation",
                        f"Publish version-controlled GitHub repository with comprehensive README",
                    ],
                    difficulty=project_diff,
                )

                milestone = RoadmapMilestone(
                    id=m_id,
                    step_number=len(phase_milestones) + 1,
                    title=raw_m["title"],
                    description=raw_m["description"],
                    estimated_weeks=raw_m["duration"],
                    category=raw_m["category"],
                    key_skills=raw_m["skills"],
                    prerequisites=raw_m.get("prerequisites", []),
                    action_items=raw_m.get("action_items", []),
                    learning_path_id=matched_path.id if matched_path else None,
                    learning_path_title=matched_path.title if matched_path else None,
                    courses=matched_courses_refs,
                    project=milestone_project,
                )
                phase_milestones.append(milestone)

            constructed_phases.append(
                RoadmapPhase(
                    phase_number=raw_phase["phase_number"],
                    title=raw_phase["title"],
                    description=raw_phase["description"],
                    estimated_duration=raw_phase["duration"],
                    milestones=phase_milestones,
                )
            )

        # ── Tailored Outcome Phase based on User's Main Goal ──
        final_phase_num = len(constructed_phases) + 1
        if effective_goal in ["Job", "Internship"]:
            outcome_phase = RoadmapPhase(
                phase_number=final_phase_num,
                title=f"Phase {final_phase_num}: Technical Interview & Production Readiness",
                description="Consolidate portfolio repos, practice system design defense, and drill data structures interview patterns.",
                estimated_duration="3 Weeks",
                milestones=[
                    RoadmapMilestone(
                        id=f"m{final_phase_num}-1",
                        step_number=1,
                        title="Technical Interview Drills & Problem Solving",
                        description="Master top technical interview patterns, complexity analysis, and whiteboard problem solving.",
                        estimated_weeks="2 Weeks",
                        category="Interview Prep",
                        key_skills=["Algorithms", "Data Structures", "Big-O", "STAR Method"],
                        action_items=[
                            "Solve top 25 high-frequency technical interview questions",
                            "Conduct peer mock interview with timed whiteboard explanation",
                            "Draft STAR method answers for architectural tradeoffs and debugging war stories",
                        ],
                        courses=[],
                        project=ProjectSpec(
                            title="Production Portfolio Showcase",
                            description="Deploy a personal engineering portfolio showcasing live projects, architecture diagrams, and GitHub codebases.",
                            tech_stack=["React", "Tailwind CSS", "Vite", "Vercel / Cloudflare"],
                            key_features=[
                                "Live interactive project demos with source code links",
                                "Embedded Lighthouse 100/100 performance and accessibility scores",
                                "Contact form connected to transactional email webhook",
                            ],
                            difficulty="Intermediate",
                        ),
                    ),
                    RoadmapMilestone(
                        id=f"m{final_phase_num}-2",
                        step_number=2,
                        title="System Architecture Defense & Resume Polish",
                        description="Structure resume bullet points around measurable business impact, and practice architectural defense.",
                        estimated_weeks="1 Week",
                        category="Career Strategy",
                        key_skills=["System Design", "Resume Optimization", "GitHub Polish"],
                        action_items=[
                            "Format resume following Google XYZ resume formula (Accomplished [X] as measured by [Y] by doing [Z])",
                            "Document system architecture diagrams (C4 model) for top 2 projects",
                            "Verify all GitHub repositories have clean commit histories and comprehensive READMEs",
                        ],
                        courses=[],
                    ),
                ],
            )
            constructed_phases.append(outcome_phase)
            milestone_counter += 2
        elif effective_goal == "Freelancing":
            outcome_phase = RoadmapPhase(
                phase_number=final_phase_num,
                title=f"Phase {final_phase_num}: Client Delivery & Monetization",
                description="Master client project scoping, milestone billing, contract agreements, and headless CMS integrations.",
                estimated_duration="2 Weeks",
                milestones=[
                    RoadmapMilestone(
                        id=f"m{final_phase_num}-1",
                        step_number=1,
                        title="Client Scoping & Payment Integration",
                        description="Implement Stripe payments, customer invoices, and headless CMS client handoffs.",
                        estimated_weeks="2 Weeks",
                        category="Freelance",
                        key_skills=["Stripe API", "Invoicing", "Client Delivery", "CMS"],
                        action_items=[
                            "Integrate Stripe Checkout and subscription billing webhooks",
                            "Set up headless CMS (Strapi / Sanity) allowing non-technical client editing",
                            "Draft standard Statement of Work (SOW) and scope creep protection clauses",
                        ],
                        courses=[],
                    ),
                ],
            )
            constructed_phases.append(outcome_phase)
            milestone_counter += 1
        elif effective_goal == "Startup":
            outcome_phase = RoadmapPhase(
                phase_number=final_phase_num,
                title=f"Phase {final_phase_num}: Rapid MVP & Cloud Scaling",
                description="Deploy production SaaS infrastructure, multi-tenancy auth, user analytics, and launch MVP.",
                estimated_duration="2 Weeks",
                milestones=[
                    RoadmapMilestone(
                        id=f"m{final_phase_num}-1",
                        step_number=1,
                        title="Production SaaS Multi-tenancy & Telemetry",
                        description="Configure tenant isolation, error tracking with Sentry, and user conversion funnel analytics.",
                        estimated_weeks="2 Weeks",
                        category="Startup Architecture",
                        key_skills=["Multi-tenancy", "Telemetry", "PostHog", "Sentry", "Cloud Launch"],
                        action_items=[
                            "Implement multi-tenant database isolation or organizational RBAC",
                            "Configure centralized error logging with Sentry and product telemetry with PostHog",
                            "Conduct load test simulating 500 concurrent users with zero memory leaks",
                        ],
                        courses=[],
                    ),
                ],
            )
            constructed_phases.append(outcome_phase)
            milestone_counter += 1

        capstone_data = bp.get("capstone")
        capstone_spec = (
            ProjectSpec(
                title=capstone_data["title"],
                description=capstone_data["description"],
                tech_stack=capstone_data["tech_stack"],
                key_features=capstone_data["key_features"],
                difficulty=capstone_data.get("difficulty", "Advanced"),
            )
            if capstone_data
            else None
        )

        roadmap_data = GeneratedRoadmapData(
            target_role=target_role,
            goal=goal,
            experience_level=effective_level,
            summary=f"{bp['summary']} Customized for {effective_goal} outcome, {effective_time} commitment, and {effective_style}-first learning style.",
            estimated_total_duration=tailored_duration,
            total_milestones=milestone_counter,
            total_courses=total_courses_count,
            total_projects=milestone_counter + (1 if capstone_spec else 0),
            phases=constructed_phases,
            capstone_project=capstone_spec,
        )

        return RoadmapGenerateResponse(
            title=roadmap_title,
            goal=goal,
            target_role=target_role,
            experience_level=effective_level,
            estimated_duration=tailored_duration,
            roadmap_data=roadmap_data,
        )

    async def save_user_roadmap(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        title: str,
        goal: str,
        target_role: str | None,
        experience_level: str,
        estimated_duration: str | None,
        roadmap_data: dict[str, Any],
    ) -> UserGeneratedRoadmap:
        """Persist a generated roadmap in user's account."""
        # Archive any previous active roadmaps if desired, or keep multiple
        new_roadmap = UserGeneratedRoadmap(
            user_id=user_id,
            title=title,
            goal=goal,
            target_role=target_role,
            experience_level=experience_level,
            estimated_duration=estimated_duration,
            roadmap_data=roadmap_data,
            is_active=True,
            progress_percent=0,
            completed_milestone_ids=[],
        )
        db.add(new_roadmap)
        await db.commit()
        await db.refresh(new_roadmap)
        return new_roadmap

    async def get_user_roadmaps(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> list[UserGeneratedRoadmap]:
        """Fetch all roadmaps saved by user."""
        stmt = (
            select(UserGeneratedRoadmap)
            .where(UserGeneratedRoadmap.user_id == user_id)
            .order_by(UserGeneratedRoadmap.created_at.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_roadmap_by_id(
        self,
        db: AsyncSession,
        roadmap_id: int,
        user_id: uuid.UUID | None = None,
    ) -> UserGeneratedRoadmap | None:
        """Fetch a specific roadmap by ID."""
        stmt = select(UserGeneratedRoadmap).where(UserGeneratedRoadmap.id == roadmap_id)
        if user_id:
            stmt = stmt.where(UserGeneratedRoadmap.user_id == user_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def toggle_milestone_progress(
        self,
        db: AsyncSession,
        roadmap_id: int,
        user_id: uuid.UUID,
        milestone_id: str,
        is_completed: bool,
    ) -> UserGeneratedRoadmap:
        """Check off or uncheck a milestone and recalculate overall progress percent."""
        roadmap = await self.get_roadmap_by_id(db, roadmap_id=roadmap_id, user_id=user_id)
        if not roadmap:
            raise ValueError("Roadmap not found or unauthorized access.")

        completed_set = set(roadmap.completed_milestone_ids or [])
        if is_completed:
            completed_set.add(milestone_id)
        else:
            completed_set.discard(milestone_id)

        roadmap.completed_milestone_ids = list(completed_set)

        # Calculate progress percent from total milestones in roadmap_data
        total_milestones = 0
        if isinstance(roadmap.roadmap_data, dict):
            phases = roadmap.roadmap_data.get("phases", [])
            for p in phases:
                total_milestones += len(p.get("milestones", []))

        if total_milestones > 0:
            roadmap.progress_percent = min(100, round((len(completed_set) / total_milestones) * 100))
        else:
            roadmap.progress_percent = 0

        await db.commit()
        await db.refresh(roadmap)
        return roadmap

    async def delete_roadmap(
        self,
        db: AsyncSession,
        roadmap_id: int,
        user_id: uuid.UUID,
    ) -> bool:
        """Remove a roadmap from user account."""
        roadmap = await self.get_roadmap_by_id(db, roadmap_id=roadmap_id, user_id=user_id)
        if not roadmap:
            return False
        await db.delete(roadmap)
        await db.commit()
        return True


roadmap_builder_service = RoadmapBuilderService()

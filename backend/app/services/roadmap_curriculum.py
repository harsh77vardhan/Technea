"""Curated technical curriculum, lessons, resources, interview prep, and language adaptations for Roadmap Builder."""

from typing import Any


LANGUAGE_BACKEND_CURRICULUM: dict[str, dict[str, Any]] = {
    "go": {
        "title": "Backend Services & REST APIs (Go)",
        "skills": ["Go", "Gin", "GORM", "Goroutines", "REST APIs", "JWT Auth"],
        "lessons": [
            "Go Language Architecture: Structs, Interfaces, Pointers & Goroutines",
            "High-Performance HTTP Routing & Middleware with Gin Framework",
            "Relational Database Persistence with GORM & PostgreSQL Pooling",
            "Stateless JWT Authentication, Context Cancellation & Concurrency Safety",
        ],
        "resources": [
            {"title": "The Go Programming Language Official Documentation", "url": "https://go.dev/doc/", "type": "Documentation"},
            {"title": "Gin Web Framework Official Guide", "url": "https://gin-gonic.com/docs/", "type": "Guide"},
            {"title": "GORM Object Relational Mapping Tutorial", "url": "https://gorm.io/docs/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a concurrent REST API in Go with JWT authentication and Gin routing",
            "Implement structured JSON logging and Prometheus metrics middleware in Go",
        ],
        "interview_prep": [
            "Explain Go channels and goroutines vs OS threads. (Goroutines are lightweight user-space threads multiplexed onto OS threads by the Go runtime)",
            "How do interfaces work in Go compared to classical OOP? (Go interfaces are satisfied implicitly without an explicit implements keyword)",
        ],
        "checkpoints": [
            "Go API compiles with zero data race warnings under 'go test -race'",
            "Handles concurrent HTTP requests with sub-5ms response latencies and graceful shutdown",
        ],
    },
    "typescript": {
        "title": "Backend Services & REST APIs (TypeScript)",
        "skills": ["TypeScript", "Node.js", "Express", "NestJS", "Prisma", "JWT"],
        "lessons": [
            "TypeScript Advanced Types, Generics, and Strict Type Safety",
            "Building Scalable REST APIs with Express/NestJS & TypeScript Controllers",
            "Database Persistence & Type-Safe Queries with Prisma ORM",
            "JWT Authentication, Route Guards, and Dependency Injection",
        ],
        "resources": [
            {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/", "type": "Documentation"},
            {"title": "NestJS Architectural Framework Guide", "url": "https://docs.nestjs.com/", "type": "Guide"},
            {"title": "Prisma ORM Reference Documentation", "url": "https://www.prisma.io/docs", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build an end-to-end typed REST API with NestJS/Express and Prisma",
            "Implement request validation pipes with class-validator and custom JWT auth guards",
        ],
        "interview_prep": [
            "Explain TypeScript interfaces vs type aliases. (Interfaces support declaration merging and OOP extends; type aliases support union and primitive types)",
            "How does the Node.js event loop handle asynchronous I/O operations? (Delegates non-blocking I/O to libuv worker thread pool and notifies via event loop phases)",
        ],
        "checkpoints": [
            "TypeScript code compiles cleanly under strict mode with zero 'any' escape hatches",
            "All route inputs are validated and sanitized before executing database queries",
        ],
    },
    "rust": {
        "title": "Backend Services & REST APIs (Rust)",
        "skills": ["Rust", "Actix-web", "Axum", "SQLx", "Tokio", "JWT"],
        "lessons": [
            "Rust Ownership, Borrow Checker, Lifetimes & Error Handling (Result/Option)",
            "Asynchronous Runtimes with Tokio & Web Frameworks (Actix-web / Axum)",
            "Type-Safe SQL Persistence with SQLx & Connection Pools",
            "Stateless Authentication Middleware & Zero-Cost Abstractions",
        ],
        "resources": [
            {"title": "The Rust Programming Language (The Book)", "url": "https://doc.rust-lang.org/book/", "type": "Documentation"},
            {"title": "Tokio Asynchronous Runtime Guide", "url": "https://tokio.rs/", "type": "Guide"},
            {"title": "Axum Web Framework Reference", "url": "https://docs.rs/axum/latest/axum/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a blazingly fast asynchronous REST API in Rust using Axum and SQLx",
            "Implement custom Tower middleware for JWT authentication and rate limiting",
        ],
        "interview_prep": [
            "Explain Rust's ownership model and borrow checker rules. (Each value has a single owner; you can have either one mutable reference or multiple immutable references)",
            "What is the difference between synchronous and async execution in Tokio? (Tokio uses cooperative multitasking over non-blocking polling without thread blocking)",
        ],
        "checkpoints": [
            "Rust binary compiles cleanly with zero unsafe blocks",
            "Demonstrates memory-safe concurrency with zero runtime garbage collection pauses",
        ],
    },
    "java": {
        "title": "Backend Services & REST APIs (Java / Spring Boot)",
        "skills": ["Java", "Spring Boot", "Spring Security", "JPA / Hibernate", "Maven"],
        "lessons": [
            "Modern Java (17/21): Records, Pattern Matching & Virtual Threads",
            "Enterprise REST APIs with Spring Boot, Controllers & Service Layers",
            "Spring Data JPA, Hibernate ORM & Relational Transactions",
            "Spring Security, JWT Token Filters & Role-Based Access Control",
        ],
        "resources": [
            {"title": "Spring Boot Reference Documentation", "url": "https://docs.spring.io/spring-boot/docs/current/reference/html/", "type": "Documentation"},
            {"title": "Baeldung Spring Boot Tutorials", "url": "https://www.baeldung.com/spring-boot", "type": "Guide"},
            {"title": "Java Language Specification (Oracle)", "url": "https://docs.oracle.com/en/java/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Develop a Spring Boot REST microservice with JPA repository and Spring Security",
            "Configure Flyway database migrations and automated unit tests with Mockito",
        ],
        "interview_prep": [
            "Explain Dependency Injection and Inversion of Control in Spring. (Spring container manages object creation and lifecycle, injecting dependencies at runtime)",
            "What is the difference between JPA and Hibernate? (JPA is a specification interface; Hibernate is the concrete ORM implementation)",
        ],
        "checkpoints": [
            "Spring Boot application passes all integration tests with @SpringBootTest",
            "Secures all endpoints with Spring Security filter chains and JWT verification",
        ],
    },
    "python": {
        "title": "Backend Services & REST APIs (Python / FastAPI)",
        "skills": ["Python", "FastAPI", "Pydantic", "SQLAlchemy", "AsyncIO", "JWT Auth"],
        "lessons": [
            "RESTful API Architectural Principles, HTTP Status Codes & URL Design",
            "Request Validation, Serialization, and Data Schemas with Pydantic",
            "Stateless User Authentication with Salted Hashing & Signed JWT Tokens",
            "Middleware Architecture: CORS, Rate Limiting, Request Logging, and Error Handling",
        ],
        "resources": [
            {"title": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Documentation"},
            {"title": "REST API Design Best Practices (Mozilla)", "url": "https://developer.mozilla.org/en-US/docs/Glossary/REST", "type": "Guide"},
            {"title": "OWASP API Security Top 10", "url": "https://owasp.org/www-project-api-security/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Create an authenticated REST API with user registration, login, and protected endpoints",
            "Implement global error handling middleware returning standardized RFC 7807 problem details",
        ],
        "interview_prep": [
            "Explain idempotent HTTP methods and why POST is typically not idempotent while PUT is. (Multiple identical PUT requests produce the same resource state; POST creates new resources)",
            "How does JWT authentication work and where should tokens be stored securely? (Signed claims verified with secret key; stored in HttpOnly SameSite cookies)",
        ],
        "checkpoints": [
            "All endpoints validate incoming request payloads with strict schema constraints",
            "Protected routes reject unauthorized requests with 401/403 status codes and descriptive errors",
        ],
    },
}

CURATED_MILESTONE_CONTENT: dict[str, dict[str, Any]] = {
    # ── Full Stack Blueprints ──
    "HTML5 & Semantic Web": {
        "lessons": [
            "Semantic HTML5 Elements & Landmark Layouts (header, main, nav, section, article)",
            "WCAG AA Accessibility Standards & Accessible Rich Internet Applications (ARIA)",
            "Web Forms, Validation States, and Native Client Constraints",
            "SEO Metadata, OpenGraph Protocol & Structured Microdata",
        ],
        "resources": [
            {"title": "MDN Web Docs: HTML Elements Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "type": "Documentation"},
            {"title": "W3C Web Accessibility Initiative (WAI)", "url": "https://www.w3.org/WAI/", "type": "Guide"},
            {"title": "Google Web.dev: Learn HTML", "url": "https://web.dev/learn/html", "type": "Reference"},
        ],
        "practice_tasks": [
            "Construct an accessible multi-page semantic website achieving 100% on Lighthouse Accessibility",
            "Build a complex registration form with client constraints, error messages, and aria-describedby",
        ],
        "interview_prep": [
            "What is the difference between <section>, <article>, and <div>? (Article is self-contained and syndicatable; section is thematic grouping; div carries no semantic meaning)",
            "How do you ensure web accessibility without overusing ARIA attributes? (Favor native semantic HTML elements first; use ARIA only to supplement missing semantics)",
        ],
        "checkpoints": [
            "Passes automated Axe Core and Lighthouse accessibility audits with zero critical violations",
            "Properly organizes semantic document outline without skipping heading levels (h1 -> h2 -> h3)",
        ],
    },
    "Modern CSS & Responsive Design": {
        "lessons": [
            "CSS Flexbox Architecture: 1D Alignment, Direction, and Flex Shrink/Grow Dynamics",
            "CSS Grid Mastery: 2D Spatial Layouts, Fractional Units (fr), and Named Template Areas",
            "Mobile-First Responsive Design, Fluid Typography with clamp(), and Container Queries",
            "Modern Utility Styling with Tailwind CSS & Design Token Systems",
        ],
        "resources": [
            {"title": "MDN Web Docs: CSS Layouts", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout", "type": "Documentation"},
            {"title": "CSS-Tricks: Complete Guide to Flexbox & Grid", "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", "type": "Guide"},
            {"title": "Tailwind CSS Official Documentation", "url": "https://tailwindcss.com/docs", "type": "Reference"},
        ],
        "practice_tasks": [
            "Implement a fully responsive multi-breakpoint dashboard layout using CSS Grid and Flexbox",
            "Refactor a traditional stylesheet into modular Tailwind CSS utility classes and tokens",
        ],
        "interview_prep": [
            "Explain the CSS Box Model and how box-sizing: border-box changes sizing calculations. (Includes padding and border in element total width/height)",
            "Compare Flexbox vs CSS Grid. (Flexbox is optimized for 1D content-first flow; Grid is optimized for 2D layout-first alignment)",
        ],
        "checkpoints": [
            "Layout dynamically adapts across 320px mobile up to 4K ultra-wide screens with zero overflow",
            "Demonstrates fluid typography and consistent responsive spacing variables",
        ],
    },
    "JavaScript (ES6+) & Async Programming": {
        "lessons": [
            "ES6+ Modern Syntax: Destructuring, Spread/Rest, Modules, and Optional Chaining",
            "Execution Context, Closures, Scopes, and the JavaScript Event Loop",
            "Asynchronous Programming: Promises, Async/Await, Error Handling & Fetch API",
            "DOM Manipulation, Custom Events, and Performance Optimization (Debounce/Throttle)",
        ],
        "resources": [
            {"title": "JavaScript.info: The Modern JavaScript Tutorial", "url": "https://javascript.info/", "type": "Guide"},
            {"title": "MDN Web Docs: Asynchronous JavaScript", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous", "type": "Documentation"},
            {"title": "Node.js & V8 Event Loop Explainer", "url": "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build an async currency converter fetching live API rates with robust error boundaries",
            "Write an interactive searchable data table with debounced input and client pagination",
        ],
        "interview_prep": [
            "How does the JavaScript Event Loop handle microtasks vs macrotasks? (Microtasks like Promises run before the next macrotask like setTimeout)",
            "What is a closure and give a practical real-world use case. (A function retaining access to its lexical scope; used in factory functions and private state)",
        ],
        "checkpoints": [
            "Can explain synchronous vs asynchronous execution flow and race conditions without hesitation",
            "Handles all Promise rejections gracefully with explicit fallback UI states",
        ],
    },
    "React Component Architecture": {
        "lessons": [
            "Declarative Functional Components, JSX Compilation, and Props Composition",
            "React Hooks Deep Dive: useState, useEffect, useMemo, useCallback, and Custom Hooks",
            "State Management Patterns: Context API vs Global State Stores",
            "Client-Side Routing, Lazy Loading, and Performance Optimization (React.memo)",
        ],
        "resources": [
            {"title": "React Official Documentation (react.dev)", "url": "https://react.dev/", "type": "Documentation"},
            {"title": "React Router Official Guide", "url": "https://reactrouter.com/", "type": "Guide"},
            {"title": "Patterns.dev: React Design Patterns", "url": "https://www.patterns.dev/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a reactive Kanban board with drag-and-drop state updates and local storage persistence",
            "Develop reusable custom hooks for API data fetching with caching and retry logic",
        ],
        "interview_prep": [
            "Why should state never be mutated directly in React? (Direct mutation bypasses React reconciliation diffing algorithm, preventing re-renders)",
            "When should you use useMemo and useCallback? (Only when memoizing expensive computations or maintaining stable callback references for memoized child components)",
        ],
        "checkpoints": [
            "Correctly configures hook dependency arrays without triggering infinite render cycles",
            "Demonstrates separation of presentation and business logic using custom hooks",
        ],
    },
    "Backend Services & REST APIs": {
        "lessons": [
            "RESTful API Architectural Principles, HTTP Status Codes & URL Design",
            "Request Validation, Serialization, and Data Schemas (Pydantic / Zod)",
            "Stateless User Authentication with Salted Hashing & Signed JWT Tokens",
            "Middleware Architecture: CORS, Rate Limiting, Request Logging, and Error Handling",
        ],
        "resources": [
            {"title": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Documentation"},
            {"title": "REST API Design Best Practices (Mozilla)", "url": "https://developer.mozilla.org/en-US/docs/Glossary/REST", "type": "Guide"},
            {"title": "OWASP API Security Top 10", "url": "https://owasp.org/www-project-api-security/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Create an authenticated REST API with user registration, login, and protected endpoints",
            "Implement global error handling middleware returning standardized RFC 7807 problem details",
        ],
        "interview_prep": [
            "Explain idempotent HTTP methods and why POST is typically not idempotent while PUT is. (Multiple identical PUT requests produce the same resource state; POST creates new resources)",
            "How does JWT authentication work and where should tokens be stored securely? (Signed claims verified with secret key; stored in HttpOnly SameSite cookies)",
        ],
        "checkpoints": [
            "All endpoints validate incoming request payloads with strict schema constraints",
            "Protected routes reject unauthorized requests with 401/403 status codes and descriptive errors",
        ],
    },
    "PostgreSQL & Database Architecture": {
        "lessons": [
            "Relational Data Modeling: Entities, Normalization (1NF, 2NF, 3NF), and Foreign Keys",
            "Advanced SQL Queries: Inner/Outer Joins, Aggregations, Grouping, and Subqueries",
            "Database Indexing Strategies: B-Tree Indexes, Composite Keys, and Query EXPLAIN Plans",
            "Schema Migrations with Alembic and Object-Relational Mapping (ORM)",
        ],
        "resources": [
            {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "Documentation"},
            {"title": "SQLAlchemy 2.0 Unified Tutorial", "url": "https://docs.sqlalchemy.org/en/20/tutorial/", "type": "Guide"},
            {"title": "Use The Index, Luke: SQL Indexing Guide", "url": "https://use-the-index-luke.com/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Design a normalized database schema for an e-commerce platform with orders, items, and users",
            "Write and optimize a complex analytical SQL query using EXPLAIN ANALYZE to eliminate sequential scans",
        ],
        "interview_prep": [
            "Explain ACID properties in relational database transactions. (Atomicity, Consistency, Isolation, Durability ensuring reliable transaction processing)",
            "What is the N+1 query problem in ORMs and how do you resolve it? (Occurs when loading related records in a loop; resolved via eager loading / join loads)",
        ],
        "checkpoints": [
            "Database schema enforces referential integrity with cascading constraints and unique indexes",
            "Successfully runs forward and backward schema migrations without data corruption",
        ],
    },
    "Docker Containerization": {
        "lessons": [
            "Container Virtualization Concepts: Namespaces, cgroups, and Image Layers",
            "Writing Production-Grade Multi-Stage Dockerfiles for Frontend and Backend Services",
            "Local Multi-Container Orchestration with Docker Compose & Volume Persistence",
            "Container Security Best Practices: Non-Root Execution and Minimal Base Images",
        ],
        "resources": [
            {"title": "Docker Official Documentation", "url": "https://docs.docker.com/", "type": "Documentation"},
            {"title": "Docker Compose Specification", "url": "https://docs.docker.com/compose/", "type": "Guide"},
            {"title": "OWASP Docker Security Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html", "type": "Reference"},
        ],
        "practice_tasks": [
            "Package a full-stack React + API service into an optimized multi-stage Docker image under 100MB",
            "Orchestrate API, database, and client services locally using Docker Compose with health checks",
        ],
        "interview_prep": [
            "What is the difference between a Docker image and a Docker container? (An image is an immutable template of layers; a container is a running instance with a writable layer)",
            "Why are multi-stage builds recommended for production Docker images? (Separates build dependencies from runtime binaries, minimizing final image size and attack surface)",
        ],
        "checkpoints": [
            "Containers build reproducibly and launch with zero manual host environment configuration",
            "Containerized services restart automatically and verify dependencies with health check probes",
        ],
    },
    "Cloud Deployment & CI/CD Pipelines": {
        "lessons": [
            "CI/CD Automation Architecture: Linting, Unit Testing, and Build Verification",
            "GitHub Actions Workflow Syntax, Secrets Management, and Matrix Strategies",
            "Edge CDN Client Deployment (Vercel / Cloudflare) and Container Cloud Hosting",
            "Application Monitoring, Structured Logging, Health Checks & Uptime Alerting",
        ],
        "resources": [
            {"title": "GitHub Actions Official Documentation", "url": "https://docs.github.com/en/actions", "type": "Documentation"},
            {"title": "Google Cloud / AWS Architecture Center", "url": "https://aws.amazon.com/architecture/", "type": "Guide"},
            {"title": "12-Factor App Methodology", "url": "https://12factor.net/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a GitHub Actions workflow that executes automated tests on every pull request",
            "Deploy a production web application with automated SSL certificates, custom domain, and health alerts",
        ],
        "interview_prep": [
            "What is the difference between Continuous Delivery and Continuous Deployment? (Delivery automates releases up to staging with manual approval; Deployment deploys automatically to production)",
            "How do you handle zero-downtime deployments for production web services? (Using blue-green or rolling deployment strategies behind a load balancer)",
        ],
        "checkpoints": [
            "Automated pipeline blocks deployments if any unit test or lint check fails",
            "Production deployment serves valid HTTPS with automated edge caching",
        ],
    },

    # ── AI & Machine Learning Blueprints ──
    "Python for Scientific Computing": {
        "lessons": [
            "NumPy Multidimensional Ndarrays, Indexing, Slicing & Memory Layout",
            "Vectorized Mathematical Operations, Broadcasting & Matrix Transformations",
            "Object-Oriented Architecture, Typing Annotations, and Test-Driven Python",
            "Computational Complexity Optimization for Vector Math",
        ],
        "resources": [
            {"title": "NumPy Official User Guide", "url": "https://numpy.org/doc/stable/user/", "type": "Documentation"},
            {"title": "Scientific Python Lectures", "url": "https://lectures.scientific-python.org/", "type": "Guide"},
            {"title": "Python Typing Specification", "url": "https://docs.python.org/3/library/typing.html", "type": "Reference"},
        ],
        "practice_tasks": [
            "Implement custom linear regression from scratch using pure NumPy matrix math",
            "Benchmark execution speed of vectorized NumPy arrays vs standard Python for-loops",
        ],
        "interview_prep": [
            "How does NumPy broadcasting work when array shapes differ? (Compares trailing dimensions right to left; dimensions match if equal or one of them is 1)",
            "Explain Python's Global Interpreter Lock (GIL) and how NumPy bypasses it. (NumPy operations execute in precompiled C extensions outside the Python interpreter lock)",
        ],
        "checkpoints": [
            "Replaces all nested iterations with vector broadcasting operations",
            "Implements proper type hints and passing unit tests for scientific functions",
        ],
    },
    "Data Exploration & Feature Engineering": {
        "lessons": [
            "Pandas Series & DataFrames: Filtering, Grouping, Merging & Imputation",
            "Data Distribution Analysis, Outlier Detection & Skewness Correction",
            "Feature Transformation: Standardization, Normalization & Categorical One-Hot Encoding",
            "Exploratory Visualization with Matplotlib, Seaborn & Interactive Charts",
        ],
        "resources": [
            {"title": "Pandas Official Documentation", "url": "https://pandas.pydata.org/docs/", "type": "Documentation"},
            {"title": "Seaborn Statistical Data Visualization", "url": "https://seaborn.pydata.org/", "type": "Guide"},
            {"title": "Feature Engineering for Machine Learning (O'Reilly)", "url": "https://www.oreilly.com/library/view/feature-engineering-for/9781491953235/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Clean and process a messy real-world customer churn dataset with missing values",
            "Engineer new temporal and ratio features improving predictive signal for modeling",
        ],
        "interview_prep": [
            "What is data leakage and how do you prevent it during feature engineering? (Leakage happens when test set information contaminates train set; fit scalers only on training data)",
            "Compare Min-Max Normalization vs Standard Z-score Scaling. (Min-Max scales between 0-1, sensitive to outliers; Z-score centers around mean with unit variance)",
        ],
        "checkpoints": [
            "Produces a reproducible feature engineering pipeline returning zero null values",
            "Generates exploratory correlation heatmaps identifying top predictive signals",
        ],
    },
    "Supervised Learning Algorithms": {
        "lessons": [
            "Linear and Logistic Regression: Cost Functions, Gradient Descent & Odds Ratios",
            "Decision Trees, Impurity Metrics (Gini / Entropy), and Pruning Mechanisms",
            "Ensemble Learning: Random Forests (Bagging) vs Gradient Boosting (XGBoost / LightGBM)",
            "Model Evaluation Metrics: Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrices",
        ],
        "resources": [
            {"title": "Scikit-Learn Machine Learning Documentation", "url": "https://scikit-learn.org/stable/", "type": "Documentation"},
            {"title": "XGBoost Documentation & Architecture", "url": "https://xgboost.readthedocs.io/", "type": "Guide"},
            {"title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "Reference"},
        ],
        "practice_tasks": [
            "Train an ensemble XGBoost classifier predicting credit loan default risk",
            "Tune hyperparameters using StratifiedKFold cross-validation and GridSearchCV",
        ],
        "interview_prep": [
            "Explain the bias-variance tradeoff and how ensemble methods address it. (High bias leads to underfitting, high variance to overfitting; Bagging reduces variance while Boosting reduces bias)",
            "When should you use PR-AUC over ROC-AUC? (PR-AUC is preferred when classes are heavily imbalanced)",
        ],
        "checkpoints": [
            "Achieves verifiable ROC-AUC score > 0.85 on held-out test splits without overfitting",
            "Inspects feature importance to explain model decision boundaries",
        ],
    },
    "Unsupervised Learning & Clustering": {
        "lessons": [
            "K-Means Clustering: Centroid Initialization, Inertia & Silhouette Analysis",
            "Hierarchical Clustering & Density-Based Spatial Clustering (DBSCAN)",
            "Principal Component Analysis (PCA): Eigenvectors, Covariance & Dimensionality Reduction",
            "Anomaly Detection Techniques with Isolation Forests",
        ],
        "resources": [
            {"title": "Scikit-Learn Clustering Guide", "url": "https://scikit-learn.org/stable/modules/clustering.html", "type": "Documentation"},
            {"title": "PCA & Dimensionality Reduction Primer", "url": "https://builtin.com/data-science/step-step-explanation-principal-component-analysis", "type": "Guide"},
            {"title": "An Introduction to Statistical Learning", "url": "https://www.statlearning.com/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Segment e-commerce customer transaction history into discrete behavioural clusters",
            "Reduce a 50-variable dataset down to 3 principal components explaining 80%+ variance",
        ],
        "interview_prep": [
            "How do you determine the optimal number of clusters (K) in K-Means? (Using the elbow method on inertia curve and maximizing the silhouette coefficient)",
            "Why is feature scaling essential before applying Principal Component Analysis? (PCA is sensitive to variances of original variables; unscaled large ranges dominate components)",
        ],
        "checkpoints": [
            "Demonstrates mathematical justification for selected cluster count",
            "Visualizes 2D/3D projections of high-dimensional customer clusters",
        ],
    },
    "PyTorch Neural Foundations": {
        "lessons": [
            "Tensors, GPU Device Placement (CUDA / MPS), and Memory Allocation",
            "Computational Graphs and Automatic Differentiation with torch.autograd",
            "Custom Neural Architectures with torch.nn.Module and Activation Functions",
            "End-to-End Training Loops: Forward Pass, Loss Computation, Backward Pass & Optimizers",
        ],
        "resources": [
            {"title": "PyTorch Official Tutorials & Documentation", "url": "https://pytorch.org/tutorials/", "type": "Documentation"},
            {"title": "Deep Learning with PyTorch (Stevens, Antiga)", "url": "https://pytorch.org/deep-learning-with-pytorch", "type": "Guide"},
            {"title": "Neural Networks and Deep Learning (Michael Nielsen)", "url": "http://neuralnetworksanddeeplearning.com/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a multi-layer perceptron (MLP) in PyTorch classifying handwritten digits (MNIST)",
            "Implement custom Dataset and DataLoader classes with mini-batch collation and augmentations",
        ],
        "interview_prep": [
            "Why do we call optimizer.zero_grad() before loss.backward() in PyTorch? (PyTorch accumulates gradients by default; zeroing prevents mixing gradients across iterations)",
            "Explain Vanishing and Exploding Gradients and how ReLU and BatchNorm mitigate them. (Small derivative products cause deep gradients to decay toward zero; ReLU maintains constant gradient of 1 for positive inputs)",
        ],
        "checkpoints": [
            "Training loop converges smoothly with decreasing validation loss and zero memory leaks",
            "Successfully exports model weights and loads checkpoints for inference",
        ],
    },
    "Computer Vision & Sequence Models": {
        "lessons": [
            "Convolutional Neural Networks (CNN): Kernels, Strides, Padding & Pooling",
            "Transfer Learning & Fine-Tuning SOTA Backbones (ResNet, EfficientNet, ConvNeXt)",
            "Sequence Modeling: Recurrent Neural Networks, LSTMs & Self-Attention Fundamentals",
            "Vision Transformers (ViT) & Multi-Head Self-Attention Architectures",
        ],
        "resources": [
            {"title": "Torchvision Models and Pretrained Weights", "url": "https://pytorch.org/vision/stable/models.html", "type": "Documentation"},
            {"title": "Stanford CS231n: Deep Learning for Computer Vision", "url": "http://cs231n.stanford.edu/", "type": "Guide"},
            {"title": "Hugging Face Vision Transformers Course", "url": "https://huggingface.co/docs/transformers/model_doc/vit", "type": "Reference"},
        ],
        "practice_tasks": [
            "Fine-tune a pretrained ResNet-50 on custom industrial defect classification dataset",
            "Apply albumentations pipeline with rotation, cut-out, and jitter to boost validation accuracy",
        ],
        "interview_prep": [
            "Why is Transfer Learning effective for deep learning when dataset sizes are small? (Pretrained weights from large corpuses capture universal lower-level visual features like edges and textures)",
            "Compare Convolutional Networks with Vision Transformers. (CNNs possess inductive bias for spatial locality; ViTs use global self-attention and excel with massive data)",
        ],
        "checkpoints": [
            "Fine-tuned vision model achieves over 90% top-1 accuracy on target validation classes",
            "Inference runtime benchmarks under 50ms per frame on edge/GPU hardware",
        ],
    },
    "Vector Databases & Retrieval Augmented Generation (RAG)": {
        "lessons": [
            "Text Embedding Models, Vector Spaces, and Cosine Similarity Metrics",
            "Vector Database Indexing (Chroma, Pinecone, Qdrant) & Approximate Nearest Neighbors (HNSW)",
            "Document Chunking Strategies, Overlap Windowing, and Hybrid Search (BM25 + Dense)",
            "RAG Pipelines: Context Injection, Prompt Engineering & Source Citations",
        ],
        "resources": [
            {"title": "Pinecone Learning Center: Vector Databases", "url": "https://www.pinecone.io/learn/", "type": "Documentation"},
            {"title": "LangChain & LlamaIndex RAG Guides", "url": "https://docs.llamaindex.ai/en/stable/", "type": "Guide"},
            {"title": "Sentence-Transformers Official Documentation", "url": "https://www.sbert.net/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a production RAG system indexing 500+ pages of internal API documentation",
            "Implement re-ranking using cross-encoders to eliminate irrelevant context chunks",
        ],
        "interview_prep": [
            "What is the difference between dense retrieval and sparse retrieval (BM25)? (Dense captures conceptual semantics via vector embeddings; sparse captures exact keyword matches)",
            "How do you evaluate RAG pipeline quality? (Using frameworks like Ragas measuring faithfulness, answer relevance, and context precision)",
        ],
        "checkpoints": [
            "Vector search returns top-k relevant documentation chunks in under 30ms",
            "Synthesized LLM answers provide exact source page attribution without hallucination",
        ],
    },
    "Autonomous AI Agents & Production Deployment": {
        "lessons": [
            "Agentic Reasoning Frameworks: ReAct (Reason + Act), Plan-and-Solve & Reflection Loops",
            "Function Calling, Tool Execution, and API Integration (Structured Output Schemas)",
            "Model Serving & Latency Optimization with vLLM, Ollama & Streaming FastAPI Endpoints",
            "Evaluation, Guardrails, and Observability with LangSmith & OpenTelemetry",
        ],
        "resources": [
            {"title": "Anthropic Tool Use & Function Calling Guide", "url": "https://docs.anthropic.com/en/docs/tool-use", "type": "Documentation"},
            {"title": "vLLM High-Throughput Model Serving", "url": "https://docs.vllm.ai/", "type": "Guide"},
            {"title": "Llama 3 & Open Weights Deployment Playbook", "url": "https://github.com/meta-llama/llama", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build an autonomous research agent that queries SQL databases and web APIs to generate reports",
            "Deploy an asynchronous streaming LLM gateway with token streaming over Server-Sent Events (SSE)",
        ],
        "interview_prep": [
            "Explain the ReAct framework in LLM agents. (Combines reasoning traces with task-specific action execution and observation loops to handle multi-step tasks)",
            "How do you prevent infinite loops and runaway costs in autonomous AI agent loops? (Impose strict maximum step counts, token limits, and deterministic validation assertions)",
        ],
        "checkpoints": [
            "Agent successfully completes multi-step tool queries with deterministic error handling",
            "Streaming gateway responds with first token within 300ms",
        ],
    },

    # ── DevOps Blueprints ──
    "Linux Systems Administration": {
        "lessons": [
            "Linux Filesystem Hierarchy, File Permissions (chmod/chown) & ACLs",
            "Process Management (ps, top, kill), Signals & systemd Service Daemons",
            "Bash Shell Automation: Conditional Scripting, Cron Jobs & Log Rotation",
            "Secure Shell (SSH) Hardening: Key Pairs, ed25519 & Port Forwarding",
        ],
        "resources": [
            {"title": "Linux Documentation Project", "url": "https://tldp.org/", "type": "Documentation"},
            {"title": "Red Hat Enterprise Linux Administration Guide", "url": "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/", "type": "Guide"},
            {"title": "The Linux Command Line (William Shotts)", "url": "https://linuxcommand.org/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Write a production bash cron job monitoring disk usage and dispatching alert webhooks",
            "Create and manage a custom systemd background service with automatic restart on failure",
        ],
        "interview_prep": [
            "What happens during the Linux boot process? (BIOS/UEFI -> Bootloader GRUB -> Kernel init -> systemd PID 1 -> Target runlevels)",
            "Explain the difference between a hard link and a soft (symbolic) link. (Hard link points to the underlying inode directly; soft link points to the filename path)",
        ],
        "checkpoints": [
            "Can manage system services, inspect journalctl logs, and diagnose CPU bottlenecks",
            "Hardens server SSH access with passwordless ed25519 authentication",
        ],
    },
    "Networking & Protocols for Cloud Engineers": {
        "lessons": [
            "The OSI 7-Layer Model vs TCP/IP Protocol Stack",
            "DNS Resolution Lifecycle: Root, TLD, Authoritative Nameservers & Record Types",
            "Transport Protocols: TCP 3-Way Handshake, Flow Control, and UDP vs QUIC",
            "Reverse Proxies, SSL/TLS Termination, and Nginx Virtual Host Configuration",
        ],
        "resources": [
            {"title": "Cloudflare Learning: How Does the Internet Work?", "url": "https://www.cloudflare.com/learning/", "type": "Documentation"},
            {"title": "Nginx Official Beginner's Guide", "url": "https://nginx.org/en/docs/beginners_guide.html", "type": "Guide"},
            {"title": "High Performance Browser Networking (Ilya Grigorik)", "url": "https://hpbn.co/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Configure Nginx as a reverse proxy with automated Let's Encrypt SSL certificates",
            "Troubleshoot network drops and socket timeouts using curl, netstat, and tcpdump",
        ],
        "interview_prep": [
            "Explain the TCP 3-way handshake and connection teardown. (SYN -> SYN-ACK -> ACK to establish; FIN -> ACK -> FIN -> ACK to close)",
            "What happens when you type a URL into your browser? (DNS resolution -> TCP handshake -> TLS negotiation -> HTTP GET -> Server processing -> DOM rendering)",
        ],
        "checkpoints": [
            "Nginx successfully terminates TLS and proxies backend requests with correct HTTP headers",
            "Can read packet capture dumps to diagnose latency and connection resets",
        ],
    },
    "Docker & Container Architecture": {
        "lessons": [
            "Container Virtualization Internals: Namespaces, cgroups, and OverlayFS Layers",
            "Writing High-Performance Multi-Stage Dockerfiles with Cached Layers",
            "Multi-Service Orchestration with Docker Compose & Isolated Bridge Networks",
            "Container Image Vulnerability Scanning and Distroless Hardening",
        ],
        "resources": [
            {"title": "Docker Architecture Guide", "url": "https://docs.docker.com/get-started/overview/", "type": "Documentation"},
            {"title": "Google Container Best Practices", "url": "https://cloud.google.com/solutions/best-practices-for-building-containers", "type": "Guide"},
            {"title": "Trivy Vulnerability Scanner Docs", "url": "https://aquasecurity.github.io/trivy/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build a minimal non-root Docker container image scanning clean on vulnerability audits",
            "Orchestrate a Redis cache, PostgreSQL DB, and API backend using Docker Compose",
        ],
        "interview_prep": [
            "How do Linux cgroups and namespaces differ in container isolation? (Namespaces provide isolation of what processes see; cgroups enforce resource limits on what processes use)",
            "Explain Docker image layer caching and how Dockerfile instruction order affects build time. (Docker invalidates cache from the first modified instruction downward)",
        ],
        "checkpoints": [
            "Container builds reliably in under 30 seconds using cached layer optimizations",
            "Runs container workloads as an unprivileged non-root user",
        ],
    },
    "Kubernetes Cluster Orchestration": {
        "lessons": [
            "Kubernetes Core Architecture: Control Plane, Kubelet, Pods, and Deployments",
            "Networking: ClusterIP, NodePort, LoadBalancer, and Ingress Controllers",
            "State & Configuration Management: ConfigMaps, Secrets, and Persistent Volumes",
            "Application Packaging and Release Management with Helm Charts",
        ],
        "resources": [
            {"title": "Kubernetes Official Documentation", "url": "https://kubernetes.io/docs/home/", "type": "Documentation"},
            {"title": "Helm Package Manager Guide", "url": "https://helm.sh/docs/", "type": "Guide"},
            {"title": "Kubernetes Up & Running (Kelsey Hightower)", "url": "https://www.oreilly.com/library/view/kubernetes-up-and/9781492046523/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Deploy a resilient high-availability web service with rolling updates and readiness probes",
            "Package a multi-tier microservice architecture into a modular Helm chart with environment values",
        ],
        "interview_prep": [
            "What is the difference between a Liveness Probe and a Readiness Probe? (Liveness probe restarts a failed container; Readiness probe removes container from service endpoints until ready)",
            "How does a Kubernetes Deployment manage ReplicaSets during a rolling update? (Creates a new ReplicaSet and scales it up while scaling down old ReplicaSet)",
        ],
        "checkpoints": [
            "Workload survives simulated node failure without dropping incoming user traffic",
            "Helm deployment configures zero-downtime rolling upgrades",
        ],
    },
    "Terraform Infrastructure as Code": {
        "lessons": [
            "HashiCorp Configuration Language (HCL) Syntax, Variables & Output Values",
            "Terraform State Management, Remote Backends (S3 / GCS), and DynamoDB State Locking",
            "Building Modular Reusable Infrastructure Modules with Strict Input Constraints",
            "Terraform Lifecycle Rules, Drift Detection, and CI/CD Automation",
        ],
        "resources": [
            {"title": "Terraform Official Tutorials & Docs", "url": "https://developer.hashicorp.com/terraform/tutorials", "type": "Documentation"},
            {"title": "Terraform Best Practices (Anton Babenko)", "url": "https://www.terraform-best-practices.com/", "type": "Guide"},
            {"title": "AWS Provider for Terraform", "url": "https://registry.terraform.io/providers/hashicorp/aws/latest/docs", "type": "Reference"},
        ],
        "practice_tasks": [
            "Provision a complete VPC with public and private subnets using reusable Terraform modules",
            "Configure remote state storage in an S3 bucket with DynamoDB state locking",
        ],
        "interview_prep": [
            "What is state file drift in Terraform and how do you remediate it? (Discrepancy between actual cloud resources and state file; detected via 'terraform plan' and refreshed via 'terraform apply')",
            "Why is state locking critical in team environments? (Prevents concurrent apply executions from corrupting the single source of truth state)",
        ],
        "checkpoints": [
            "All cloud resources are 100% provisionable and destroyable via declarative Terraform code",
            "State is encrypted at rest with verified remote concurrency locking",
        ],
    },
    "AWS Cloud Architecture & Security": {
        "lessons": [
            "AWS VPC Networking: Subnets, Route Tables, Internet Gateways & NAT Gateways",
            "Identity & Access Management (IAM): Least Privilege, Roles, Policies & MFA",
            "Compute & Storage: EC2 Autoscaling, S3 Bucket Security & RDS Databases",
            "Cloud Security: AWS WAF, Security Groups, NACLs & AWS CloudTrail Auditing",
        ],
        "resources": [
            {"title": "AWS Well-Architected Framework", "url": "https://aws.amazon.com/architecture/well-architected/", "type": "Documentation"},
            {"title": "AWS IAM Best Practices Guide", "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html", "type": "Guide"},
            {"title": "AWS Solutions Library", "url": "https://aws.amazon.com/solutions/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Architect a highly available multi-AZ architecture with Auto Scaling Groups behind an Application Load Balancer",
            "Implement strict zero-trust IAM policies with role assumption for developer workstations",
        ],
        "interview_prep": [
            "Compare Security Groups vs Network Access Control Lists (NACLs). (Security groups are stateful and operate at instance level; NACLs are stateless and operate at subnet level)",
            "What is the AWS Shared Responsibility Model? (AWS manages security OF the cloud; customer manages security IN the cloud including data, OS, and firewalls)",
        ],
        "checkpoints": [
            "All private database and compute instances are inaccessible directly from the public internet",
            "IAM policies enforce strict principle of least privilege with zero wildcard admin access",
        ],
    },
    "Automated CI/CD Delivery Pipelines": {
        "lessons": [
            "Declarative CI/CD Pipelines: Testing, Artifact Versioning, and Release Gates",
            "GitOps Architecture with ArgoCD / Flux: Syncing Kubernetes State from Git",
            "Secrets Management in Pipelines (Vault / Sealed Secrets / GitHub Secrets)",
            "Deployment Strategies: Blue/Green Deployments, Canary Releases & Automated Rollbacks",
        ],
        "resources": [
            {"title": "ArgoCD Official Documentation", "url": "https://argo-cd.readthedocs.io/", "type": "Documentation"},
            {"title": "GitOps Principles and Workflows (OpenGitOps)", "url": "https://opengitops.net/", "type": "Guide"},
            {"title": "GitHub Actions for Production Deployments", "url": "https://docs.github.com/en/actions/deployment", "type": "Reference"},
        ],
        "practice_tasks": [
            "Build an automated GitHub Actions pipeline compiling code, building Docker images, and tagging semver releases",
            "Configure ArgoCD to synchronize Kubernetes cluster state automatically upon merging to main",
        ],
        "interview_prep": [
            "What is GitOps and why is it preferred over traditional push-based CI/CD? (Git is the single source of truth; cluster pull-based agents detect drift and reconcile state securely)",
            "How does a Canary deployment mitigate production release risks? (Routes a small percentage of user traffic to the new version, verifying error rates before full rollout)",
        ],
        "checkpoints": [
            "Deployment pipeline executes end-to-end within 5 minutes without manual steps",
            "Automated rollback triggers immediately if error rates spike after rollout",
        ],
    },
    "Observability, Monitoring & Alerting": {
        "lessons": [
            "The Three Pillars of Observability: Metrics, Structured Logs & Distributed Traces",
            "Prometheus Time-Series Architecture, Metric Types (Counter, Gauge, Histogram) & PromQL",
            "Visualizing System Health with Interactive Grafana Dashboards",
            "Alerting Rules with Prometheus Alertmanager and SLO/SLA Error Budgets",
        ],
        "resources": [
            {"title": "Prometheus Monitoring System Docs", "url": "https://prometheus.io/docs/introduction/overview/", "type": "Documentation"},
            {"title": "Grafana Dashboards & Visualization Tutorials", "url": "https://grafana.com/docs/grafana/latest/", "type": "Guide"},
            {"title": "Google SRE Book: Monitoring Distributed Systems", "url": "https://sre.google/sre-book/monitoring-distributed-systems/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Instrument an API backend with custom Prometheus metrics tracking HTTP request latency and error counts",
            "Design an executive Grafana dashboard monitoring the 4 Golden Signals (Latency, Traffic, Errors, Saturation)",
        ],
        "interview_prep": [
            "Explain the difference between a Counter and a Gauge in Prometheus. (A Counter is monotonically increasing and only resets on restart; a Gauge can fluctuate up and down)",
            "What are the 4 Golden Signals in SRE monitoring? (Latency, Traffic, Errors, and Saturation)",
        ],
        "checkpoints": [
            "Grafana visualizes real-time metrics with under 15-second scrape latency",
            "Alertmanager fires notifications to Slack / PagerDuty upon SLA budget breaches",
        ],
    },

    # ── Outcome Phases ──
    "Technical Interview Drills & Problem Solving": {
        "lessons": [
            "High-Frequency Data Structures: Hash Maps, Linked Lists, Trees, Graphs & Heaps",
            "Algorithmic Problem-Solving Patterns: Two Pointers, Sliding Window & Dynamic Programming",
            "Time & Space Complexity Analysis (Big-O Notation) under Timed Whiteboard Conditions",
            "Behavioral Interview Strategy: STAR Method (Situation, Task, Action, Result)",
        ],
        "resources": [
            {"title": "NeetCode / LeetCode Roadmap & Patterns", "url": "https://neetcode.io/roadmap", "type": "Documentation"},
            {"title": "Tech Interview Handbook (Yangshun Tay)", "url": "https://www.techinterviewhandbook.org/", "type": "Guide"},
            {"title": "Cracking the Coding Interview Summary", "url": "https://www.crackingthecodinginterview.com/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Solve 25 top technical interview algorithmic challenges within a 25-minute per problem window",
            "Conduct a timed 45-minute peer mock technical interview explaining trade-offs out loud",
        ],
        "interview_prep": [
            "How do you determine whether to use BFS vs DFS on a graph problem? (BFS finds the shortest path on unweighted graphs; DFS is ideal for deep traversal and backtracking)",
            "Explain the difference between QuickSort and MergeSort. (MergeSort guarantees O(N log N) but requires O(N) extra space; QuickSort is in-place but has O(N^2) worst case)",
        ],
        "checkpoints": [
            "Solves medium algorithmic challenges with clean, optimal O(N) or O(N log N) implementations",
            "Delivers structured STAR behavioral responses with measurable business metrics",
        ],
    },
    "System Architecture Defense & Resume Polish": {
        "lessons": [
            "High-Level System Design: Load Balancers, Caching (Redis), Message Queues & Partitioning",
            "Designing for Scalability, Availability (99.99%), and Data Consistency (CAP Theorem)",
            "Resume Bullet Point Engineering: Google XYZ Formula (Accomplished X measured by Y via Z)",
            "GitHub Portfolio Curation: README Visuals, Architecture Diagrams & Clean Git Commit History",
        ],
        "resources": [
            {"title": "System Design Primer (Donne Martin)", "url": "https://github.com/donnemartin/system-design-primer", "type": "Documentation"},
            {"title": "C4 Model for Software Architecture Diagrams", "url": "https://c4model.com/", "type": "Guide"},
            {"title": "ByteByteGo System Design System", "url": "https://bytebytego.com/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Draft a comprehensive system design document with C4 architecture diagrams for a scalable URL shortener",
            "Rewrite engineering resume bullets using quantifiable impact metrics and action verbs",
        ],
        "interview_prep": [
            "Explain the CAP Theorem and its implications for distributed database selection. (A distributed system can guarantee at most two out of Consistency, Availability, and Partition Tolerance)",
            "How do you scale a database when read volume exceeds single-server capacity? (Implement read replicas behind a load balancer and caching layers via Redis)",
        ],
        "checkpoints": [
            "Can defend architectural tradeoffs (sync vs async, SQL vs NoSQL) under interview pressure",
            "GitHub portfolio displays polished READMEs with live deployed demo links",
        ],
    },
    "Client Scoping & Payment Integration": {
        "lessons": [
            "Client Project Scoping, Deliverable Breakdown & Milestone Billing Contracts",
            "Payment Processing Integration with Stripe Checkout and Subscription Webhooks",
            "Headless CMS (Strapi / Sanity) Client Hand-off Architecture",
            "Statement of Work (SOW) Drafting & Scope Creep Protection Protocols",
        ],
        "resources": [
            {"title": "Stripe API Documentation & Checkout Quickstart", "url": "https://stripe.com/docs/api", "type": "Documentation"},
            {"title": "Strapi Headless CMS Documentation", "url": "https://docs.strapi.io/", "type": "Guide"},
            {"title": "The Freelance Developer Contract Playbook", "url": "https://github.com/kossnocorp/freelance-contract", "type": "Reference"},
        ],
        "practice_tasks": [
            "Integrate Stripe payments and secure webhook listener handling subscription events",
            "Build a headless CMS integration enabling client content updates with zero code changes",
        ],
        "interview_prep": [
            "How do you handle idempotent webhook processing with payment processors like Stripe? (Track and verify event IDs in database before processing transactions)",
            "How do you manage client scope creep during fixed-price milestones? (Require written change orders with explicit hourly estimates before starting out-of-scope work)",
        ],
        "checkpoints": [
            "Successfully processes test card transactions and dispatches automated invoice receipts",
            "Client CMS configuration allows content updates with instant preview",
        ],
    },
    "Production SaaS Multi-tenancy & Telemetry": {
        "lessons": [
            "Multi-Tenant Database Architectures: Row-Level Security vs Schema-Per-Tenant",
            "Centralized Error Tracking, Crash Reporting & Performance Profiling with Sentry",
            "Product Telemetry, Funnel Analysis & Event Tracking with PostHog",
            "Production Cloud Scaling, Automated Health Probes & Load Testing (k6)",
        ],
        "resources": [
            {"title": "PostgreSQL Row Level Security (RLS) Guide", "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "type": "Documentation"},
            {"title": "Sentry Error Monitoring Documentation", "url": "https://docs.sentry.io/", "type": "Guide"},
            {"title": "k6 Open Source Load Testing Tool", "url": "https://k6.io/docs/", "type": "Reference"},
        ],
        "practice_tasks": [
            "Implement multi-tenant data isolation enforcing strict tenant context on all SQL queries",
            "Execute automated k6 load test simulating 500 concurrent users without database deadlocks",
        ],
        "interview_prep": [
            "Compare Row-Level Security (RLS) vs Separate Database per Tenant for SaaS. (RLS is cost-effective and easier to maintain; separate DB offers highest compliance and data isolation)",
            "How do you trace user sessions across microservices in distributed telemetry? (Inject and propagate unique trace and span IDs via W3C TraceContext HTTP headers)",
        ],
        "checkpoints": [
            "Verifies complete tenant isolation: tenant A cannot query tenant B records under any circumstances",
            "Load testing verifies 99th percentile response time stays under 200ms at peak load",
        ],
    },
}


def enrich_milestone_content(
    title: str,
    category: str = "General",
    skills: list[str] | None = None,
    preferred_language: str | None = None,
    current_skills: list[str] | None = None,
) -> dict[str, Any]:
    """Provide tailored lessons, curated resources, practice tasks, interview prep, and checkpoints."""
    skills = skills or []
    lang_key = preferred_language.strip().lower() if preferred_language else None

    # Check language adaptation for backend/programming milestones
    is_backend_milestone = "backend" in title.lower() or "rest api" in title.lower()
    if is_backend_milestone and lang_key:
        matched_lang = None
        for k in LANGUAGE_BACKEND_CURRICULUM:
            if k in lang_key or lang_key in k:
                matched_lang = k
                break
        if matched_lang:
            custom_spec = LANGUAGE_BACKEND_CURRICULUM[matched_lang]
            return {
                "title": custom_spec["title"],
                "skills": custom_spec["skills"],
                "lessons": custom_spec["lessons"],
                "resources": custom_spec["resources"],
                "practice_tasks": custom_spec["practice_tasks"],
                "interview_prep": custom_spec["interview_prep"],
                "checkpoints": custom_spec["checkpoints"],
            }

    # Check curated registry for milestone title
    if title in CURATED_MILESTONE_CONTENT:
        base = CURATED_MILESTONE_CONTENT[title]
        return {
            "title": title,
            "skills": skills,
            "lessons": list(base["lessons"]),
            "resources": list(base["resources"]),
            "practice_tasks": list(base["practice_tasks"]),
            "interview_prep": list(base["interview_prep"]),
            "checkpoints": list(base["checkpoints"]),
        }

    # Dynamic fallback generator for any custom or synthesized milestone
    primary_skill = skills[0] if skills else title
    sec_skill = skills[1] if len(skills) > 1 else "Architecture"
    third_skill = skills[2] if len(skills) > 2 else "Best Practices"

    lessons = [
        f"Core Foundations & Principles of {title}",
        f"Architectural Patterns & Component Structuring with {primary_skill}",
        f"State Management, Error Boundaries, and Resilience in {sec_skill}",
        f"Production Engineering, Testing & Performance Optimization for {third_skill}",
    ]

    resources = [
        {"title": f"Official {primary_skill} Documentation & Reference", "url": f"https://devdocs.io/#q={primary_skill.lower()}", "type": "Documentation"},
        {"title": f"Best Practices & Architectural Guide for {title}", "url": "https://developer.mozilla.org/", "type": "Guide"},
        {"title": f"{primary_skill} Engineering Patterns & Standards", "url": "https://github.com/", "type": "Reference"},
    ]

    practice_tasks = [
        f"Construct a hands-on production deliverable demonstrating mastery in {primary_skill}",
        f"Write comprehensive automated unit and integration tests verifying {sec_skill} functionality",
    ]

    interview_prep = [
        f"Explain core architectural trade-offs when designing systems using {primary_skill}. (Evaluates complexity, maintainability, and runtime efficiency)",
        f"How do you handle production error boundaries and edge failure cases in {sec_skill}? (Requires defense-in-depth, graceful fallbacks, and structured logging)",
    ]

    checkpoints = [
        f"Successfully deploys working deliverable utilizing {primary_skill} with passing test suite",
        f"Demonstrates clear understanding of {title} concepts during peer review or technical evaluation",
    ]

    return {
        "title": title,
        "skills": skills,
        "lessons": lessons,
        "resources": resources,
        "practice_tasks": practice_tasks,
        "interview_prep": interview_prep,
        "checkpoints": checkpoints,
    }

"""Milestone Quiz Engine for Technea AI.

Generates scenario-based diagnostic and retention quizzes strictly calibrated to:
1. Current milestone (e.g. 'Object-Oriented Design Patterns' -> Encapsulation, Polymorphism, Factory, Strategy, SOLID principles).
2. Current lesson or completed concepts.
3. Learner skill level (Beginner, Intermediate, Advanced).

Each quiz question features:
- Realistic engineering scenario
- 4 options (A, B, C, D)
- Concise technical explanation
- Interactive answering tip (💡)
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
import random
import re
from typing import Any


@dataclass
class QuizQuestion:
    """A scenario-based multiple choice question."""

    id: int
    concept: str
    scenario: str
    question: str
    options: dict[str, str]  # Keys: "A", "B", "C", "D"
    correct_option: str  # "A", "B", "C", or "D"
    explanation: str
    answering_tip: str

    def to_dict(self) -> dict[str, Any]:
        """Convert question to dictionary."""
        return asdict(self)


@dataclass
class Quiz:
    """A generated milestone quiz."""

    milestone: str
    lesson: str | None
    difficulty: str
    concepts: list[str]
    questions: list[QuizQuestion]

    def to_dict(self) -> dict[str, Any]:
        """Convert quiz to dictionary representation."""
        return {
            "milestone": self.milestone,
            "lesson": self.lesson,
            "difficulty": self.difficulty,
            "concepts": self.concepts,
            "total_questions": len(self.questions),
            "questions": [q.to_dict() for q in self.questions],
        }

    def to_markdown(self) -> str:
        """Render quiz as clean, interactive GitHub-flavored markdown."""
        lines: list[str] = [
            f"### 📝 Milestone Quiz: {self.milestone}",
            f"*Calibrated Level: {self.difficulty} | Focus: {', '.join(self.concepts)}*\n",
            "Test your active recall with these practical engineering scenarios:\n",
        ]

        for q in self.questions:
            lines.append(f"#### Question {q.id} ({q.concept})")
            lines.append(f"**Scenario:** {q.scenario}\n")
            lines.append(f"**Question:** {q.question}\n")
            for opt_key, opt_val in q.options.items():
                lines.append(f"- **{opt_key})** {opt_val}")
            lines.append(f"\n> {q.answering_tip}\n")

        # Solution / Explanations Section
        lines.append("<details>")
        lines.append("<summary><b>🔍 View Answer Key & Explanations</b></summary>\n")
        for q in self.questions:
            lines.append(f"**Question {q.id} Answer: Option {q.correct_option}**")
            lines.append(f"- *Explanation*: {q.explanation}\n")
        lines.append("</details>")

        return "\n".join(lines)


class QuizEngine:
    """Milestone Quiz Engine generating level-calibrated scenario quizzes."""

    # Curated Question Bank organized by Milestone Topic and Difficulty Level
    QUESTION_BANK: dict[str, dict[str, list[dict[str, Any]]]] = {
        "oop": {
            "Beginner": [
                {
                    "concept": "Encapsulation",
                    "scenario": (
                        "You are building a BankAccount class. Currently, other developers can directly set "
                        "`account.balance = -5000` from any external module, creating overdraft bugs via an unencapsulated state anti-pattern."
                    ),
                    "question": "How should you apply Encapsulation to protect the account balance and avoid this anti-pattern?",
                    "options": {
                        "A": "Make the balance public and add an inline comment asking developers not to assign negative numbers.",
                        "B": "Make the attribute private (e.g., `_balance`) and provide controlled `deposit()` and `withdraw()` methods with validation.",
                        "C": "Inherit from a global BalanceValidator class that overrides all assignments dynamically.",
                        "D": "Store all balances in an external global dictionary accessible across threads.",
                    },
                    "correct_option": "B",
                    "explanation": (
                        "Encapsulation bundles data and the methods that operate on that data within a class, "
                        "restricting direct external access via private attributes (`_balance`) and exposing validated methods to eliminate anti-patterns."
                    ),
                    "answering_tip": "💡 Consider the architectural trade-off of hiding internal state vs. exposing raw public fields.",
                },
                {
                    "concept": "Polymorphism",
                    "scenario": (
                        "You have a notifications module with EmailNotification and SMSNotification classes. Both classes "
                        "need to be triggered by an AlertService without the service checking the exact class type."
                    ),
                    "question": "What object-oriented principle allows AlertService to call `.send()` on either object uniformly?",
                    "options": {
                        "A": "Polymorphism, allowing subclasses or interface implementers to define their own version of `.send()`.",
                        "B": "Encapsulation, which merges SMS and Email into one single mega-class.",
                        "C": "Static Dispatch, which evaluates all types at compile time.",
                        "D": "Multiple Inheritance, requiring every notification to inherit from a socket handler.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Polymorphism allows different classes to implement the same interface or method signature (`send()`), "
                        "enabling callers to interact with them interchangeably without inspecting their concrete type."
                    ),
                    "answering_tip": "💡 Think about 'many forms'—calling the same method name on different objects with custom behaviors.",
                },
                {
                    "concept": "SOLID: Single Responsibility Principle",
                    "scenario": (
                        "A `UserProfile` class currently manages user data, formats HTML for web pages, "
                        "and executes SQL queries directly to save users to PostgreSQL."
                    ),
                    "question": "Which principle does this violate, and what is the proper refactoring step?",
                    "options": {
                        "A": "Violates Liskov Substitution Principle; add default parameters to all methods.",
                        "B": "Violates Single Responsibility Principle; split into a domain Model, a Repository for SQL, and a Template Presenter.",
                        "C": "Violates Open/Closed Principle; wrap all SQL queries in try/except blocks.",
                        "D": "Violates Dependency Inversion; make all database methods static.",
                    },
                    "correct_option": "B",
                    "explanation": (
                        "The Single Responsibility Principle (SRP) states a class should have one, and only one, reason to change. "
                        "Mixing persistence (SQL), domain state, and presentation (HTML) violates SRP."
                    ),
                    "answering_tip": "💡 Ask yourself: how many different actors (database admin, UI designer, business analyst) could request changes to this class?",
                },
                {
                    "concept": "Factory Pattern",
                    "scenario": (
                        "Your application connects to different cloud storage providers (AWS S3, Google Cloud Storage, Local Disk) "
                        "based on an environment configuration string `STORAGE_PROVIDER`."
                    ),
                    "question": "Which design pattern centralizes this instantiation logic without coupling caller code to concrete classes?",
                    "options": {
                        "A": "Factory Method Pattern",
                        "B": "Singleton Pattern",
                        "C": "Prototype Pattern",
                        "D": "Decorator Pattern",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "The Factory Method Pattern defines an interface for creating an object, but lets the factory decide "
                        "which concrete class (S3Storage, GCSStorage, LocalStorage) to instantiate based on runtime configuration."
                    ),
                    "answering_tip": "💡 Look for a pattern that acts as a centralized 'creator' based on parameters.",
                },
            ],
            "Intermediate": [
                {
                    "concept": "Strategy Pattern",
                    "scenario": (
                        "An e-commerce checkout service calculates shipping fees. Currently, a 50-line `if/elif/else` chain checks "
                        "`if country == 'US'`, `elif shipping_type == 'EXPRESS'`, etc. Adding a new carrier requires modifying this core method."
                    ),
                    "question": "How should the Strategy Pattern be implemented to resolve this design smell?",
                    "options": {
                        "A": "Define a `ShippingStrategy` interface with `.calculate(order)`, create concrete strategy classes for each carrier, and inject the selected strategy into the checkout service.",
                        "B": "Subclass the entire Order class for every possible carrier and country combination.",
                        "C": "Create a Singleton ShippingManager that executes carrier shell commands directly.",
                        "D": "Store all shipping calculation formulas in raw JSON and parse them with `eval()`.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "The Strategy Pattern encapsulates interchangeable algorithms inside separate classes that implement a common interface. "
                        "This adheres to the Open/Closed Principle by allowing new carriers without modifying checkout code."
                    ),
                    "answering_tip": "💡 The Strategy Pattern separates the algorithm from the context using it.",
                },
                {
                    "concept": "SOLID: Open/Closed Principle",
                    "scenario": (
                        "You have a `ReportGenerator` class. Every time marketing requests a new export format (CSV, PDF, Excel), "
                        "engineers must edit `ReportGenerator.generate()` by adding another `elif format == '...'` block."
                    ),
                    "question": "How can you make `ReportGenerator` open for extension but closed for modification?",
                    "options": {
                        "A": "Pass a raw function pointer to `ReportGenerator` and remove class hierarchies completely.",
                        "B": "Define a `ReportExporter` interface and register concrete exporter instances in an export registry or dependency container.",
                        "C": "Merge all export logic into a single database stored procedure.",
                        "D": "Catch invalid format exceptions and default to plaintext output.",
                    },
                    "correct_option": "B",
                    "explanation": (
                        "The Open/Closed Principle (OCP) requires classes to be open for extension (adding new exporters) but closed for modification. "
                        "A polymorphic exporter interface or registry allows adding PDF/CSV exporters without touching the core generator."
                    ),
                    "answering_tip": "💡 New features should mean writing new classes, not editing existing battle-tested classes.",
                },
                {
                    "concept": "SOLID: Liskov Substitution Principle",
                    "scenario": (
                        "You have a base class `ReadOnlyDatabaseConnection` with a `.query()` method. A developer creates a subclass "
                        "`WritableDatabaseConnection` that overrides `.query()` but throws a `NotImplementedError` if a query starts with `SELECT`."
                    ),
                    "question": "Why does this violate the Liskov Substitution Principle (LSP)?",
                    "options": {
                        "A": "Subclasses must strictly add more lines of code than their parent classes.",
                        "B": "Objects of a superclass should be replaceable with objects of a subclass without altering the correctness of the program; breaking expected contracts breaks callers.",
                        "C": "Database connections cannot use inheritance in Python.",
                        "D": "Subclasses must always be marked as abstract.",
                    },
                    "correct_option": "B",
                    "explanation": (
                        "LSP states that subtypes must be substitutable for their base types. If a subclass weakens preconditions, "
                        "strengthens postconditions, or throws unexpected exceptions on inherited methods, it breaks LSP."
                    ),
                    "answering_tip": "💡 If it looks like a duck and quacks like a duck, but explodes when you swim, LSP is violated.",
                },
                {
                    "concept": "SOLID: Dependency Inversion Principle",
                    "scenario": (
                        "An `OrderService` directly instantiates `self.repository = PostgresOrderRepository()` inside its `__init__` method. "
                        "When writing unit tests, you cannot test `OrderService` without spinning up a live PostgreSQL instance."
                    ),
                    "question": "How should Dependency Inversion be applied to make `OrderService` testable and modular?",
                    "options": {
                        "A": "Have `OrderService` depend on an `OrderRepositoryInterface`, and inject the concrete repository instance via constructor injection.",
                        "B": "Create a global SQLite database that mimics PostgreSQL during tests.",
                        "C": "Use monkeypatching in every test file to overwrite internal Postgres methods.",
                        "D": "Delete `OrderRepository` and put raw SQL directly in the FastAPI controller.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Dependency Inversion Principle (DIP) states that high-level modules (OrderService) should not depend on low-level modules (PostgresOrderRepository). "
                        "Both should depend on abstractions (OrderRepositoryInterface) injected from the outside."
                    ),
                    "answering_tip": "💡 Invert the control: pass dependencies in rather than constructing them internally.",
                },
            ],
            "Advanced": [
                {
                    "concept": "Abstract Factory & Architecture",
                    "scenario": (
                        "You are architecting a cross-platform GUI framework supporting macOS, Windows, and Linux. "
                        "Each platform requires cohesive families of related UI widgets (Buttons, Menus, Scrollbars) that match platform styling."
                    ),
                    "question": "Why is the Abstract Factory Pattern preferred over multiple standalone Simple Factories here?",
                    "options": {
                        "A": "Abstract Factory enforces that products from the same platform family (e.g., MacButton with MacScrollbar) are always used together without mismatched components.",
                        "B": "Abstract Factory eliminates the need for interfaces or abstract base classes.",
                        "C": "Abstract Factory automatically parallelizes widget rendering across GPU threads.",
                        "D": "Abstract Factory reduces memory footprint by converting all widgets into singletons.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Abstract Factory provides an interface for creating families of related or dependent objects without specifying "
                        "their concrete classes, guaranteeing that widget families remain mutually consistent."
                    ),
                    "answering_tip": "💡 Look for 'families of related products' where mixing and matching would cause bugs.",
                },
                {
                    "concept": "Observer vs Pub-Sub Trade-offs",
                    "scenario": (
                        "In an event-driven architecture with high concurrency, you need to decouple event producers from 15+ downstream analytics, "
                        "email, and auditing services."
                    ),
                    "question": "What is the primary architectural trade-off between the in-memory Observer Pattern and an asynchronous Pub-Sub message broker (e.g. RabbitMQ/Kafka)?",
                    "options": {
                        "A": "Observer has zero network overhead and immediate consistency within one process, but couples execution to the producer's thread; Pub-Sub provides backpressure and horizontal scalability at the cost of network latency and eventual consistency.",
                        "B": "Observer handles distributed transactions natively, while Pub-Sub cannot handle JSON payloads.",
                        "C": "Pub-Sub is strictly synchronous, whereas Observer is strictly asynchronous across nodes.",
                        "D": "Observer patterns cannot be implemented in compiled languages like Go or Rust.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Observer is an in-memory design pattern that runs synchronously within process boundaries. Distributed Pub-Sub brokers "
                        "decouple execution time, memory space, and availability, enabling horizontal scaling and persistence."
                    ),
                    "answering_tip": "💡 Weigh in-process coupling and latency against distributed scalability and eventual consistency.",
                },
                {
                    "concept": "Decorator vs Proxy Pattern",
                    "scenario": (
                        "You want to add distributed tracing, latency metrics, and exponential backoff retries around database calls "
                        "without altering the existing DatabaseClient class."
                    ),
                    "question": "Which design pattern is best suited for wrapping the object to dynamically add responsibilities and cross-cutting concerns?",
                    "options": {
                        "A": "Decorator Pattern, wrapping the underlying client with identical interface while layering additional telemetry and retry behavior.",
                        "B": "Adapter Pattern, converting the database SQL syntax into GraphQL.",
                        "C": "Flyweight Pattern, sharing immutable database connection strings.",
                        "D": "Facade Pattern, reducing the client down to a single parameterless method.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "The Decorator Pattern attaches additional responsibilities to an object dynamically. Decorators provide a flexible "
                        "alternative to subclassing for extending functionality like metrics, logging, and retries."
                    ),
                    "answering_tip": "💡 Decorators add responsibilities; Adapters change interfaces; Proxies control access.",
                },
            ],
        },
        "api": {
            "Beginner": [
                {
                    "concept": "REST HTTP Status Codes",
                    "scenario": (
                        "A client submits a POST request to `/api/v1/users` with missing required fields (e.g. missing `email`). "
                        "Your API currently returns HTTP 500 Internal Server Error."
                    ),
                    "question": "Which HTTP status code should your API return to indicate client input validation failure?",
                    "options": {
                        "A": "200 OK with error message in body",
                        "B": "400 Bad Request (or 422 Unprocessable Entity)",
                        "C": "404 Not Found",
                        "D": "502 Bad Gateway",
                    },
                    "correct_option": "B",
                    "explanation": (
                        "400 Bad Request indicates client-side syntax/input errors, and 422 Unprocessable Entity is used by frameworks like FastAPI "
                        "when JSON syntax is valid but semantic fields fail validation. 500 indicates server bugs."
                    ),
                    "answering_tip": "💡 4xx codes represent client errors; 5xx represent server errors.",
                },
                {
                    "concept": "HTTP Methods & Idempotency",
                    "scenario": (
                        "A payment mobile client experiences an intermittent cellular network timeout while charging a customer. "
                        "The app automatically retries the request."
                    ),
                    "question": "Why is POST considered non-idempotent, and how do production payment APIs prevent double-charging?",
                    "options": {
                        "A": "POST creates new resources on each invocation; payment APIs use unique Idempotency Keys in headers to ensure duplicate requests return cached results.",
                        "B": "POST requests cannot send JSON payloads more than once per minute.",
                        "C": "POST is idempotent by definition according to the HTTP specification.",
                        "D": "Clients should change the request to GET so the payment is read-only.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "POST is non-idempotent because repeated identical calls create multiple resources. Payment gateways enforce idempotency keys "
                        "(e.g., UUIDs in headers) to detect and safely ignore duplicate submissions."
                    ),
                    "answering_tip": "💡 Idempotent means calling the operation multiple times produces the exact same side-effect as calling it once.",
                },
                {
                    "concept": "Authentication Tokens",
                    "scenario": (
                        "Your API uses JSON Web Tokens (JWT) for authentication. After a user logs in, the frontend receives a token "
                        "and needs to call protected endpoints."
                    ),
                    "question": "In standard REST conventions, where should the client pass this authentication token?",
                    "options": {
                        "A": "In the `Authorization` header as `Bearer <token>`",
                        "B": "Appended to every URL as a query parameter `?token=<token>`",
                        "C": "Inside the body of every GET request",
                        "D": "In the `User-Agent` header",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "The standard HTTP authorization convention is passing the JWT token in the `Authorization: Bearer <token>` header, "
                        "preventing token leakage in server access logs or browser history."
                    ),
                    "answering_tip": "💡 Remember RFC 6750: Authorization: Bearer <token>.",
                },
            ],
            "Intermediate": [
                {
                    "concept": "Database Connection Pooling",
                    "scenario": (
                        "During peak traffic hours, your FastAPI service begins throwing `OperationalError: too many connections to PostgreSQL` "
                        "and latency spikes from 30ms to 4000ms."
                    ),
                    "question": "What is the primary cause and recommended architectural fix?",
                    "options": {
                        "A": "Each request is opening a fresh raw database connection without connection pooling; configure an asynchronous connection pool (e.g., SQLAlchemy AsyncEngine pool_size and max_overflow).",
                        "B": "PostgreSQL can only handle 10 total users; migrate to SQLite immediately.",
                        "C": "Disable SSL verification on all database sockets.",
                        "D": "Cache all database tables in browser localStorage.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Opening raw TCP connections to PostgreSQL for every HTTP request is expensive and quickly exhausts database connection limits. "
                        "Connection pools reuse a fixed set of open connections across concurrent requests."
                    ),
                    "answering_tip": "💡 Reusing connections is vastly faster than opening and handshaking fresh sockets on every request.",
                },
                {
                    "concept": "Mitigating N+1 Query Problem",
                    "scenario": (
                        "An endpoint `/api/v1/posts` returns 50 posts along with their author details. When inspecting database logs, "
                        "you observe 1 query to fetch posts, followed by 50 individual queries fetching authors."
                    ),
                    "question": "What is this performance issue, and how do you resolve it in SQLAlchemy?",
                    "options": {
                        "A": "N+1 query problem; use eager loading with `selectinload` or `joinedload` to fetch authors in a single optimized join or batch.",
                        "B": "Deadlock condition; wrap each author query in a transaction savepoint.",
                        "C": "SQL injection vulnerability; sanitize post IDs with regex.",
                        "D": "Database index fragmentation; rebuild the primary key table.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "The N+1 problem occurs when an ORM lazily loads relationships inside a loop. Eager loading via `joinedload` or `selectinload` "
                        "fetches all related records in 1 or 2 batch queries."
                    ),
                    "answering_tip": "💡 Look for 'eager loading' to turn N separate roundtrips into a single coordinated query.",
                },
            ],
            "Advanced": [
                {
                    "concept": "Distributed Rate Limiting",
                    "scenario": (
                        "You run a multi-replica Kubernetes cluster of API servers. You must enforce a strict rate limit of 100 requests "
                        "per minute per API key across all pods."
                    ),
                    "question": "Which algorithm and storage strategy guarantees consistent rate limiting across all pods?",
                    "options": {
                        "A": "Token Bucket or Sliding Window Log implemented in a central Redis instance using atomic Lua scripts.",
                        "B": "An in-memory dictionary inside each Python pod's process memory.",
                        "C": "Writing rate limit timestamps to a flat text file on a shared NFS mount.",
                        "D": "Counting requests in the client's browser cookies.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "In-memory tracking fails across multi-node clusters. A centralized in-memory store like Redis running atomic Lua scripts "
                        "guarantees race-condition-free sliding window or token bucket rate limiting."
                    ),
                    "answering_tip": "💡 Multi-node clusters require atomic centralized coordination.",
                },
            ],
        },
        "devops": {
            "Beginner": [
                {
                    "concept": "Container Isolation",
                    "scenario": (
                        "A junior engineer asks whether running an application inside Docker is identical to spinning up a virtual machine."
                    ),
                    "question": "What is the key architectural difference between Docker containers and Virtual Machines (VMs)?",
                    "options": {
                        "A": "Containers share the host OS kernel and isolate user space processes, making them lightweight and fast to boot; VMs include a full guest OS on a hypervisor.",
                        "B": "VMs share the host kernel, whereas containers emulate complete hardware BIOS.",
                        "C": "Containers only run on Linux, while VMs only run on Windows.",
                        "D": "There is no difference; Docker is just a marketing term for VMware.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Containers virtualize at the OS layer (sharing the host Linux kernel via cgroups and namespaces). "
                        "VMs virtualize at the hardware layer via a hypervisor and run full guest OS instances."
                    ),
                    "answering_tip": "💡 Kernel sharing vs Hypervisor hardware virtualization.",
                },
                {
                    "concept": "Dockerfile Optimization",
                    "scenario": (
                        "Your Python Docker image is currently 1.4 GB and builds slowly because `pip install` runs every time any source code file changes."
                    ),
                    "question": "How should you order Dockerfile instructions to leverage Docker build layer caching?",
                    "options": {
                        "A": "Copy `requirements.txt` first, run `pip install`, and only then copy the rest of your source code.",
                        "B": "Copy all application files on line 1 of the Dockerfile.",
                        "C": "Run `pip install` in a separate container and volume mount it.",
                        "D": "Disable Docker cache with `--no-cache` on every build.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Docker caches layers sequentially. By copying `requirements.txt` and installing dependencies before copying source code, "
                        "the heavy dependency installation step is cached until `requirements.txt` actually changes."
                    ),
                    "answering_tip": "💡 Put slow, infrequently changing instructions before fast, frequently changing source code copies.",
                },
            ],
            "Intermediate": [
                {
                    "concept": "Kubernetes Health Checks",
                    "scenario": (
                        "Your FastAPI pod takes 45 seconds to initialize ML models on startup. Currently, Kubernetes routes traffic "
                        "immediately upon pod creation, causing users to see HTTP 502 errors for 45 seconds."
                    ),
                    "question": "Which Kubernetes probe configuration prevents traffic from reaching the pod until initialization finishes?",
                    "options": {
                        "A": "Readiness Probe configured to check an `/health/ready` endpoint, holding traffic until it returns 200 OK.",
                        "B": "Liveness Probe configured to immediately kill and restart the container.",
                        "C": "Setting pod CPU limit to 100 cores.",
                        "D": "Manual pod port-forwarding by system administrators.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Readiness Probes determine when a container is ready to accept incoming network traffic. "
                        "Liveness Probes determine if a container needs to be restarted due to deadlocks."
                    ),
                    "answering_tip": "💡 Readiness governs traffic routing; Liveness governs container restart/recovery.",
                },
            ],
            "Advanced": [
                {
                    "concept": "Zero-Downtime Deployment Strategies",
                    "scenario": (
                        "You need to roll out a major API release with zero customer downtime and immediate rollback capability "
                        "if error rates exceed 0.5%."
                    ),
                    "question": "Which deployment strategy provides immediate instant cutover and zero-downtime rollback?",
                    "options": {
                        "A": "Blue-Green Deployment with a router/load-balancer switching traffic from Blue to Green once Green passes smoke tests.",
                        "B": "Recreate deployment strategy (terminate all old pods before creating new ones).",
                        "C": "Directly SSHing into live pods and running `git pull`.",
                        "D": "Deleting the Kubernetes cluster and rebuilding from Terraform.",
                    },
                    "correct_option": "A",
                    "explanation": (
                        "Blue-Green deployment provisions identical production environments (Green) side-by-side with Blue. "
                        "After verification, the load balancer switches traffic instantaneously, with Blue standing by for instantaneous rollback."
                    ),
                    "answering_tip": "💡 Two identical production environments with a switch at the traffic router.",
                },
            ],
        },
        "sql": {
            "Beginner": [
                {
                    "concept": "SQL Joins",
                    "scenario": (
                        "You need to fetch all registered users and their orders. Some users have not placed any "
                        "orders yet, but they must still appear in the result set with NULL values for order columns."
                    ),
                    "question": "Which SQL JOIN clause should you use to preserve all rows from the users table?",
                    "options": {
                        "A": "INNER JOIN orders ON users.id = orders.user_id",
                        "B": "LEFT JOIN orders ON users.id = orders.user_id",
                        "C": "CROSS JOIN orders",
                        "D": "RIGHT JOIN orders ON users.id = orders.user_id",
                    },
                    "correct_option": "B",
                    "explanation": "A LEFT JOIN returns all records from the left table (users), and matched records from the right table (orders). Unmatched rows contain NULL.",
                    "answering_tip": "💡 LEFT JOIN preserves all left-table records even when no matching foreign record exists.",
                },
                {
                    "concept": "Aggregate Filtering",
                    "scenario": (
                        "You want to retrieve only the product categories that contain strictly more than 10 products in inventory."
                    ),
                    "question": "Which SQL clause is used to filter aggregated groups after a GROUP BY operation?",
                    "options": {
                        "A": "WHERE COUNT(*) > 10",
                        "B": "HAVING COUNT(*) > 10",
                        "C": "FILTER COUNT(*) > 10",
                        "D": "LIMIT 10",
                    },
                    "correct_option": "B",
                    "explanation": "HAVING filters groups created by GROUP BY based on aggregate conditions. WHERE filters individual rows before grouping.",
                    "answering_tip": "💡 Remember: WHERE filters individual rows; HAVING filters grouped aggregates.",
                },
                {
                    "concept": "Indexing & Query Performance",
                    "scenario": (
                        "Your database query `SELECT * FROM users WHERE email = 'dev@technea.io'` is performing a slow sequential scan across 5 million rows."
                    ),
                    "question": "How can you optimize this query for fast sub-millisecond lookup?",
                    "options": {
                        "A": "Add a B-Tree index on the `email` column",
                        "B": "Convert the table to unlogged storage",
                        "C": "Use a correlated subquery inside the WHERE clause",
                        "D": "Replace single quotes with double quotes",
                    },
                    "correct_option": "A",
                    "explanation": "A B-Tree index provides O(log n) logarithmic lookup time on the indexed column instead of an O(n) full table scan.",
                    "answering_tip": "💡 B-Tree indexes provide fast logarithmic search for equality and range filters.",
                },
                {
                    "concept": "ACID Transactions",
                    "scenario": (
                        "A funds transfer debits $100 from Account A and credits $100 to Account B. If the database crashes midway, no money should be lost or partially transferred."
                    ),
                    "question": "Which ACID property guarantees that all database operations in a transaction succeed or all fail together?",
                    "options": {
                        "A": "Atomicity",
                        "B": "Consistency",
                        "C": "Isolation",
                        "D": "Durability",
                    },
                    "correct_option": "A",
                    "explanation": "Atomicity ensures all statements in a transaction execute as an indivisible unit: either all succeed (COMMIT) or all roll back (ROLLBACK).",
                    "answering_tip": "💡 Atomicity represents the 'all-or-nothing' principle of transactions.",
                },
            ],
            "Intermediate": [
                {
                    "concept": "SQL Joins",
                    "scenario": (
                        "You need to fetch all registered users and their orders. Some users have not placed any "
                        "orders yet, but they must still appear in the result set with NULL values for order columns."
                    ),
                    "question": "Which SQL JOIN clause should you use to preserve all rows from the users table?",
                    "options": {
                        "A": "INNER JOIN orders ON users.id = orders.user_id",
                        "B": "LEFT JOIN orders ON users.id = orders.user_id",
                        "C": "CROSS JOIN orders",
                        "D": "RIGHT JOIN orders ON users.id = orders.user_id",
                    },
                    "correct_option": "B",
                    "explanation": "A LEFT JOIN returns all records from the left table (users), and matched records from the right table (orders). Unmatched rows contain NULL.",
                    "answering_tip": "💡 LEFT JOIN preserves all left-table records even when no matching foreign record exists.",
                },
                {
                    "concept": "Aggregate Filtering",
                    "scenario": (
                        "You want to retrieve only the product categories that contain strictly more than 10 products in inventory."
                    ),
                    "question": "Which SQL clause is used to filter aggregated groups after a GROUP BY operation?",
                    "options": {
                        "A": "WHERE COUNT(*) > 10",
                        "B": "HAVING COUNT(*) > 10",
                        "C": "FILTER COUNT(*) > 10",
                        "D": "LIMIT 10",
                    },
                    "correct_option": "B",
                    "explanation": "HAVING filters groups created by GROUP BY based on aggregate conditions. WHERE filters individual rows before grouping.",
                    "answering_tip": "💡 Remember: WHERE filters individual rows; HAVING filters grouped aggregates.",
                },
            ],
            "Advanced": [
                {
                    "concept": "Indexing & Query Performance",
                    "scenario": (
                        "Your database query `SELECT * FROM users WHERE email = 'dev@technea.io'` is performing a slow sequential scan across 5 million rows."
                    ),
                    "question": "How can you optimize this query for fast sub-millisecond lookup?",
                    "options": {
                        "A": "Add a B-Tree index on the `email` column",
                        "B": "Convert the table to unlogged storage",
                        "C": "Use a correlated subquery inside the WHERE clause",
                        "D": "Replace single quotes with double quotes",
                    },
                    "correct_option": "A",
                    "explanation": "A B-Tree index provides O(log n) logarithmic lookup time on the indexed column instead of an O(n) full table scan.",
                    "answering_tip": "💡 B-Tree indexes provide fast logarithmic search for equality and range filters.",
                },
            ],
        },
    }

    @classmethod
    def _detect_category(cls, milestone: str, lesson: str | None = None) -> str:
        """Detect the technical domain category from milestone or lesson text."""
        combined = f"{milestone} {lesson or ''}".lower()

        if any(w in combined for w in ["sql", "database", "postgres", "mysql", "sqlite", "query", "relational"]):
            return "sql"
        if any(w in combined for w in ["oop", "pattern", "design pattern", "object", "solid", "class", "encapsulation", "polymorphism", "inheritance"]):
            return "oop"
        if any(w in combined for w in ["api", "rest", "fastapi", "http", "jwt", "backend", "endpoint", "route", "crud"]):
            return "api"
        if any(w in combined for w in ["docker", "kubernetes", "k8s", "devops", "cloud", "container", "ci/cd", "deployment"]):
            return "devops"

        # Default to oop for general design, api for web
        if "web" in combined:
            return "api"
        return "oop"

    @classmethod
    def _normalize_level(cls, level: str | None) -> str:
        """Normalize learner level to Beginner, Intermediate, or Advanced."""
        if not level:
            return "Beginner"
        lvl = level.strip().title()
        if "Advanced" in lvl or "Senior" in lvl:
            return "Advanced"
        if "Intermediate" in lvl or "Mid" in lvl:
            return "Intermediate"
        return "Beginner"

    @classmethod
    def generate_quiz(
        cls,
        milestone: str | None = None,
        lesson: str | None = None,
        level: str = "Beginner",
        completed_concepts: list[str] | None = None,
        context: dict[str, Any] | None = None,
        num_questions: int = 3,
        seed: Any = None,
    ) -> Quiz:
        """Generate a milestone quiz strictly calibrated to milestone, completed concepts, and user level.

        Args:
            milestone: Current milestone title (e.g. "Object-Oriented Design Patterns").
            lesson: Current lesson title.
            level: Learner's level ("Beginner", "Intermediate", "Advanced").
            completed_concepts: Specific concepts already completed.
            context: Additional learner context (active roadmaps, progress).
            num_questions: Target number of scenario questions (3-4).
            seed: Optional seed for determinism in testing.

        Returns:
            A calibrated Quiz object with questions, options, explanations, and tips.
        """
        rng = random.Random(seed) if seed is not None else random.Random()

        # Resolve milestone from arguments or context
        resolved_milestone = milestone
        if not resolved_milestone and context:
            resolved_milestone = context.get("current_milestone_title")
            if not resolved_milestone and context.get("active_roadmaps"):
                active_rms = context.get("active_roadmaps")
                if isinstance(active_rms, list) and len(active_rms) > 0 and isinstance(active_rms[0], dict):
                    resolved_milestone = active_rms[0].get("current_milestone") or active_rms[0].get("title")

        if not resolved_milestone:
            resolved_milestone = "Object-Oriented Design Patterns"

        # Resolve level
        resolved_level = cls._normalize_level(level or (context.get("level") if context else "Beginner"))

        # Detect category
        category = cls._detect_category(resolved_milestone, lesson)
        category_bank = cls.QUESTION_BANK.get(category, cls.QUESTION_BANK["oop"])
        level_pool = category_bank.get(resolved_level, category_bank.get("Beginner", []))

        # Fallback to adjacent levels if pool is empty
        if not level_pool:
            level_pool = category_bank.get("Beginner", [])

        # Filter or prioritize based on completed concepts if provided
        selected_raw: list[dict[str, Any]] = []
        if completed_concepts:
            concept_matches = [
                q for q in level_pool
                if any(c.lower() in q["concept"].lower() for c in completed_concepts)
            ]
            selected_raw.extend(concept_matches)

        # Supplement remaining questions from level_pool without duplicates
        remaining = [q for q in level_pool if q not in selected_raw]
        rng.shuffle(remaining)

        target_count = max(3, min(4, num_questions))
        for q in remaining:
            if len(selected_raw) >= target_count:
                break
            selected_raw.append(q)

        # Build QuizQuestion objects with 1-based indexing
        questions: list[QuizQuestion] = []
        extracted_concepts: list[str] = []

        for idx, item in enumerate(selected_raw[:target_count], start=1):
            questions.append(
                QuizQuestion(
                    id=idx,
                    concept=item["concept"],
                    scenario=item["scenario"],
                    question=item["question"],
                    options=item["options"],
                    correct_option=item["correct_option"],
                    explanation=item["explanation"],
                    answering_tip=item["answering_tip"],
                )
            )
            if item["concept"] not in extracted_concepts:
                extracted_concepts.append(item["concept"])

        return Quiz(
            milestone=resolved_milestone,
            lesson=lesson,
            difficulty=resolved_level,
            concepts=extracted_concepts,
            questions=questions,
        )

    @classmethod
    def generate_milestone_quiz(
        cls,
        milestone: str,
        level: str = "Beginner",
        lesson: str | None = None,
        completed_concepts: list[str] | None = None,
        context: dict[str, Any] | None = None,
        num_questions: int = 3,
        seed: Any = None,
    ) -> Quiz:
        """Alias for generate_quiz specifically anchored to a milestone."""
        return cls.generate_quiz(
            milestone=milestone,
            lesson=lesson,
            level=level,
            completed_concepts=completed_concepts,
            context=context,
            num_questions=num_questions,
            seed=seed,
        )

    def format_quiz(self, quiz: Quiz) -> str:
        """Render a quiz instance as formatted markdown."""
        return quiz.to_markdown()


quiz_engine = QuizEngine()

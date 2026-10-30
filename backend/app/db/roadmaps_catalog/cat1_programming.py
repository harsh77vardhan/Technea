"""Domain 1: Programming Roadmaps (12 Roadmaps)"""

PROGRAMMING_ROADMAPS = [
    {
        "title": "Python Core & Scripting Mastery",
        "slug": "python-core-scripting-mastery",
        "category": "Programming",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "8 Weeks",
        "description": "Master modern Python 3.12 syntax, data structures, functional patterns, and algorithmic thinking. Learn to build production-grade CLI utilities, automate operating system tasks, and write clean, maintainable, object-oriented code with comprehensive unit testing.",
        "skills_covered": ["Python 3.12 Syntax", "Data Structures & Collections", "Object-Oriented Programming", "Functional Iterators & Generators", "Packaging & Virtual Envs", "Automated Testing with Pytest", "File I/O & OS Scripting"],
        "prerequisites": ["None - Designed for beginners with basic computer literacy", "Familiarity with terminal/command line basics is helpful"],
        "career_outcomes": ["Junior Python Developer", "Automation Engineer", "Backend Developer Trainee", "Scripting Specialist"],
        "tech_stack": ["Python 3.12", "Pytest", "Poetry", "Ruff", "Black", "Click", "Requests"],
        "tags": ["python", "scripting", "oop", "pytest", "automation", "beginner", "algorithms"],
        "capstone_projects": [
            {
                "title": "Automated Multi-Source Data Ingestion & Sanitization CLI",
                "description": "Build an extensible command-line tool with Click and Rich that downloads datasets from REST APIs, parses heterogeneous JSON/CSV records, validates schemas, and generates audit reports.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Concurrent File System Watcher & Backup Daemon",
                "description": "Develop a background daemon that monitors directory trees for file modifications using watchdog, calculates SHA-256 hashes, and archives compressed backups incrementally.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Official Python 3.12 Documentation", "url": "https://docs.python.org/3/", "type": "Documentation"},
            {"title": "Real Python Tutorials & Guides", "url": "https://realpython.com/", "type": "Interactive Guides"},
            {"title": "Fluent Python by Luciano Ramalho", "url": "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", "type": "Book"}
        ],
        "is_featured": True,
        "popularity_rank": 2,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Python Syntax, Variables & Control Flow",
                "description": "Establish foundational fluency with variables, primitive types, string formatting, arithmetic operators, and conditional branching.",
                "topics_covered": ["Dynamic Typing & Variable Assignment", "Primitive Types & Type Casting", "String Formatting (F-Strings)", "Conditional Branching (if/elif/else)", "Pattern Matching with Match/Case"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Sequences, Collections & Memory Behavior",
                "description": "Deep dive into lists, tuples, dictionaries, sets, memory mutability, and high-performance list and dictionary comprehensions.",
                "topics_covered": ["Lists & Tuple Immutability", "Dictionary Hash Maps & Sets", "Slicing & Indexing Operations", "List & Dict Comprehensions", "Reference Mutability & Shallow vs Deep Copy"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Modular Functions, Scopes & Closures",
                "description": "Write reusable, modular functions with keyword arguments, variable argument unpacking, closures, and higher-order functions.",
                "topics_covered": ["Positional & Keyword Arguments", "*args & **kwargs Unpacking", "Lexical Scoping & LEGB Rule", "First-Class Functions & Lambdas", "Decorator Foundations & Closures"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Object-Oriented Programming & Dunder Methods",
                "description": "Design modular software architectures using classes, encapsulation, inheritance hierarchies, composition, and Python dunder protocols.",
                "topics_covered": ["Classes, Instances & __init__", "Inheritance & Super() Resolution", "Dunder Protocols (__str__, __repr__, __len__)", "Dataclasses & Pydantic Basics", "Composition vs Inheritance Design"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Generators, Iterators & Context Managers",
                "description": "Harness memory-efficient streaming computation using Python generator expressions, yield statements, and resource management protocols.",
                "topics_covered": ["Iterator Protocol (__iter__, __next__)", "Generator Functions & Yield", "Generator Expressions & Pipelines", "Context Managers with with & contextlib", "Memory Profiling of Large Iterables"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Robust Error Handling, Testing & Packaging",
                "description": "Package modern Python code with Poetry or UV, configure linters like Ruff, and write comprehensive test suites using Pytest.",
                "topics_covered": ["Exception Hierarchies & Custom Errors", "Unit Testing with Pytest & Fixtures", "Mocking External Dependencies", "Virtual Environments & Poetry Tooling", "Code Quality with Ruff & MyPy Typing"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Modern JavaScript (ES2024+) Deep Dive",
        "slug": "modern-javascript-deep-dive",
        "category": "Programming",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "6 Weeks",
        "description": "Explore the full depth of modern JavaScript, from V8 engine execution contexts and closures to asynchronous microtask queues and modern ECMAScript features. Build rich interactive applications and high-speed CLI programs with deep runtime understanding.",
        "skills_covered": ["V8 Engine & Call Stack", "Event Loop & Microtasks", "Promises & Async/Await", "Prototypal Inheritance", "ES Modules & Bundlers", "Functional Array Methods", "DOM & Browser APIs"],
        "prerequisites": ["Basic understanding of web technologies (HTML/CSS)", "No prior programming experience required"],
        "career_outcomes": ["Frontend Web Developer", "Full Stack JavaScript Engineer", "Client-Side Developer", "UI Software Engineer"],
        "tech_stack": ["JavaScript ES2024", "Node.js", "Vite", "ESLint", "Vitest", "Chrome DevTools"],
        "tags": ["javascript", "es6", "event-loop", "async", "v8", "web", "frontend"],
        "capstone_projects": [
            {
                "title": "Pure Vanilla JS Reactive Virtual DOM Engine",
                "description": "Implement a lightweight virtual DOM diffing engine and state store without external frameworks, featuring batched rendering and custom event emissions.",
                "difficulty": "Advanced"
            },
            {
                "title": "Interactive Kanban Task Management App with LocalStorage Sync",
                "description": "Build an offline-first responsive kanban board utilizing drag-and-drop HTML5 APIs, custom DOM event delegation, and immutable state transforms.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "MDN Web Docs: JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "Documentation"},
            {"title": "JavaScript.info - The Modern JavaScript Tutorial", "url": "https://javascript.info/", "type": "Interactive Guide"},
            {"title": "You Don't Know JS Yet by Kyle Simpson", "url": "https://github.com/getify/You-Dont-Know-JS", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 14,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Lexical Scope, Hoisting & Execution Context",
                "description": "Understand how the JavaScript engine evaluates code, manages execution contexts, variable declarations (var/let/const), and hoisting.",
                "topics_covered": ["Global & Function Execution Contexts", "Scope Chain & Lexical Environment", "Var vs Let vs Const Hoisting", "Temporal Dead Zone (TDZ)", "Strict Mode Nuances"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Closures, Functions & This Binding",
                "description": "Master lexical closures, practical memory encapsulation, arrow functions, and the four explicit and implicit binding rules of 'this'.",
                "topics_covered": ["Closures & Private Variables", "Arrow Functions vs Function Declarations", "Explicit Binding: call, apply, bind", "Constructor Functions & new Operator", "Memory Leaks via Retained Closures"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Prototypes, Prototypal Inheritance & ES Classes",
                "description": "Explore JavaScript's prototype chain, property lookup mechanics, prototypal inheritance patterns, and modern ES6+ class syntax.",
                "topics_covered": ["__proto__ vs prototype Property", "Object.create & Delegation", "ES6 Class Syntax & Syntactic Sugar", "Private Class Fields (#field)", "Polymorphism & Static Methods"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Asynchronous JavaScript, Event Loop & Promises",
                "description": "Deep dive into the concurrency model: call stack, web APIs, macrotask queue, microtask queue, Promise lifecycle, and async/await.",
                "topics_covered": ["Call Stack & Single-Threaded Model", "Macrotask vs Microtask Execution", "Promise Chaining & Error Propagation", "Promise.all, allSettled, race, any", "Async/Await Desugaring & Try/Catch"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "ES Modules, Collections & Modern Metaprogramming",
                "description": "Leverage modern JavaScript primitives including Symbols, Proxies, Reflect, Map/Set, WeakMap/WeakSet, and ES module loaders.",
                "topics_covered": ["ESM Import/Export & Dynamic Imports", "Map, Set, WeakMap, WeakSet", "Symbols & Well-Known Symbols", "Proxy & Reflect for Reactivity", "Structured Clone & Deep Copying"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "DOM Manipulation, Custom Events & Testing",
                "description": "Connect JavaScript to the browser DOM, implement high-performance event delegation, debounce/throttle patterns, and test with Vitest.",
                "topics_covered": ["DOM Traversal & Mutation", "Event Bubbling, Capturing & Delegation", "Debounce, Throttle & RequestAnimationFrame", "Unit Testing with Vitest & JSDOM", "Building Modern Bundles with Vite"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "TypeScript Production Architecture",
        "slug": "typescript-production-architecture",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Elevate your JavaScript development with enterprise-grade type safety, structural typing, advanced generics, conditional types, and template literal types. Architect robust full-stack applications with bulletproof type inference and zero runtime errors.",
        "skills_covered": ["TypeScript Type System", "Advanced Generics", "Conditional & Mapped Types", "Template Literal Types", "Type Narrowing & Guards", "Declaration Merging & d.ts", "Monorepo Project References"],
        "prerequisites": ["Solid understanding of modern JavaScript (ES6+)", "Familiarity with Node.js and npm package ecosystem"],
        "career_outcomes": ["Senior TypeScript Developer", "Frontend Architect", "Full Stack Engineer", "Platform Engineer"],
        "tech_stack": ["TypeScript 5.x", "Zod", "TS-Node", "Vitest", "Prettier", "TurboRepo", "ESLint TypeScript"],
        "tags": ["typescript", "type-safety", "generics", "zod", "architecture", "full-stack", "compiler"],
        "capstone_projects": [
            {
                "title": "Type-Safe RPC & Validation Framework",
                "description": "Construct a full end-to-end type-safe RPC client and server library inspired by tRPC, leveraging recursive conditional types, Zod schemas, and automated contract inferencing.",
                "difficulty": "Advanced"
            },
            {
                "title": "Config-Driven Form State & Schema Validation Engine",
                "description": "Build an enterprise form builder where form fields, conditional dependencies, and runtime validation rules are inferred with 100% compile-time type safety.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "Documentation"},
            {"title": "Total TypeScript by Matt Pocock", "url": "https://www.totaltypescript.com/", "type": "Interactive Guides"},
            {"title": "Effective TypeScript by Dan Vanderkam", "url": "https://effectivetypescript.com/", "type": "Book"}
        ],
        "is_featured": True,
        "popularity_rank": 8,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Type Foundations, Unions & Literal Types",
                "description": "Master primitive types, type aliases, interfaces, union and intersection types, and strict compiler configurations.",
                "topics_covered": ["tsconfig.json Optimization & Strict Mode", "Interfaces vs Type Aliases", "Union & Intersection Operators", "Literal & Enum Types", "Unknown vs Any vs Never Types"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Type Narrowing, Guards & Discriminated Unions",
                "description": "Implement robust runtime narrowing patterns, custom user-defined type predicates, assertion signatures, and discriminated unions.",
                "topics_covered": ["Typeof, Instanceof & In Operators", "Custom User-Defined Type Predicates (is)", "Assertion Signatures (asserts)", "Discriminated Unions & Exhaustiveness Checking", "Defensive Domain Modeling"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Generics & Reusable Type Constraints",
                "description": "Design highly reusable abstractions using type arguments, default type parameters, and generic constraints using extends.",
                "topics_covered": ["Generic Functions, Interfaces & Classes", "Generic Constraints (extends)", "Keyof Operator & Indexed Access Types", "Utility Types: Partial, Pick, Omit, Record", "Generic Currying & Factory Functions"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Conditional & Mapped Types",
                "description": "Construct metaprogramming types that dynamically alter shape based on conditions using the infer keyword and mapped modifiers.",
                "topics_covered": ["Conditional Types Syntax (T extends U ? X : Y)", "Infer Keyword for Type Extraction", "Mapped Types & Key Remapping (as)", "Readonly & Optional Modifiers (+/-)", "Recursive Type Definitions (JSON, DeepPartial)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Template Literal Types & Runtime Validation with Zod",
                "description": "Combine compile-time template literal strings with modern runtime schema validation libraries to eliminate boundary type mismatches.",
                "topics_covered": ["Template Literal Types (Event:${string})", "String Manipulation Utility Types", "Zod Schema Definition & z.infer", "API Boundary Validation Strategies", "Type-Safe Environment Variables"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Monorepos, Declaration Files & Library Publishing",
                "description": "Configure multi-package project references, author third-party definition files (d.ts), and bundle production libraries.",
                "topics_covered": ["Project References & Solution tsconfigs", "Ambient Declarations & Module Augmentation", "Publishing npm Packages with tsup / rollup", "Monorepo Setup with Turborepo", "Compiler API Basics & AST Transforms"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Rust Systems & Memory-Safe Engineering",
        "slug": "rust-systems-developer",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "12 Weeks",
        "description": "Master memory safety without garbage collection, zero-cost abstractions, fearless concurrency, and low-level systems programming using modern Rust. Build ultra-fast, robust networking engines, CLI utilities, and operating system components with production reliability.",
        "skills_covered": ["Ownership & Borrow Checker", "Lifetime Annotations", "Fearless Concurrency & Atomics", "Async Runtime with Tokio", "Unsafe Rust & FFI Bindings", "Crates.io Ecosystem & Cargo", "Systems Memory Profiling"],
        "prerequisites": ["Familiarity with at least one compiled or garbage-collected language (C, C++, Go, or Python)", "Basic understanding of pointers, stack vs heap memory"],
        "career_outcomes": ["Rust Systems Engineer", "High-Performance Backend Developer", "Infrastructure & Cloud Systems Engineer", "Embedded Software Developer"],
        "tech_stack": ["Rust 2024", "Cargo", "Tokio", "Rayon", "Serde", "Valgrind", "WebAssembly"],
        "tags": ["rust", "systems-programming", "memory-safety", "concurrency", "tokio", "low-level", "backend"],
        "capstone_projects": [
            {
                "title": "High-Throughput Multi-Threaded Redis-Compatible In-Memory Cache",
                "description": "Architect a distributed in-memory key-value store with RESP protocol parsing, LRU eviction, non-blocking asynchronous I/O via Tokio, and thread-safe concurrent hash maps.",
                "difficulty": "Advanced"
            },
            {
                "title": "Zero-Copy High-Speed Log Processing CLI Daemon",
                "description": "Develop a high-performance command line daemon that streams gigabytes of web server logs, parses structured JSON with Serde zero-copy deserialization, and produces real-time telemetry metrics.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "The Rust Programming Language (The Book)", "url": "https://doc.rust-lang.org/book/", "type": "Official Documentation"},
            {"title": "Rust by Example", "url": "https://doc.rust-lang.org/rust-by-example/", "type": "Interactive Guide"},
            {"title": "Tokio Async Rust Tutorial & Architecture Guide", "url": "https://tokio.rs/tokio/tutorial", "type": "Architecture Guide"}
        ],
        "is_featured": True,
        "popularity_rank": 6,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Rust Syntax, Toolchain & Ownership Foundations",
                "description": "Master rustup, cargo, immutability by default, basic primitive types, control flow, and understand Rust's core memory model.",
                "topics_covered": ["Cargo & Project Structure", "Variables & Immutability", "Ownership Rules & Stack vs Heap", "Borrowing & References", "Slices & Custom Structs"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Enums, Pattern Matching & Error Handling",
                "description": "Harness powerful algebraic data types with Option and Result, pattern matching with match and if-let, and robust error propagation.",
                "topics_covered": ["Option & Result Enums", "Exhaustive Pattern Matching", "Question Mark Operator (?)", "Custom Error Types with thiserror & anyhow", "Panic Recovery vs Defensive Errors"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Lifetimes, Traits & Generics",
                "description": "Write generic zero-cost abstractions, understand the borrow checker's lifetime validation rules, and implement standard traits.",
                "topics_covered": ["Generic Functions & Structs", "Trait Definitions & Trait Bounds", "Derive Macros (Clone, Debug, Serialize)", "Explicit Lifetime Annotations ('a)", "Static vs Dynamic Dispatch (dyn Trait)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Multi-Threading, Channels & Shared State",
                "description": "Harness fearless concurrency with threads, message passing via mpsc channels, Arc, Mutex, RwLock, and atomic operations.",
                "topics_covered": ["Thread Spawning & JoinHandles", "Message Passing with MPSC Channels", "Shared State Concurrency with Arc<Mutex<T>>", "Send & Sync Marker Traits", "Atomic Primitives & Lock-Free Logic"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Asynchronous Programming with Tokio",
                "description": "Build high-concurrency non-blocking network servers using async/await syntax, Tokio runtimes, tasks, and futures.",
                "topics_covered": ["Futures & The Polling Model", "Tokio Runtime Architecture", "Async Tasks & JoinSets", "TCP Streams & Framed Codecs", "Select! Macro & Timeout Management"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Unsafe Rust, FFI & WebAssembly Compilation",
                "description": "Explore raw pointers, unsafe blocks, foreign function interfaces with C, and compiling high-speed Rust code to WebAssembly.",
                "topics_covered": ["Raw Pointers & Dereferencing", "Unsafe Functions & Invariants", "C Foreign Function Interface (bindgen)", "WebAssembly Targets with wasm-pack", "Performance Profiling with Flamegraph"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Go Cloud-Native Services & Concurrency",
        "slug": "go-cloud-native-concurrency",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master Google Go for cloud-native microservices, goroutines, channels, and distributed infrastructure engineering. Write idiomatic, clean, high-throughput backend services with lightning-fast compilation and minimal resource footprint.",
        "skills_covered": ["Idiomatic Go Syntax", "Goroutines & Channels", "Sync Package & Memory Model", "HTTP & gRPC Services", "Microservice Architecture", "Database Access & SQLx", "Benchmarking & Pprof"],
        "prerequisites": ["Basic understanding of programming fundamentals", "Familiarity with networking concepts (HTTP, TCP, JSON)"],
        "career_outcomes": ["Go Backend Developer", "Cloud-Native Infrastructure Engineer", "Distributed Systems Engineer", "Site Reliability Engineer"],
        "tech_stack": ["Go 1.22+", "Docker", "gRPC", "Protobuf", "PostgreSQL", "Gin", "Pprof", "Testify"],
        "tags": ["golang", "concurrency", "goroutines", "cloud-native", "microservices", "grpc", "backend"],
        "capstone_projects": [
            {
                "title": "High-Throughput Distributed Rate Limiter & Reverse Proxy",
                "description": "Build an edge reverse proxy in Go with token bucket rate limiting, Redis backing, circuit breakers, and sub-millisecond request routing.",
                "difficulty": "Advanced"
            },
            {
                "title": "Concurrent URL Health Checker & Alerting Daemon",
                "description": "Develop a concurrent website health check engine that polls thousands of endpoints in parallel using worker pools, collecting latency histograms.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Effective Go - Official Documentation", "url": "https://go.dev/doc/effective_go", "type": "Official Guide"},
            {"title": "Go by Example", "url": "https://gobyexample.com/", "type": "Interactive Guide"},
            {"title": "The Go Programming Language by Donovan & Kernighan", "url": "https://www.gopl.io/", "type": "Book"}
        ],
        "is_featured": True,
        "popularity_rank": 11,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Go Fundamentals, Types & Control Structures",
                "description": "Understand Go's opinionated design, workspace setup, packages, basic types, slices, maps, and explicit error handling.",
                "topics_covered": ["Go Modules & Project Layout", "Slices, Arrays & Memory Headers", "Maps & Hash Table Mechanics", "Explicit Error Values & Panic/Recover", "Structs & Composition over Inheritance"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Interfaces, Methods & Type Assertions",
                "description": "Harness implicit interface satisfaction, method sets, pointer vs value receivers, and the empty interface / any.",
                "topics_covered": ["Implicit Interface Satisfaction", "Pointer vs Value Receivers", "Type Assertions & Type Switches", "Standard Library Interfaces (io.Reader, io.Writer)", "Go Generics (Type Parameters)"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Goroutines, Channels & CSP Concurrency",
                "description": "Master Communicating Sequential Processes (CSP) using lightweight goroutines, buffered/unbuffered channels, and select multiplexing.",
                "topics_covered": ["Goroutine Lifecycle & Go Scheduler (M:N)", "Unbuffered vs Buffered Channels", "Select Statement Multiplexing", "Worker Pool & Fan-Out/Fan-In Patterns", "Channel Closing & Ranging"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Synchronization Primitives & Race Detection",
                "description": "Safeguard shared memory with sync.Mutex, RWMutex, WaitGroup, Once, and detect data races using the Go race detector.",
                "topics_covered": ["sync.WaitGroup & Coordination", "sync.Mutex & sync.RWMutex", "Atomic Operations with sync/atomic", "sync.Pool for Memory Re-use", "The -race Detector & Race Condition Debugging"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Building Production REST & gRPC Microservices",
                "description": "Develop high-performance network services with standard net/http, Gin framework, Protobuf schemas, and gRPC streaming.",
                "topics_covered": ["net/http Server Architecture & Middleware", "Routing with Gin or Chi", "Context Propagation & Cancellation", "Protocol Buffers & gRPC Streaming", "Database Connection Pooling (database/sql)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Benchmarking, Profiling & Containerization",
                "description": "Optimize Go applications using testing benchmarks, memory/CPU profiling with pprof, and create scratch Docker images.",
                "topics_covered": ["Unit Testing with Testify & Table-Driven Tests", "Benchmark Functions (testing.B)", "CPU & Memory Profiling with Pprof", "Garbage Collector Tuning (GOGC)", "Multi-Stage Docker Scratch Images"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Modern C++20/C++23 Systems Engineering",
        "slug": "modern-cpp20-systems-engineering",
        "category": "Programming",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "12 Weeks",
        "description": "Master Modern C++ (C++20 and C++23) for ultra-low-latency, high-performance computing, game engines, and operating systems. Learn concepts, coroutines, ranges, modules, RAII memory management, and modern template metaprogramming.",
        "skills_covered": ["C++20 Concepts & Constraints", "Coroutines & Asynchronous Tasks", "Ranges & Views Library", "Modern C++ Modules", "Move Semantics & Perfect Forwarding", "RAII & Smart Pointers", "Template Metaprogramming"],
        "prerequisites": ["Prior programming knowledge in C or another object-oriented language", "Understanding of computer architecture and pointers"],
        "career_outcomes": ["C++ Systems Engineer", "Quantitative Developer (HFT)", "Game Engine Programmer", "Autonomous Vehicle Systems Engineer"],
        "tech_stack": ["C++20/C++23", "Clang", "GCC", "CMake", "GDB", "Valgrind", "Google Benchmark"],
        "tags": ["cpp", "cplusplus", "systems-programming", "low-latency", "cmake", "performance", "high-performance"],
        "capstone_projects": [
            {
                "title": "Ultra-Low-Latency Order Book Matching Engine",
                "description": "Design a high-frequency financial matching engine using lock-free ring buffers, custom arena memory allocators, and modern C++20 concepts.",
                "difficulty": "Advanced"
            },
            {
                "title": "Modern C++20 Async Coroutine Networking Library",
                "description": "Implement a non-blocking asynchronous socket server leveraging C++20 coroutines (co_await, co_return) and epoll/kqueue event loops.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "cppreference.com - Complete C++ Reference", "url": "https://en.cppreference.com/", "type": "Documentation"},
            {"title": "C++ Core Guidelines by Bjarne Stroustrup", "url": "https://isocpp.github.io/CppCoreGuidelines/", "type": "Best Practices"},
            {"title": "A Tour of C++ (3rd Edition) by Bjarne Stroustrup", "url": "https://www.stroustrup.com/tour3.html", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 24,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "RAII, Pointers & Modern Memory Management",
                "description": "Establish modern memory safety using Resource Acquisition Is Initialization (RAII), std::unique_ptr, and std::shared_ptr.",
                "topics_covered": ["Stack vs Heap Allocation Mechanics", "RAII Idiom & Deterministic Destructors", "std::unique_ptr & std::shared_ptr", "std::weak_ptr & Circular Dependency Prevention", "Custom Deleters & Allocator Awareness"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Move Semantics, Rvalues & Perfect Forwarding",
                "description": "Eliminate expensive memory copies using rvalue references (&&), std::move, copy elision, and universal references with std::forward.",
                "topics_covered": ["Lvalues vs Rvalues Expressions", "Move Constructors & Move Assignment Operators", "std::move & Rule of Five / Rule of Zero", "Universal (Forwarding) References", "std::forward & Perfect Forwarding"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "C++20 Concepts, Constraints & Modern Templates",
                "description": "Write readable, compile-time validated generic code using C++20 concepts, requires clauses, and template metaprogramming.",
                "topics_covered": ["Template Specialization & SFINAE Basics", "C++20 Concepts & Requires Expressions", "Standard Concepts Library (<concepts>)", "Constexpr & Consteval Functions", "Fold Expressions & Variadic Templates"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Ranges, Views & Functional Composition",
                "description": "Process data pipelines lazily and safely without unnecessary memory allocations using the C++20 ranges and views library.",
                "topics_covered": ["Ranges Concepts & Projections", "Lazy Evaluation with std::views", "Pipe Operator (|) Composition", "Spans (std::span) for Safe Contiguous Buffers", "Algorithms Overhaul with Ranges"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "C++20 Coroutines & High-Concurrency Systems",
                "description": "Implement cooperative multitasking and asynchronous I/O using co_await, co_yield, promise_type, and std::jthread.",
                "topics_covered": ["Coroutines Anatomy & Coroutine State", "Promise_type, Awaitable & Awaiter Protocols", "Generators using co_yield", "Thread Management with std::jthread", "Atomic Operations & Memory Ordering (std::memory_order)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Build Systems, CMake & High-Performance Profiling",
                "description": "Structure modern C++ projects with CMake, C++20 Modules, address sanitizers, and microbenchmarking tools.",
                "topics_covered": ["Modern Target-Based CMake Best Practices", "C++20 Modules (import vs #include)", "AddressSanitizer (ASan) & UndefinedBehaviorSanitizer", "Benchmarking with Google Benchmark", "CPU Profiling with Linux Perf & Flamegraphs"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "C Systems Programming & Operating Systems Internals",
        "slug": "c-systems-programming-os-internals",
        "category": "Programming",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "12 Weeks",
        "description": "Dive down to the bare metal with modern C17/C23, Unix POSIX system calls, memory layout, process scheduling, and kernel interfacing. Master manual pointer arithmetic, signal handling, IPC, and socket networking to build robust foundational infrastructure.",
        "skills_covered": ["Pointer Arithmetic & Memory Layout", "POSIX System Calls (fork, exec, wait)", "Inter-Process Communication (IPC)", "Dynamic Memory Allocators", "POSIX Threads (Pthreads)", "Socket Programming with Epoll", "GDB Debugging & Valgrind"],
        "prerequisites": ["Basic programming experience in any language", "Understanding of binary numbers, hex, and basic command line"],
        "career_outcomes": ["Systems Software Engineer", "Kernel / OS Developer", "Firmware / Embedded Developer", "Security Researcher"],
        "tech_stack": ["C17/C23", "GCC/Clang", "GDB", "Valgrind", "Make", "POSIX", "Strace"],
        "tags": ["c", "systems-programming", "operating-systems", "posix", "memory", "linux-kernel", "gdb"],
        "capstone_projects": [
            {
                "title": "Custom POSIX Unix Shell with Job Control & Piping",
                "description": "Build a fully functional Unix shell featuring command parsing, environment variable expansion, piping (|), file redirection (<, >), and foreground/background job control.",
                "difficulty": "Advanced"
            },
            {
                "title": "Custom Dynamic Memory Allocator (malloc/free Implementation)",
                "description": "Write a high-performance heap memory allocator using sbrk/mmap, segregated explicit free lists, boundary tags, and coalescing algorithms.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "The C Programming Language (2nd Ed) by K&R", "url": "https://en.wikipedia.org/wiki/The_C_Programming_Language", "type": "Book"},
            {"title": "The Linux Programming Interface by Michael Kerrisk", "url": "https://man7.org/tlpi/", "type": "Book"},
            {"title": "Operating Systems: Three Easy Pieces", "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/", "type": "Free Textbook"}
        ],
        "is_featured": False,
        "popularity_rank": 38,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "C Fundamentals, Memory Layout & Pointers",
                "description": "Explore the virtual address space, data segment, stack, heap, pointer arithmetic, and struct alignment padding.",
                "topics_covered": ["Virtual Memory Layout of a C Process", "Pointer Arithmetic & Double Pointers", "Struct Padding & Memory Alignment", "Bitwise Operations & Bitfields", "Type Casting & Void Pointers"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Dynamic Memory Management & Debugging Tools",
                "description": "Master malloc, calloc, realloc, free, detect memory leaks, and prevent buffer overflows using Valgrind and AddressSanitizer.",
                "topics_covered": ["Heap Allocation Mechanics (brk vs mmap)", "Buffer Overflows & Use-After-Free", "Valgrind Memcheck & Leak Detection", "GDB Command Line Debugging & Core Dumps", "Static Analysis with Clang-Tidy"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Unix File I/O, Descriptors & Inodes",
                "description": "Work directly with POSIX file descriptors, system calls (open, read, write, lseek), directory navigation, and file metadata.",
                "topics_covered": ["System Calls vs C Standard Library", "File Descriptors & Open File Tables", "Inodes, Hard Links & Symbolic Links", "Standard I/O Buffering Mechanics", "Memory-Mapped Files with mmap()"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Processes, Fork-Exec & Signal Handling",
                "description": "Manage Unix processes, process lifecycles, signal dispatching, and asynchronous re-entrancy safety.",
                "topics_covered": ["Process Creation with fork() & execve()", "Process Termination & waitpid() Zombies", "Signals Handling (sigaction, kill)", "Async-Signal-Safe Functions", "Daemon Process Architecture"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Inter-Process Communication & POSIX Threads",
                "description": "Facilitate communication across processes using pipes, FIFOs, shared memory, and multithread using pthread.",
                "topics_covered": ["Anonymous & Named Pipes (FIFOs)", "POSIX Shared Memory & Semaphores", "POSIX Threads Creation (pthread_create)", "Mutexes & Condition Variables", "Thread Deadlocks & Race Conditions"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Network Socket Programming & Multiplexing with Epoll",
                "description": "Build high-performance non-blocking network daemons using TCP stream sockets and scalable Linux epoll event notification.",
                "topics_covered": ["Berkeley Socket API (socket, bind, listen, accept)", "TCP State Machine & Handshakes", "Blocking vs Non-Blocking I/O (fcntl)", "I/O Multiplexing with Epoll (Level vs Edge Triggered)", "Writing a High-Throughput HTTP Micro-Server"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Enterprise Java with Spring Boot 3",
        "slug": "enterprise-java-spring-boot-3",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Master enterprise backend engineering using Java 21 LTS and Spring Boot 3. Build robust microservices with Spring Data JPA, Spring Security with OAuth2/JWT, Dockerized deployment, Kafka messaging, and modern virtual threads (Project Loom).",
        "skills_covered": ["Java 21 LTS Features", "Virtual Threads (Project Loom)", "Spring Boot 3 Architecture", "Spring Data JPA & Hibernate", "Spring Security 6 & OAuth2", "Microservices with Spring Cloud", "Event-Driven Kafka Integration"],
        "prerequisites": ["Fundamental understanding of Object-Oriented Programming (OOP)", "Basic knowledge of SQL and relational databases"],
        "career_outcomes": ["Enterprise Java Developer", "Spring Boot Backend Engineer", "Java Microservices Architect", "Full Stack Java Developer"],
        "tech_stack": ["Java 21", "Spring Boot 3", "PostgreSQL", "Hibernate", "Apache Kafka", "Docker", "Maven/Gradle"],
        "tags": ["java", "spring-boot", "microservices", "jpa", "virtual-threads", "enterprise", "backend"],
        "capstone_projects": [
            {
                "title": "Multi-Tenant Enterprise E-Commerce Microservices Engine",
                "description": "Architect a multi-service distributed shopping platform with Spring Boot 3, featuring catalog, cart, and payment services, asynchronous order events via Kafka, and JWT security.",
                "difficulty": "Advanced"
            },
            {
                "title": "High-Throughput Banking Ledger with Virtual Threads",
                "description": "Build a high-concurrency financial transaction ledger utilizing Java 21 Virtual Threads, optimistic locking with JPA, and distributed database migrations.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Spring Boot 3 Official Reference Documentation", "url": "https://docs.spring.io/spring-boot/docs/current/reference/html/", "type": "Official Documentation"},
            {"title": "Baeldung Spring Boot Tutorials", "url": "https://www.baeldung.com/spring-boot", "type": "Interactive Guides"},
            {"title": "Effective Java by Joshua Bloch", "url": "https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 19,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Modern Java 21, Records & Pattern Matching",
                "description": "Embrace modern Java features including immutable Records, sealed classes, switch pattern matching, and Virtual Threads.",
                "topics_covered": ["Java 21 LTS Overview", "Records & Immutable Data Carriers", "Pattern Matching for Switch & Instanceof", "Sealed Classes & Interfaces", "Virtual Threads & Project Loom Fundamentals"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Spring Boot 3 Core, Dependency Injection & IoC",
                "description": "Master Spring's Inversion of Control (IoC) container, Bean lifecycles, component scanning, and application profiles.",
                "topics_covered": ["IoC Container & ApplicationContext", "@Component, @Service, @Repository, @Configuration", "Constructor Injection vs Field Injection", "Spring Profiles & Externalized Configuration", "Spring Boot Auto-Configuration Internals"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Persistence with Spring Data JPA & PostgreSQL",
                "description": "Design relational domain models with Hibernate ORM, write custom JPQL queries, manage transactions, and handle N+1 problems.",
                "topics_covered": ["JPA Entity Relationships (@OneToMany, @ManyToMany)", "Spring Data JPA Repository Interfaces", "JPQL & Native Queries with Specifications", "Transaction Management (@Transactional)", "Solving the N+1 Query Problem with EntityGraphs"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "REST APIs, DTOs & Validation",
                "description": "Construct clean, production-ready REST controllers with custom DTOs, Bean Validation (Jakarta Validation), and OpenAPI documentation.",
                "topics_covered": ["@RestController & HTTP Method Mapping", "Jakarta Bean Validation (@Valid, Custom Validators)", "Global Exception Handling (@ControllerAdvice)", "DTO Pattern & MapStruct Object Mapping", "Interactive Documentation with SpringDoc OpenAPI"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Enterprise Security with Spring Security 6 & JWT",
                "description": "Secure microservices using filter chains, stateless JWT authentication, role-based access control, and CORS configuration.",
                "topics_covered": ["SecurityFilterChain Architecture", "Stateless Authentication with JWT Tokens", "Password Hashing with BCrypt", "Method-Level Security (@PreAuthorize)", "CORS & CSRF Best Practices"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Microservices, Kafka Events & Docker Deployment",
                "description": "Break monoliths into resilient microservices communicating asynchronously via Apache Kafka and containerize with Docker.",
                "topics_covered": ["Event-Driven Architecture with Spring for Apache Kafka", "Distributed Tracing with Micrometer & Zipkin", "Resilience4j Circuit Breakers & Retries", "Multi-Stage Docker Containerization", "CI/CD Pipeline Integration"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Modern C# & .NET 8 Cloud Development",
        "slug": "modern-csharp-dotnet-cloud-development",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Build high-performance cloud applications and microservices using C# 12 and .NET 8. Master Entity Framework Core, ASP.NET Core Minimal APIs, Dependency Injection, asynchronous programming with async/await, and Azure cloud integration.",
        "skills_covered": ["C# 12 Syntax & Features", "ASP.NET Core Web APIs", "Entity Framework Core 8", "Dependency Injection & Middleware", "LINQ & Collections", "Asynchronous Task Systems", "Docker & Azure App Services"],
        "prerequisites": ["Basic understanding of object-oriented programming", "Familiarity with relational databases and SQL"],
        "career_outcomes": [".NET Developer", "C# Backend Engineer", "Cloud Software Developer", "Enterprise Solutions Developer"],
        "tech_stack": ["C# 12", ".NET 8", "ASP.NET Core", "Entity Framework Core", "SQL Server / PostgreSQL", "Docker", "Azure"],
        "tags": ["csharp", "dotnet", "aspnet-core", "entity-framework", "azure", "cloud", "backend"],
        "capstone_projects": [
            {
                "title": "Enterprise SaaS Multi-Tenant Task & Invoice Platform",
                "description": "Build a cloud-native SaaS API using ASP.NET Core Minimal APIs, EF Core multi-tenancy, JWT identity authentication, and background worker queues.",
                "difficulty": "Advanced"
            },
            {
                "title": "Real-Time Collaborative Dashboard with SignalR",
                "description": "Develop a real-time analytics broadcasting hub using SignalR websockets, Redis backplane, and clean architecture.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Microsoft Learn: C# & .NET Documentation", "url": "https://learn.microsoft.com/en-us/dotnet/", "type": "Documentation"},
            {"title": "C# in Depth by Jon Skeet", "url": "https://csharpindepth.com/", "type": "Book"},
            {"title": "Milan Jovanović .NET Architecture Blog", "url": "https://www.milanjovanovic.tech/", "type": "Articles & Guides"}
        ],
        "is_featured": False,
        "popularity_rank": 31,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "C# 12 Foundations, Records & Pattern Matching",
                "description": "Explore primary constructors, record structs, pattern matching, nullable reference types, and LINQ expressions.",
                "topics_covered": ["C# 12 Primary Constructors & Collection Expressions", "Record Types & Value Equality", "Advanced Pattern Matching", "Nullable Reference Types & Compiler Warnings", "LINQ Query & Method Syntax"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "ASP.NET Core Architecture & Minimal APIs",
                "description": "Build lightweight, high-performance web APIs using ASP.NET Core Minimal APIs, middleware pipelines, and dependency injection.",
                "topics_covered": ["Minimal APIs Routing & Endpoint Filters", "Built-in Dependency Injection Lifetimes (Transient, Scoped, Singleton)", "Custom Middleware Pipeline Architecture", "Configuration Management & Options Pattern", "Validation with FluentValidation"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Data Persistence with Entity Framework Core 8",
                "description": "Model complex databases using EF Core, migrations, LINQ projections, change tracking, and performance tuning.",
                "topics_covered": ["DbContext Configuration & Fluent API", "Code-First Migrations & Database Versioning", "Eager, Lazy & Explicit Loading", "Compiled Queries & AsNoTracking Optimization", "Interceptors & Soft Deletes"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Authentication, Authorization & Security",
                "description": "Implement authentication using ASP.NET Core Identity, JWT Bearer tokens, policy-based authorization, and data encryption.",
                "topics_covered": ["ASP.NET Core Identity Integration", "JWT Bearer Token Generation & Validation", "Policy & Role-Based Authorization", "API Key Authentication & Rate Limiting", "Cross-Site Scripting (XSS) & CSRF Defense"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Real-Time Web with SignalR & Background Services",
                "description": "Build real-time websocket applications using SignalR and long-running background tasks using IHostedService.",
                "topics_covered": ["SignalR Hub Architecture & Client Subscriptions", "Scaling SignalR with Redis Backplane", "Background Tasks with IHostedService & BackgroundService", "Channel-Based Producer/Consumer Patterns", "Health Checks & Readiness Probes"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Testing, Containerization & Cloud Deployment",
                "description": "Write automated integration tests with WebApplicationFactory, containerize with Docker, and deploy to Azure.",
                "topics_covered": ["Unit Testing with xUnit & Moq", "Integration Testing with WebApplicationFactory", "Dockerizing .NET 8 Applications", "CI/CD Deployment with GitHub Actions", "Deploying to Azure App Service / Container Apps"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Swift & Apple Systems Architecture",
        "slug": "swift-apple-systems-architecture",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master Apple's Swift language for systems engineering, command line tools, server-side development with Vapor, and foundational macOS/iOS architecture. Learn modern Swift 6 strict concurrency, protocols, value types, and memory management with ARC.",
        "skills_covered": ["Swift 6 Syntax & Safety", "Protocol-Oriented Programming", "Value Semantics & Structs", "Automatic Reference Counting (ARC)", "Swift Concurrency (async/await, Actors)", "Swift Package Manager (SPM)", "Server-Side Swift with Vapor"],
        "prerequisites": ["Basic programming knowledge in any object-oriented or functional language", "Access to a macOS machine or Linux with Swift toolchain"],
        "career_outcomes": ["Swift Software Engineer", "iOS Systems Engineer", "macOS Software Developer", "Server-Side Swift Engineer"],
        "tech_stack": ["Swift 6", "Xcode", "Swift Package Manager", "Vapor", "Instruments", "LLVM", "XCTest"],
        "tags": ["swift", "apple", "ios", "macos", "concurrency", "vapor", "server-side-swift"],
        "capstone_projects": [
            {
                "title": "High-Throughput Server-Side REST & WebSocket API with Vapor",
                "description": "Build an asynchronous web API in Swift using Vapor 4, Fluent ORM with PostgreSQL, JWT authentication, and Swift Actors for thread-safe state management.",
                "difficulty": "Advanced"
            },
            {
                "title": "Native macOS Developer Productivity CLI & Daemon",
                "description": "Develop a lightweight command-line tool and launch daemon using Swift Package Manager, ArgumentParser, and Darwin notifications.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "The Swift Programming Language - Official Documentation", "url": "https://www.swift.org/documentation/", "type": "Official Guide"},
            {"title": "Swift by Sundell Tutorials & Podcasts", "url": "https://www.swiftbysundell.com/", "type": "Interactive Guides"},
            {"title": "Vapor Web Framework Documentation", "url": "https://docs.vapor.codes/", "type": "Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 45,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Swift Basics, Optionals & Control Flow",
                "description": "Understand Swift's type safety, optionals, optional unwrapping, guard statements, and fundamental collection types.",
                "topics_covered": ["Type Safety & Type Inference", "Optionals, Forced Unwrapping & Optional Binding", "Nil-Coalescing & Optional Chaining", "Guard Statements & Early Exits", "Arrays, Dictionaries & Sets"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Structures, Classes & Protocol-Oriented Programming",
                "description": "Embrace value semantics with Structs, understand reference types with Classes, and design protocol hierarchies with extensions.",
                "topics_covered": ["Structs vs Classes (Value vs Reference Semantics)", "Protocol-Oriented Programming (POP)", "Protocol Extensions & Default Implementations", "Generics & Associated Types", "Enums with Associated Values"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Memory Management & Automatic Reference Counting (ARC)",
                "description": "Prevent memory leaks, retain cycles, and understand strong, weak, and unowned references in closures and classes.",
                "topics_covered": ["Automatic Reference Counting Mechanics", "Retain Cycles in Class Hierarchies", "Weak vs Unowned References", "Escaping vs Non-Escaping Closures", "Capture Lists in Closures ([weak self])"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Modern Swift Concurrency & Actors",
                "description": "Master structured concurrency using async/await, TaskGroups, and eliminate data races with Swift Actors.",
                "topics_covered": ["Async/Await & Async Let Bindings", "Task & TaskGroup Parallelism", "Actors & Data Isolation", "Global Actors (@MainActor)", "Sendable Protocol & Swift 6 Strict Concurrency"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Swift Package Manager & CLI Tooling",
                "description": "Organize modular multi-target projects using SwiftPM and build command-line applications with ArgumentParser.",
                "topics_covered": ["Package.swift Manifest Anatomy", "Multi-Target Architecture & Dependencies", "Building CLI Utilities with swift-argument-parser", "Unit Testing with XCTest & Swift Testing Framework", "Profiling with Apple Instruments"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Server-Side Swift with Vapor Framework",
                "description": "Deploy backend web services written in Swift using the Vapor framework, asynchronous NIO event loops, and PostgreSQL.",
                "topics_covered": ["Vapor Application Architecture & Routing", "Content Negotiation & Codable Models", "Fluent ORM Database Modeling", "Authentication with JWT & Password Hashing", "Dockerizing Swift Backend Services"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Kotlin JVM & Multiplatform Development",
        "slug": "kotlin-jvm-multiplatform-development",
        "category": "Programming",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master modern Kotlin for server-side backend development, JVM engineering, and cross-platform shared code with Kotlin Multiplatform (KMP). Learn null safety, coroutines, flows, extension functions, and modern framework integration with Ktor and Spring.",
        "skills_covered": ["Kotlin Null Safety & Syntax", "Extension Functions & Higher-Order Functions", "Kotlin Coroutines & Structured Concurrency", "Flows & Reactive Streams", "Kotlin Multiplatform (KMP) Architecture", "Ktor Microservices", "Serialization & Exposed ORM"],
        "prerequisites": ["Basic understanding of programming (Java, Python, or TypeScript)", "Familiarity with object-oriented and functional concepts"],
        "career_outcomes": ["Kotlin Backend Engineer", "Android/Kotlin Developer", "Kotlin Multiplatform Specialist", "Full Stack Kotlin Developer"],
        "tech_stack": ["Kotlin 2.x", "Coroutines", "Ktor", "Gradle (Kotlin DSL)", "Exposed ORM", "PostgreSQL", "JUnit 5"],
        "tags": ["kotlin", "jvm", "coroutines", "kmp", "ktor", "null-safety", "backend"],
        "capstone_projects": [
            {
                "title": "High-Concurrency Async Streaming API with Ktor & Coroutines",
                "description": "Build an asynchronous microservice using Ktor, Coroutine Channels/Flows, Exposed SQL ORM, and JWT authentication.",
                "difficulty": "Advanced"
            },
            {
                "title": "Cross-Platform Business Logic Core with Kotlin Multiplatform",
                "description": "Develop a shared KMP library containing networking, offline caching (SQLDelight), and reactive state stores consumed by Android, iOS, and Desktop.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Kotlin Official Documentation & Tutorials", "url": "https://kotlinlang.org/docs/home.html", "type": "Official Documentation"},
            {"title": "Kotlin Coroutines Guide by JetBrains", "url": "https://kotlinlang.org/docs/coroutines-guide.html", "type": "Interactive Guides"},
            {"title": "Kotlin in Action by Dmitry Jemerov", "url": "https://www.manning.com/books/kotlin-in-action-second-edition", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 42,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Kotlin Syntax, Null Safety & Idioms",
                "description": "Understand compile-time null safety, smart casts, val vs var, string templates, and when expressions.",
                "topics_covered": ["Null Safety & Nullable Types (T?)", "Safe Calls (?.) & Elvis Operator (?:)", "Smart Casting & Type Checks", "When Expressions & Pattern Matching", "Data Classes & Destructuring Declarations"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Functional Programming & Extension Functions",
                "description": "Harness higher-order functions, lambdas with receiver, scope functions (let, run, with, apply, also), and extension functions.",
                "topics_covered": ["Extension Functions & Properties", "Higher-Order Functions & Inline Functions", "Scope Functions (let, apply, also, run, with)", "Sequences for Lazy Evaluation", "Operator Overloading & Infix Functions"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Kotlin Coroutines & Structured Concurrency",
                "description": "Master asynchronous lightweight coroutines, Dispatchers, CoroutineScopes, Job lifecycles, and exception handling.",
                "topics_covered": ["Suspending Functions Mechanics", "Coroutine Builders (launch, async)", "Dispatchers (Default, IO, Main, Unconfined)", "Structured Concurrency & Job Cancellation", "SupervisorJob & Exception Handlers"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Asynchronous Streams with Kotlin Flow",
                "description": "Handle cold and hot reactive data streams using Kotlin Flows, StateFlow, SharedFlow, and transformation operators.",
                "topics_covered": ["Cold Flows vs Hot Flows", "Flow Builders & Intermediate Operators (map, filter, transform)", "Flow Context & flowOn Dispatcher Switching", "StateFlow & SharedFlow for State Management", "Buffering, Conflation & Backpressure"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Server-Side Microservices with Ktor Framework",
                "description": "Build asynchronous HTTP microservices using Ktor, content negotiation with kotlinx.serialization, and Exposed ORM.",
                "topics_covered": ["Ktor Application Engine & Routing DSL", "Content Negotiation with JSON Serialization", "Authentication & JWT Validation", "Database Access with Exposed ORM", "Writing Automated Tests with Ktor Test Engine"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Kotlin Multiplatform (KMP) Architecture",
                "description": "Share core architecture, networking, and data layers across Android, iOS, and Web using Kotlin Multiplatform.",
                "topics_covered": ["KMP Project Hierarchy & expect/actual Declarations", "Cross-Platform Networking with Ktor Client", "Cross-Platform Persistence with SQLDelight", "Gradle Multiplatform Configuration", "Packaging & Exporting Frameworks for iOS/CocoaPods"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Functional Programming with Elixir & Phoenix",
        "slug": "functional-programming-elixir-phoenix",
        "category": "Programming",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Master functional programming on the BEAM Erlang virtual machine with Elixir and Phoenix. Build fault-tolerant, massive-concurrency, distributed web systems utilizing lightweight processes, OTP GenServers, supervision trees, and real-time Phoenix LiveView.",
        "skills_covered": ["Immutability & Pattern Matching", "Erlang BEAM & Actor Model", "OTP GenServers & Supervisors", "Phoenix Framework & Ecto ORM", "Phoenix LiveView Real-Time UI", "Distributed Nodes & Message Passing", "Fault-Tolerant System Design"],
        "prerequisites": ["Experience with at least one programming language", "Basic familiarity with web development and databases"],
        "career_outcomes": ["Elixir Backend Engineer", "Phoenix Full Stack Developer", "Distributed Systems Engineer", "Real-Time Systems Architect"],
        "tech_stack": ["Elixir 1.16+", "Erlang/OTP", "Phoenix 1.7+", "Phoenix LiveView", "Ecto", "PostgreSQL", "Mix"],
        "tags": ["elixir", "phoenix", "functional-programming", "beam", "otp", "liveview", "concurrency"],
        "capstone_projects": [
            {
                "title": "Massively Concurrent Real-Time Chat & Collaboration Engine",
                "description": "Build a real-time messaging application with Phoenix Channels, LiveView, Presence tracking, and distributed PubSub across multiple BEAM nodes.",
                "difficulty": "Advanced"
            },
            {
                "title": "Distributed Background Job Scheduler with OTP Supervisors",
                "description": "Construct an in-memory resilient task queue using GenServers, dynamic supervision trees, and distributed node discovery.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Official Elixir Getting Started Guide", "url": "https://elixir-lang.org/getting-started/introduction.html", "type": "Official Guide"},
            {"title": "Phoenix Framework Documentation", "url": "https://hexdocs.pm/phoenix/overview.html", "type": "Documentation"},
            {"title": "Programming Elixir ≥ 1.6 by Dave Thomas", "url": "https://pragprog.com/titles/elixir16/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 58,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Elixir Syntax, Immutability & Pattern Matching",
                "description": "Understand pure functional immutability, pattern matching with the match operator (=), tuples, lists, and the pipe operator (|>).",
                "topics_covered": ["The Match Operator & Destructuring", "Atoms, Tuples, Lists & Keyword Lists", "Maps & Structs", "The Pipe Operator (|>) for Clean Pipelines", "Anonymous & Named Functions in Modules"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "BEAM Processes, Message Passing & The Actor Model",
                "description": "Spawn millions of lightweight BEAM processes, communicate via asynchronous message passing, and handle state without locks.",
                "topics_covered": ["Spawning Processes (spawn, spawn_link)", "Sending & Receiving Messages (send, receive)", "Stateful Processes & Recursive Loops", "Process Dictionaries & Mailbox Queues", "Process Links & Monitors"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "OTP GenServers & Supervision Trees",
                "description": "Harness the Open Telecom Platform (OTP) framework to build bulletproof systems with GenServer, Supervisor, and 'Let It Crash' philosophy.",
                "topics_covered": ["GenServer Callbacks (init, handle_call, handle_cast, handle_info)", "Client API vs Server Callbacks Separation", "Supervision Strategies (one_for_one, one_for_all, rest_for_one)", "DynamicSupervisor & Task.Supervisor", "Application Lifecycle Management"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Database Persistence with Ecto",
                "description": "Model and query data safely using Ecto schemas, changesets for validation, and composable SQL queries with transactions.",
                "topics_covered": ["Ecto.Schema & Model Definition", "Ecto.Changeset for Validations & Casting", "Composable Queries with Ecto.Query", "Multi-Step Transactions with Ecto.Multi", "Database Migrations & Seed Workflows"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Phoenix Web Framework & LiveView Architecture",
                "description": "Build high-speed web apps with Phoenix, server-rendered reactive interfaces with LiveView, and bidirectional websocket channels.",
                "topics_covered": ["Phoenix Router, Controllers & Views", "Phoenix PubSub & Channels", "LiveView Lifecycle (mount, handle_params, handle_event)", "LiveComponents & State Updates", "JS Interop with LiveView Hooks"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Distributed BEAM Clustering, Telemetry & Releases",
                "description": "Connect multiple Elixir nodes in a cluster, monitor production systems with Telemetry, and package deployments using Mix releases.",
                "topics_covered": ["Distributed Erlang & Node Connection (Node.connect)", "Distributed Registry & Presence", "Telemetry Events & LiveDashboard Monitoring", "Packaging Self-Contained Mix Releases", "Deploying with Docker & Fly.io"],
                "duration": "1 Week"
            }
        ]
    }
]

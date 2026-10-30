"""Domain 7: Mobile Roadmaps (12 Roadmaps)"""

MOBILE_ROADMAPS = [
    {
        "title": "Modern Android Development with Kotlin & Jetpack Compose",
        "slug": "android-development-kotlin-jetpack-compose",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Master modern native Android app development using 100% Kotlin and Jetpack Compose. Learn declarative UI design, unidirectional data flow, Kotlin Coroutines and StateFlow, dependency injection with Hilt, local persistence with Room, and Material 3 design.",
        "skills_covered": ["Kotlin for Android", "Jetpack Compose Declarative UI", "Coroutines & StateFlow", "Architecture Components (ViewModel, Navigation)", "Dependency Injection with Hilt", "Room Database & DataStore", "Material 3 Design System"],
        "prerequisites": ["Basic programming knowledge in Kotlin or Java", "Familiarity with object-oriented and functional programming"],
        "career_outcomes": ["Android Developer", "Mobile Application Engineer", "Native Mobile Architect", "Android UI Specialist"],
        "tech_stack": ["Kotlin 2.x", "Jetpack Compose", "Android Studio", "Hilt", "Room", "Retrofit", "Material 3"],
        "tags": ["android", "kotlin", "jetpack-compose", "mobile", "hilt", "room", "material3"],
        "capstone_projects": [
            {
                "title": "Full-Featured Offline-First E-Commerce & Delivery App",
                "description": "Build an Android app in Jetpack Compose featuring offline-first catalog caching with Room, animated shopping carts, network synchronization with Retrofit, and dependency injection with Hilt.",
                "difficulty": "Advanced"
            },
            {
                "title": "Real-Time Crypto & Stock Market Tracking Mobile App",
                "description": "Construct an interactive financial tracker using Compose canvas charts, Kotlin Flows for live ticker updates, and Material 3 dynamic color theming.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Android Developers Official Documentation & Compose Pathways", "url": "https://developer.android.com/courses", "type": "Official Courses"},
            {"title": "Jetpack Compose Internals by Jorge Castillo", "url": "https://jorgecastillo.dev/book/", "type": "Book"},
            {"title": "Philipp Lackner's Modern Android YouTube Tutorials", "url": "https://www.youtube.com/@PhilippLackner", "type": "Video Tutorials"}
        ],
        "is_featured": True,
        "popularity_rank": 26,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Jetpack Compose Fundamentals & Layouts",
                "description": "Embrace declarative UI: composable functions, Column, Row, Box layouts, modifiers, and understand recomposition mechanics.",
                "topics_covered": ["Declarative UI Paradigm vs Legacy XML Views", "@Composable Functions & Compose Compiler", "Standard Layouts: Column, Row, Box, Spacer", "Modifiers for Sizing, Padding, Backgrounds & Click Handling", "Recomposition Lifecycle & The remember Primitive"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "State Management, ViewModel & Unidirectional Data Flow",
                "description": "Structure state cleanly using rememberSaveable, StateFlow, ViewModel, and Unidirectional Data Flow (UDF) patterns.",
                "topics_covered": ["State Hoisting & Stateless vs Stateful Composables", "MutableStateOf vs rememberSaveable", "Architecture Components ViewModel Integration", "Observing StateFlow with collectAsStateWithLifecycle()", "Unidirectional Data Flow (UDF: Events Up, State Down)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Navigation & Material 3 Design System",
                "description": "Implement multi-screen navigation using the official Navigation Compose library and style with Material 3 dynamic theming.",
                "topics_covered": ["NavHost, NavController & Composable Destinations", "Passing Type-Safe Arguments between Screens", "Scaffold, TopAppBar, BottomNavigation & FloatingActionButton", "Material 3 Dynamic Color Scheme (Monet Engine)", "Dark Theme Support & Custom Typography Styles"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Networking & REST APIs with Retrofit & OkHttp",
                "description": "Connect mobile apps to backend services using Retrofit, Moshi/Kotlinx.serialization, OkHttp interceptors, and error handling.",
                "topics_covered": ["Defining Retrofit Service Interfaces with Suspend Functions", "JSON Parsing with Kotlinx Serialization / Moshi", "OkHttp Interceptors for Auth Headers & Logging", "Handling Network Errors & Resource Result Wrappers", "Image Loading with Coil Compose"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Local Persistence: Room Database & DataStore",
                "description": "Build offline-first local storage using Room SQLite database entities, DAOs with Coroutine Flows, and Preferences DataStore.",
                "topics_covered": ["Room Database Architecture: Entities, DAOs, Database Class", "Writing Type-Safe SQL Queries in DAOs", "Observing Database Queries as Reactive Flows", "Database Migrations Best Practices", "Preferences DataStore for Key-Value Settings Storage"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Dependency Injection with Hilt & Production Testing",
                "description": "Wire up clean architecture dependencies using Hilt, write UI tests with Compose Test Rule, and build release APK/AAB bundles.",
                "topics_covered": ["Hilt Architecture: @HiltAndroidApp, @AndroidEntryPoint", "@Module, @Provides, and @Binds Dependency Definitions", "Constructor Injection into ViewModels (@HiltViewModel)", "UI Testing with createComposeRule()", "Building Release Android App Bundles (.aab) with ProGuard/R8"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "iOS App Development with Swift & SwiftUI",
        "slug": "ios-development-swift-swiftui",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Master native iOS app development for iPhone, iPad, and Apple ecosystem using Swift and SwiftUI. Learn declarative view composition, navigation, modern Swift Concurrency, MVVM architecture, SwiftData/Core Data persistence, and App Store submission.",
        "skills_covered": ["SwiftUI Declarative Architecture", "Modern State Management (@State, @Binding)", "Observation Framework (@Observable)", "Swift Concurrency (async/await, Actors)", "SwiftData Persistence", "NavigationStack & Sheets", "App Store Publishing Guidelines"],
        "prerequisites": ["Basic understanding of programming in Swift or an object-oriented language", "Access to a Mac with Xcode installed"],
        "career_outcomes": ["iOS Developer", "Apple Platform Engineer", "SwiftUI Specialist", "Mobile Applications Developer"],
        "tech_stack": ["Swift 6", "SwiftUI", "Xcode", "SwiftData", "Instruments", "TestFlight", "CocoaPods / SPM"],
        "tags": ["ios", "swift", "swiftui", "apple", "mobile", "swiftdata", "xcode"],
        "capstone_projects": [
            {
                "title": "Interactive Habit Tracker & Fitness Journal with SwiftData",
                "description": "Build an iOS application featuring custom SwiftUI animated progress rings, SwiftData local persistence, interactive home screen widgets with WidgetKit, and CloudKit iCloud syncing.",
                "difficulty": "Advanced"
            },
            {
                "title": "Audio Podcast Streaming Player with Lock Screen Controls",
                "description": "Develop an audio streaming iOS app utilizing AVFoundation, background audio playback, lock screen now playing controls, and dynamic playlist filtering.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "100 Days of SwiftUI by Paul Hudson (Hacking with Swift)", "url": "https://www.hackingwithswift.com/100/swiftui", "type": "Interactive Course"},
            {"title": "Apple Developer Documentation & SwiftUI Tutorials", "url": "https://developer.apple.com/tutorials/swiftui", "type": "Official Documentation"},
            {"title": "Swift by Sundell iOS Development Articles", "url": "https://www.swiftbysundell.com/", "type": "Articles & Guides"}
        ],
        "is_featured": True,
        "popularity_rank": 25,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "SwiftUI Declarative Foundations & View Composition",
                "description": "Understand declarative UI composition: View protocol, body property, standard views (Text, Image, Button), and view modifiers.",
                "topics_covered": ["Imperative UIKit vs Declarative SwiftUI Paradigm", "The View Protocol & some View Opaque Return Type", "Stack Layouts: VStack, HStack, ZStack", "View Modifiers & Execution Order Nuances", "Extracting Reusable Subviews & Custom Modifiers"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "State Management & The Modern Observation Framework",
                "description": "Master data flow in SwiftUI: @State, @Binding, and the modern Swift Observation framework (@Observable macro).",
                "topics_covered": ["Source of Truth Principle in SwiftUI", "@State for Local View State", "@Binding for Two-Way Child View Communication", "The @Observable Macro in Swift 5.9+ / Swift 6", "@Environment for Injected Global Dependencies"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Lists, NavigationStack & Modal Presentations",
                "description": "Build fluid multi-screen apps using NavigationStack, List, ScrollView, sheet modals, and alert presentations.",
                "topics_covered": ["NavigationStack & navigationDestination(for:)", "Lists, LazyVStack & ScrollView Performance", "Modal Sheets (.sheet) & Full-Screen Covers", "Custom TabView Hierarchies", "Handling User Gestures (Tap, Drag, LongPress)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Asynchronous Networking with Modern Swift Concurrency",
                "description": "Fetch remote data asynchronously using URLSession, async/await, Task, JSONDecoder, and prevent race conditions with Actors.",
                "topics_covered": ["URLSession Data Tasks with Async/Await", "JSON Parsing with Codable Protocol", "The .task View Modifier for Lifecycle Fetching", "Swift Actors for Thread-Safe Data Managers", "@MainActor for Guaranteed UI Thread Updates"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Data Persistence with SwiftData & CloudKit Sync",
                "description": "Persist application data using Apple's SwiftData framework: @Model schemas, @Query property wrappers, and model contexts.",
                "topics_covered": ["SwiftData Architecture: @Model Macro", "Querying & Filtering with @Query & Predicates", "ModelContext CRUD Operations (Insert, Delete, Save)", "One-to-Many & Many-to-Many Model Relationships", "Automatic CloudKit iCloud Syncing Integration"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Widgets, Profiling with Instruments & App Store Release",
                "description": "Build Home Screen widgets with WidgetKit, audit memory leaks with Instruments, and prepare apps for TestFlight and App Store review.",
                "topics_covered": ["Building iOS Home Screen Widgets with WidgetKit", "Memory Leak & Retain Cycle Profiling with Xcode Instruments", "Unit & UI Testing with XCTest Framework", "Configuring App Icons, Launch Screens & Privacy Permissions", "TestFlight Beta Distribution & App Store Connect Submission"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Cross-Platform Mobile Apps with Flutter & Dart",
        "slug": "cross-platform-flutter-dart-development",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Build natively compiled, 60 FPS cross-platform mobile apps for iOS and Android from a single codebase using Google Flutter and Dart. Master the widget tree, state management (Bloc / Riverpod), asynchronous programming, native platform channels, and local caching.",
        "skills_covered": ["Dart 3 Language & Patterns", "Flutter Widget Architecture", "State Management (Bloc & Riverpod)", "Navigation & Routing (GoRouter)", "REST API Integration (Dio)", "Local Storage with Hive / Isar", "Native Platform Channels (MethodChannel)"],
        "prerequisites": ["Basic understanding of object-oriented programming in any language", "Familiarity with mobile concepts"],
        "career_outcomes": ["Flutter Developer", "Cross-Platform Mobile Engineer", "Mobile Applications Architect", "Dart Software Developer"],
        "tech_stack": ["Flutter 3.x", "Dart 3", "Bloc / Riverpod", "GoRouter", "Dio", "Hive", "Android Studio / VS Code"],
        "tags": ["flutter", "dart", "cross-platform", "mobile", "bloc", "riverpod", "ios-android"],
        "capstone_projects": [
            {
                "title": "Food Delivery & Live Order Tracking Mobile App with Flutter",
                "description": "Build a production-quality cross-platform food ordering app with interactive menu carousels, Cart state management via Bloc, live GPS driver tracking on Google Maps, and Stripe payments.",
                "difficulty": "Advanced"
            },
            {
                "title": "Personal Finance & Expense Tracker with Offline Sync",
                "description": "Construct an intuitive budgeting application featuring interactive animated charts, local NoSQL persistence with Hive, and biometric authentication.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Flutter Official Documentation & Codelabs", "url": "https://docs.flutter.dev/", "type": "Official Documentation"},
            {"title": "Dart.dev Official Language Tour & Guides", "url": "https://dart.dev/guides", "type": "Documentation"},
            {"title": "Flutter in Action by Eric Windmill", "url": "https://www.manning.com/books/flutter-in-action", "type": "Book"}
        ],
        "is_featured": True,
        "popularity_rank": 28,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Dart 3 Fundamentals & Object-Oriented Principles",
                "description": "Master Dart 3: null safety, records, pattern matching, class modifiers (sealed, interface), and asynchronous Futures and Streams.",
                "topics_covered": ["Dart Type System & Sound Null Safety", "Records & Pattern Matching in Dart 3", "Classes, Mixins & Inheritance", "Asynchronous Programming with Futures & async/await", "Reactive Streams & StreamControllers"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Flutter Widget Tree & Layout Architecture",
                "description": "Understand Flutter's rendering engine (Impeller): StatelessWidget, StatefulWidget, Element Tree, RenderObjects, and standard layouts.",
                "topics_covered": ["The 3 Trees: Widget Tree, Element Tree, RenderObject Tree", "StatelessWidget vs StatefulWidget Lifecycle", "Layout Primitives: Container, Column, Row, Stack, Expanded", "ListView, GridView & Slivers for Custom Scrolling", "Impeller Rendering Engine Mechanics"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "State Management with BLoC & Riverpod",
                "description": "Separate UI from business logic using the BLoC (Business Logic Component) pattern or modern Riverpod providers.",
                "topics_covered": ["Why SetState Does Not Scale in Production", "BLoC Pattern: Events, States, and Event Handlers", "BlocBuilder, BlocListener, and BlocConsumer", "Riverpod 2.x Notifier & StateNotifier Providers", "Choosing the Right State Architecture for Scalability"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Declarative Routing with GoRouter",
                "description": "Implement multi-screen navigation, deep linking, nested route tabs, and route redirection using the GoRouter package.",
                "topics_covered": ["Imperative Navigator 1.0 vs Declarative Router", "Configuring GoRouter Routes & ShellRoutes for Bottom Bars", "Passing Path & Query Parameters", "Authentication Redirection Guards", "Handling Mobile Deep Links from URLs"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Networking with Dio & Local Caching with Hive",
                "description": "Connect to REST services with Dio interceptors, parse JSON models, and persist data offline using fast key-value storage.",
                "topics_covered": ["HTTP Client Architecture with Dio", "Dio Interceptors for JWT Refresh Tokens", "JSON Serialization with json_serializable / build_runner", "Fast Lightweight NoSQL Local Storage with Hive / Isar", "Building an Offline-First Sync Repository"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Native Platform Channels, Permissions & Publishing",
                "description": "Communicate with native iOS/Android SDKs via MethodChannels, configure hardware permissions, and build release bundles.",
                "topics_covered": ["MethodChannel Communication with Kotlin and Swift", "Requesting Camera, Location & Biometric Permissions", "Custom Animations with AnimatedBuilder & Hero Transitions", "Flavor Configurations for Dev, Staging, and Production", "Generating APK/AAB for Google Play and IPA for App Store"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "React Native & Expo Mobile Engineering",
        "slug": "react-native-expo-mobile-engineering",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master cross-platform mobile development using React Native and modern Expo. Learn the New Architecture (TurboModules, Fabric renderer, Bridgeless mode), Expo Router file-based navigation, gesture animations with Reanimated 3, native device APIs, and EAS cloud builds.",
        "skills_covered": ["React Native Core Components", "The New Architecture (Fabric & TurboModules)", "Expo Router File-Based Routing", "Gesture Handling with React Native Gesture Handler", "Fluid Animations with Reanimated 3", "EAS (Expo Application Services) Cloud Build", "Offline Storage with MMKV"],
        "prerequisites": ["Proficiency in React (hooks, components, state management)", "Solid understanding of modern JavaScript and TypeScript"],
        "career_outcomes": ["React Native Developer", "Cross-Platform Mobile Engineer", "Full Stack Mobile Developer", "Mobile Solutions Architect"],
        "tech_stack": ["React Native", "Expo SDK 51+", "TypeScript", "Expo Router", "Reanimated 3", "MMKV", "EAS"],
        "tags": ["react-native", "expo", "mobile", "cross-platform", "reanimated", "fabric", "turbomodules"],
        "capstone_projects": [
            {
                "title": "Social Media Mobile App with Stories & Real-Time Chat",
                "description": "Build an engaging cross-platform social mobile app in React Native featuring video reels, animated swipeable stories using Reanimated 3, real-time chat with WebSockets, and push notifications.",
                "difficulty": "Advanced"
            },
            {
                "title": "Offline-First Fitness & Workout Tracker",
                "description": "Develop an intuitive fitness app with ultra-fast local persistence using react-native-mmkv, custom SVG body charts, and audio timer cues.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "React Native Official Documentation", "url": "https://reactnative.dev/docs/getting-started", "type": "Official Documentation"},
            {"title": "Expo Official Guides & Tutorials", "url": "https://docs.expo.dev/", "type": "Documentation"},
            {"title": "Software Mansion - React Native Reanimated Guide", "url": "https://docs.swmansion.com/react-native-reanimated/", "type": "Interactive Guides"}
        ],
        "is_featured": False,
        "popularity_rank": 29,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "React Native Fundamentals & The New Architecture",
                "description": "Understand mobile rendering primitives (View, Text, Image, FlatList) and the New Architecture (Fabric, TurboModules, Bridgeless).",
                "topics_covered": ["Native Components vs Web DOM Elements", "The Old Bridge vs The New Architecture (Fabric Renderer & TurboModules)", "JSI (JavaScript Interface) Direct Synchronous Calls", "Core Components: View, Text, Image, ScrollView, FlatList", "Setting up Modern Expo Projects with Prebuild"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "File-Based Navigation with Expo Router",
                "description": "Master navigation modeled on web standards: app/ directory, tabs, stacks, dynamic routes, and native modal presentations.",
                "topics_covered": ["Expo Router Paradigm & File-Based Routing", "Stack Layouts (<Stack>) & Tab Bars (<Tabs>)", "Dynamic Routes (app/user/[id].tsx)", "Native Modal Presentation Styles", "Deep Linking & Universal Links Configuration"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "High-Performance Animations with Reanimated 3",
                "description": "Create 60/120 FPS animations running entirely on the native UI thread using react-native-reanimated worklets and shared values.",
                "topics_covered": ["JavaScript Thread vs UI Thread Frame Drops", "Reanimated 3 Shared Values & useAnimatedStyle", "Worklets: Running JavaScript Functions on the UI Thread", "Spring, Timing & Decay Physics Animations", "Layout Animations (FadeIn, SlideOut, Layout Transition)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Native Gestures & Bottom Sheets",
                "description": "Handle complex pinch, pan, and swipe gestures natively using react-native-gesture-handler and Gorhom Bottom Sheet.",
                "topics_covered": ["GestureHandlerRootView & Gesture Detectors", "Pan, Pinch, Rotation, and Tap Gestures", "Simultaneous & Exclusive Gesture Composition", "Building Smooth Draggable Bottom Sheets", "Swipe-to-Delete List Items with Full Tactile Feedback"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Native Hardware APIs & Ultra-Fast MMKV Storage",
                "description": "Access device hardware (Camera, Location, Haptics) via Expo modules and replace slow AsyncStorage with lightning-fast MMKV.",
                "topics_covered": ["Expo Camera & Media Library Permissions", "Location Tracking & Geofencing with expo-location", "Tactile User Feedback with expo-haptics", "High-Performance Key-Value Storage with react-native-mmkv", "Configuring Secure Biometrics with expo-local-authentication"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "EAS Cloud Builds, OTA Updates & App Store Release",
                "description": "Automate cloud compilation and deployment with EAS Build, ship instant over-the-air bug fixes with EAS Update, and release.",
                "topics_covered": ["Expo Application Services (EAS) Architecture", "Configuring eas.json for Development, Preview & Production", "Over-The-Air (OTA) JavaScript Updates with EAS Update", "Generating Native App Credentials (Keystores & Provisioning Profiles)", "Submitting Directly to Google Play and Apple App Store via EAS Submit"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Mobile Security & Secure App Architecture",
        "slug": "mobile-security-secure-app-architecture",
        "category": "Mobile",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Protect Android and iOS applications against reverse engineering, tampering, data exfiltration, and unauthorized API access. Learn OWASP Mobile Top 10, Keychain/Keystore secure storage, SSL pinning, jailbreak/root detection, code obfuscation (ProGuard/R8), and dynamic analysis with Frida.",
        "skills_covered": ["OWASP Mobile Top 10 Standards", "iOS Keychain & Android Keystore Systems", "SSL / TLS Certificate Pinning", "Root & Jailbreak Detection", "Dynamic Instrumentation with Frida", "Binary Decompilation & Reverse Engineering (JADX)", "Code Obfuscation with ProGuard/R8"],
        "prerequisites": ["Experience building native or cross-platform mobile applications", "Basic understanding of mobile operating systems and cryptography"],
        "career_outcomes": ["Mobile Security Engineer", "Application Security Specialist - Mobile", "Mobile Penetration Tester", "FinTech Security Architect"],
        "tech_stack": ["Frida", "JADX", "Burp Suite", "Android Keystore", "iOS Keychain", "ProGuard / R8", "Objection"],
        "tags": ["mobile-security", "owasp-mobile", "frida", "ssl-pinning", "jailbreak-detection", "reverse-engineering", "android-security"],
        "capstone_projects": [
            {
                "title": "Complete Mobile Penetration Test & Security Audit Report",
                "description": "Conduct a comprehensive security audit of an enterprise mobile banking application: bypass root detection using Frida scripts, inspect in-transit traffic by circumventing SSL pinning, and extract hardcoded secrets.",
                "difficulty": "Advanced"
            },
            {
                "title": "Hardened Multi-Layer Mobile Security SDK",
                "description": "Develop an open-source security SDK for mobile apps that provides cryptographic storage wrappers, runtime integrity verification, and tamper alerting.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "OWASP Mobile Security Testing Guide (MSTG)", "url": "https://mas.owasp.org/MASTG/", "type": "Comprehensive Standard"},
            {"title": "Frida Official Dynamic Instrumentation Toolkit Documentation", "url": "https://frida.re/docs/home/", "type": "Documentation"},
            {"title": "iOS and Android Application Security by David Thiel", "url": "https://nostarch.com/iossecurity", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 69,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "OWASP Mobile Top 10 & Threat Vectors",
                "description": "Examine the most critical mobile vulnerabilities: improper credential usage, inadequate supply chain security, insecure authentication, and insufficient cryptography.",
                "topics_covered": ["OWASP Mobile Top 10 Vulnerabilities Overview", "Mobile Threat Landscape & Untrusted Client Realities", "Decompiling Android APKs with JADX-GUI", "Extracting Hardcoded API Keys, Passwords & Secrets", "Static Analysis of AndroidManifest.xml & Info.plist"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Secure Hardware-Backed Data Storage",
                "description": "Protect tokens and sensitive data using hardware-backed cryptoprocessors: Android Keystore, EncryptedSharedPreferences, and iOS Keychain.",
                "topics_covered": ["Insecure Local Storage Risks (Plain SharedPrefs, SQLite, LocalStorage)", "Android Keystore System & StrongBox Keymaster", "EncryptedSharedPreferences Implementation", "iOS Keychain Services & kSecAttrAccessible Accessibility Attributes", "Biometric Authentication Gateways (CryptoObject Verification)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Network Security & SSL / TLS Certificate Pinning",
                "description": "Prevent Man-in-the-Middle (MitM) attacks by pinning public key hashes in the mobile network client and handling pin rotation.",
                "topics_covered": ["The Risk of Compromised System Root Certificate Authorities", "Public Key Pinning vs Certificate Pinning Architecture", "Implementing SSL Pinning in OkHttp (CertificatePinner)", "Network Security Config in Android (network_security_config.xml)", "Managing Graceful Pin Rotation to Prevent Brick Apps"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Anti-Tampering: Root & Jailbreak Detection",
                "description": "Detect compromised operating system environments: detecting su binaries, Magisk hide, Cydia, test-keys, and debugger attachments.",
                "topics_covered": ["Risks of Running on Rooted / Jailbroken Devices", "Heuristic Checks: Common su Binaries, Packages, and Mount Permissions", "Detecting Magisk, Zygisk, and KernelSU", "Detecting Debugger Attachments (ptrace, isDebuggerConnected)", "Defending against Hooking Frameworks (Substrate, Xposed)"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Dynamic Instrumentation with Frida & Objection",
                "description": "Bypass client-side security controls dynamically at runtime by hooking native and Java/Obj-C methods with Frida and Objection.",
                "topics_covered": ["Frida Architecture & JavaScript In-Process Injection", "Exploring Mobile Apps with Objection CLI", "Hooking Java Methods in Memory & Altering Return Values", "Bypassing Root Detection & SSL Pinning via Frida Scripts", "Intercepting In-Memory Encryption Keys"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Code Obfuscation, Anti-Reversing & Integrity Attestation",
                "description": "Harden compiled binaries using ProGuard/R8, string encryption, and verify app authenticity using Google Play Integrity API / Apple App Attest.",
                "topics_covered": ["ProGuard / R8 Rules for Symbol Stripping & Renaming", "Commercial Obfuscation Techniques (Control Flow Flattening)", "Google Play Integrity API for Attesting Genuine App Copies", "Apple DeviceCheck & App Attest Framework", "Establishing a Defense-in-Depth Mobile Architecture"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Mobile App Performance, Profiling & Battery Optimization",
        "slug": "mobile-performance-profiling-optimization",
        "category": "Mobile",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "6 Weeks",
        "description": "Optimize native and cross-platform mobile apps for smooth 60/120 FPS frame rates, minimal battery consumption, rapid cold startup, and low memory footprints. Master Android Studio Profiler, Apple Instruments, memory leak detection with LeakCanary, and battery drain analysis.",
        "skills_covered": ["Frame Rate & Jank Elimination (16ms/8ms budgets)", "Android Studio CPU & Memory Profiler", "Apple Instruments (Time Profiler, Allocations)", "Memory Leaks & Retain Cycle Detection", "Battery Drain & Wake Lock Auditing", "Cold Startup Time Optimization", "Network Payload Compression"],
        "prerequisites": ["Experience developing mobile applications for iOS or Android", "Basic understanding of mobile operating system runtimes"],
        "career_outcomes": ["Mobile Performance Engineer", "Senior Android/iOS Developer", "Mobile Core Platform Architect", "Mobile Optimization Specialist"],
        "tech_stack": ["Android Studio Profiler", "Apple Instruments", "LeakCanary", "Systrace / Perfetto", "Flipper"],
        "tags": ["mobile-performance", "profiling", "battery-optimization", "memory-leaks", "instruments", "jank", "android-profiler"],
        "capstone_projects": [
            {
                "title": "Laggy Mobile Feed Optimization Audit & Benchmark",
                "description": "Diagnose and optimize a heavily lagging social media feed dropping frames below 20 FPS: profile memory allocations, eliminate nested view hierarchies, fix retain cycles with LeakCanary, and restore 120 FPS smooth scrolling.",
                "difficulty": "Advanced"
            },
            {
                "title": "Zero-Impact Background Geolocation Tracking Engine",
                "description": "Develop a power-efficient background location logging daemon that optimizes GPS duty cycles, batching updates to reduce device battery consumption by over 60%.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Android Performance Documentation & Best Practices", "url": "https://developer.android.com/topic/performance", "type": "Official Documentation"},
            {"title": "Apple Developer: Improving App Performance with Instruments", "url": "https://developer.apple.com/documentation/xcode/improving-app-performance", "type": "Official Guide"},
            {"title": "High Performance Android Apps by Doug Sillars", "url": "https://www.oreilly.com/library/view/high-performance-android/9781491913994/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 73,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Rendering Pipeline, Jank & Frame Budgets",
                "description": "Understand display refresh rates: 60Hz (16.6ms) and 120Hz (8.3ms) frame budgets, UI thread bottlenecks, and visual jank.",
                "topics_covered": ["Mobile Display Refresh Rates & VSync Signaling", "Frame Rendering Pipeline (Measure, Layout, Draw)", "What Causes Jank: Dropped Frames & Garbage Collection Pauses", "Overdraw Diagnostics & Transparent View Layers", "Identifying Slow Frames with Android Vitals and Xcode Organizer"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "CPU Profiling & Systrace / Perfetto Analysis",
                "description": "Profile CPU execution bottlenecks using Android Studio CPU Profiler, method tracing, Systrace, and modern Perfetto trace visualizer.",
                "topics_covered": ["Sampled vs Traced CPU Profiling Modes", "Reading Call Charts, Flame Charts & Top-Down Execution Trees", "System-Wide Tracing with Perfetto", "Tracing Main Thread Work with Custom Trace Markers", "Eliminating Heavy Computations on the UI Thread"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Memory Allocations, Churn & Leak Detection",
                "description": "Eliminate Out-Of-Memory (OOM) crashes by diagnosing object allocation churn, heap dumps, and automated leak detection with LeakCanary.",
                "topics_covered": ["Garbage Collection Mechanics on Dalvik/ART and iOS ARC", "Memory Churn: Frequent Short-Lived Allocations in Loops", "Heap Dumps Acquisition & Analysis in Android Studio / Eclipse MAT", "Detecting Activity & Fragment Leaks Automatically with LeakCanary", "Finding Retain Cycles in Xcode Instruments (Allocations & Leaks)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "App Startup Time Optimization (Cold, Warm, Hot)",
                "description": "Speed up app launch times: optimizing Application.onCreate(), lazy-loading SDKs, Baseline Profiles, and app prewarming.",
                "topics_covered": ["Cold Start vs Warm Start vs Hot Start Definitions", "Analyzing Startup Bottlenecks with Android App Startup Library", "Generating Android Baseline Profiles with Macrobenchmark", "Deferring Third-Party Analytics and Crash SDK Initializations", "Splash Screen Best Practices & Pre-Rendering Layouts"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Battery Drain, Radio Energy & Doze Mode",
                "description": "Optimize power consumption: cellular radio power states, background work constraints, Doze mode, and Energy Profiler.",
                "topics_covered": ["Mobile Cellular Radio States (Active, Full Power, Idle Tail)", "Battery Drain Profiling with Android Battery Historian", "Scheduling Deferrable Work with WorkManager & BackgroundTasks", "Handling Android Doze Mode & App Standby Buckets", "Optimizing GPS Power Consumption with Fused Location Provider"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Network Optimization, Image Caching & APK/IPA Sizing",
                "description": "Reduce cellular data usage and shrink app bundle sizes using image caching, Gzip/Brotli, ProGuard/R8, and resource shrinking.",
                "topics_covered": ["Network Batching & Compression (Protobuf vs JSON)", "Memory-Efficient Image Downsampling with Coil / Glide / SDWebImage", "Multi-Level Disk and RAM Image Caches", "Reducing APK/AAB Size with R8 Resource Shrinking and App Bundles", "Stripping Unused ABIs & Native Dynamic Libraries (.so files)"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Offline-First Mobile Architectures with SQLite & WatermelonDB",
        "slug": "offline-first-mobile-architectures",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Architect mission-critical mobile applications that work seamlessly with zero internet connectivity. Master offline-first principles, local embedded SQLite, lazy-loading WatermelonDB for React Native, conflict resolution algorithms (Last-Write-Wins, CRDTs), and robust background sync queues.",
        "skills_covered": ["Offline-First Design Principles", "Embedded SQLite Performance Tuning", "WatermelonDB for React Native", "Conflict Resolution Strategies", "Background Synchronization Queues", "Optimistic UI Updates", "Delta Sync & Change Tracking"],
        "prerequisites": ["Experience with mobile development (React Native, Flutter, or native Android/iOS)", "Basic knowledge of SQL databases and REST APIs"],
        "career_outcomes": ["Offline Mobile Architect", "Senior Mobile Engineer", "Mobile Core Systems Developer", "Field Software Engineer"],
        "tech_stack": ["WatermelonDB", "SQLite", "React Native / Kotlin", "TypeScript", "REST / WebSockets", "Docker"],
        "tags": ["offline-first", "watermelondb", "sqlite", "crdt", "synchronization", "mobile", "local-storage"],
        "capstone_projects": [
            {
                "title": "Mission-Critical Field Inspection Mobile App with Full Offline Sync",
                "description": "Build an offline-first field inspection tablet app using WatermelonDB and SQLite that allows workers in remote areas to record inspections, take photo attachments, and automatically sync conflicts with cloud servers upon reconnection.",
                "difficulty": "Advanced"
            },
            {
                "title": "Collaborative Offline-First Notes App with CRDT Conflict Resolution",
                "description": "Construct a collaborative notes application that allows simultaneous multi-device offline edits, resolving conflicts mathematically without data loss using Conflict-Free Replicated Data Types (CRDTs).",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "WatermelonDB Official Documentation & Architecture Guide", "url": "https://watermelondb.dev/docs", "type": "Documentation"},
            {"title": "Offline First: The Future of Software Architecture", "url": "http://offlinefirst.org/", "type": "Community Guidelines"},
            {"title": "An Introduction to Conflict-Free Replicated Data Types (CRDTs)", "url": "https://crdt.tech/", "type": "Research Hub"}
        ],
        "is_featured": False,
        "popularity_rank": 70,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The Offline-First Philosophy & Architecture",
                "description": "Understand why online-first mobile apps fail: flaky connections, latency spikes, and treating the local database as the primary source of truth.",
                "topics_covered": ["The Flawed Assumptions of Online-First Mobile Architectures", "Local Database as the Single Source of Truth for the UI", "Optimistic Mutations: Instant Feedback with Asynchronous Sync", "Network Reachability Monitoring vs False Positives", "Handling Intermittent & Low-Bandwidth Network Conditions"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "High-Performance Embedded SQLite Optimization",
                "description": "Tune local SQLite databases for tens of thousands of records: PRAGMA optimizations, write-ahead logging (WAL), and indexing.",
                "topics_covered": ["SQLite B-Tree Storage Architecture on Flash Memory", "Write-Ahead Logging (PRAGMA journal_mode = WAL)", "PRAGMA synchronous = NORMAL for Faster Commits", "Indexing Strategies on Local Relational Tables", "Managing Database Migrations Across App Version Upgrades"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Lazy-Loading Reactive Databases with WatermelonDB",
                "description": "Scale React Native apps to 100,000+ records with WatermelonDB: lazy-loaded observable models, query decorators, and batch mutations.",
                "topics_covered": ["WatermelonDB Architecture & Multi-Threaded Native SQLite Driver", "Defining Schemas, Tables & Model Classes with Decorators", "Reactive Queries with RxJS Observables in Components", "Lazy Loading Data to Maintain Instant Startup Times", "Batching Thousands of Local Record Mutations"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Synchronization Protocols: Delta Sync & Push/Pull Loops",
                "description": "Design bidirectional synchronization protocols: pulling changed records since last_pulled_at timestamp and pushing local mutations.",
                "topics_covered": ["The 2-Phase Synchronization Protocol (Pull Changes -> Push Changes)", "Timestamp-Based Delta Synchronization (since_timestamp)", "Soft Deletes & Tombstones (deleted_at Column)", "WatermelonDB synchronize() Native Protocol Integration", "Handling Payload Chunking for Large Initial Synchronizations"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Conflict Resolution: Last-Write-Wins vs CRDTs",
                "description": "Resolve multi-device collision conflicts: Last-Write-Wins (LWW), field-level merging, manual conflict review, and state-based CRDTs.",
                "topics_covered": ["Why Conflicts Happen: Concurrent Edits on Offline Devices", "Last-Write-Wins (LWW) Pros, Cons, and Data Loss Risks", "Field-Level Semantic Merging Strategies", "Conflict-Free Replicated Data Types (CRDTs: LWW-Element-Set, PN-Counter)", "Designing User-Facing Conflict Resolution Modals"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Offline Binary Media & Resilient Sync Queues",
                "description": "Manage offline file attachments (photos, voice recordings), resume paused uploads, and build persistent background queues.",
                "topics_covered": ["Local File Storage Schemes for Images & Documents", "Persistent Work Queues for Background Uploads", "Resumable File Uploads with TUS Protocol", "Handling Background Execution Limits on iOS & Android", "End-to-End Testing of Offline Workflows & Network Flapping"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Audio & Video Streaming Apps on Mobile",
        "slug": "audiovideo-streaming-mobile-apps",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Build high-performance media streaming mobile applications like Spotify and YouTube. Master HTTP Live Streaming (HLS), Dynamic Adaptive Streaming (DASH), media player engines (Android ExoPlayer / Media3 and iOS AVPlayer), background playback, and offline downloads.",
        "skills_covered": ["HLS & DASH Streaming Protocols", "Android Media3 / ExoPlayer Engine", "Apple AVFoundation & AVPlayer", "Adaptive Bitrate (ABR) Streaming", "Background Media Playback & Controls", "Offline Encrypted Media Caching", "DRM & Digital Rights Management"],
        "prerequisites": ["Intermediate Android (Kotlin) or iOS (Swift) mobile engineering experience", "Understanding of network protocols and media formats"],
        "career_outcomes": ["Mobile Streaming Engineer", "Audio/Video Application Developer", "Media Infrastructure Mobile Specialist", "Senior Mobile Engineer"],
        "tech_stack": ["Android Media3 (ExoPlayer)", "iOS AVPlayer", "Kotlin", "Swift", "FFmpeg", "HLS / DASH"],
        "tags": ["streaming", "video-streaming", "audio-streaming", "exoplayer", "avplayer", "hls", "mobile"],
        "capstone_projects": [
            {
                "title": "Production YouTube-Style Video Streaming Mobile App",
                "description": "Build a responsive mobile video player app featuring HLS adaptive bitrate streaming, picture-in-picture (PiP) support, custom player gesture controls, and offline video downloading.",
                "difficulty": "Advanced"
            },
            {
                "title": "Full-Featured Background Audio Streaming Service",
                "description": "Construct a background audio playback service adhering to OS media session standards with lock-screen metadata controls, headphone button hooks, and automated audio focus ducking.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Android Media3 Official Developer Guide", "url": "https://developer.android.com/media/media3", "type": "Official Documentation"},
            {"title": "Apple AVFoundation Programming Guide", "url": "https://developer.apple.com/av-foundation/", "type": "Documentation"},
            {"title": "How Video Streaming Works: An Introduction by Mux", "url": "https://www.mux.com/blog/how-video-streaming-works", "type": "Industry Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 81,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Digital Audio/Video Fundamentals & Streaming Protocols",
                "description": "Understand codecs (H.264, H.265, AAC, Opus), containers (MP4), fragmented MP4, and streaming protocols (HLS, DASH).",
                "topics_covered": ["Video Containers vs Compression Codecs (AVC/H.264, HEVC, AV1)", "Audio Encoding Standards (AAC, Opus, FLAC)", "HTTP Live Streaming (HLS) Architecture: M3U8 Master & Media Playlists", "DASH (Dynamic Adaptive Streaming over HTTP) MPD Manifests", "Segmented Video Chunks (.ts, .m4s) and Bandwidth Switching"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Android Media3 & ExoPlayer Architecture",
                "description": "Implement media playback with Google's Media3 library: ExoPlayer, PlayerView, MediaSource, TrackSelection, and buffering.",
                "topics_covered": ["Android Media3 Architecture & Upgrading from Legacy ExoPlayer", "Setting Up PlayerView & Custom UI Controllers", "MediaSource Hierarchy (HlsMediaSource, ProgressiveMediaSource)", "TrackSelector for Custom Audio Languages & Subtitles", "Customizing Buffer Parameters (DefaultLoadControl) for Fast Startup"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "iOS Video Playback with AVFoundation & AVPlayer",
                "description": "Stream adaptive video on iOS using AVPlayer, AVPlayerLayer, AVPlayerViewController, and KVO state monitoring.",
                "topics_covered": ["AVFoundation Architecture: AVURLAsset, AVPlayerItem, AVPlayer", "Displaying Video with AVPlayerLayer and SwiftUI VideoPlayer", "Key-Value Observing (KVO) on AVPlayerItem.Status and TimeRanges", "Handling Adaptive Bitrate (ABR) Switching Automatically", "Picture-in-Picture (PiP) Mode Integration on iOS"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Background Audio Playback & MediaSession Controls",
                "description": "Keep audio playing while the app is backgrounded or device is locked, integrating with OS notification and lock-screen controls.",
                "topics_covered": ["Configuring Background Modes on iOS & Android Foreground Services", "Android MediaSessionService & Notification MediaStyle", "iOS MPNowPlayingInfoCenter & MPRemoteCommandCenter", "Handling Audio Focus & Interruption Events (Phone Calls, Siri)", "Bluetooth Headset Button Controls & Becoming Noisy Broadcasts"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Offline Media Downloads & Storage Management",
                "description": "Allow users to download streaming video and audio playlists for offline playback with progress notifications.",
                "topics_covered": ["Parsing & Downloading HLS/DASH Chunks Locally", "ExoPlayer DownloadManager & DownloadService", "iOS AVAggregateAssetDownloadTask for Offline HLS", "Managing Storage Quotas & Secure Local File Encryption", "Verifying Playback Integrity in Airplane Mode"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Digital Rights Management (DRM) & Performance Analytics",
                "description": "Protect copyrighted content with Widevine and FairPlay DRM, and track playback QoS (rebuffering ratio, time-to-first-frame).",
                "topics_covered": ["DRM Ecosystem: Google Widevine (Modular) vs Apple FairPlay", "Acquiring License Keys from DRM License Servers", "Encrypted Media Extensions (EME) & Common Encryption (CENC)", "Quality of Service (QoS) Metrics: Startup Time, Rebuffer Rate, Bitrate Shifts", "Integrating Video Analytics SDKs (Mux, Conviva)"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Mobile DevOps & CI/CD with Fastlane",
        "slug": "mobile-devops-fastlane-appstore",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Automate the painful mobile release engineering cycle for iOS and Android. Master Fastlane automation, code signing with Match and Git repositories, automated screenshot generation, TestFlight distribution, and Google Play Console deployment via GitHub Actions.",
        "skills_covered": ["Fastlane CLI & Fastfiles", "iOS Code Signing with Match", "Android Keystore Automation", "Automated App Store Screenshots", "Continuous Integration with GitHub Actions", "Automated Beta Testing (TestFlight & Firebase)", "App Store & Google Play Deployment"],
        "prerequisites": ["Experience building native or cross-platform mobile apps", "Basic familiarity with Git and terminal commands"],
        "career_outcomes": ["Mobile DevOps Engineer", "Mobile Release Manager", "Build & Release Engineer", "Senior Mobile Infrastructure Specialist"],
        "tech_stack": ["Fastlane", "GitHub Actions", "Ruby", "Xcode CLI", "Gradle", "TestFlight", "Google Play Console"],
        "tags": ["mobile-devops", "fastlane", "ci-cd", "testflight", "app-store", "google-play", "code-signing"],
        "capstone_projects": [
            {
                "title": "Zero-Touch Automated Mobile CI/CD Pipeline to App Stores",
                "description": "Build an automated GitHub Actions and Fastlane pipeline where merging to main triggers automated unit tests, bumps semantic build versions, signs iOS and Android builds, and uploads releases to TestFlight and Google Play Internal Track.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Multi-Device App Store Screenshot Localization Suite",
                "description": "Configure Fastlane Snapshot and Frameit to automatically run UI tests on multiple iOS simulators, capturing and framing localized App Store marketing screenshots in 5 languages.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Fastlane Official Documentation & Action Directory", "url": "https://docs.fastlane.tools/", "type": "Official Documentation"},
            {"title": "Mobile DevOps Playbook by Bitrise", "url": "https://www.bitrise.io/resources", "type": "Industry Whitepaper"},
            {"title": "Codesigning Guide for iOS by Felix Krause", "url": "https://codesigning.guide/", "type": "Comprehensive Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 65,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The Mobile Release Bottleneck & Fastlane Setup",
                "description": "Understand why mobile releases are challenging: manual signing, simulator builds, review delays, and setting up Fastlane.",
                "topics_covered": ["Web CI/CD vs Mobile Release Engineering Nuances", "Installing Fastlane with Bundler & Ruby Gems", "Fastlane Folder Structure: Appfile and Fastfile", "Writing Your First Fastlane Lane (lane :test do ... end)", "Executing Local Automated Builds via Fastlane"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "iOS Code Signing Demystified with Fastlane Match",
                "description": "Eliminate iOS code signing headaches using Fastlane Match: Git-backed encrypted certificates, provisioning profiles, and App Store keys.",
                "topics_covered": ["Apple Code Signing: Development vs Distribution Certificates", "Provisioning Profiles & Bundle Identifiers", "The Fastlane Match Philosophy (Shared Git Repo + Encryption Password)", "Match Storage on Private GitHub / GitLab Repositories", "Automating Certificate Generation & Synching across Team Machines"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Android Keystores, Version Codes & Gradle Automation",
                "description": "Automate Android build compilation, release signing keys, and dynamic version code management using Gradle and Fastlane.",
                "topics_covered": ["Generating and Securing Android Release Keystores (.jks)", "Injecting Keystore Secrets into build.gradle via Environment Variables", "Automating Version Code & Semantic Version Name Increments", "Building Release Android App Bundles (.aab) with Gradle Action", "Linting & Running JVM Unit Tests in Fastlane"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Automated Screenshots & Metadata Management",
                "description": "Generate localized marketing screenshots automatically across different device screen sizes using Snapshot, Screengrab, and Deliver.",
                "topics_covered": ["Automating UI Testing for Screenshots with Fastlane Snapshot", "Framing Screenshots in Device Bezels with Frameit", "Managing App Store Metadata in Text Files (Deliver)", "Google Play Metadata Management with Supply", "Uploading Localized Store Descriptions and Release Notes"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Beta Distribution: TestFlight & Firebase App Distribution",
                "description": "Distribute automated test builds to internal QA and external beta testers with Apple TestFlight and Firebase App Distribution.",
                "topics_covered": ["Uploading iOS Builds to TestFlight with Pilot Action", "Managing Internal and External TestFlight Groups", "Distributing Android APKs/AABs via Firebase App Distribution", "Automated Slack & Discord Build Notification Webhooks", "Collecting Crash & ANR Reports from Beta Builds"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "End-to-End Cloud CI/CD with GitHub Actions & App Stores",
                "description": "Run the entire mobile pipeline on cloud runners with GitHub Actions, App Store Connect API keys, and Google Play service accounts.",
                "topics_covered": ["Configuring macOS & Ubuntu GitHub Actions Runners", "Authenticating via App Store Connect API Key (.p8 file)", "Authenticating via Google Cloud Service Account JSON Key", "Triggering Automated Submissions on Git Tag Pushes (v1.0.0)", "Canary & Phased Release Rollouts (1%, 5%, 20%, 100%)"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Wearable & IoT Mobile Apps (WatchOS & WearOS)",
        "slug": "wearable-iot-mobile-apps",
        "category": "Mobile",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Build modern companion and standalone applications for smartwatches and Internet of Things (IoT) hardware. Master Apple WatchOS with SwiftUI, Google WearOS with Jetpack Compose, Bluetooth Low Energy (BLE) peripheral communication, and health sensor integrations.",
        "skills_covered": ["Apple WatchOS Development", "Google WearOS with Compose for Wear", "Bluetooth Low Energy (BLE) Protocols", "Watch Complications & Tiles", "HealthKit & Health Connect Integration", "Low-Power Sensor Streaming", "Phone-to-Watch Data Synchronization"],
        "prerequisites": ["Basic proficiency in Swift/iOS or Kotlin/Android development", "Understanding of asynchronous programming and hardware peripherals"],
        "career_outcomes": ["Wearable App Developer", "IoT Mobile Engineer", "HealthTech Application Specialist", "Connected Devices Engineer"],
        "tech_stack": ["SwiftUI", "WatchOS", "WearOS", "Compose for Wear", "CoreBluetooth", "Android BLE", "HealthKit"],
        "tags": ["wearables", "watchos", "wearos", "iot", "bluetooth", "healthkit", "mobile"],
        "capstone_projects": [
            {
                "title": "Real-Time Workout & Biometric Heart Rate WatchOS & WearOS App",
                "description": "Build an interactive smartwatch fitness app that streams live heart rate sensors, displays real-time workout stats, syncs with HealthKit/Health Connect, and features custom watch complications.",
                "difficulty": "Advanced"
            },
            {
                "title": "Bluetooth Low Energy (BLE) IoT Smart Device Controller",
                "description": "Construct a mobile companion application that scans for nearby BLE smart sensors, connects to custom GATT services, reads telemetry, and writes commands.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Apple WatchOS Developer Documentation & Human Interface Guidelines", "url": "https://developer.apple.com/watchos/", "type": "Official Documentation"},
            {"title": "Google WearOS Official Developer Guide", "url": "https://developer.android.com/training/wearables", "type": "Documentation"},
            {"title": "Bluetooth Low Energy (BLE) The Definitive Guide by Kevin Townsend", "url": "https://www.oreilly.com/library/view/getting-started-with/9781491900550/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 84,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Wearable UX Constraints & Standalone vs Companion Models",
                "description": "Understand micro-interactions: glanceable UI, power consumption limits, independent standalone apps vs phone-dependent companion apps.",
                "topics_covered": ["Wearable Human Interface Guidelines: Glances, Complications, Alerts", "Standalone vs Companion App Architecture", "Power Budget & Battery Life Constraints on Small Cells", "Screen Resolutions, Circular Displays & Rotary Input (Digital Crown)", "Setting up WatchOS and WearOS Simulators in IDEs"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Apple WatchOS Development with SwiftUI",
                "description": "Build watch applications with SwiftUI: WatchConnectivity framework, Watch complications (WidgetKit), and handling background sessions.",
                "topics_covered": ["Building WatchOS Views in SwiftUI", "Phone-to-Watch Communication with WatchConnectivity (WCSession)", "Transferring UserInfo & ApplicationContext", "Creating Watch Complications with WidgetKit", "Extended Runtime Sessions for Physical Navigation / Audio"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Google WearOS with Compose for Wear",
                "description": "Develop Android smartwatch applications with Jetpack Compose for Wear OS, Rotary scrolling, Tiles, and complication providers.",
                "topics_covered": ["Compose for Wear OS Material Library", "Handling Circular Displays with ScalingLazyColumn", "Rotary Input Support for Bezel Scrolling", "Building Wear OS Glanceable Tiles (ProtoLayout)", "ComplicationDataSourceService for Watch Faces"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Health & Fitness Sensors: HealthKit & Health Connect",
                "description": "Collect biometric sensor data: heart rate, steps, active calories, and sleep cycles using Apple HealthKit and Google Health Connect.",
                "topics_covered": ["Health Data Privacy Permissions & Legal Compliance", "Apple HealthKit: HKHealthStore, HKQuantityType & Workouts", "Continuous Real-Time Heart Rate Streaming in HKWorkoutSession", "Google Health Connect API Architecture & Records", "Battery-Conscious Background Step Counter Sensor Hooks"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Bluetooth Low Energy (BLE) Fundamentals & GATT",
                "description": "Communicate with IoT smart hardware using BLE: Central vs Peripheral roles, Advertising packets, GATT Services, and Characteristics.",
                "topics_covered": ["Classic Bluetooth vs Bluetooth Low Energy (BLE)", "Central (Phone) vs Peripheral (Hardware) Architecture", "Generic Access Profile (GAP) & Advertising Packets", "Generic Attribute Profile (GATT) Hierarchy: Profile, Service, Characteristic", "UUIDs: Standard 16-bit vs Custom 128-bit Vendor Identifiers"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "CoreBluetooth & Android BLE Implementation",
                "description": "Scan, connect, read, write, and subscribe to notifications from hardware sensors using Apple CoreBluetooth and Android BluetoothGatt.",
                "topics_covered": ["Scanning for BLE Peripherals with Service Filters", "Establishing Connections & Discovering Services", "Reading & Writing Characteristic Bytes (Read / Write / WriteWithoutResponse)", "Subscribing to Real-Time Sensor Notifications (setNotifyValue)", "Handling Unexpected Disconnections & Auto-Reconnect Logic"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "AR & Spatial Computing on Mobile (ARKit & ARCore)",
        "slug": "ar-spatial-computing-arkit-arcore",
        "category": "Mobile",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Build immersive Augmented Reality (AR) experiences for millions of mobile devices. Master Apple ARKit, Google ARCore, RealityKit, plane detection, 3D world tracking, visual inertial odometry (VIO), raycasting, spatial audio, and LiDAR depth mapping.",
        "skills_covered": ["Augmented Reality Fundamentals", "Apple ARKit & RealityKit", "Google ARCore Architecture", "Visual Inertial Odometry (VIO)", "Surface Plane Detection & Raycasting", "LiDAR Mesh Scene Reconstruction", "Lighting Estimation & PBR Materials"],
        "prerequisites": ["Intermediate iOS (Swift) or Android (Kotlin) development proficiency", "Basic understanding of 3D mathematics (vectors, matrices, quaternions)"],
        "career_outcomes": ["Augmented Reality Engineer", "Spatial Computing Developer", "AR/VR Mobile Specialist", "Interactive 3D Mobile Developer"],
        "tech_stack": ["ARKit", "ARCore", "RealityKit", "Swift", "Kotlin", "Blender / USDZ", "SceneKit"],
        "tags": ["ar", "augmented-reality", "spatial-computing", "arkit", "arcore", "realitykit", "lidar"],
        "capstone_projects": [
            {
                "title": "Real-World Room Measurement & Spatial 3D Interior Visualizer",
                "description": "Build an AR application that detects room floors and walls using LiDAR, allows users to place photorealistic 3D furniture models with physical collisions, cast shadows, and measures distances accurately.",
                "difficulty": "Advanced"
            },
            {
                "title": "Interactive AR Museum Guide with Image & Object Tracking",
                "description": "Develop an AR museum companion app that recognizes real-world physical artwork and exhibits via image anchors, overlaying animated 3D visual effects and spatial audio narratives.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Apple ARKit Official Documentation", "url": "https://developer.apple.com/augmented-reality/arkit/", "type": "Official Documentation"},
            {"title": "Google ARCore Developer Guides", "url": "https://developers.google.com/ar", "type": "Documentation"},
            {"title": "RealityKit Fundamentals Tutorial by Apple", "url": "https://developer.apple.com/documentation/realitykit", "type": "Official Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 78,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Augmented Reality & Visual Inertial Odometry (VIO)",
                "description": "Understand how mobile devices track their position in space by fusing camera frames with IMU gyroscope/accelerometer sensors.",
                "topics_covered": ["Visual Inertial Odometry (VIO) Mathematical Principles", "Feature Point Extraction & Optical Flow Tracking", "Camera Sensor Calibration & Coordinate Systems (World Space)", "Degrees of Freedom (3DoF vs 6DoF)", "Common VIO Tracking Failures (Textureless Walls, Fast Motion)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Apple ARKit & RealityKit Architecture",
                "description": "Master Apple's spatial engine: ARSession, ARView, RealityKit Entity-Component System (ECS), and loading USDZ 3D models.",
                "topics_covered": ["ARKit ARSession Lifecycle & Tracking Configurations", "RealityKit Entity-Component-System (ECS) Architecture", "ModelEntity, AnchorEntity & Transform Positioning", "Loading and Caching USDZ 3D Assets Asynchronously", "Gestures for Scaling, Rotating, and Translating 3D Virtual Objects"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Google ARCore Architecture for Android",
                "description": "Deploy cross-device AR on Android using Google ARCore: Session, Frame, CameraConfig, and rendering with Sceneview.",
                "topics_covered": ["ARCore Session Configuration & Supported Hardware Checks", "Tracking State & Tracking Failure Reasons", "Rendering 3D Objects with Filament / Sceneview", "Frame-by-Frame Updates & Camera Intrinsics", "Handling Screen Orientation & Aspect Ratio Shifts"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Plane Detection, Raycasting & World Anchors",
                "description": "Detect horizontal tables and vertical walls in the physical room, project screen touches into 3D world coordinates with raycasting.",
                "topics_covered": ["Horizontal vs Vertical Surface Plane Detection", "Visualizing Plane Meshes in Real-Time", "ARRaycastQuery vs Legacy Hit-Testing", "Snapping Virtual Objects to Real-World Physical Geometry", "Persistent World Anchors for Session Continuity"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "LiDAR Scene Reconstruction & People Occlusion",
                "description": "Leverage hardware LiDAR scanners for dense 3D room meshes, real-world physics collisions, and realistic human occlusion.",
                "topics_covered": ["LiDAR Time-of-Flight Sensors vs Pure Camera Stereo Vision", "Generating Dense 3D Mesh Geometry with Scene Reconstruction", "Physical Physics Collisions between Virtual Objects and Real Furniture", "People Occlusion: Rendering Virtual Content Behind Human Bodies", "Depth API on ARCore for Motion Depth Estimation"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Lighting Estimation, Spatial Audio & Location Anchors",
                "description": "Blend virtual content seamlessly into reality with environmental reflections, directional lighting, spatial audio, and GPS AR.",
                "topics_covered": ["Environmental Lighting Estimation (Ambient Intensity, Color Temperature)", "Spherical Harmonics & Environment Probe Textures for Reflections", "Spatial Audio Positioning (Directional Sound in 3D Space)", "Image Anchor Recognition & Real-World Poster Tracking", "Geospatial API / Location Anchors with Google Street View Data"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Native C++ Modules for Mobile (JNI & C++ Interop)",
        "slug": "native-cpp-modules-mobile-jni",
        "category": "Mobile",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Bridge high-performance C++20 algorithms, cryptography, or game engines into Android and iOS applications. Master the Android NDK, Java Native Interface (JNI), CMake cross-compilation, Swift-to-C++ interoperability in Swift 6, and zero-copy direct memory buffers.",
        "skills_covered": ["Android NDK (Native Development Kit)", "Java Native Interface (JNI) & JNIEnv", "CMake for Android Cross-Compilation", "Swift 6 C++ Direct Interoperability", "Direct Byte Buffers (Zero-Copy Interop)", "Cross-Platform C++ Core Architecture", "Profiling Native Memory with ASan"],
        "prerequisites": ["Proficiency in C++ (pointers, memory management)", "Experience with native Android (Kotlin) or iOS (Swift)"],
        "career_outcomes": ["Native Mobile Systems Engineer", "Mobile Game Engine Developer", "Audio/DSP Mobile Specialist", "High-Performance Mobile Architect"],
        "tech_stack": ["C++20", "Android NDK", "CMake", "JNI", "Swift 6", "Clang", "AddressSanitizer"],
        "tags": ["cpp", "ndk", "jni", "swift-cpp", "mobile-performance", "cross-compilation", "native"],
        "capstone_projects": [
            {
                "title": "High-Performance Real-Time Audio DSP Processing Engine",
                "description": "Implement a cross-platform digital signal processing (DSP) audio filter engine in C++20 with sub-5ms latency, compiled for Android via JNI/Oboe and iOS via direct Swift 6 C++ interop.",
                "difficulty": "Advanced"
            },
            {
                "title": "Hardware-Accelerated Computer Vision Filter Library",
                "description": "Build an optimized C++ image processing library using SIMD instructions (ARM NEON), callable with zero memory copies directly from Kotlin and Swift.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Android NDK Official Guides & Samples", "url": "https://developer.android.com/ndk/guides", "type": "Official Documentation"},
            {"title": "Apple Developer: Mixing Swift and C++ Documentation", "url": "https://www.swift.org/documentation/cxx-interop/", "type": "Documentation"},
            {"title": "The Java Native Interface: Programmer's Guide and Specification", "url": "https://docs.oracle.com/javase/8/docs/technotes/guides/jni/", "type": "Classic Specification"}
        ],
        "is_featured": False,
        "popularity_rank": 88,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Why Native Code on Mobile & Architectural Layout",
                "description": "Understand when to use C++ on mobile: raw compute speed, reusing existing libraries (FFmpeg, OpenCV), and shared cross-platform core.",
                "topics_covered": ["Performance Trade-offs: Managed Runtimes (ART, ARC) vs Native C++", "Shared Cross-Platform Business Logic Architecture", "Android NDK Toolchain Overview & ABI Architecture (arm64-v8a, armeabi-v7a, x86_64)", "Apple Clang Cross-Compilation for iOS Arm64 & Simulators", "Project Structure for Polyglot Mobile Repositories"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Android NDK, CMake & Gradle Integration",
                "description": "Configure Android Studio to compile native C++ libraries using CMakeLists.txt and externalNativeBuild in build.gradle.",
                "topics_covered": ["Android NDK Toolchains & sysroot Compilation", "Writing CMakeLists.txt for Android Libraries", "Linking Prebuilt Third-Party Shared (.so) and Static (.a) Libraries", "Target Architectures & Packaging .so Files in APKs/AABs", "Native Logging with __android_log_print and Android logcat"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Java Native Interface (JNI) Mechanics & Memory Safety",
                "description": "Master JNI communication between Kotlin/Java and C++: JNIEnv pointer, jobject references, string conversions, and exception handling.",
                "topics_covered": ["JNI Method Signatures & Name Mangling Rules", "JNIEnv Pointer & Thread Attachment Rules", "Local References vs Global References (NewGlobalRef) & Leaks", "String Conversions (GetStringUTFChars & ReleaseStringUTFChars)", "Handling and Throwing Java Exceptions from C++"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Zero-Copy Memory Interop: Direct Byte Buffers",
                "description": "Eliminate expensive memory copying across managed and unmanaged boundaries using Direct Byte Buffers and raw pointers.",
                "topics_covered": ["The Memory Copying Bottleneck in Native Interop", "Allocating Direct Buffers with ByteBuffer.allocateDirect()", "Accessing Raw Pointer Addresses with GetDirectBufferAddress", "Zero-Copy Frame Processing for Audio and Video Buffers", "Cache Invalidation & Memory Coherency across CPU Cores"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Swift 6 Direct C++ Interoperability on iOS",
                "description": "Call C++ functions, instantiate C++ classes, and use modern C++ standard templates directly in Swift without Objective-C wrappers.",
                "topics_covered": ["Enabling C++ Interoperability in Xcode (SWIFT_OBJC_INTEROP_MODE)", "Calling C++ Functions Directly from Swift 6", "Instantiating & Managing C++ Value vs Reference Types in Swift", "Bridging C++ Vectors (std::vector) and Strings (std::string)", "Using Swift Types Inside C++ Code"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Native Debugging, Profiling & AddressSanitizer",
                "description": "Debug native crashes (SIGSEGV, SIGBUS) using LLDB, symbolicate stack traces, and detect buffer overflows with AddressSanitizer.",
                "topics_covered": ["Debugging Native Code Line-by-Line with LLDB in Android Studio & Xcode", "Symbolicating Native Tombstones and Crash Dumps with ndk-stack", "Enabling AddressSanitizer (ASan) for Memory Corruption Detection", "ARM NEON SIMD Assembly Instructions for 4x Vector Math Acceleration", "Publishing Reusable Cross-Platform Native Mobile SDKs"],
                "duration": "1 Week"
            }
        ]
    }
]

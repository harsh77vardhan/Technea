"""Domain 4: Data Roadmaps (12 Roadmaps)"""

DATA_ROADMAPS = [
    {
        "title": "Data Science & Exploratory Data Analysis",
        "slug": "data-science-exploratory-analysis",
        "category": "Data",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "10 Weeks",
        "description": "Master data science workflows from hypothesis generation to actionable business insights. Learn scientific Python with NumPy, Pandas, statistical modeling, exploratory data analysis (EDA), hypothesis testing, and interactive data visualization with Plotly and Seaborn.",
        "skills_covered": ["Exploratory Data Analysis (EDA)", "Pandas & NumPy", "Statistical Hypothesis Testing", "Data Cleaning & Imputation", "Feature Engineering", "Data Storytelling & Visualization", "JupyterLab Workflows"],
        "prerequisites": ["Basic Python programming syntax", "High school mathematics (basic algebra and statistics)"],
        "career_outcomes": ["Data Scientist", "Associate Data Analyst", "Quantitative Research Analyst", "Business Analytics Specialist"],
        "tech_stack": ["Python 3.12", "Pandas", "NumPy", "SciPy", "Seaborn", "Plotly", "JupyterLab"],
        "tags": ["data-science", "eda", "pandas", "numpy", "statistics", "data-analysis", "hypothesis-testing"],
        "capstone_projects": [
            {
                "title": "Global Healthcare & Disease Progression Statistical Study",
                "description": "Perform comprehensive exploratory analysis on public epidemiology datasets, uncovering epidemiological correlations, handling missing survey metrics, and testing hypothesis significances.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Interactive Multi-Dimensional E-Commerce Analytics Dashboard",
                "description": "Build an interactive analytical reporting dashboard in Plotly Dash displaying cohort retention heatmaps, customer lifetime value distributions, and churn factors.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Python for Data Analysis (3rd Ed) by Wes McKinney", "url": "https://wesmckinney.com/book/", "type": "Book"},
            {"title": "Kaggle Learn: Data Science & Pandas Courses", "url": "https://www.kaggle.com/learn", "type": "Interactive Guides"},
            {"title": "StatQuest with Josh Starmer - Statistics & ML", "url": "https://statquest.org/", "type": "Video Explanations"}
        ],
        "is_featured": True,
        "popularity_rank": 13,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Tabular Data Mastery with Pandas",
                "description": "Manipulate structured data with DataFrames, indexing, multi-indexing, filtering, joins, merges, and reshapes.",
                "topics_covered": ["Series & DataFrame Data Structures", "Loc, Iloc & Boolean Masking", "Merging, Joining & Concatenating DataFrames", "Pivoting, Melting & Reshaping Datasets", "Handling DateTime Sequences & Time Zones"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Data Scrubbing, Cleaning & Missing Value Strategies",
                "description": "Handle real-world messy data: missing values, duplicate records, type casting, outliers, and string regex parsing.",
                "topics_covered": ["Diagnosing Missing Data (MCAR, MAR, MNAR)", "Imputation Techniques (Mean, Median, KNN, MICE)", "Detecting Outliers with Z-Score & Interquartile Range (IQR)", "String Cleaning with Regular Expressions", "Data Validation & Schema Type Audits"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Statistical Foundations & Distributions",
                "description": "Understand descriptive statistics, probability distributions (Normal, Binomial, Poisson), variance, skewness, and kurtosis.",
                "topics_covered": ["Measures of Central Tendency & Dispersion", "Normal Distribution & Central Limit Theorem", "Probability Mass & Density Functions", "Covariance & Pearson / Spearman Correlation", "Detecting Simpson's Paradox in Data"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Hypothesis Testing & Statistical Inference",
                "description": "Validate experimental findings using Null Hypothesis Significance Testing, P-values, T-tests, ANOVA, and Chi-Square tests.",
                "topics_covered": ["Null & Alternative Hypotheses Formulation", "Type I (Alpha) & Type II (Beta) Errors", "One-Sample, Two-Sample & Paired T-Tests with SciPy", "Analysis of Variance (ANOVA) for Multi-Group Tests", "Chi-Square Test of Independence"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Advanced Feature Engineering & Transformations",
                "description": "Create predictive features from raw data: scaling, log transforms, one-hot encoding, target encoding, and interactions.",
                "topics_covered": ["Feature Scaling: Standardization vs Min-Max Normalization", "Log & Box-Cox Power Transformations", "One-Hot Encoding vs Target / Ordinal Encoding", "Generating Interaction Terms & Polynomial Features", "Feature Selection: Mutual Information & Recursive Feature Elimination"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Data Storytelling & Interactive Visualizations",
                "description": "Communicate complex statistical conclusions using publication-ready charts in Seaborn, Plotly, and Dash dashboards.",
                "topics_covered": ["Principles of Visual Data Storytelling & Edward Tufte Guidelines", "Advanced Seaborn FacetGrids & PairPlots", "Interactive Visualizations with Plotly Express", "Building Exploratory Web Apps with Streamlit / Dash", "Documenting Reproducible Jupyter Notebooks"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Advanced SQL & High-Performance Data Modeling",
        "slug": "advanced-sql-data-modeling",
        "category": "Data",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master advanced SQL for complex data analysis, warehousing, and engineering. Learn window functions, common table expressions (CTEs), recursive queries, indexing internals, dimensional modeling (Kimball Star Schema), and query execution optimization.",
        "skills_covered": ["Advanced Window Functions", "Recursive Common Table Expressions (CTEs)", "Dimensional Modeling (Star & Snowflake Schema)", "Slowly Changing Dimensions (SCD)", "Query Plan Analysis (EXPLAIN ANALYZE)", "Analytical Grouping Sets & Rollups", "Performance Tuning"],
        "prerequisites": ["Basic SQL literacy (SELECT, JOIN, WHERE, GROUP BY)", "Familiarity with relational database tables"],
        "career_outcomes": ["Analytics Engineer", "Senior SQL Developer", "BI Data Architect", "Data Warehouse Engineer"],
        "tech_stack": ["PostgreSQL 16", "DuckDB", "dbt", "pgAdmin", "Docker"],
        "tags": ["sql", "advanced-sql", "window-functions", "data-modeling", "kimball", "query-optimization"],
        "capstone_projects": [
            {
                "title": "Enterprise Retail Dimensional Data Warehouse with SCD Type 2",
                "description": "Design and populate a complete Kimball Star Schema data warehouse from raw transaction logs, implementing Slowly Changing Dimensions (SCD Type 2) and complex aggregate window queries.",
                "difficulty": "Advanced"
            },
            {
                "title": "Recursive Organizational Hierarchy & Bill of Materials Query Engine",
                "description": "Construct recursive Common Table Expressions to model and traverse deep tree hierarchies, calculating roll-up costs and organizational spans of control.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "The Data Warehouse Toolkit by Ralph Kimball", "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-toolkit/", "type": "Book"},
            {"title": "Modern SQL Tutorials by Markus Winand", "url": "https://modern-sql.com/", "type": "Interactive Guides"},
            {"title": "PostgreSQL Window Functions Documentation", "url": "https://www.postgresql.org/docs/current/tutorial-window.html", "type": "Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 17,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Window Functions & Analytic Calculations",
                "description": "Perform complex calculations across related table rows without collapsing results: ROW_NUMBER, RANK, DENSE_RANK, NTILE, and moving averages.",
                "topics_covered": ["OVER (PARTITION BY ... ORDER BY ...) Syntax", "Ranking Functions: ROW_NUMBER vs RANK vs DENSE_RANK", "Value Window Functions: LAG, LEAD, FIRST_VALUE, LAST_VALUE", "Sliding Window Frames (ROWS BETWEEN N PRECEDING AND CURRENT ROW)", "Calculating Running Totals & 7-Day Moving Averages"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Common Table Expressions & Recursive SQL",
                "description": "Simplify multi-level nested queries with CTEs and traverse recursive trees, graphs, and hierarchical networks using WITH RECURSIVE.",
                "topics_covered": ["Subqueries vs Common Table Expressions (WITH)", "WITH RECURSIVE Anchor & Recursive Member Structure", "Cycle Detection in Graph Traversal", "Hierarchical Path Building & Level Counting", "Materialized vs Inline CTE Execution in PostgreSQL"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Advanced Aggregations & Pivot Operations",
                "description": "Generate multi-dimensional report totals with GROUPING SETS, ROLLUP, CUBE, and convert rows into dynamic columns.",
                "topics_covered": ["GROUPING SETS for Flexible Subtotals", "ROLLUP for Hierarchical Summary Totals", "CUBE for Exhaustive Multi-Dimensional Combinations", "FILTER Clause on Aggregate Functions (SUM() FILTER (WHERE ...))", "Pivoting Rows to Columns using CROSSTAB & CASE WHEN"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Dimensional Modeling & The Kimball Methodology",
                "description": "Design data warehouse architectures for business reporting: Fact tables, Dimension tables, Conformed Dimensions, and Star Schemas.",
                "topics_covered": ["Transactional Facts vs Periodic Snapshot Facts vs Accumulating Facts", "Dimension Tables & Degenerate Dimensions", "Star Schema vs Snowflake Schema Trade-offs", "Surrogate Keys vs Natural Business Keys", "Conformed Dimensions Across Enterprise Data Marts"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Slowly Changing Dimensions (SCD Types 0-3)",
                "description": "Preserve historical truth as dimensions mutate over time using Slowly Changing Dimension patterns.",
                "topics_covered": ["SCD Type 0 (Fixed Retained)", "SCD Type 1 (Direct Overwrite)", "SCD Type 2 (Historical Versioning with Valid_From / Valid_To / Is_Current)", "SCD Type 3 (Previous Value Column)", "Automating SCD Type 2 Merge Operations in SQL"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Query Optimization, Indexing & Execution Plans",
                "description": "Read query plans with EXPLAIN ANALYZE, tune JOIN types (Nested Loop, Hash, Merge), and eliminate query performance bottlenecks.",
                "topics_covered": ["Reading EXPLAIN (ANALYZE, BUFFERS) Trees", "Join Algorithms: Nested Loop vs Hash Join vs Merge Join", "B-Tree vs Partial vs Composite Index Optimization", "Common Anti-Patterns (SELECT *, Function Calls on Indexed Columns)", "Analyzing PostgreSQL pg_stat_statements"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Modern Data Engineering with Spark & Delta Lake",
        "slug": "modern-data-engineering-spark-delta",
        "category": "Data",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "12 Weeks",
        "description": "Architect petabyte-scale big data pipelines and Lakehouses. Master Apache Spark 3.x internals, PySpark DataFrames, distributed memory execution, Catalyst query optimizer, Delta Lake ACID transactions, structured streaming, and data lake storage.",
        "skills_covered": ["Apache Spark Architecture & PySpark", "Catalyst Optimizer & Tungsten Engine", "Delta Lake ACID Transactions", "Data Lakehouse Architecture", "Structured Streaming", "Spark Performance Tuning & Shuffling", "Parquet & Columnar Formats"],
        "prerequisites": ["Proficiency in Python and advanced SQL", "Basic understanding of distributed systems and Linux"],
        "career_outcomes": ["Data Engineer", "Big Data Architect", "Lakehouse Platform Engineer", "Senior Data Infrastructure Developer"],
        "tech_stack": ["Apache Spark 3.5", "PySpark", "Delta Lake", "Apache Parquet", "MinIO / S3", "Docker", "JupyterLab"],
        "tags": ["spark", "pyspark", "delta-lake", "data-engineering", "lakehouse", "big-data", "streaming"],
        "capstone_projects": [
            {
                "title": "Petabyte-Scale FinTech Lakehouse with Delta Lake Time Travel",
                "description": "Architect a Lakehouse with Bronze, Silver, and Gold tiers using PySpark and Delta Lake, implementing ACID transactions, schema enforcement, time-travel auditing, and optimize Z-Ordering.",
                "difficulty": "Advanced"
            },
            {
                "title": "Real-Time Clickstream Structured Streaming Pipeline",
                "description": "Develop an end-to-end streaming aggregation pipeline reading real-time click events, performing 10-minute watermarked window aggregations, and upserting into Delta tables.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Learning Spark (2nd Ed) by Damji, Wenig, Das & Lee", "url": "https://www.oreilly.com/library/view/learning-spark-2nd/9781492050032/", "type": "Book"},
            {"title": "Delta Lake Official Documentation & Architecture Guide", "url": "https://docs.delta.io/latest/index.html", "type": "Documentation"},
            {"title": "Spark: The Definitive Guide by Bill Chambers & Matei Zaharia", "url": "https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/", "type": "Classic Textbook"}
        ],
        "is_featured": False,
        "popularity_rank": 23,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Spark Cluster Architecture, Drivers & Executors",
                "description": "Understand distributed computing: Spark Driver, Cluster Manager, Executors, Tasks, Slots, and RDD fundamentals.",
                "topics_covered": ["Driver Program, Cluster Managers (Standalone, K8s, YARN)", "Executors, Memory Overhead & CPU Cores Allocation", "Resilient Distributed Datasets (RDD) Immutable Partitions", "Transformations (Lazy) vs Actions (Eager)", "The Spark UI (Jobs, Stages, Tasks Visualizer)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "PySpark DataFrames & Catalyst Optimizer",
                "description": "Manipulate structured data with PySpark DataFrames, SQL functions, and understand Catalyst's logical and physical query plans.",
                "topics_covered": ["PySpark DataFrame API Syntax & Schemas", "Standard PySpark Functions (pyspark.sql.functions)", "Catalyst Optimizer: Analysis, Logical Optimization, Physical Planning", "Project Tungsten: Off-Heap Memory & Whole-Stage Code Generation", "Writing User-Defined Functions (UDFs) & Pandas Vectorized UDFs"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Shuffling, Partitioning & Performance Tuning",
                "description": "Eliminate shuffle bottlenecks, mitigate data skew, optimize spark.sql.shuffle.partitions, and use Broadcast Joins.",
                "topics_covered": ["Wide vs Narrow Dependencies & Shuffle Mechanics", "Tuning spark.sql.shuffle.partitions & Adaptive Query Execution (AQE)", "Broadcast Hash Joins (BHJ) vs Sort Merge Joins (SMJ)", "Handling Data Skew with Salting Techniques", "Caching (cache vs persist with StorageLevel)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Lakehouse Architecture & Delta Lake ACID Storage",
                "description": "Transform data lakes into transactional Lakehouses using Delta Lake transaction logs, ACID guarantees, and schema enforcement.",
                "topics_covered": ["The Medallion Architecture (Bronze -> Silver -> Gold)", "Delta Lake Transaction Log (_delta_log JSON commits)", "ACID Guarantees & Serializable Isolation", "Schema Enforcement vs Schema Evolution", "Time Travel Queries (VERSION AS OF / TIMESTAMP AS OF)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Delta Lake Maintenance: Compaction, Vacuum & Z-Order",
                "description": "Maintain high query performance in object storage using file compaction, Z-Ordering, Vacuum, and liquid clustering.",
                "topics_covered": ["The Small Files Problem in Data Lakes", "OPTIMIZE Command & File Compaction", "Z-Order Clustering for Multi-Dimensional Co-Locality", "VACUUM Command & Retention Period Safeguards", "Change Data Feed (CDF) for Incremental Downstream Processing"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Spark Structured Streaming & Real-Time Ingestion",
                "description": "Process streaming events with micro-batches, event-time watermarking, windowed aggregations, and streaming sink writes.",
                "topics_covered": ["Structured Streaming Continuous Processing Model", "Event Time vs Processing Time", "Watermarking for Late-Arriving Data Handling", "Tumbling & Sliding Window Aggregations", "Streaming Sinks & Checkpointing for Exactly-Once Semantics"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Business Intelligence & Executive Analytics",
        "slug": "business-intelligence-executive-analytics",
        "category": "Data",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "6 Weeks",
        "description": "Transform enterprise data into strategic executive dashboards and operational insights. Master business KPI formulation, modern BI tooling (Power BI, Tableau, Metabase), data modeling, DAX calculations, semantic layers, and automated reporting.",
        "skills_covered": ["Business KPI Formulation", "Power BI / Tableau Dashboard Design", "DAX Formulas & Measures", "Data Modeling for BI", "Executive Storytelling & Infographics", "Self-Service Analytics Governance", "Automated Scheduled Refreshes"],
        "prerequisites": ["Basic understanding of Excel formulas and spreadsheets", "Curiosity about business strategy and metrics"],
        "career_outcomes": ["Business Intelligence Analyst", "BI Developer", "Operations Analyst", "Executive Reporting Specialist"],
        "tech_stack": ["Power BI", "Tableau", "Metabase", "SQL", "Excel", "Figma"],
        "tags": ["bi", "business-intelligence", "power-bi", "tableau", "dax", "analytics", "dashboards"],
        "capstone_projects": [
            {
                "title": "Executive C-Suite Revenue, Churn & Unit Economics Dashboard",
                "description": "Design an interactive executive dashboard in Power BI tracking Monthly Recurring Revenue (MRR), Customer Acquisition Cost (CAC), Net Dollar Retention (NDR), and automated anomaly alerts.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Global Supply Chain & Logistics Performance Cockpit",
                "description": "Construct an operational logistics cockpit in Tableau analyzing shipment transit times, vendor fulfillment reliability, and inventory stock-out risks.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Microsoft Power BI Official Documentation & Guided Learning", "url": "https://learn.microsoft.com/en-us/power-bi/", "type": "Official Guides"},
            {"title": "The Definitive Guide to DAX by Marco Russo & Alberto Ferrari", "url": "https://www.sqlbi.com/books/the-definitive-guide-to-dax-2nd-edition/", "type": "Book"},
            {"title": "Information Dashboard Design by Stephen Few", "url": "http://www.perceptualedge.com/library.php#Books", "type": "Design Textbook"}
        ],
        "is_featured": False,
        "popularity_rank": 35,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Business KPIs, Unit Economics & Metrics Frameworks",
                "description": "Define business metrics that drive decisions: CAC, LTV, MRR, churn rate, gross margin, conversion funnels, and OKRs.",
                "topics_covered": ["SaaS & E-Commerce Metrics Frameworks", "Leading vs Lagging Key Performance Indicators", "North Star Metric Selection", "Funnel Analytics & Conversion Rates", "Translating Business Questions into Analytical Queries"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Data Modeling in BI: Star Schemas & Relationships",
                "description": "Model clean data inside Power BI and Tableau: active relationships, one-to-many cardinality, cross-filtering directions, and date dimensions.",
                "topics_covered": ["Import Mode vs DirectQuery vs Composite Models", "Fact-to-Dimension Relationships & Cardinality", "Bi-Directional Cross-Filtering Pitfalls", "Generating Comprehensive Date / Calendar Tables", "Role-Playing Dimensions in BI Tools"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "DAX Calculations, Context & Measures",
                "description": "Write business calculation logic using Data Analysis Expressions (DAX): CALCULATE, FILTER, time intelligence, and evaluation contexts.",
                "topics_covered": ["Row Context vs Filter Context in DAX", "The CALCULATE() Function & Context Transition", "Time Intelligence Functions (YTD, QTD, MoM, YoY)", "Iterator Functions (SUMX, AVERAGEX, RANKX)", "Creating Reusable Calculated Measures vs Columns"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Visual Hierarchy, UX & Dashboard Layout Design",
                "description": "Apply cognitive psychology and design principles: Stephen Few guidelines, visual hierarchy, contrast, and eliminating chartjunk.",
                "topics_covered": ["Gestalt Principles of Visual Perception", "Selecting the Right Chart for the Right Data Type", "Color Psychology & Avoiding Cognitive Overload", "Grid-Based Layouts & Wireframing in Figma", "Drill-Through Actions, Tooltips & Bookmarks"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Open-Source BI with Metabase & Semantic Layers",
                "description": "Deploy self-service analytics for whole organizations using open-source Metabase, Cube.js semantic layers, and embedded dashboards.",
                "topics_covered": ["Setting up Metabase & Connecting Databases", "Visual Query Builder vs Custom SQL Cards", "Cube.js Semantic Layer for Unified Metrics", "Embedded Analytics in Web Applications", "Permissions & Collection Access Control"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Governance, Row-Level Security & Automated Refreshes",
                "description": "Secure sensitive enterprise data using Row-Level Security (RLS) and automate data pipeline refreshes and email reports.",
                "topics_covered": ["Row-Level Security (RLS) Roles & Dynamic User Rules", "Configuring Enterprise Gateways for On-Premise Data", "Automated Scheduled Refreshes & Incremental Refresh", "Alerting Triggers on Metric Thresholds", "Exporting & Presenting to Executive Stakeholders"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Real-Time Streaming Systems with Kafka & Flink",
        "slug": "real-time-streaming-kafka-flink",
        "category": "Data",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Architect mission-critical, low-latency stream processing systems. Master Apache Kafka event streaming, log-centric architectures, consumer groups, exactly-once semantics, Kafka Streams, and stateful event-driven stream processing with Apache Flink.",
        "skills_covered": ["Apache Kafka Architecture", "Producers, Consumers & Consumer Groups", "Kafka Streams Processing", "Apache Flink Stateful Stream Processing", "Event Time & Watermarks", "Exactly-Once Semantics (EOS)", "Schema Registry & Avro Serialization"],
        "prerequisites": ["Solid programming experience in Java, Scala, Python, or Go", "Understanding of distributed systems and networking fundamentals"],
        "career_outcomes": ["Real-Time Streaming Engineer", "Distributed Systems Engineer", "Data Platform Architect", "Event-Driven Backend Engineer"],
        "tech_stack": ["Apache Kafka 3.x", "Apache Flink 1.18+", "KRaft", "Schema Registry", "Apache Avro", "Docker", "Prometheus"],
        "tags": ["kafka", "flink", "streaming", "event-driven", "real-time", "distributed-systems", "big-data"],
        "capstone_projects": [
            {
                "title": "Real-Time Financial Fraud Detection & Transaction Scoring Engine",
                "description": "Build an ultra-low-latency fraud detection system consuming card transactions from Kafka, scoring patterns against sliding 5-minute historical states in Flink, and emitting block alerts.",
                "difficulty": "Advanced"
            },
            {
                "title": "Multi-Tenant Event Sourcing & CQRS Audit Pipeline",
                "description": "Architect a resilient event-sourced auditing pipeline featuring Kafka message compaction, Schema Registry schema evolution, and exactly-once processing guarantees.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Kafka: The Definitive Guide by Gwen Shapira et al.", "url": "https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/", "type": "Book"},
            {"title": "Stream Processing with Apache Flink by Fabian Hueske & Vasiliki Kalavri", "url": "https://www.oreilly.com/library/view/stream-processing-with/9781491974285/", "type": "Book"},
            {"title": "Apache Flink Official Documentation & Tutorials", "url": "https://nightlies.apache.org/flink/flink-docs-stable/", "type": "Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 30,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Event-Driven Philosophy & Kafka Storage Internals",
                "description": "Understand the commit log architecture: partitions, segments, index files, zero-copy reads, and KRaft consensus metadata.",
                "topics_covered": ["Commit Log Architecture & Append-Only Storage", "Topics, Partitions & Log Segments (.log, .index)", "OS Page Cache & Zero-Copy Network Transfer (sendfile)", "KRaft Consensus Protocol (No ZooKeeper)", "Retention Policies: Delete vs Log Compaction"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Producers, Consumers & Consumer Groups",
                "description": "Write resilient message producers with partitioners and configure consumer groups, rebalancing protocols, and offset commits.",
                "topics_covered": ["Producer Acknowledgments (acks=0, 1, all) & Idempotent Producers", "Partitioner Algorithms & Key Hashing", "Consumer Groups & Partition Assignment Strategies (Range, RoundRobin, Sticky)", "Offset Management: Manual vs Auto-Commit", "Handling Consumer Group Rebalances Gracefully"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Schema Governance with Schema Registry & Avro",
                "description": "Enforce strong contracts on streaming data using Confluent Schema Registry, Apache Avro schemas, and compatibility rules.",
                "topics_covered": ["The Danger of Schema Drift in Distributed Streaming", "Apache Avro Binary Serialization vs JSON", "Schema Registry Architecture & Subject Naming Strategies", "Compatibility Modes (Backward, Forward, Full, None)", "Automating Schema Validation in CI/CD"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Stream Processing with Kafka Streams",
                "description": "Process events within lightweight client libraries using KStreams, KTables, GlobalKTables, and state stores.",
                "topics_covered": ["KStream vs KTable Dualism", "Stateless Operations (filter, map, branch)", "Stateful Operations & RocksDB Local State Stores", "Windowing: Tumbling, Hopping, Session Windows", "Handling Late Data & Output Suppressors"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Apache Flink Core: Stateful Stream Processing",
                "description": "Process unbounded streams with Apache Flink: DataStream API, state backends (EmbeddedRocksDB), and checkpointing.",
                "topics_covered": ["Flink Distributed Runtime: JobManager vs TaskManagers", "Keyed State (ValueState, ListState, MapState)", "State Backends: HashMap vs EmbeddedRocksDBStateBackend", "Asynchronous Barrier Snapshotting (Chandy-Lamport Algorithm)", "Savepoints vs Checkpoints for Zero-Downtime Upgrades"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Event Time, Watermarks & Exactly-Once Semantics",
                "description": "Handle out-of-order records with Flink watermarks, process continuous joins, and achieve end-to-end Exactly-Once Semantics (EOS).",
                "topics_covered": ["Event Time vs Ingestion Time vs Processing Time", "Watermark Generation Strategies (Bounded-Out-Of-Orderness)", "Stream-to-Stream Joins & Interval Joins", "Two-Phase Commit Protocol (2PC) for Exactly-Once Sinks", "Production Cluster Sizing & Monitoring with Prometheus"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Data Analytics with Python & Pandas",
        "slug": "data-analytics-python-pandas",
        "category": "Data",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "6 Weeks",
        "description": "Master practical business analytics using Python and Pandas. Learn to automate spreadsheet workflows, parse corporate databases, clean imperfect customer records, aggregate sales metrics, compute cohort retention, and generate automated executive reports.",
        "skills_covered": ["Data Wrangling with Pandas", "Data Cleaning & Transformation", "Excel Automation with OpenPyXL", "SQL Database Querying from Python", "Cohort & Retention Analysis", "Automated Report Generation", "Data Visualization with Matplotlib"],
        "prerequisites": ["None - Designed for beginners or spreadsheet power users", "Basic computer literacy"],
        "career_outcomes": ["Data Analyst", "Business Operations Analyst", "Marketing Analytics Specialist", "Financial Analyst"],
        "tech_stack": ["Python 3.12", "Pandas", "OpenPyXL", "SQLite", "Matplotlib", "Seaborn", "JupyterLab"],
        "tags": ["python", "pandas", "data-analytics", "excel-automation", "cohort-analysis", "reporting"],
        "capstone_projects": [
            {
                "title": "Automated Multi-Branch Financial Statement Consolidator",
                "description": "Write a Python script that ingests dozens of inconsistent multi-tab Excel workbooks, standardizes currency formats, detects anomalies, and generates an executive PDF summary.",
                "difficulty": "Beginner"
            },
            {
                "title": "SaaS Customer Cohort Retention & Churn Analysis Suite",
                "description": "Construct a customer retention analysis pipeline that tracks sign-up cohorts over time, visualizes retention curves, and predicts customer lifetime value (LTV).",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Automate the Boring Stuff with Python by Al Sweigart", "url": "https://automatetheboringstuff.com/", "type": "Free Book"},
            {"title": "Pandas Official Documentation & 10 Minutes to Pandas", "url": "https://pandas.pydata.org/docs/user_guide/10min.html", "type": "Documentation"},
            {"title": "Storytelling with Data by Cole Nussbaumer Knaflic", "url": "https://www.storytellingwithdata.com/books", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 28,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Python Basics for Data Analysts",
                "description": "Learn essential Python syntax tailored for data manipulation: variables, lists, dictionaries, for loops, and functions.",
                "topics_covered": ["Variables, Types & Arithmetic Calculations", "Lists, Dictionaries & Nested Data Structures", "Looping, Iteration & List Comprehensions", "Writing Clean Functions with Parameters", "Reading & Writing Local Text and CSV Files"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Pandas DataFrames, Slicing & Filtering",
                "description": "Load real-world datasets into Pandas DataFrames and master row/column selection, filtering criteria, and sorting.",
                "topics_covered": ["Loading CSV, Excel & Parquet Files", "Selecting Columns & Slicing Rows (.loc and .iloc)", "Filtering Data with Complex Boolean Conditions", "Sorting, Renaming & Reordering Columns", "Inspecting Data with .info(), .describe(), and .head()"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Data Aggregations, GroupBy & Pivot Tables",
                "description": "Summarize millions of data points using group-by operations, multiple aggregation functions, and pivot tables.",
                "topics_covered": ["The Split-Apply-Combine Strategy", "DataFrame GroupBy Operations with .agg()", "Pivot Tables & Crosstabs for Multi-Way Summaries", "Transformations with Group-Level Calculations", "Rolling Averages & Cumulative Sums"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Merging, Joining & Multi-Source Reconciliation",
                "description": "Combine data across heterogeneous files and SQL databases using inner, outer, left, and right joins.",
                "topics_covered": ["Relational Joins with pd.merge() (Inner, Left, Right, Outer)", "Stacking Datasets with pd.concat()", "Executing SQL Queries with pd.read_sql()", "Handling Key Mismatches & Data Reconciliations", "Validating One-to-One and One-to-Many Merge Cardinality"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Practical Business Analytics: Cohorts, Churn & LTV",
                "description": "Calculate standard business metrics: month-over-month growth, customer churn rates, and cohort retention matrices.",
                "topics_covered": ["Defining Time-Based Cohorts from Transaction Dates", "Constructing Cohort Retention Heatmaps", "Churn Rate & Customer Lifetime Value Formulas", "RFM (Recency, Frequency, Monetary) Segmentation", "Market Basket Analysis & Product Co-Purchases"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Automating Reports with Excel & OpenPyXL",
                "description": "Generate automated, styled Excel spreadsheets with formulas, charts, and conditional formatting using OpenPyXL.",
                "topics_covered": ["Writing to Multi-Sheet Workbooks with pd.ExcelWriter", "Formatting Cells, Fonts & Borders with OpenPyXL", "Injecting Excel Formulas Dynamically via Python", "Embedding Native Excel Charts", "Scheduling Automated Daily Email Delivery with smtplib"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Snowflake Cloud Data Warehousing & Architecture",
        "slug": "snowflake-cloud-data-warehouse",
        "category": "Data",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master Snowflake's cloud-native data platform architecture. Learn multi-cluster shared data architecture, virtual warehouses, micro-partitioning, clustering keys, zero-copy cloning, time travel, Snowpipe automated continuous ingestion, and secure data sharing.",
        "skills_covered": ["Snowflake Architecture & Storage Layer", "Virtual Compute Warehouses", "Micro-Partitioning & Clustering Keys", "Continuous Ingestion with Snowpipe", "Time Travel & Zero-Copy Cloning", "Data Governance & Masking Policies", "Snowpark Python & Streamlit"],
        "prerequisites": ["Proficiency in SQL querying", "Basic understanding of data warehousing concepts"],
        "career_outcomes": ["Snowflake Data Engineer", "Cloud Data Warehouse Architect", "Analytics Engineer", "Enterprise Data Platform Specialist"],
        "tech_stack": ["Snowflake", "SnowSQL", "Snowpark", "dbt", "AWS S3 / Azure Blob", "Python"],
        "tags": ["snowflake", "cloud-data-warehouse", "snowpipe", "snowpark", "time-travel", "sql", "data-engineering"],
        "capstone_projects": [
            {
                "title": "Automated Cloud-Native Lakehouse Ingestion with Snowpipe & Streams/Tasks",
                "description": "Build an automated continuous ingestion pipeline that detects files in S3, triggers Snowpipe micro-batches, tracks changes with Snowflake Streams, and transforms data with Tasks.",
                "difficulty": "Advanced"
            },
            {
                "title": "Secure Enterprise Data Sharing & Dynamic Masking System",
                "description": "Implement enterprise role-based access control (RBAC), tag-based dynamic data masking for PII, and configure secure outbound data shares without data movement.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Snowflake Official Documentation", "url": "https://docs.snowflake.com/", "type": "Official Documentation"},
            {"title": "Snowflake University & Hands-On Labs", "url": "https://learn.snowflake.com/", "type": "Interactive Labs"},
            {"title": "Mastering Snowflake Solutions by Mark Balkenende", "url": "https://www.packtpub.com/en-us/product/mastering-snowflake-solutions-9781801815154", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 39,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Snowflake 3-Tier Architecture & Objects Hierarchy",
                "description": "Understand Snowflake's separated compute, storage, and cloud services layers, and navigate the Organization, Account, Database, and Schema hierarchy.",
                "topics_covered": ["The 3 Layers: Database Storage, Query Processing, Cloud Services", "Organization, Accounts, Databases, Schemas Hierarchy", "Internal vs External Stages (S3, Azure Blob, GCS)", "COPY INTO Command for Bulk Ingestion", "File Formats: CSV, JSON, Parquet, ORC, Avro"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Virtual Compute Warehouses & Credit Management",
                "description": "Configure virtual warehouses, auto-suspend, auto-resume, multi-cluster scaling, and optimize cost allocations.",
                "topics_covered": ["T-Shirt Sizing of Virtual Warehouses (XS to 6X-Large)", "Auto-Suspend & Auto-Resume Settings for Cost Control", "Multi-Cluster Warehouses: Standard vs Economy Scaling", "Warehouse Isolation for Dedicated Workloads (ETL vs BI)", "Query Profiler & Analyzing Spilling to Local/Remote Storage"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Micro-Partitioning, Pruning & Clustering Keys",
                "description": "Learn how Snowflake automatically partitions columnar data into 50-500MB micro-partitions and when to define clustering keys.",
                "topics_covered": ["Micro-Partitioning Columnar Architecture", "Metadata-Driven Partition Pruning Mechanics", "Clustering Information & Clustering Depth", "When to Define Automatic Clustering Keys", "Search Optimization Service (SOS) for Point Lookups"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Time Travel, Fail-Safe & Zero-Copy Cloning",
                "description": "Restore dropped tables, query historical data up to 90 days in the past, and create instantaneous database copies with zero storage cost.",
                "topics_covered": ["Time Travel Syntax (AT / BEFORE TIMESTAMP, OFFSET, STATEMENT)", "Restoring Deleted Objects with UNDROP", "Fail-Safe 7-Day Disaster Recovery Period", "Zero-Copy Cloning of Databases, Schemas & Tables", "Testing Migrations Safely on Cloned Environments"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Continuous Ingestion: Snowpipe, Streams & Tasks",
                "description": "Automate real-time cloud data pipelines using cloud event notifications, Snowpipe, change-data-capture Streams, and scheduled Tasks.",
                "topics_covered": ["Snowpipe Architecture & S3 Event Notification Integration", "Snowflake Streams for Change Data Capture (CDC)", "Snowflake Tasks & Directed Acyclic Graph (DAG) Schedules", "Error Handling & Snowpipe System Functions (SYSTEM$PIPE_STATUS)", "Serverless Tasks vs Warehouse Tasks"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Governance, Security & Snowpark Python",
                "description": "Implement Role-Based Access Control, dynamic PII masking, secure data sharing, and execute Python transformations with Snowpark.",
                "topics_covered": ["Role-Based Access Control (RBAC) & Custom Role Hierarchies", "Dynamic Data Masking Policies & Row Access Policies", "Secure Direct Data Sharing & Clean Rooms", "Snowpark Python DataFrames & Stored Procedures", "Deploying Streamlit in Snowflake Native Apps"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Data Pipelines Orchestration with Airflow & Dagster",
        "slug": "data-pipelines-airflow-dagster",
        "category": "Data",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master data pipeline orchestration and workflow automation. Learn workflow DAG design with Apache Airflow 2.x, modern asset-based orchestration with Dagster, idempotency, backfilling, retries, sensors, alerting, and containerized pipeline execution.",
        "skills_covered": ["Directed Acyclic Graphs (DAGs)", "Apache Airflow 2.x Architecture", "Dagster Software-Defined Assets", "Pipeline Idempotency & Backfills", "Airflow Operators & TaskFlow API", "Alerting & SLA Management", "Dockerized Pipeline Deployments"],
        "prerequisites": ["Intermediate Python programming proficiency", "Basic familiarity with SQL and data processing tools"],
        "career_outcomes": ["Data Pipeline Engineer", "Data Platform Developer", "Analytics Orchestration Specialist", "Senior Data Engineer"],
        "tech_stack": ["Apache Airflow 2.9+", "Dagster", "Python 3.12", "PostgreSQL", "Docker", "Slack Webhooks"],
        "tags": ["airflow", "dagster", "orchestration", "data-pipelines", "dags", "data-engineering", "etl"],
        "capstone_projects": [
            {
                "title": "Automated Multi-Source Enterprise ETL Orchestrator with Airflow",
                "description": "Build an end-to-end Airflow pipeline orchestrating extraction from REST APIs, validation with Great Expectations, transformation via dbt, and loading into Snowflake with automated Slack alerts.",
                "difficulty": "Advanced"
            },
            {
                "title": "Asset-Based Modern Data Platform with Dagster",
                "description": "Construct a software-defined asset graph in Dagster featuring automatic partition lineage, downstream materializations, and asset cataloging.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Apache Airflow Official Documentation", "url": "https://airflow.apache.org/docs/", "type": "Official Documentation"},
            {"title": "Dagster Official Documentation & Guides", "url": "https://docs.dagster.io/", "type": "Documentation"},
            {"title": "Data Pipelines with Apache Airflow by Bas Harenslak & Julian de Ruiter", "url": "https://www.manning.com/books/data-pipelines-with-apache-airflow", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 44,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Orchestration Concepts & Airflow Architecture",
                "description": "Understand workflow automation: Webserver, Scheduler, Metadata Database, Triggerer, and Executor models (Local, Celery, Kubernetes).",
                "topics_covered": ["Workflow Orchestration vs Cron Scheduling", "Airflow Core Components: Scheduler, Webserver, Workers, DB", "Executor Types (LocalExecutor, CeleryExecutor, KubernetesExecutor)", "Airflow Folder Layout & Configuration (airflow.cfg)", "Setting up Airflow Locally with Docker Compose"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Writing DAGs with the TaskFlow API (@task)",
                "description": "Author Pythonic Directed Acyclic Graphs using Airflow 2's TaskFlow API, custom operators, and explicit dependencies.",
                "topics_covered": ["Defining DAGs with Context Managers & @dag Decorator", "The @task Decorator & Automatic XCom Value Passing", "Setting Upstream & Downstream Dependencies (>> and <<)", "Standard Operators: BashOperator, PythonOperator, SQLExecuteQueryOperator", "Dynamic Task Mapping (.expand()) for Parallel Execution"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Scheduling, Idempotency, Catchup & Backfilling",
                "description": "Design idempotent pipelines that can run safely across historical time ranges with catchup, execution dates, and backfill CLI.",
                "topics_covered": ["Cron Expressions & Timetables", "Logical Date (Execution Date) vs Data Interval Start/End", "Writing Idempotent Pipeline Steps (Upsert vs Append)", "The Catchup Parameter: When to Enable or Disable", "Triggering Historical Backfills via Airflow CLI"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Sensors, Connections, Variables & Alerting",
                "description": "Pause tasks until external conditions are met using Sensors, manage secrets via Connections, and send Slack error alerts.",
                "topics_covered": ["Sensors & Poke vs Reschedule Modes", "Managing Credentials with Airflow Connections", "Airflow Variables & Secrets Backend Integration", "SLA Miss Callbacks & on_failure_callback Handlers", "Real-Time Slack & PagerDuty Alert Notifications"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Modern Asset-Based Orchestration with Dagster",
                "description": "Shift from task-centric pipelines to software-defined assets with Dagster, asset lineage, and partitioned computing.",
                "topics_covered": ["Task-Based vs Software-Defined Asset (SDA) Philosophy", "Defining Assets with @asset & Asset Dependencies", "Partitioned Assets (Daily, Hourly, Static Partitions)", "Dagster UI (Dagit) Lineage & Asset Catalog", "Testing Assets Locally with Python Mocks"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Production Deployment & Kubernetes Execution",
                "description": "Deploy production orchestration clusters using Helm charts, KubernetesExecutor, and CI/CD automated DAG testing.",
                "topics_covered": ["Deploying Airflow / Dagster on Kubernetes via Helm", "KubernetesPodOperator for Isolated Language Runtimes", "Unit Testing DAGs with Pytest (Cycle Detection, Import Errors)", "Automating DAG Deployments with Git-Sync", "Cluster Health Monitoring & Database Maintenance"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "dbt (Data Build Tool) Analytics Engineering",
        "slug": "dbt-analytics-engineering",
        "category": "Data",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master Analytics Engineering with dbt (data build tool). Learn software engineering best practices applied to data transformations: modular SQL models, Jinja templating, incremental materializations, automated schema testing, documentation lineage, and CI/CD.",
        "skills_covered": ["dbt Core & dbt Cloud Workflows", "Modular SQL Modeling (Staging, Intermediate, Marts)", "Jinja Templating & dbt Macros", "Incremental Materializations", "Automated Data Testing (Schema & Custom)", "Data Lineage & Auto-Generated Docs", "dbt Semantic Layer"],
        "prerequisites": ["Strong proficiency in SQL queries and transformations", "Familiarity with cloud data warehouses (Snowflake, BigQuery, or Postgres)"],
        "career_outcomes": ["Analytics Engineer", "Data Transformation Specialist", "dbt Developer", "Modern BI Developer"],
        "tech_stack": ["dbt Core", "dbt Cloud", "PostgreSQL / Snowflake", "Jinja", "Git", "GitHub Actions"],
        "tags": ["dbt", "analytics-engineering", "sql", "data-transformations", "data-modeling", "jinja"],
        "capstone_projects": [
            {
                "title": "Enterprise B2B SaaS dbt Analytics Project from Scratch",
                "description": "Build an enterprise dbt project structuring raw event data into Staging, Intermediate, and Business Mart layers, featuring incremental event tables, comprehensive tests, and lineage graphs.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Automated dbt Continuous Integration (CI) Testing Pipeline",
                "description": "Construct a GitHub Actions CI pipeline that creates ephemeral pull request schemas, runs dbt build on modified models, and prevents regressions.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "dbt Official Documentation & Best Practices Guide", "url": "https://docs.getdbt.com/docs/introduction", "type": "Documentation"},
            {"title": "dbt Learn Free Interactive Courses", "url": "https://courses.getdbt.com/", "type": "Interactive Guides"},
            {"title": "The Analytics Engineering Roundup by Tristan Handy", "url": "https://roundup.getdbt.com/", "type": "Industry Newsletter"}
        ],
        "is_featured": False,
        "popularity_rank": 47,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Analytics Engineering Fundamentals & dbt Setup",
                "description": "Understand the T in ELT, the analytics engineering workflow, setting up dbt Core with profiles.yml, and project directory structure.",
                "topics_covered": ["The Rise of Analytics Engineering & ELT Paradigm", "dbt Core vs dbt Cloud Architecture", "Configuring profiles.yml & Warehouse Connection", "dbt_project.yml Configuration & Model Paths", "Running dbt compile & dbt run"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Layered Architecture: Sources, Staging & Marts",
                "description": "Organize transformations cleanly: source declaration with freshness tests, 1:1 staging models, intermediate transformations, and business-facing marts.",
                "topics_covered": ["Source Declarations & {{ source() }} Macro", "Source Data Freshness Tests (dbt source freshness)", "Staging Layer Guidelines (Light Cleaning, Type Casting, Renaming)", "Intermediate Models for Reusable Business Logic", "Dimensional Marts (fct_ and dim_ Models)"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Materializations: Views, Tables & Incremental Models",
                "description": "Choose the optimal materialization strategy for every model and master incremental models to process only new records.",
                "topics_covered": ["View vs Table vs Ephemeral Materializations", "Configuring Incremental Materializations", "The is_incremental() Jinja Macro", "Incremental Strategies (Merge, Delete+Insert, Append)", "Unique Keys & Safe Historical Re-Runs (--full-refresh)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Jinja Metaprogramming & Custom Macros",
                "description": "Write DRY (Don't Repeat Yourself) SQL using Jinja control flow, loops, environment variables, and custom dbt macros.",
                "topics_covered": ["Jinja Syntax: Variables {{ }}, Control {% %}, Comments {# #}", "Writing Custom Reusable Macros in macros/", "Iterating Over Lists & Generating Dynamic Pivots", "dbt-utils Community Package Integrations", "Introspecting Database Information Schema in Macros"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Automated Testing, Documentation & Lineage DAGs",
                "description": "Guarantee data quality with generic tests, custom singular tests, and generate interactive documentation with full lineage graphs.",
                "topics_covered": ["Out-of-the-Box Generic Tests (unique, not_null, accepted_values, relationships)", "Writing Singular Custom SQL Tests", "dbt-expectations Package for Advanced Quality Rules", "Generating Markdown Documentation in .yml Files", "Viewing & Interpreting the Interactive Lineage DAG"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "dbt CI/CD, Slim CI & Deployment Automation",
                "description": "Automate dbt workflows in GitHub Actions using Slim CI (state:modified+), ephemeral schemas, and production job schedules.",
                "topics_covered": ["Slim CI Concepts with State Comparison (state:modified+)", "Creating Ephemeral PR Schemas in Cloud Data Warehouses", "Automating PR Checks with GitHub Actions", "Scheduling Production Production Jobs via dbt Cloud / Airflow", "dbt Semantic Layer & Metric Definitions"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Big Data Architecture with Hadoop & Presto/Trino",
        "slug": "big-data-architecture-hadoop-trino",
        "category": "Data",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Architect distributed big data querying engines across distributed file systems and object storage. Learn Hadoop HDFS, MapReduce history, YARN resource negotiation, Hive metastores, and high-speed distributed interactive SQL with Presto / Trino.",
        "skills_covered": ["Distributed File Systems (HDFS)", "YARN Resource Management", "Hive Metastore Architecture", "Trino / Presto Distributed SQL Engine", "Federated Querying Across Polyglot Stores", "Columnar Storage (ORC & Parquet)", "High-Concurrency Query Tuning"],
        "prerequisites": ["Proficiency in advanced SQL", "Solid understanding of Linux operating systems and distributed computing"],
        "career_outcomes": ["Big Data Platform Engineer", "Trino / Presto Administrator", "Distributed Systems Engineer", "Enterprise Data Architect"],
        "tech_stack": ["Trino 440+", "Apache Hive", "Hadoop HDFS", "Docker", "MinIO / S3", "PostgreSQL", "DBeaver"],
        "tags": ["trino", "presto", "hadoop", "big-data", "federated-sql", "distributed-systems", "hdfs"],
        "capstone_projects": [
            {
                "title": "Federated Interactive Big Data Lakehouse Query Hub with Trino",
                "description": "Deploy a multi-node Trino cluster querying across an S3 Delta Lake, a transactional PostgreSQL database, and a MongoDB cluster in a single high-speed federated SQL statement.",
                "difficulty": "Advanced"
            },
            {
                "title": "High-Throughput Distributed Log Analytics Engine",
                "description": "Build an analytical query engine ingesting millions of server logs into partitioned ORC files on distributed storage, optimized for sub-second Trino querying.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Trino: The Definitive Guide by Matt Fuller, Manfred Moser & Martin Traverso", "url": "https://trino.io/trino-the-definitive-guide.html", "type": "Book"},
            {"title": "Hadoop: The Definitive Guide by Tom White", "url": "https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901687/", "type": "Book"},
            {"title": "Trino Official Documentation & Community Tutorials", "url": "https://trino.io/docs/current/", "type": "Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 66,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Distributed Storage & The Hadoop Ecosystem",
                "description": "Understand horizontal scaling: HDFS NameNode, DataNodes, block replication, YARN resource manager, and NodeManagers.",
                "topics_covered": ["The Evolution of Big Data: Google File System & MapReduce Papers", "HDFS NameNode vs DataNodes Architecture", "Block Size Optimization (128MB/256MB) & Rack Awareness", "YARN Architecture: ResourceManager & NodeManagers", "HDFS Fault Tolerance & Data Recovery"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "The Hive Metastore & Table Formats",
                "description": "Understand table abstractions over files: Hive Metastore (HMS), schema-on-read, external vs managed tables, and partitions.",
                "topics_covered": ["Hive Metastore (HMS) Architecture & Metadata Catalog", "Schema-on-Read vs Schema-on-Write", "Managed Tables vs External Tables in Distributed Storage", "Static vs Dynamic Table Partitioning", "Columnar File Formats: Apache Parquet vs Apache ORC"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Trino / Presto Architecture: Coordinator & Workers",
                "description": "Master Trino's massively parallel processing (MPP) memory-based SQL execution engine without map-reduce disk spills.",
                "topics_covered": ["Trino Coordinator vs Worker Nodes Role Separation", "MPP (Massively Parallel Processing) In-Memory Architecture", "Query Parsing, Logical Planning & Fragmented Execution Stages", "Pipelined Execution & Exchange Operators", "Deploying Trino Clusters with Docker and Kubernetes"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Connectors & Federated Query Execution",
                "description": "Execute queries that join tables living in completely different storage systems in a single standard ANSI SQL query.",
                "topics_covered": ["Trino Connector Architecture (Hive, Delta Lake, Iceberg, Postgres)", "Configuring Catalogs (*.properties files)", "Executing Federated Cross-Database SQL Joins", "Pushdown Predicates & Cost-Based Optimizer (CBO)", "Dynamic Filtering for High-Speed Star Schema Joins"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Query Tuning, Memory Management & Spilling",
                "description": "Diagnose Trino query latency using query plans, memory pools (User, System, Reserved), and query spilling to disk.",
                "topics_covered": ["Reading EXPLAIN and EXPLAIN ANALYZE in Trino", "Memory Allocation & Out-of-Memory (Query Exceeded Per-Node User Memory) Limits", "Enabling Query Spilling for Large Aggregations & Joins", "Tuning Worker Thread Counts & Network Buffers", "Analyzing Trino Web UI Active Queries & Live Operators"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Security, Access Control & Enterprise Governance",
                "description": "Secure big data query clusters using TLS, LDAP / OAuth authentication, and Apache Ranger fine-grained column/row permissions.",
                "topics_covered": ["Securing Trino Internals with Mutual TLS", "Authentication with LDAP, Kerberos & OAuth2/OIDC", "Fine-Grained Role-Based Access Control (RBAC) with Apache Ranger", "Column-Level Masking & Row-Level Filtering Rules", "Auditing Query Logs & Compliance Monitoring"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Data Governance, Quality & Cataloging",
        "slug": "data-governance-quality-cataloging",
        "category": "Data",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master enterprise data trust, compliance, and governance. Learn automated data quality testing with Great Expectations, data cataloging and discovery with DataHub, lineage tracking with OpenLineage, privacy compliance (GDPR/CCPA), and data mesh ownership.",
        "skills_covered": ["Automated Data Quality Testing", "Great Expectations Framework", "Data Cataloging & Discovery with DataHub", "Data Lineage Tracking (OpenLineage)", "PII Classification & GDPR/CCPA Compliance", "Data Mesh Governance Principles", "Data Observability & Alerting"],
        "prerequisites": ["Experience with Python and SQL", "Familiarity with data warehouses or databases"],
        "career_outcomes": ["Data Governance Specialist", "Data Quality Engineer", "Data Steward", "Enterprise Data Architect"],
        "tech_stack": ["Python 3.12", "Great Expectations", "DataHub", "OpenLineage", "PostgreSQL", "Docker"],
        "tags": ["data-governance", "data-quality", "great-expectations", "datahub", "data-lineage", "compliance"],
        "capstone_projects": [
            {
                "title": "Automated Enterprise Data Quality & Anomaly Detection Gateway",
                "description": "Build an automated quality gate using Great Expectations that validates incoming datasets, rejects malformed schemas, and publishes automated data docs.",
                "difficulty": "Intermediate"
            },
            {
                "title": "End-to-End Metadata & Lineage Catalog with DataHub",
                "description": "Deploy an enterprise DataHub catalog that automatically harvests metadata from PostgreSQL, dbt, and Airflow, providing searchable semantic tags and end-to-end lineage.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Great Expectations Official Documentation", "url": "https://docs.greatexpectations.io/", "type": "Documentation"},
            {"title": "DataHub Project Documentation & Architecture", "url": "https://datahubproject.io/docs/", "type": "Documentation"},
            {"title": "Data Mesh: Delivering Data-Driven Value at Scale by Zhamak Dehghani", "url": "https://www.oreilly.com/library/view/data-mesh/9781492092384/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 72,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Data Governance Foundations & Regulatory Compliance",
                "description": "Understand data stewardship, PII identification, right-to-be-forgotten obligations under GDPR/CCPA, and data retention policies.",
                "topics_covered": ["Core Pillars of Data Governance", "Identifying Personally Identifiable Information (PII)", "Regulatory Frameworks: GDPR, CCPA, HIPAA, SOC 2", "Data Retention, Archival & Cryptographic Erasure", "Creating Enterprise Data Dictionaries & Glossaries"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Automated Quality Testing with Great Expectations",
                "description": "Define declarative assertions on datasets using Great Expectations: expectation suites, validation operators, and automated Data Docs.",
                "topics_covered": ["Expectations Syntax (expect_column_values_to_not_be_null, etc.)", "Expectation Suites & Profilers", "Checkpoints & Automated Validation Runs", "Generating Human-Readable HTML Data Docs", "Integrating Validations into ETL Ingestion Pipelines"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Metadata Ingestion & Cataloging with DataHub",
                "description": "Deploy LinkedIn's open-source DataHub to index datasets, tables, dashboards, and pipelines into a unified searchable catalog.",
                "topics_covered": ["DataHub Architecture: GMS, Frontend & Kafka Pipeline", "Metadata Ingestion Recipes for Databases & Warehouses", "Search & Discovery UX for Data Consumers", "Domain Ownership, Tags & Glossary Terms", "Assigning Data Stewards & Ownership Roles"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Automated Lineage Tracking with OpenLineage",
                "description": "Trace data transformation paths from raw source files through pipelines to final BI dashboards using OpenLineage standards.",
                "topics_covered": ["The OpenLineage Standard & Event Specifications", "Automatic Lineage Extraction from Airflow & Spark", "dbt Lineage Integration into Data Catalogs", "Impact Analysis for Downstream Schema Changes", "Column-Level Lineage Tracing"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Data Observability, Anomaly Detection & SLA Tracking",
                "description": "Monitor the health of data systems across freshness, volume, distribution, and schema dimensions with automated alerts.",
                "topics_covered": ["The 5 Pillars of Data Observability (Freshness, Volume, Distribution, Schema, Lineage)", "Statistical Anomaly Detection on Ingestion Volumes", "Schema Drift Detection & Breaking Change Alerts", "Defining Data SLAs & Service Level Objectives (SLOs)", "Incident Management for Data Pipeline Outages"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Data Mesh Principles & Federated Governance",
                "description": "Adopt modern decentralized data architectures: domain-oriented ownership, data-as-a-product, and federated computational governance.",
                "topics_covered": ["Monolithic Central Data Team Bottlenecks", "Domain-Oriented Decentralized Data Ownership", "Data as a Product & Product Thinking", "Self-Serve Data Platform Infrastructure", "Federated Computational Governance Policies"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Vector Search & Feature Store Architecture",
        "slug": "vector-search-feature-store-architecture",
        "category": "Data",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Architect mission-critical data systems for modern real-time AI and machine learning. Master feature stores (Feast, Tecton) for zero-skew training and online inference, high-scale vector indexing algorithms, embedding lifecycles, and streaming feature pipelines.",
        "skills_covered": ["Feature Store Architecture (Feast)", "Online vs Offline Feature Syncing", "Train-Serve Skew Elimination", "Vector Indexing at Scale (HNSW, ScaNN)", "Real-Time Streaming Feature Calculation", "Embedding Storage & Versioning", "Entity Resolution & Similarity Search"],
        "prerequisites": ["Solid understanding of Python, SQL, and database concepts", "Familiarity with machine learning inference workflows"],
        "career_outcomes": ["AI Data Engineer", "Feature Store Specialist", "Vector Search Architect", "ML Infrastructure Engineer"],
        "tech_stack": ["Feast", "Redis", "PostgreSQL / pgvector", "Qdrant", "Python 3.12", "Apache Kafka", "Docker"],
        "tags": ["feature-store", "vector-search", "feast", "redis", "pgvector", "mlops", "ai-infrastructure"],
        "capstone_projects": [
            {
                "title": "Production Real-Time Fraud & Recommendation Feature Store with Feast",
                "description": "Implement a dual-storage feature store with Feast, synchronizing batch features from PostgreSQL into an in-memory Redis cluster with sub-5ms lookup latency.",
                "difficulty": "Advanced"
            },
            {
                "title": "Billion-Scale Vector Similarity Search Engine with HNSW & Metadata Filtering",
                "description": "Architect a distributed vector search cluster using Qdrant with custom payload filtering, snapshot backups, and high-throughput streaming insertions.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Feast Official Feature Store Documentation", "url": "https://docs.feast.dev/", "type": "Documentation"},
            {"title": "Chip Huyen's Guide to Feature Stores", "url": "https://huyenchip.com/2021/10/10/feature-stores.html", "type": "Comprehensive Article"},
            {"title": "Vector Search at Scale (Google ScaNN Paper)", "url": "https://arxiv.org/abs/2007.09697", "type": "Research Paper"}
        ],
        "is_featured": False,
        "popularity_rank": 52,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The Feature Store Imperative & Train-Serve Skew",
                "description": "Understand why traditional ML pipelines fail in production: point-in-time correctness, feature reuse, and train-serve skew.",
                "topics_covered": ["The Train-Serve Skew Phenomenon", "Point-in-Time Correctness & Data Leakage Prevention", "Dual Storage Architecture (Offline Warehouse vs Online Cache)", "Feature Discovery, Metadata & Sharing Across Teams", "Feature Versioning Strategies"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Feast Architecture: Entities, Views & Materialization",
                "description": "Configure Feast feature stores: entities, feature views, batch sources, and materializing features into Redis.",
                "topics_covered": ["Defining Entities & Primary Keys", "Feature Views with TTL Expirations", "Offline Storage Setup (Parquet / PostgreSQL / BigQuery)", "Online Storage Setup with Redis Clusters", "Executing feast apply and feast materialize"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Real-Time Streaming Feature Ingestion",
                "description": "Calculate dynamic features on the fly from streaming Kafka events and update online feature stores in sub-seconds.",
                "topics_covered": ["Push Sources & Streaming Feature Views in Feast", "Calculating Sliding Window Counts from Kafka Events", "Low-Latency Writing to In-Memory Online Stores", "Handling Late Data in Streaming Features", "Benchmarking Online Feature Retrieval Latencies (<5ms)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Vector Search Algorithms: HNSW, IVF & Product Quantization",
                "description": "Deconstruct modern Approximate Nearest Neighbor (ANN) index algorithms powering large-scale similarity search.",
                "topics_covered": ["Exact Nearest Neighbor vs Approximate Nearest Neighbor (ANN)", "Hierarchical Navigable Small World (HNSW) Multi-Layer Graphs", "Inverted File Indexing (IVF) Clustering", "Product Quantization (PQ) Compression Math", "Google ScaNN Anisotropic Vector Quantization"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Vector Databases in Production: Qdrant & pgvector",
                "description": "Deploy and configure enterprise vector databases with payload schemas, tenant separation, and hybrid search.",
                "topics_covered": ["Qdrant Distributed Architecture & Collections", "pgvector Indexing (HNSW / IVFFlat) in PostgreSQL", "Payload Indexing & Pre-Filtering Execution", "Embedding Lifecycles & Re-Embedding Strategies", "Vector Index Snapshots, Backups & Recovery"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Observability, Feature Monitoring & Drift Detection",
                "description": "Monitor feature quality in production: detecting feature drift, null spikes, latency percentiles, and automated alerting.",
                "topics_covered": ["Tracking Feature Statistical Drift with Evidently AI", "Monitoring Online Feature Store P99 Retrieval Latency", "Detecting Null Spikes & Outlier Values in Ingestion", "Feature Deprecation Lifecycle & Cleanup", "End-to-End Testing of Feature Extraction Pipelines"],
                "duration": "1 Week"
            }
        ]
    }
]

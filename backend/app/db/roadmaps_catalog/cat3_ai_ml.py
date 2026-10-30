"""Domain 3: AI / ML Roadmaps (13 Roadmaps)"""

AI_ML_ROADMAPS = [
    {
        "title": "Artificial Intelligence & Machine Learning Fundamentals",
        "slug": "ai-machine-learning-fundamentals",
        "category": "AI / ML",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "10 Weeks",
        "description": "Establish a deep foundation in classical machine learning and artificial intelligence. Learn mathematical foundations (linear algebra, calculus, probability), supervised and unsupervised learning algorithms with Scikit-Learn, data preprocessing, and model evaluation metrics.",
        "skills_covered": ["Linear Algebra & Matrix Operations", "Probability & Statistics for ML", "Supervised Learning (Regression & Classification)", "Unsupervised Learning (Clustering & PCA)", "Feature Engineering & Preprocessing", "Model Evaluation Metrics (ROC-AUC, F1)", "Scikit-Learn & NumPy/Pandas"],
        "prerequisites": ["Basic proficiency in Python programming", "High school level mathematics (algebra, basic functions)"],
        "career_outcomes": ["Junior Machine Learning Engineer", "Associate Data Scientist", "AI Research Trainee", "Data Analyst - Machine Learning"],
        "tech_stack": ["Python 3.12", "NumPy", "Pandas", "Scikit-Learn", "Matplotlib", "Seaborn", "JupyterLab"],
        "tags": ["machine-learning", "ai", "scikit-learn", "numpy", "pandas", "supervised-learning", "statistics"],
        "capstone_projects": [
            {
                "title": "End-to-End Predictive Housing Price Regression Engine",
                "description": "Build an end-to-end regression model with Scikit-Learn, featuring outlier detection, missing value imputation, categorical encoding, cross-validation, and hyperparameter tuning with GridSearchCV.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Customer Churn Prediction & Feature Importance Classifier",
                "description": "Develop a classification pipeline predicting customer churn with Random Forests and Gradient Boosting, calculating SHAP feature importances and precision-recall trade-offs.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Machine Learning Specialization by Andrew Ng (DeepLearning.AI)", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "type": "Comprehensive Course"},
            {"title": "Scikit-Learn Official User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Documentation"},
            {"title": "Hands-On Machine Learning with Scikit-Learn by Aurélien Géron", "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/", "type": "Book"}
        ],
        "is_featured": True,
        "popularity_rank": 4,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Mathematics Foundations: Linear Algebra & Calculus",
                "description": "Master the core mathematics powering ML: vector spaces, dot products, matrix multiplications, eigenvalues, and partial derivative gradients.",
                "topics_covered": ["Vectors, Norms & Dot Product Geometric Meaning", "Matrix Multiplication & Matrix Inverses", "Eigenvalues, Eigenvectors & Dimensionality Reduction", "Multivariate Calculus & Partial Derivatives", "Gradient Descent Mathematical Intuition"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "NumPy, Pandas & Exploratory Data Analysis (EDA)",
                "description": "Manipulate high-dimensional tensor arrays with NumPy and clean tabular datasets using Pandas and statistical visualizations.",
                "topics_covered": ["NumPy Array Broadcasting & Vectorized Operations", "Pandas DataFrames, GroupBy & Filtering", "Handling Missing Data & Imputation", "Statistical Visualizations with Seaborn & Matplotlib", "Correlation Matrices & Multicollinearity"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Supervised Learning: Linear & Logistic Regression",
                "description": "Build predictive models using Linear Regression, cost functions (MSE), gradient descent, L1/L2 regularization, and Logistic Regression.",
                "topics_covered": ["Linear Regression & Ordinary Least Squares", "Mean Squared Error (MSE) Cost Function", "Batch, Stochastic & Mini-Batch Gradient Descent", "L1 Lasso & L2 Ridge Regularization", "Logistic Regression & Sigmoid Decision Boundaries"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Classification Algorithms & Tree-Based Ensembles",
                "description": "Implement Decision Trees, Gini impurity, entropy, Random Forests bagging, and Gradient Boosted Trees (XGBoost, LightGBM).",
                "topics_covered": ["Decision Trees Splitting Criteria (Gini vs Entropy)", "Bagging & Random Forest Ensembles", "Boosting Principles & Gradient Boosted Decision Trees", "K-Nearest Neighbors (KNN) & Support Vector Machines (SVM)", "Hyperparameter Optimization with GridSearchCV / Optuna"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Unsupervised Learning: Clustering & Dimensionality Reduction",
                "description": "Discover latent patterns in unlabeled data using K-Means clustering, DBSCAN density clustering, and Principal Component Analysis (PCA).",
                "topics_covered": ["K-Means Clustering & Elbow Method Evaluation", "DBSCAN Density-Based Spatial Clustering", "Hierarchical Agglomerative Clustering & Dendrograms", "Principal Component Analysis (PCA) Variance Maximization", "t-SNE & UMAP for High-Dimensional Visualization"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Model Evaluation, Cross-Validation & Scikit-Learn Pipelines",
                "description": "Prevent data leakage and rigorously evaluate models using Stratified K-Fold cross validation, ROC-AUC curves, and Scikit-Learn Pipelines.",
                "topics_covered": ["Train / Validation / Test Splits & Data Leakage Prevention", "Stratified K-Fold Cross-Validation", "Confusion Matrix, Precision, Recall & F1-Score", "ROC Curves & Area Under Curve (ROC-AUC)", "Building Production Scikit-Learn Pipeline Ensembles"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Autonomous AI Agents & Multi-Agent Swarms",
        "slug": "autonomous-ai-agents-swarms",
        "category": "AI / ML",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Architect autonomous, self-directing AI agent systems and multi-agent collaborative swarms. Learn ReAct reasoning loops, tool-use execution, memory architectures, plan-and-solve workflows, human-in-the-loop validation, and frameworks like LangGraph, CrewAI, and AutoGen.",
        "skills_covered": ["Autonomous Agent Architecture", "ReAct & Plan-and-Solve Loops", "Function Calling & Tool Use", "Agentic Memory Systems", "Multi-Agent Collaboration Protocols", "LangGraph StateGraph Workflows", "Human-in-the-Loop Safeguards"],
        "prerequisites": ["Proficiency in Python programming", "Solid understanding of Large Language Models (LLMs) and Prompt Engineering"],
        "career_outcomes": ["Autonomous AI Agent Engineer", "AI Systems Architect", "Cognitive Architecture Engineer", "Applied AI Specialist"],
        "tech_stack": ["Python 3.12", "LangGraph", "CrewAI", "OpenAI / Claude APIs", "FastAPI", "ChromaDB / Pinecone", "Docker"],
        "tags": ["ai-agents", "autonomous-agents", "langgraph", "crewai", "tool-calling", "swarms", "llm"],
        "capstone_projects": [
            {
                "title": "Autonomous Software Engineering Swarm (Architect, Coder, Tester, Reviewer)",
                "description": "Build a multi-agent development team using LangGraph where an Architect plans software specs, a Coder writes code, a Tester executes sandbox tests, and a Reviewer validates pull requests.",
                "difficulty": "Advanced"
            },
            {
                "title": "Autonomous Market Research & Competitive Intelligence Agent",
                "description": "Construct an agent that browses web pages, executes search queries, analyzes financial filings, synthesizes data into structured reports, and alerts human analysts.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "LangGraph Official Documentation & Agent Tutorials", "url": "https://langchain-ai.github.io/langgraph/", "type": "Documentation"},
            {"title": "CrewAI Multi-Agent Framework Documentation", "url": "https://docs.crewai.com/", "type": "Official Guide"},
            {"title": "ReAct: Synergizing Reasoning and Acting in Language Models (Paper)", "url": "https://arxiv.org/abs/2210.03629", "type": "Research Paper"}
        ],
        "is_featured": True,
        "popularity_rank": 7,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Agent Foundations, Tool Use & Function Calling",
                "description": "Understand the difference between stateless LLM completions and agentic systems capable of invoking external tools and APIs.",
                "topics_covered": ["LLM Function Calling Specifications & JSON Schemas", "Tool Definitions with Pydantic & Return Types", "Tool Execution Sandboxes & Error Handling", "ReAct (Reasoning + Acting) Execution Loop", "Parsing Model Decisions & Halting Conditions"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Agent Memory Architectures & Context Compaction",
                "description": "Design short-term and long-term memory systems for agents: scratchpads, conversation history, vector episodic memory, and summarization.",
                "topics_covered": ["Short-Term Working Memory vs Long-Term Episodic Memory", "Semantic Memory Retrieval with Vector Embeddings", "Context Window Management & Summarization Pruning", "Entity Memory & Knowledge Graphs", "Handling Memory Poisoning & Hallucinations"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Planning, Self-Reflection & Error Recovery",
                "description": "Empower agents with strategic planning, decomposing complex goals into subtasks, evaluating outcomes, and self-correcting mistakes.",
                "topics_covered": ["Plan-and-Solve & Tree-of-Thoughts Prompting", "Self-Reflection & Reflexion Agent Patterns", "Dynamic Replanning on Tool Execution Failure", "Critique & Verification Prompts", "Setting Strict Depth Limits & Cost Quotas"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Graph-Based Workflows with LangGraph",
                "description": "Model complex agent workflows as stateful cyclic graphs using LangGraph: nodes, edges, conditional routing, and checkpointing.",
                "topics_covered": ["StateGraph Architecture & Custom State Schemas", "Defining Agent Nodes & Tool Nodes", "Conditional Edges & Router Functions", "Cyclic Loops & Maximum Recursion Safeguards", "State Persistence & Time-Travel Debugging with Checkpointers"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Multi-Agent Collaboration with CrewAI & Swarms",
                "description": "Orchestrate specialized multi-agent teams with explicit roles, delegated tasks, hierarchical supervisors, and consensus voting.",
                "topics_covered": ["CrewAI Agent Roles, Goals & Backstories", "Sequential vs Hierarchical Crew Workflows", "Agent Delegation & Inter-Agent Communication", "Consensus Mechanisms & Multi-Perspective Synthesis", "Preventing Infinite Discussion Loops"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Human-in-the-Loop, Guardrails & Production Deployment",
                "description": "Integrate human approval interrupts for high-risk actions, apply safety guardrails with NeMo Guardrails, and deploy scalable APIs.",
                "topics_covered": ["Human-in-the-Loop Approval Interrupts in LangGraph", "Action Whitelisting & Destructive Command Protection", "Semantic Guardrails with NeMo Guardrails", "Observability & Tracing with LangSmith", "Deploying Agent Services via FastAPI & WebSockets"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "LLM Application Engineering & LangChain/LlamaIndex",
        "slug": "llm-application-engineering",
        "category": "AI / ML",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Build enterprise-grade applications powered by Large Language Models. Master prompt chaining, retrieval-augmented generation (RAG), vector embeddings, document chunking, structured JSON outputs, streaming responses, and open-source models with Ollama and vLLM.",
        "skills_covered": ["Prompt Engineering & Chaining", "Retrieval-Augmented Generation (RAG)", "LangChain Core & Expression Language (LCEL)", "LlamaIndex Document Ingestion", "Structured Outputs with Instructor & Pydantic", "Local LLMs with Ollama & vLLM", "Cost Optimization & Token Caching"],
        "prerequisites": ["Intermediate Python programming proficiency", "Familiarity with REST APIs and basic database concepts"],
        "career_outcomes": ["AI Application Engineer", "LLM Engineer", "Generative AI Developer", "AI Solutions Architect"],
        "tech_stack": ["Python 3.12", "LangChain", "LlamaIndex", "OpenAI / Anthropic APIs", "Ollama", "Qdrant / ChromaDB", "FastAPI"],
        "tags": ["llm", "langchain", "llamaindex", "rag", "generative-ai", "prompt-engineering", "vector-db"],
        "capstone_projects": [
            {
                "title": "Enterprise Knowledge Base Chatbot with Multi-Format RAG",
                "description": "Build an intelligent RAG system that ingests PDFs, Markdown, and audio transcripts, extracts embeddings, performs hybrid search, and generates sourced citations.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Medical / Legal Contract Extraction Engine",
                "description": "Construct a high-accuracy document parsing pipeline that extracts complex nested legal clauses into validated Pydantic models using Instructor and few-shot examples.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "LangChain Official Documentation & Tutorials", "url": "https://python.langchain.com/docs/introduction/", "type": "Documentation"},
            {"title": "LlamaIndex Official Documentation", "url": "https://docs.llamaindex.ai/en/stable/", "type": "Documentation"},
            {"title": "Prompt Engineering Guide by DAIR.AI", "url": "https://www.promptingguide.ai/", "type": "Interactive Guides"}
        ],
        "is_featured": True,
        "popularity_rank": 10,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "LLM Fundamentals, Tokenization & API Architectures",
                "description": "Understand how autoregressive transformers generate tokens, temperature, top-p, context windows, and modern API protocols.",
                "topics_covered": ["Tokenization Mechanics (Byte-Pair Encoding)", "Autoregressive Next-Token Prediction", "Hyperparameters: Temperature, Top-P, Presence Penalty", "OpenAI & Anthropic REST API Specs", "Streaming Completions via Server-Sent Events (SSE)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Structured Outputs & Extraction with Pydantic & Instructor",
                "description": "Force LLMs to return guaranteed, schema-validated JSON outputs using JSON Mode, Pydantic, and the Instructor library.",
                "topics_covered": ["JSON Mode vs Native Function Calling", "Schema Enforcement with Pydantic v2 Models", "Instructor Library for Type-Safe LLM Responses", "Self-Correction & Automatic Validation Retries", "Few-Shot Examples for Complex Nested Objects"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Chaining & Composition with LangChain (LCEL)",
                "description": "Construct deterministic prompt chains using LangChain Expression Language (LCEL), runnables, fallbacks, and parallel execution.",
                "topics_covered": ["LangChain Expression Language (LCEL) Architecture", "PromptTemplate & ChatPromptTemplate Dynamic Fill", "RunnablePassthrough, RunnableParallel & RunnableBranch", "Handling Fallbacks & Model Redundancy", "Custom Output Parsers & String Trimming"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Data Ingestion & Indexing with LlamaIndex",
                "description": "Parse heterogeneous documents (PDFs, Notion, SQL) using LlamaIndex connectors, intelligent semantic chunking, and node parsing.",
                "topics_covered": ["Document Readers (PDF, DOCX, Markdown, Web)", "Chunking Strategies: Fixed-Size, Sentence, Semantic Splitting", "Node Hierarchy & Metadata Extraction", "VectorStoreIndex Creation & Query Engines", "Router & SubQuestion Query Engines"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Retrieval-Augmented Generation (RAG) Architecture",
                "description": "Build high-accuracy RAG systems with dense embeddings, hybrid keyword+semantic search, re-ranking, and citation generation.",
                "topics_covered": ["Embedding Models (OpenAI text-embedding-3, BAAI/bge)", "Vector Indexing in Qdrant / ChromaDB", "Hybrid Search (Dense Vector + Sparse BM25)", "Cross-Encoder Re-Ranking with Cohere / BGE", "Hallucination Mitigation & Sourced Citations"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Local LLM Serving, Token Caching & Evaluation",
                "description": "Host open-weights models (Llama 3, Mistral) locally with Ollama / vLLM, optimize inference costs with prompt caching, and evaluate with RAGAS.",
                "topics_covered": ["Running Local Models with Ollama & vLLM", "Prompt Caching & KV Cache Reuse", "Token Usage & Cost Optimization Strategies", "RAG Evaluation Metrics with RAGAS (Faithfulness, Relevance)", "Tracing & Debugging Chains with LangSmith / Phoenix"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Advanced Prompt Engineering & Evaluation Systems",
        "slug": "advanced-prompt-engineering-evaluation",
        "category": "AI / ML",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "4 Weeks",
        "description": "Master the science of prompt engineering and systematic LLM evaluation. Learn few-shot prompting, Chain-of-Thought (CoT), Tree-of-Thoughts, directional stimulus, prompt injection defenses, automated benchmark suites, and LLM-as-a-Judge evaluation.",
        "skills_covered": ["Chain-of-Thought (CoT) Prompting", "Few-Shot In-Context Learning", "System Prompt Engineering", "Jailbreak & Prompt Injection Defense", "Automated Evaluation Frameworks", "LLM-as-a-Judge Methodologies", "Prompt Versioning & CI/CD"],
        "prerequisites": ["Basic computer literacy and curiosity about generative AI", "No coding experience required, though Python basics are helpful"],
        "career_outcomes": ["Prompt Engineer", "AI Product Specialist", "AI Evaluation Specialist", "LLM Solutions Consultant"],
        "tech_stack": ["OpenAI Playground", "Anthropic Console", "Python", "DeepEval", "Ragas", "LangSmith"],
        "tags": ["prompt-engineering", "cot", "llm-evaluation", "safety", "jailbreaks", "generative-ai"],
        "capstone_projects": [
            {
                "title": "Enterprise Customer Support System Prompt & Evaluation Suite",
                "description": "Design a bulletproof system prompt with strict brand voice, dynamic context placeholders, refusal policies for out-of-scope queries, and an automated 100-test evaluation suite.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Red-Teaming & Prompt Injection Defense Benchmark",
                "description": "Construct an automated red-teaming test harness that evaluates LLM robustness against direct injection, indirect injection, and jailbreak attempts.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Anthropic Interactive Prompt Engineering Tutorial", "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", "type": "Official Tutorial"},
            {"title": "OpenAI Prompt Engineering Guide", "url": "https://platform.openai.com/docs/guides/prompt-engineering", "type": "Documentation"},
            {"title": "Learn Prompting - Open Source Course", "url": "https://learnprompting.org/", "type": "Interactive Guides"}
        ],
        "is_featured": False,
        "popularity_rank": 22,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Core Prompt Anatomy & System Roles",
                "description": "Understand system instructions, user prompts, assistant turns, delimiters, clear instructions, and role definition techniques.",
                "topics_covered": ["System vs User vs Assistant Message Roles", "Using XML Delimiters (<context>, <instructions>)", "Role Prompting & Tone Setting", "Clear vs Vague Instructions", "Formatting Constraints & Negative Constraints"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "In-Context Learning & Advanced Reasoning Patterns",
                "description": "Unlock complex problem solving through zero-shot, few-shot examples, Chain-of-Thought (CoT), and Least-to-Most decomposition.",
                "topics_covered": ["Zero-Shot vs Few-Shot Exemplars Selection", "Chain-of-Thought (CoT) & 'Think Step-by-Step'", "Self-Consistency & Majority Voting", "Least-to-Most Decomposition Strategy", "Directional Stimulus & Meta-Prompting"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Prompt Security, Red-Teaming & Jailbreak Defense",
                "description": "Safeguard production LLM applications against prompt injections, adversarial jailbreaks, system prompt leakage, and data exfiltration.",
                "topics_covered": ["Direct vs Indirect Prompt Injection Attacks", "Jailbreak Techniques (Hypotheticals, Roleplays, Base64)", "System Prompt Leakage Prevention", "Input Sanitization & Canary Tokens", "Output Guardrails & Format Verification"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Systematic Evaluation & LLM-as-a-Judge",
                "description": "Measure prompt performance systematically using synthetic test datasets, assertion tests, and automated LLM-as-a-Judge scoring.",
                "topics_covered": ["Creating Golden Benchmark Evaluation Datasets", "Deterministic Assertions vs Semantic Similarity", "LLM-as-a-Judge Scoring Criteria & Calibration", "DeepEval Framework for Automated Testing", "Prompt Version Control & A/B Testing in Production"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Deep Learning & Neural Networks with PyTorch 2.x",
        "slug": "deep-learning-pytorch",
        "category": "AI / ML",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "12 Weeks",
        "description": "Master deep neural networks from first principles using PyTorch 2.x. Build, train, and optimize Multi-Layer Perceptrons (MLPs), Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs/LSTMs), and Transformer architectures with GPU acceleration.",
        "skills_covered": ["PyTorch Tensors & Autograd Engine", "Neural Network Architecture Design (nn.Module)", "Backpropagation & Optimization Algorithms", "Convolutional Neural Networks (CNNs)", "Sequence Modeling & Transformers", "Mixed Precision & GPU Acceleration", "Model Checkpointing & TorchScript"],
        "prerequisites": ["Solid understanding of Python programming and NumPy", "Basic calculus (derivatives, chain rule) and linear algebra (matrices)"],
        "career_outcomes": ["Deep Learning Engineer", "Computer Vision Specialist", "NLP Research Engineer", "Applied AI Scientist"],
        "tech_stack": ["Python 3.12", "PyTorch 2.x", "Torchvision", "CUDA", "TensorBoard", "Weights & Biases", "Timm"],
        "tags": ["deep-learning", "pytorch", "neural-networks", "cnn", "transformers", "gpu", "autograd"],
        "capstone_projects": [
            {
                "title": "End-to-End Image Classification & Object Localization CNN",
                "description": "Build and train a modern ResNet/ConvNeXt architecture from scratch on GPU using custom PyTorch datasets, data augmentations, learning rate warmups, and mixed precision.",
                "difficulty": "Advanced"
            },
            {
                "title": "Mini-GPT Transformer Language Model Trained from Scratch",
                "description": "Implement a decoder-only Transformer language model in PyTorch featuring multi-head self-attention, rotary positional embeddings, and autoregressive text generation.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "PyTorch Official Tutorials & Deep Learning Course", "url": "https://pytorch.org/tutorials/", "type": "Official Tutorial"},
            {"title": "Deep Learning Specialization by Andrew Ng", "url": "https://www.deeplearning.ai/courses/deep-learning-specialization/", "type": "Comprehensive Course"},
            {"title": "Neural Networks: Zero to Hero by Andrej Karpathy", "url": "https://karpathy.ai/zero-to-hero.html", "type": "Video Series & Code"}
        ],
        "is_featured": False,
        "popularity_rank": 15,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Tensors, Computational Graphs & Autograd",
                "description": "Understand PyTorch tensor operations, CPU vs GPU memory transfers, automatic differentiation, and backward pass dynamics.",
                "topics_covered": ["PyTorch Tensor Creation, Shapes & Device Management", "Computational Graphs & Dynamic Execution", "Automatic Differentiation with torch.autograd", "Backward() Pass & Gradient Accumulation", "Disabling Gradients with torch.no_grad()"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Multi-Layer Perceptrons & Training Loops",
                "description": "Construct neural network architectures using torch.nn.Module, activation functions (ReLU, GELU), loss functions, and optimizers.",
                "topics_covered": ["nn.Module, nn.Linear & Parameter Registration", "Activation Functions: Sigmoid, Tanh, ReLU, GELU", "Loss Functions: MSELoss, CrossEntropyLoss", "Optimizers: SGD with Momentum, Adam, AdamW", "Standard Training & Validation Loop Architecture"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Overfitting Defense: Regularization & Normalization",
                "description": "Prevent neural network overfitting using Dropout, Weight Decay, Batch Normalization, and Layer Normalization.",
                "topics_covered": ["Bias-Variance Trade-off in Deep Networks", "Dropout & Spatial Dropout Mechanics", "L2 Regularization (Weight Decay in Optimizers)", "Batch Normalization vs Layer Normalization", "Early Stopping & Learning Rate Schedulers (CosineAnnealing)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Convolutional Neural Networks (CNNs) for Computer Vision",
                "description": "Master spatial feature extraction with 2D convolutions, pooling, residual skip connections, and transfer learning.",
                "topics_covered": ["2D Convolutions, Kernel Sizes, Stride & Padding", "Max Pooling vs Average Pooling", "ResNet Architecture & Residual Skip Connections", "Data Augmentation with torchvision.transforms.v2", "Fine-Tuning Pre-Trained Models with Timm"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Sequence Modeling & The Self-Attention Mechanism",
                "description": "From recurrent cells to the breakthrough Transformer architecture: Scaled Dot-Product Attention and Multi-Head Attention.",
                "topics_covered": ["Limitations of RNNs & LSTMs", "Self-Attention Mathematics (Query, Key, Value)", "Scaled Dot-Product Attention & Softmax Scaling", "Multi-Head Attention (MHA) Mechanism", "Positional Embeddings (Sinusoidal vs Rotary/RoPE)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "GPU Acceleration, Mixed Precision & Profiling",
                "description": "Speed up PyTorch training by 3-5x using Automatic Mixed Precision (AMP), torch.compile, distributed data parallel, and profiling.",
                "topics_covered": ["Automatic Mixed Precision (torch.cuda.amp.autocast)", "PyTorch 2.x torch.compile Graph Optimization", "PyTorch Profiler & GPU Memory Snapshots", "DistributedDataParallel (DDP) Multi-GPU Training", "Exporting Models with TorchScript & ONNX"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Large Language Model Fine-Tuning & Quantization",
        "slug": "llm-fine-tuning-quantization",
        "category": "AI / ML",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Customize open-weights Large Language Models for proprietary domain tasks. Master Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA), instruction dataset preparation, Direct Preference Optimization (DPO), model quantization (GGUF, AWQ), and vLLM inference hosting.",
        "skills_covered": ["LoRA & QLoRA Fine-Tuning", "PEFT & HuggingFace TRL", "Dataset Formatting & Tokenization", "Direct Preference Optimization (DPO)", "Model Quantization (GGUF, AWQ, EXL2)", "Evaluation with LLM Benchmarks", "High-Throughput vLLM Deployment"],
        "prerequisites": ["Proficiency in PyTorch and transformer architectures", "Experience with Hugging Face transformers library"],
        "career_outcomes": ["LLM Fine-Tuning Specialist", "Applied AI Scientist", "Open-Source AI Engineer", "AI Infrastructure Engineer"],
        "tech_stack": ["Python 3.12", "Hugging Face TRL", "PEFT", "BitsAndBytes", "vLLM", "Axolotl", "Unsloth", "Weights & Biases"],
        "tags": ["fine-tuning", "lora", "qlora", "llm", "quantization", "huggingface", "vllm"],
        "capstone_projects": [
            {
                "title": "Domain-Specific Legal / Medical LLM via QLoRA & DPO",
                "description": "Fine-tune an open-source model (Llama-3-8B or Mistral-7B) on high-value domain documents with QLoRA, align responses with Direct Preference Optimization (DPO), and benchmark against GPT-4.",
                "difficulty": "Advanced"
            },
            {
                "title": "Quantized Model Production Serving Engine with vLLM",
                "description": "Quantize a custom fine-tuned model into AWQ format and deploy a high-concurrency vLLM inference endpoint with PagedAttention and continuous batching.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Hugging Face TRL (Transformer Reinforcement Learning) Guide", "url": "https://huggingface.co/docs/trl/index", "type": "Documentation"},
            {"title": "LoRA: Low-Rank Adaptation of Large Language Models (Paper)", "url": "https://arxiv.org/abs/2106.09685", "type": "Research Paper"},
            {"title": "Unsloth Fast Fine-Tuning Documentation", "url": "https://docs.unsloth.ai/", "type": "Interactive Guides"}
        ],
        "is_featured": False,
        "popularity_rank": 20,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "LLM Architecture Recap & When to Fine-Tune",
                "description": "Evaluate trade-offs between Prompt Engineering, RAG, and Fine-Tuning, and understand transformer weight matrices.",
                "topics_covered": ["Comparing Prompt Engineering vs RAG vs Fine-Tuning", "Transformer Weight Matrices (Q, K, V, O, MLP layers)", "Full Parameter Fine-Tuning vs PEFT Memory Demands", "Catastrophic Forgetting & Generalization Decay", "Hardware Requirements & VRAM Budget Calculations"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Parameter-Efficient Fine-Tuning (LoRA & QLoRA)",
                "description": "Deconstruct Low-Rank Adaptation (LoRA), low-rank matrix decomposition (A and B), and 4-bit NormalFloat QLoRA quantization.",
                "topics_covered": ["Low-Rank Matrix Decomposition Math (W0 + B * A)", "LoRA Hyperparameters: Rank (r), Alpha (α), Target Modules", "4-Bit NormalFloat (NF4) & Double Quantization in QLoRA", "BitsAndBytes Integration with Hugging Face", "Unsloth for 5x Faster Training & Memory Optimization"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Instruction Dataset Preparation & Tokenization",
                "description": "Curate high-quality instruction tuning datasets using Alpaca, ShareGPT, and ChatML formatting with loss masking.",
                "topics_covered": ["Instruction Dataset Schemas (Instruction, Input, Output)", "ChatML & Standard Conversation Templates", "Applying Loss Masks to Prompt Tokens (Train on Responses Only)", "Synthetic Data Generation with Self-Instruct", "Data Filtering, De-Duplication & Quality Scrubbing"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Supervised Fine-Tuning (SFT) with TRL & Axolotl",
                "description": "Configure SFTTrainer, monitor training loss with Weights & Biases, manage gradient accumulation, and merge adapters.",
                "topics_covered": ["Hugging Face TRL SFTTrainer Setup", "Gradient Accumulation & Gradient Checkpointing", "Learning Rate Warmup & Cosine Schedulers", "Tracking Training Dynamics with Weights & Biases", "Merging LoRA Adapter Weights into Base Model"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Preference Alignment: DPO & ORPO",
                "description": "Align fine-tuned models with human preferences using Direct Preference Optimization (DPO) without complex RLHF reward models.",
                "topics_covered": ["RLHF vs Direct Preference Optimization (DPO)", "Pairwise Chosen vs Rejected Preference Datasets", "DPO Loss Function & Beta Parameter Tuning", "Odds Ratio Preference Optimization (ORPO)", "Evaluating Alignment & Reducing Hallucinations"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Model Quantization & High-Throughput Serving (vLLM)",
                "description": "Quantize models to GGUF, AWQ, and EXL2, and serve thousands of requests per second using vLLM PagedAttention.",
                "topics_covered": ["Weight Quantization Schemes (GGUF, AWQ, GPTQ)", "Running Models on Local Hardware with llama.cpp", "vLLM Engine Architecture & PagedAttention", "Continuous Batching for Concurrent Requests", "OpenAI-Compatible REST Server Deployment"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Vector Databases & Enterprise RAG Systems",
        "slug": "vector-databases-enterprise-rag",
        "category": "AI / ML",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "6 Weeks",
        "description": "Master vector search engineering and enterprise Retrieval-Augmented Generation (RAG). Learn high-dimensional vector math, Approximate Nearest Neighbor (ANN) indexing with HNSW and IVF, vector database systems (Qdrant, Pinecone, Milvus, pgvector), and advanced RAG query transformations.",
        "skills_covered": ["Vector Embeddings & Cosine Similarity", "Approximate Nearest Neighbors (HNSW & IVF)", "Vector Databases (Qdrant, Pinecone, pgvector)", "Hybrid Search (Dense + Sparse BM25)", "Query Decomposition & HyDE", "Re-Ranking Models", "Enterprise RAG Evaluation"],
        "prerequisites": ["Intermediate Python programming experience", "Basic understanding of embeddings and RESTful APIs"],
        "career_outcomes": ["Vector Search Engineer", "RAG Systems Architect", "AI Data Engineer", "Enterprise AI Specialist"],
        "tech_stack": ["Python 3.12", "Qdrant", "pgvector / PostgreSQL", "Pinecone", "Hugging Face", "Cohere", "FastAPI"],
        "tags": ["vector-database", "rag", "qdrant", "pgvector", "embeddings", "hnsw", "hybrid-search"],
        "capstone_projects": [
            {
                "title": "Multi-Tenant Enterprise RAG Engine with RBAC & Metadata Filtering",
                "description": "Architect a production vector search platform with Qdrant, featuring payload metadata filtering, tenant isolation, role-based document access, and sub-10ms query latency.",
                "difficulty": "Advanced"
            },
            {
                "title": "Hybrid Search Engine with Reciprocal Rank Fusion (RRF)",
                "description": "Implement a dual-retriever pipeline combining sparse keyword search (BM25) and dense embeddings, fused via Reciprocal Rank Fusion and re-ranked with Cohere.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Qdrant Official Vector Database Documentation", "url": "https://qdrant.tech/documentation/", "type": "Documentation"},
            {"title": "Pinecone Learning Center: Vector Search Explained", "url": "https://www.pinecone.io/learn/", "type": "Interactive Guides"},
            {"title": "pgvector GitHub Repository & Documentation", "url": "https://github.com/pgvector/pgvector", "type": "Open Source Reference"}
        ],
        "is_featured": False,
        "popularity_rank": 26,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "High-Dimensional Vector Math & Embedding Models",
                "description": "Understand how text and media are converted to semantic coordinates: dot product, cosine similarity, Euclidean distance, and embedding generation.",
                "topics_covered": ["Vector Spaces & Semantic Proximity", "Cosine Similarity vs Dot Product vs Euclidean Distance", "Embedding Models (OpenAI, HuggingFace Sentence-Transformers)", "Dimensionality & Curse of Dimensionality", "Normalized Vectors & Fast Matrix Computations"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Approximate Nearest Neighbor (ANN) Algorithms",
                "description": "Explore algorithms that search billions of vectors in milliseconds: Hierarchical Navigable Small World (HNSW) and Inverted File (IVF).",
                "topics_covered": ["Exact k-NN vs Approximate Nearest Neighbors (ANN)", "HNSW Graph Construction & Multi-Layer Navigation", "Inverted File Index (IVF) & Voronoi Cells", "Product Quantization (PQ) for Memory Compression", "Recall vs Latency Tuning Parameters (M, efSearch)"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Vector Databases: Qdrant, Pinecone & pgvector",
                "description": "Deploy, configure, and query leading vector databases, comparing dedicated vector databases with relational extensions like pgvector.",
                "topics_covered": ["Qdrant Collections, Payloads & Filtered Search", "Pinecone Serverless Architecture & Namespaces", "pgvector Extension in PostgreSQL (HNSW Indexing)", "Metadata Filtering Pre-Filtering vs Post-Filtering", "Vector Database Benchmarking & Performance Profiling"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Advanced Query Transformation & Routing",
                "description": "Optimize user queries prior to retrieval using Hypothetical Document Embeddings (HyDE), query decomposition, and semantic routing.",
                "topics_covered": ["Hypothetical Document Embeddings (HyDE)", "Multi-Query Expansion & Sub-Question Decomposition", "Query Rewriting & Coreference Resolution", "Semantic Query Routers", "Handling Ambiguous & Out-of-Domain Queries"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Hybrid Search & Cross-Encoder Re-Ranking",
                "description": "Combine the precision of keyword search with the conceptual understanding of vector search, and rerank with cross-encoders.",
                "topics_covered": ["Sparse Keyword Search (BM25 / Splade)", "Dense Semantic Vector Retrieval", "Reciprocal Rank Fusion (RRF) Mathematical Formula", "Cross-Encoder Re-Ranking (Cohere Rerank, BGE-Reranker)", "Context Window Compression & Slicing"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Production RAG Observability, Security & Evaluation",
                "description": "Monitor and protect RAG pipelines: hallucination detection, prompt injection scanning, access control, and latency tracing.",
                "topics_covered": ["Tenant Isolation & Row-Level Security in Vector Databases", "Continuous Evaluation with RAGAS (Context Precision, Recall)", "Detecting Outdated Vectors & Incremental Index Syncing", "Tracing Retrieval Pipelines with OpenTelemetry / Langfuse", "Production SLA & High Availability Deployment"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Natural Language Processing (NLP) & Transformers",
        "slug": "nlp-transformers-huggingface",
        "category": "AI / ML",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Master Modern Natural Language Processing (NLP) using the Hugging Face ecosystem and Transformer architectures. Learn text tokenization, BERT sequence classification, GPT causal language modeling, named entity recognition (NER), summarization, and translation.",
        "skills_covered": ["Transformers Architecture", "Hugging Face Transformers & Datasets", "BERT & RoBERTa for Classification", "Token Classification & Named Entity Recognition (NER)", "Seq2Seq Models (T5, BART) for Summarization", "Tokenizers Library (BPE & WordPiece)", "Model Evaluation with ROUGE & BLEU"],
        "prerequisites": ["Proficiency in Python programming", "Basic understanding of deep learning and PyTorch tensors"],
        "career_outcomes": ["NLP Engineer", "Machine Learning Scientist", "AI Research Engineer", "Conversational AI Developer"],
        "tech_stack": ["Python 3.12", "Hugging Face Transformers", "Datasets", "Evaluate", "PyTorch", "Accelerate", "Tokenizers"],
        "tags": ["nlp", "transformers", "huggingface", "bert", "tokenization", "text-classification", "ner"],
        "capstone_projects": [
            {
                "title": "Multi-Entity Financial Named Entity Recognition (NER) Extractor",
                "description": "Fine-tune a RoBERTa model on SEC quarterly filings to extract stock tickers, financial figures, executive names, and legal liabilities with 95%+ F1 score.",
                "difficulty": "Advanced"
            },
            {
                "title": "Abstractive Meeting Summarization Service with T5",
                "description": "Build an end-to-end meeting transcript summarization pipeline using a fine-tuned T5 model, custom chunking, and automated ROUGE evaluation metrics.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Hugging Face Official NLP Course", "url": "https://huggingface.co/learn/nlp-course/chapter1/1", "type": "Interactive Course"},
            {"title": "Attention Is All You Need (Original Transformer Paper)", "url": "https://arxiv.org/abs/1706.03762", "type": "Research Paper"},
            {"title": "Natural Language Processing with Transformers by Tunstall et al.", "url": "https://www.oreilly.com/library/view/natural-language-processing/9781098103231/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 29,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "NLP Foundations, Text Preprocessing & Tokenization",
                "description": "Understand text normalization, subword tokenization algorithms (BPE, WordPiece, SentencePiece), and Hugging Face Tokenizers.",
                "topics_covered": ["N-Grams, Stemming & Lemmatization Historical Context", "Byte-Pair Encoding (BPE) & WordPiece Mechanics", "Special Tokens ([CLS], [SEP], [PAD], [MASK])", "Fast Tokenizers with Hugging Face Tokenizers", "Padding, Truncation & Attention Masks"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "The Transformer Architecture Deep Dive",
                "description": "Deconstruct Encoder and Decoder architectures, Self-Attention, Cross-Attention, and Positional Encodings.",
                "topics_covered": ["Encoder-Only (BERT) vs Decoder-Only (GPT) vs Encoder-Decoder (T5)", "Scaled Dot-Product Self-Attention Computation", "Feed-Forward Networks & Residual Connections", "LayerNorm & Pre-LN vs Post-LN Dynamics", "Inference Generation Strategies: Greedy, Beam Search, Top-K"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Sequence Classification & Sentiment Analysis",
                "description": "Fine-tune pre-trained BERT and RoBERTa models on custom text classification datasets using Hugging Face Trainer.",
                "topics_covered": ["Hugging Face Datasets Library & DataLoaders", "AutoModelForSequenceClassification Setup", "Hugging Face Trainer API Configuration", "Evaluation Metrics: Accuracy, Precision, Recall, F1", "Hyperparameter Search with Ray Tune / Optuna"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Token Classification & Named Entity Recognition (NER)",
                "description": "Label individual tokens in sequences for entity extraction, PII identification, and medical term classification.",
                "topics_covered": ["BIO (Beginning, Inside, Outside) Tagging Scheme", "AutoModelForTokenClassification Architecture", "Aligning Tokenizer Subwords with Character Labels", "Seqeval Metric for Chunk-Level Entity Scoring", "Domain Adaptation for Specialized Corpora"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Sequence-to-Sequence Modeling: Summarization & Translation",
                "description": "Train encoder-decoder models (T5, BART) to generate new text sequences for abstractive summarization and machine translation.",
                "topics_covered": ["Encoder-Decoder Cross-Attention Mechanics", "Data Collators for Seq2Seq Tasks", "Beam Search & Repetition Penalties", "ROUGE Metric Evaluation for Summarization", "BLEU & sacreBLEU Evaluation for Translation"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Model Optimization, ONNX Export & Hugging Face Hub",
                "description": "Export models to ONNX runtime, quantize for low-latency CPU/GPU inference, and publish to Hugging Face Hub.",
                "topics_covered": ["Exporting PyTorch Transformers to ONNX via Optimum", "ONNX Runtime Inference Acceleration", "Dynamic Quantization (INT8) for Low Latency", "Model Cards & Documentation Best Practices", "Publishing Models & Datasets to Hugging Face Hub"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Computer Vision with PyTorch & OpenCV",
        "slug": "computer-vision-pytorch-opencv",
        "category": "AI / ML",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "10 Weeks",
        "description": "Master modern Computer Vision from classic digital image processing with OpenCV to state-of-the-art deep learning architectures. Learn image filtering, object detection with YOLOv8/YOLOv9, semantic segmentation with Mask R-CNN, Vision Transformers (ViT), and video analytics.",
        "skills_covered": ["OpenCV Image Processing", "Convolutional Neural Networks (CNNs)", "Object Detection with YOLOv8/YOLOv9", "Image Segmentation (U-Net & Mask R-CNN)", "Vision Transformers (ViT)", "Data Augmentation with Albumentations", "Real-Time Video Analytics Pipeline"],
        "prerequisites": ["Proficiency in Python programming", "Basic familiarity with deep learning and PyTorch"],
        "career_outcomes": ["Computer Vision Engineer", "Perception Engineer (Robotics/Autonomous)", "AI Video Systems Developer", "Image Processing Specialist"],
        "tech_stack": ["Python 3.12", "OpenCV", "PyTorch", "Ultralytics YOLO", "Albumentations", "Torchvision", "CUDA"],
        "tags": ["computer-vision", "opencv", "yolo", "segmentation", "pytorch", "object-detection", "vit"],
        "capstone_projects": [
            {
                "title": "Real-Time Multi-Camera Traffic & Pedestrian Analytics System",
                "description": "Build a real-time surveillance analytics engine utilizing YOLOv8 object detection, ByteTrack multi-object tracking, speed estimation, and intrusion zone alerting.",
                "difficulty": "Advanced"
            },
            {
                "title": "Biomedical Cell & Tumor Semantic Segmentation with U-Net",
                "description": "Train a custom U-Net segmentation model on microscopic imaging datasets using focal loss, dice coefficient optimization, and test-time augmentation.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "OpenCV Official Documentation & Tutorials", "url": "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html", "type": "Official Documentation"},
            {"title": "Ultralytics YOLOv8 Documentation", "url": "https://docs.ultralytics.com/", "type": "Documentation"},
            {"title": "Computer Vision: Algorithms and Applications by Richard Szeliski", "url": "https://szeliski.org/Book/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 34,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Digital Image Processing & OpenCV Foundations",
                "description": "Manipulate pixel matrices, color spaces (RGB, HSV, Grayscale), histograms, affine transformations, and morphological operators.",
                "topics_covered": ["Image Representation as NumPy Arrays", "Color Space Conversions (BGR, RGB, HSV)", "Image Filtering: Gaussian Blur, Median, Bilateral", "Edge Detection with Canny & Sobel Gradients", "Contour Finding, Bounding Boxes & Moments"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Advanced Augmentation & Dataset Preparation",
                "description": "Prepare computer vision datasets using Albumentations, spatial augmentations, color jittering, and annotation formats (COCO, YOLO, Pascal VOC).",
                "topics_covered": ["Bounding Box & Mask Augmentation with Albumentations", "CutMix, MixUp & Mosaic Augmentations", "Annotation Formats: COCO JSON, YOLO TXT, Pascal VOC XML", "Custom PyTorch Dataset & DataLoader Implementation", "Addressing Class Imbalance in Vision Datasets"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Modern Object Detection with YOLOv8 & YOLOv9",
                "description": "Train and fine-tune real-time single-stage object detection models using Ultralytics YOLOv8 and anchor-free architectures.",
                "topics_covered": ["Anchor-Based vs Anchor-Free Detection Architectures", "Intersection over Union (IoU, GIoU, CIoU)", "Non-Maximum Suppression (NMS) Algorithm", "Mean Average Precision (mAP@50, mAP@50:95) Evaluation", "Fine-Tuning YOLOv8 on Custom Object Datasets"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Semantic & Instance Segmentation (U-Net & Mask R-CNN)",
                "description": "Classify every pixel in an image for semantic segmentation with U-Net and distinguish individual objects with instance segmentation.",
                "topics_covered": ["Semantic vs Instance vs Panoptic Segmentation", "U-Net Encoder-Decoder Architecture with Skip Connections", "Transposed Convolutions & Bilinear Upsampling", "Loss Functions: Binary Cross-Entropy + Dice Loss", "Mask R-CNN Regional Proposal Architecture"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Vision Transformers (ViT) & Foundation Models",
                "description": "Apply transformer architectures to images using Vision Transformers (ViT), Patch Embeddings, and Segment Anything (SAM).",
                "topics_covered": ["Patch Embeddings & Positional Encodings for Images", "Vision Transformer (ViT) Architecture", "Comparing CNN Inductive Bias vs ViT Global Attention", "Self-Supervised Vision Pre-training (DINO, MAE)", "Zero-Shot Segmentation with Meta's Segment Anything (SAM)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Real-Time Multi-Object Tracking & Edge Deployment",
                "description": "Track moving objects across video frames with ByteTrack/DeepSORT and export optimized models with TensorRT.",
                "topics_covered": ["Multi-Object Tracking (MOT) with Kalman Filters", "ByteTrack & DeepSORT Tracking by Detection", "Video Pipeline Threading with OpenCV & PyAV", "Model Acceleration with NVIDIA TensorRT & ONNX", "Deploying Vision Pipelines on Edge Devices (Jetson)"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "MLOps: Machine Learning Systems in Production",
        "slug": "mlops-production-systems",
        "category": "AI / ML",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Bridge the gap between experimental machine learning and reliable cloud production systems. Learn end-to-end MLOps: reproducible data pipelines with DVC, experiment tracking with MLflow, automated model registries, containerized serving with Triton, drift detection with Evidently, and CI/CD for ML.",
        "skills_covered": ["Data Version Control (DVC)", "Experiment Tracking with MLflow", "Model Registry & Versioning", "Automated ML Pipelines (Kubeflow / Airflow)", "Feature Stores with Feast", "Model Monitoring & Drift Detection", "High-Throughput Model Serving"],
        "prerequisites": ["Experience training machine learning or deep learning models", "Basic proficiency with Docker, Git, and Linux command line"],
        "career_outcomes": ["MLOps Engineer", "Machine Learning Platform Engineer", "AI Infrastructure Specialist", "Production ML Architect"],
        "tech_stack": ["Python", "MLflow", "DVC", "Docker", "Kubernetes", "Evidently AI", "FastAPI", "Triton Inference Server"],
        "tags": ["mlops", "mlflow", "dvc", "kubernetes", "model-monitoring", "docker", "production-ml"],
        "capstone_projects": [
            {
                "title": "Production Automated End-to-End MLOps Pipeline with Drift Triggers",
                "description": "Build an automated pipeline that versions data with DVC, trains models on GitHub Actions runners, logs artifacts to MLflow, and automatically triggers retraining upon Evidently data drift detection.",
                "difficulty": "Advanced"
            },
            {
                "title": "Enterprise High-Throughput Triton Inference Cluster",
                "description": "Deploy NVIDIA Triton Inference Server on Kubernetes supporting dynamic batching, concurrent model execution, and sub-10ms response latency.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Made With ML by Goku Mohandas", "url": "https://madewithml.com/", "type": "Comprehensive Guide"},
            {"title": "MLflow Official Documentation", "url": "https://mlflow.org/docs/latest/index.html", "type": "Documentation"},
            {"title": "Designing Machine Learning Systems by Chip Huyen", "url": "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 25,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Reproducibility & Data Version Control with DVC",
                "description": "Track gigabytes of training datasets and model weights using Git and Data Version Control (DVC) with remote S3 storage.",
                "topics_covered": ["The Reproducibility Crisis in Machine Learning", "DVC Setup & Remote Storage Connections (S3, GCS)", "DVC Data Pipelines (dvc.yaml & Stages)", "Tracking Large Artifacts without Bloating Git", "Data Lineage & Reproducible Experiments"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Experiment Tracking & Model Registry with MLflow",
                "description": "Log parameters, metrics, artifacts, and transition models through Staging, Production, and Archived states with MLflow.",
                "topics_covered": ["MLflow Tracking Server Architecture", "Logging Hyperparameters, Training Loss & Confusion Matrices", "MLflow Autologging Integrations (PyTorch, Scikit-Learn)", "MLflow Model Registry & Semantic Model Versioning", "Model Governance & Promotion Webhooks"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Feature Stores Architecture with Feast",
                "description": "Eliminate train-serve skew using centralized feature stores for consistent historical training data and low-latency online serving.",
                "topics_covered": ["The Train-Serve Skew Problem", "Feature Store Concepts: Entities, Features, Views", "Offline Stores (Parquet, Snowflake) for Training", "Online Stores (Redis) for Real-Time Inference", "Feast Configuration & Feature Retrieval APIs"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Continuous Integration & Deployment (CI/CD) for ML",
                "description": "Automate model testing, linting, packaging, and deployment using GitHub Actions and Continuous Machine Learning (CML).",
                "topics_covered": ["Automated Unit Tests for ML Pipelines", "Data Validation Tests with Great Expectations", "GitHub Actions Workflows for Model Training", "Continuous Machine Learning (CML) Pull Request Reports", "Containerizing Models into Minimal Docker Images"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Production Model Serving: FastAPI to Triton Server",
                "description": "Serve models with sub-millisecond latency using FastAPI, TorchServe, and NVIDIA Triton Inference Server with dynamic batching.",
                "topics_covered": ["REST vs gRPC Model Serving Latency Benchmarks", "Dynamic Batching & Worker Parallelism", "NVIDIA Triton Inference Server Architecture", "Multi-Model Serving on Shared GPU Memory", "Canary Deployments & Shadow Model Traffic Routing"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Model Monitoring, Drift Detection & Retraining",
                "description": "Detect data drift, concept drift, and performance degradation in production using Evidently AI and automated alerts.",
                "topics_covered": ["Data Drift vs Concept Drift vs Covariate Shift", "Statistical Tests for Drift (Kolmogorov-Smirnov, PSI)", "Monitoring Prediction Quality with Evidently AI", "Prometheus Metrics & Grafana MLOps Dashboards", "Automated Retraining Triggers & Fallback Strategies"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Generative AI with Diffusion Models & Multimodal AI",
        "slug": "generative-ai-diffusion-multimodal",
        "category": "AI / ML",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Master cutting-edge generative computer vision and multimodal intelligence. Learn the mathematics of Denoising Diffusion Probabilistic Models (DDPM/DDIM), latent diffusion with Stable Diffusion XL / Flux, text-to-image pipelines, LoRA fine-tuning for visual styles, and vision-language models (CLIP, LLaVA).",
        "skills_covered": ["Diffusion Mathematics (Forward & Reverse SDEs)", "Denoising Diffusion Probabilistic Models (DDPM)", "Latent Diffusion Architecture (Stable Diffusion)", "U-Net & DiT (Diffusion Transformer) Backbones", "Classifier-Free Guidance (CFG)", "LoRA & ControlNet Conditioning", "Multimodal Vision-Language Models (CLIP, LLaVA)"],
        "prerequisites": ["Strong understanding of PyTorch and deep learning fundamentals", "Solid grounding in calculus, probability, and linear algebra"],
        "career_outcomes": ["Generative AI Scientist", "Diffusion Model Engineer", "Multimodal AI Architect", "Creative AI Systems Developer"],
        "tech_stack": ["Python 3.12", "PyTorch 2.x", "Hugging Face Diffusers", "ComfyUI", "CUDA", "Accelerate", "Timm"],
        "tags": ["diffusion-models", "generative-ai", "stable-diffusion", "clip", "multimodal", "flux", "pytorch"],
        "capstone_projects": [
            {
                "title": "Controlled Architectural Rendering Generator with ControlNet",
                "description": "Build a generative pipeline using Stable Diffusion XL and ControlNet (Canny & Depth) that converts wireframe architectural sketches into photorealistic 4K building renders.",
                "difficulty": "Advanced"
            },
            {
                "title": "Multimodal Visual Question Answering Assistant (LLaVA Integration)",
                "description": "Construct an end-to-end multimodal assistant using a vision encoder (CLIP) and an LLM decoder to analyze medical scans and generate diagnostic summaries.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Hugging Face Diffusers Documentation & Tutorials", "url": "https://huggingface.co/docs/diffusers/index", "type": "Documentation"},
            {"title": "High-Resolution Image Synthesis with Latent Diffusion Models (Paper)", "url": "https://arxiv.org/abs/2112.10752", "type": "Research Paper"},
            {"title": "Diffusion Models from Scratch Tutorial by Lilian Weng", "url": "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/", "type": "Deep Dive Blog"}
        ],
        "is_featured": False,
        "popularity_rank": 32,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Diffusion Mathematics: Forward & Reverse Processes",
                "description": "Understand Markov chains, Gaussian noise scheduling, forward noising processes, and reverse denoising with score matching.",
                "topics_covered": ["Markov Chain Forward Noising Process", "Variance Schedulers (Linear, Cosine, Scaled Linear)", "Denoising Objective: Predicting Added Gaussian Noise (Epsilon)", "Denoising Diffusion Probabilistic Models (DDPM) Derivation", "Accelerated Samplers: DDIM & Euler Ancestral"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Latent Diffusion Architecture & Variational Autoencoders (VAEs)",
                "description": "Save GPU compute by shifting diffusion from pixel space to compressed latent space using pre-trained Variational Autoencoders (VAEs).",
                "topics_covered": ["Pixel Space vs Latent Space Computational Complexity", "Variational Autoencoders (VAE) Encoder & Decoder", "Latent Compression & Reconstruction Loss", "U-Net Backbone with Residual Blocks & Cross-Attention", "Text Conditioning with CLIP Text Encoder"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Conditioning, Guidance & Text-to-Image Generation",
                "description": "Control image generation quality and prompt adherence using Classifier-Free Guidance (CFG), negative prompts, and text embeddings.",
                "topics_covered": ["Classifier Guidance vs Classifier-Free Guidance (CFG)", "The CFG Scale Parameter & Image Saturation Trade-offs", "Negative Prompting Mechanics in Diffusion", "Cross-Attention Maps & Prompt Weighting", "Diffusers Library Pipelines (StableDiffusionPipeline)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "ControlNet, LoRA & Diffusion Model Customization",
                "description": "Inject precise spatial composition control using ControlNet (edges, pose, depth) and train low-rank adapters (LoRAs) for styles.",
                "topics_covered": ["ControlNet Zero-Convolution Architecture", "Spatial Conditioners: Canny Edge, Depth Maps, OpenPose", "Fine-Tuning Visual Concepts with DreamBooth & LoRA", "Inpainting & Outpainting Masking Pipelines", "IP-Adapter for Image-Prompt Conditioning"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Next-Gen Architectures: Diffusion Transformers (DiT & Flux)",
                "description": "Transition from U-Net to scalable Diffusion Transformers (DiT) powering Sora, SD3, and Flux models.",
                "topics_covered": ["Replacing U-Nets with Diffusion Transformers (DiT)", "Patchification & Adaptive Layer Normalization (AdaLN)", "Flow Matching Mathematics & Rectified Flows", "Flux & SD3 Architecture Breakdown", "Scaling Laws in Generative Vision"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Multimodal Vision-Language Models (CLIP, LLaVA)",
                "description": "Bridge vision and language using Contrastive Language-Image Pretraining (CLIP) and Vision-Language LLMs like LLaVA.",
                "topics_covered": ["Contrastive Language-Image Pretraining (CLIP) Contrastive Loss", "Zero-Shot Image Classification with Text Embeddings", "LLaVA Architecture: Projection Layer + LLM Backbone", "Visual Instruction Tuning & Datasets", "Real-Time Visual Question Answering Deployment"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Reinforcement Learning & RLHF",
        "slug": "reinforcement-learning-rlhf",
        "category": "AI / ML",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "12 Weeks",
        "description": "Master classical Reinforcement Learning (RL) and modern Reinforcement Learning from Human Feedback (RLHF). Learn Markov Decision Processes, Q-Learning, Policy Gradients (PPO, TRPO), Actor-Critic models, and align Large Language Models with human preferences using reward models.",
        "skills_covered": ["Markov Decision Processes (MDP)", "Q-Learning & Deep Q-Networks (DQN)", "Policy Gradient Algorithms", "Proximal Policy Optimization (PPO)", "Actor-Critic Architectures", "Reward Model Training", "RLHF for Large Language Models"],
        "prerequisites": ["Strong proficiency in PyTorch and neural network training", "Solid understanding of probability, expectation, and dynamic programming"],
        "career_outcomes": ["Reinforcement Learning Engineer", "AI Alignment Researcher", "Autonomous Systems Developer", "LLM Alignment Specialist"],
        "tech_stack": ["Python 3.12", "PyTorch", "Gymnasium (OpenAI Gym)", "Stable-Baselines3", "Hugging Face TRL", "Weights & Biases"],
        "tags": ["reinforcement-learning", "rlhf", "ppo", "q-learning", "alignment", "gymnasium", "reward-model"],
        "capstone_projects": [
            {
                "title": "End-to-End RLHF Alignment Pipeline for LLMs with PPO",
                "description": "Train a reward model on human preference comparison datasets, optimize a policy LLM with Proximal Policy Optimization (PPO), and prevent reward hacking using KL-divergence penalties.",
                "difficulty": "Advanced"
            },
            {
                "title": "Autonomous Driving Agent in Simulated Gymnasium Physics Environment",
                "description": "Train an autonomous vehicle controller in a continuous action space simulation using Soft Actor-Critic (SAC) and customized reward shaping.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Reinforcement Learning: An Introduction by Sutton & Barto", "url": "http://incompleteideas.net/book/the-book-2nd.html", "type": "Classic Textbook"},
            {"title": "OpenAI Spinning Up in Deep RL", "url": "https://spinningup.openai.com/", "type": "Comprehensive Guide"},
            {"title": "Illustrating Reinforcement Learning from Human Feedback (RLHF) by Chip Huyen", "url": "https://huyenchip.com/2023/05/02/rlhf.html", "type": "Architecture Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 62,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Markov Decision Processes & Dynamic Programming",
                "description": "Understand states, actions, rewards, discount factors, the Bellman Expectation Equation, and Policy/Value Iteration.",
                "topics_covered": ["Markov Decision Processes (MDP) Formalism", "State-Value Function V(s) & Action-Value Function Q(s, a)", "The Bellman Expectation & Optimality Equations", "Policy Iteration & Value Iteration Algorithms", "Gymnasium Environment Standards"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Model-Free RL: Monte Carlo & Q-Learning",
                "description": "Learn without environmental transition dynamics using Monte Carlo sampling, Temporal Difference (TD) learning, and Q-Learning.",
                "topics_covered": ["Monte Carlo Policy Evaluation & Control", "Temporal Difference (TD(0)) Learning & TD Error", "SARSA (On-Policy) vs Q-Learning (Off-Policy)", "Epsilon-Greedy Exploration vs Exploitation", "Convergence Guarantees & Tabular Limitations"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Deep Q-Networks (DQN) & Stability Tricks",
                "description": "Scale Q-Learning to high-dimensional state spaces using neural networks, Experience Replay buffers, and target networks.",
                "topics_covered": ["Deep Q-Network (DQN) Architecture", "Experience Replay Memory Buffer to Break Correlations", "Target Network for Stable Optimization", "Double DQN & Dueling DQN Improvements", "Prioritized Experience Replay (PER)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Policy Gradients & Proximal Policy Optimization (PPO)",
                "description": "Directly optimize policy parameters in continuous and discrete action spaces using REINFORCE, Actor-Critic, and PPO.",
                "topics_covered": ["The Policy Gradient Theorem & REINFORCE Algorithm", "Actor-Critic Architectures (Advantage Actor-Critic / A2C)", "Generalized Advantage Estimation (GAE)", "Proximal Policy Optimization (PPO) Clipped Surrogate Objective", "Stable-Baselines3 Implementation & Training"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Reward Model Training for Human Preferences",
                "description": "Collect pairwise human preference data and train Bradley-Terry reward models to score generative model responses.",
                "topics_covered": ["Pairwise Preference Data Collection & Normalization", "Bradley-Terry Preference Probability Model", "Binary Cross-Entropy Loss for Reward Models", "Reward Calibration & Regularization", "Detecting & Preventing Reward Hacking (Goodhart's Law)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "RLHF for LLM Alignment & Direct Preference Optimization (DPO)",
                "description": "Align language models with PPO, enforce KL-divergence penalties to maintain linguistic coherence, and compare with DPO.",
                "topics_covered": ["The 3-Step RLHF Pipeline (SFT, Reward Model, PPO)", "Kullback-Leibler (KL) Divergence Penalty against Reference Policy", "Token-by-Token Action Generation & Critic Value Estimation", "Troubleshooting PPO Instability in Large Models", "Comparing PPO Alignment vs Direct Preference Optimization (DPO)"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Edge AI & On-Device Model Deployment",
        "slug": "edge-ai-on-device-deployment",
        "category": "AI / ML",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Deploy deep learning models directly onto edge devices, microcontrollers, mobile phones, and web browsers with zero cloud dependency. Master ONNX runtime, TensorRT, Apple Core ML, WebGPU/ONNX Runtime Web, and pruning/quantization techniques.",
        "skills_covered": ["Model Pruning & Knowledge Distillation", "Post-Training Quantization (INT8 / INT4)", "ONNX Runtime & Graph Optimizations", "NVIDIA TensorRT Acceleration", "Apple Core ML & Neural Engine", "WebGPU & In-Browser AI", "Embedded Edge Deployment"],
        "prerequisites": ["Proficiency in PyTorch and deep learning model training", "Familiarity with C++ or modern JavaScript is beneficial"],
        "career_outcomes": ["Edge AI Engineer", "Mobile AI Developer", "Embedded Machine Learning Specialist", "Client-Side AI Architect"],
        "tech_stack": ["Python", "ONNX", "TensorRT", "Core ML", "WebGPU", "C++", "Docker"],
        "tags": ["edge-ai", "onnx", "tensorrt", "coreml", "quantization", "webgpu", "embedded-ai"],
        "capstone_projects": [
            {
                "title": "Zero-Latency Client-Side In-Browser Background Blur & Segmentation",
                "description": "Deploy an optimized real-time body segmentation model running entirely in the browser using WebGPU and ONNX Runtime Web at 60 FPS.",
                "difficulty": "Advanced"
            },
            {
                "title": "Real-Time Embedded Jetson Nano Defect Inspection System",
                "description": "Optimize a vision inspection model with NVIDIA TensorRT INT8 calibration and deploy to a Jetson Nano edge camera with GPIO trigger outputs.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "ONNX Runtime Official Documentation", "url": "https://onnxruntime.ai/docs/", "type": "Official Documentation"},
            {"title": "NVIDIA TensorRT Developer Guide", "url": "https://docs.nvidia.com/deeplearning/tensorrt/developer-guide/index.html", "type": "Documentation"},
            {"title": "Apple Core ML Tools Documentation", "url": "https://apple.github.io/coremltools/docs-guides/", "type": "Official Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 68,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Model Compression: Pruning & Knowledge Distillation",
                "description": "Reduce model parameter counts by 50-80% using structured/unstructured pruning and student-teacher knowledge distillation.",
                "topics_covered": ["Magnitude-Based Weight Pruning vs Structured Channel Pruning", "Knowledge Distillation (Teacher-Student Logit Matching)", "Temperature Scaling in Soft Target Distillation", "Measuring FLOPs, MACs & Parameter Counts", "Fine-Tuning Pruned Architectures"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Post-Training Quantization & Quantization-Aware Training",
                "description": "Convert 32-bit floating point weights to 8-bit integers (INT8) and 4-bit integers with minimal accuracy degradation.",
                "topics_covered": ["Floating-Point FP32/FP16 vs Fixed-Point INT8 Formats", "Affine & Symmetric Quantization Math", "Post-Training Quantization (PTQ) with Calibration Datasets", "Quantization-Aware Training (QAT) with Fake Quantization", "Evaluating Per-Layer Quantization Error"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Open Neural Network Exchange (ONNX) & Runtime",
                "description": "Export PyTorch models to framework-agnostic ONNX computation graphs and execute high-speed inference with ONNX Runtime.",
                "topics_covered": ["Exporting PyTorch Graphs to ONNX Format", "Inspecting Graphs with Netron Visualizer", "ONNX Graph Optimizations & Constant Folding", "ONNX Runtime Execution Providers (CPU, CUDA, DirectML)", "Benchmarking Throughput & Latency P99"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "NVIDIA TensorRT for GPU Edge Devices",
                "description": "Compile deep learning models into optimized NVIDIA TensorRT engines for Jetson Nano, Orin, and enterprise edge servers.",
                "topics_covered": ["TensorRT Engine Architecture & Layer Fusion", "INT8 Calibration with Entropy Calibrator", "Dynamic Input Shapes & Optimization Profiles", "Writing C++ & Python TensorRT Inference Pipelines", "Maximizing GPU Tensor Core Utilization"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Apple Core ML & Apple Neural Engine (ANE)",
                "description": "Convert models to Core ML format and execute hardware-accelerated inference on iPhone, iPad, and Mac Apple Silicon Neural Engines.",
                "topics_covered": ["coremltools Python Conversion Pipeline", "Targeting the Apple Neural Engine (ANE)", "Profiling Memory & Latency in Xcode Instruments", "Swift Integration with Vision & Core ML Frameworks", "On-Device Privacy & Offline-First Guarantees"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "In-Browser Edge AI with WebGPU & ONNX Web",
                "description": "Execute deep learning models directly inside web browsers without cloud servers using WebGPU and WebAssembly (WASM).",
                "topics_covered": ["WebAssembly (WASM) vs WebGPU for Neural Networks", "ONNX Runtime Web Setup in JavaScript", "Memory Buffer Management in Browser GPUs", "Streaming Audio & Vision Models in Browser", "Progressive Web App (PWA) Offline Model Caching"],
                "duration": "1 Week"
            }
        ]
    }
]

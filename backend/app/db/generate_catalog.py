"""Generator script for complete 24-domain Technea YouTube catalog."""

import json

DOMAINS = [
    # 1. Python
    {
        "skill": {"name": "Python", "category": "Programming", "description": "General-purpose language powering web services, automation, scientific computing, and AI."},
        "path": {"title": "Python Fundamentals", "category": "Programming", "level": "Beginner", "duration": "4 Weeks", "description": "Master core syntax, dynamic typing, algorithmic thinking, and modern development idioms in Python."},
        "courses": [
            ("Python for Beginners - Full Course", "Mike Dane", "YouTube / freeCodeCamp", "4h 26m", "rfscVS0vtbw", "https://www.youtube.com/playlist?list=PLWKjhJtqVAbkmRvnFmOd4KhDdlK1oIq23"),
            ("Python Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 05m", "_uQrJ0TkZlc", None),
            ("CS50's Introduction to Programming with Python", "David J. Malan", "YouTube / CS50", "15h 56m", "nLRL_NcnK-4", "https://www.youtube.com/playlist?list=PLhQjrBD2T3817j24-GogXmWAmOlgL5CXO"),
            ("Python Full Course for Beginners", "Bro Code", "YouTube / Bro Code", "12h 00m", "XKHEz6rJS3t", None),
            ("Python Tutorial for Beginners - Full Course", "Tim Ruscica", "YouTube / Tech With Tim", "2h 45m", "mDKM-JtUhhc", None),
        ]
    },
    # 2. Java
    {
        "skill": {"name": "Java", "category": "Programming", "description": "Object-oriented, statically typed platform powering enterprise backends and Android applications."},
        "path": {"title": "Java Programming", "category": "Programming", "level": "Beginner to Intermediate", "duration": "6 Weeks", "description": "Develop strong object-oriented principles, understand the JVM ecosystem, and build scalable Java services."},
        "courses": [
            ("Java Tutorial for Beginners", "Nelson Djalo (Amigoscode)", "YouTube / freeCodeCamp", "9h 30m", "A74TOX803D0", None),
            ("Java Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "2h 30m", "eIrMbAQSU34", None),
            ("Java Full Course", "Bro Code", "YouTube / Bro Code", "12h 00m", "Qgl81fPcLc8", None),
            ("Java Tutorial for Beginners in Hindi", "CodeWithHarry", "YouTube / CodeWithHarry", "2h 15m", "ntLJmHOJ0ME", None),
            ("Java Course 2024", "Navin Reddy", "YouTube / Telusko", "12h 00m", "BGTx91t8q50", None),
        ]
    },
    # 3. C++
    {
        "skill": {"name": "C++", "category": "Programming", "description": "High-performance systems language with manual memory management and zero-cost abstractions."},
        "path": {"title": "C++ Programming", "category": "Programming", "level": "Intermediate", "duration": "6 Weeks", "description": "Understand pointers, references, memory layouts, RAII, and modern C++ standard library features."},
        "courses": [
            ("C++ Full Course for Beginners", "Caleb Curry", "YouTube / freeCodeCamp", "4h 01m", "vLnPwxZdW4Y", None),
            ("C++ Full Course", "Bro Code", "YouTube / Bro Code", "6h 00m", "-TkoO8Z07hI", None),
            ("How C++ Works - C++ Series", "The Cherno", "YouTube / The Cherno", "15h 00m", "18c3MTX0PK0", "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4G6b"),
            ("C++ Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 00m", "ZzaPdXTrSb8", None),
            ("C++ Complete Course", "CodeWithHarry", "YouTube / CodeWithHarry", "2h 20m", "yGB9jhsEsr8", None),
        ]
    },
    # 4. Data Structures & Algorithms
    {
        "skill": {"name": "Data Structures & Algorithms", "category": "Programming", "description": "Computational foundations enabling optimized runtime and memory complexity in software engineering."},
        "path": {"title": "Data Structures & Algorithms", "category": "Programming", "level": "Intermediate", "duration": "8 Weeks", "description": "Analyze complexity with Big-O, master fundamental data structures, and solve algorithmic challenges."},
        "courses": [
            ("Data Structures and Algorithms for Beginners", "freeCodeCamp Team", "YouTube / freeCodeCamp", "8h 00m", "8hly31xKli0", None),
            ("Data Structures and Algorithms Full Course", "Bro Code", "YouTube / Bro Code", "4h 00m", "CBYHwZcbD-s", None),
            ("MIT 6.006 Introduction to Algorithms", "Erik Demaine", "YouTube / MIT OpenCourseWare", "24h 00m", "ZA-tUyM_y7s", "https://www.youtube.com/playlist?list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb"),
            ("Algorithms & Data Structures for Beginners", "NeetCode", "YouTube / NeetCode", "6h 00m", "0IAPZzGSbME", None),
            ("Algorithms Complete Course", "Abdul Bari", "YouTube / Abdul Bari", "10h 00m", "2Z58nWEXPEw", "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O"),
        ]
    },
    # 5. JavaScript
    {
        "skill": {"name": "JavaScript", "category": "Programming", "description": "Dynamic, event-driven language underpinning modern interactive web applications and full-stack runtime systems."},
        "path": {"title": "JavaScript Fundamentals", "category": "Programming", "level": "Beginner", "duration": "4 Weeks", "description": "Understand prototypes, lexical scopes, asynchronous event loops, and DOM manipulation in modern JavaScript."},
        "courses": [
            ("JavaScript Programming - Full Course", "Per Harald Borgen", "YouTube / freeCodeCamp", "7h 45m", "jS4aFq5-91M", None),
            ("JavaScript Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 00m", "W6NZfCO5SIk", None),
            ("JavaScript Crash Course For Beginners", "Brad Traversy", "YouTube / Traversy Media", "1h 40m", "hdI2bqOjy3c", None),
            ("JavaScript Full Course", "Bro Code", "YouTube / Bro Code", "8h 00m", "lfmg-EJ8gm4", None),
            ("Modern JavaScript Tutorial", "Shaun Pelling", "YouTube / The Net Ninja", "4h 30m", "iWOYAxlnaww", "https://www.youtube.com/playlist?list=PL4cUxeGkcC9haFPT7J25Q9GRB_ZkFrQAc"),
        ]
    },
    # 6. Machine Learning
    {
        "skill": {"name": "Machine Learning", "category": "AI & ML", "description": "Algorithms and statistical models that extract patterns and make predictions from data."},
        "path": {"title": "Machine Learning Beginner Roadmap", "category": "AI & ML", "level": "Beginner", "duration": "8 Weeks", "description": "Grasp regression, classification, clustering, evaluation metrics, and practical scikit-learn pipelines."},
        "courses": [
            ("Supervised Machine Learning: Regression and Classification", "Andrew Ng", "YouTube / DeepLearning.AI", "8h 00m", "jGwO_UgTS7I", "https://www.youtube.com/playlist?list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI"),
            ("Machine Learning for Everybody", "Kylie Ying", "YouTube / freeCodeCamp", "3h 50m", "i_LwzRVP7bg", None),
            ("Machine Learning Fundamentals", "Josh Starmer", "YouTube / StatQuest", "5h 00m", "Gv9_4yMHFhI", "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF"),
            ("Python Machine Learning Tutorial", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 00m", "7eh4d6sabA0", None),
            ("Machine Learning Tutorial Python", "Tim Ruscica", "YouTube / Tech With Tim", "2h 30m", "WFr2WgN9_xE", None),
        ]
    },
    # 7. Deep Learning
    {
        "skill": {"name": "Deep Learning", "category": "AI & ML", "description": "Multi-layer artificial neural networks powering speech, vision, translation, and generative systems."},
        "path": {"title": "Deep Learning", "category": "AI & ML", "level": "Intermediate", "duration": "8 Weeks", "description": "Learn forward and backpropagation, activation functions, CNNs, RNNs, and PyTorch training pipelines."},
        "courses": [
            ("MIT 6.S191: Introduction to Deep Learning", "Alexander Amini", "YouTube / MIT OpenCourseWare", "6h 00m", "7sCG883kVz8", "https://www.youtube.com/playlist?list=PLtBw6njkvDA-YrT05nQoxUq8g5Vp5K-qN"),
            ("Neural Networks and Deep Learning", "Andrew Ng", "YouTube / DeepLearning.AI", "6h 00m", "CS4cs9xVecg", "https://www.youtube.com/playlist?list=PLkDaE6sCZn6Ec-XTbcX1uRg2_u4xOEky0"),
            ("Deep Learning with PyTorch for Beginners", "Daniel Bourke", "YouTube / freeCodeCamp", "25h 00m", "GIsg-ZUy0MY", None),
            ("Neural Networks: Zero to Hero", "Grant Sanderson", "YouTube / 3Blue1Brown", "2h 00m", "aircAruvnKk", "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"),
            ("Deep Learning with TensorFlow 2.0", "Paige Bailey", "YouTube / TensorFlow", "4h 00m", "tPYj3fFNHjk", None),
        ]
    },
    # 8. Generative AI
    {
        "skill": {"name": "Generative AI", "category": "AI & ML", "description": "Architectures synthesizing human-quality textual, visual, audio, and code representations."},
        "path": {"title": "Generative AI", "category": "AI & ML", "level": "Intermediate", "duration": "6 Weeks", "description": "Understand latent spaces, diffusion mechanisms, GANs, transformer foundations, and prompt orchestration."},
        "courses": [
            ("Introduction to Generative AI", "Google Cloud Tech Team", "YouTube / Google Developers", "1h 00m", "G2fqAlgmoPo", None),
            ("Generative AI with Large Language Models", "Andrew Ng", "YouTube / DeepLearning.AI", "4h 00m", "mEsleV16qdo", None),
            ("Generative AI Full Course", "freeCodeCamp Team", "YouTube / freeCodeCamp", "5h 00m", "mBYu5NoXBcs", None),
            ("Generative AI Explained in 100 Seconds", "Jeff Delaney", "YouTube / Fireship", "45 mins", "2eWuYf-aZE4", None),
            ("What is Generative AI?", "Martin Keen", "YouTube / IBM Technology", "1h 15m", "hfIUstz19Fk", None),
        ]
    },
    # 9. Large Language Models
    {
        "skill": {"name": "Large Language Models", "category": "AI & ML", "description": "Massive autoregressive transformer architectures trained on web-scale text corpora."},
        "path": {"title": "Large Language Models", "category": "AI & ML", "level": "Advanced", "duration": "6 Weeks", "description": "Deconstruct self-attention mechanics, tokenization, pretraining, LoRA fine-tuning, and RAG architectures."},
        "courses": [
            ("Intro to Large Language Models", "Andrej Karpathy", "YouTube / Andrej Karpathy", "1h 00m", "zjkBMFhNj_g", None),
            ("Build nanoGPT from scratch", "Andrej Karpathy", "YouTube / Andrej Karpathy", "2h 00m", "kCc8FmEb1nY", None),
            ("LLM Engineering Masterclass", "freeCodeCamp Team", "YouTube / freeCodeCamp", "6h 00m", "9vM4p9NN0Ts", None),
            ("Transformers & LLM Crash Course", "Hugging Face Team", "YouTube / HuggingFace", "3h 00m", "1pedAIvTWXk", None),
            ("LangChain for LLM Application Development", "Harrison Chase & Andrew Ng", "YouTube / DeepLearning.AI", "2h 30m", "aywZrzNaKjs", None),
        ]
    },
    # 10. Computer Vision
    {
        "skill": {"name": "Computer Vision", "category": "AI & ML", "description": "Algorithmic extraction of semantic meaning, bounding geometries, and motion from imagery and video."},
        "path": {"title": "Computer Vision", "category": "AI & ML", "level": "Intermediate", "duration": "6 Weeks", "description": "Learn spatial convolutions, edge detectors, OpenCV filters, YOLO object detectors, and segmentation."},
        "courses": [
            ("OpenCV Course - Computer Vision with Python", "Murtaza Hassan", "YouTube / freeCodeCamp", "3h 00m", "oXlwWbU8l2o", None),
            ("CS231n: Convolutional Neural Networks for Visual Recognition", "Fei-Fei Li & Andrej Karpathy", "YouTube / Stanford Online", "18h 00m", "vT1JzLTH4G4", "https://www.youtube.com/playlist?list=PL3FW7PR47gcwrUNOphU97AnZ7VFYHclV7"),
            ("Computer Vision with Python & OpenCV", "Nicholas Renotte", "YouTube / Nicholas Renotte", "2h 45m", "yqkISICHH-U", None),
            ("Computer Vision with TensorFlow", "Laurence Moroney", "YouTube / TensorFlow", "3h 15m", "beP0A_aK0jA", None),
            ("YOLOv8 Computer Vision Projects", "Murtaza Hassan", "YouTube / Murtaza's Workshop", "4h 00m", "WgPbbWmnXJ8", None),
        ]
    },
    # 11. NLP
    {
        "skill": {"name": "NLP", "category": "AI & ML", "description": "Computational processing, statistical parsing, and contextual comprehension of human languages."},
        "path": {"title": "NLP", "category": "AI & ML", "level": "Intermediate", "duration": "6 Weeks", "description": "Master tokenization, embeddings (Word2Vec), sequence transformers (BERT/GPT), and text classification."},
        "courses": [
            ("NLP Course - Transformers", "Hugging Face Team", "YouTube / HuggingFace", "4h 00m", "00GKzGyUFes", "https://www.youtube.com/playlist?list=PLo2EIpI_JMQvWfQndUesu0nPBAtZ9gP1o"),
            ("CS224N: Natural Language Processing with Deep Learning", "Christopher Manning", "YouTube / Stanford Online", "20h 00m", "rmVRLeJRkl4", "https://www.youtube.com/playlist?list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"),
            ("Natural Language Processing (NLP) with Python", "freeCodeCamp Team", "YouTube / freeCodeCamp", "5h 30m", "M7SWr5xObvw", None),
            ("Natural Language Processing Specialization", "Younes Bensouda Mourri", "YouTube / DeepLearning.AI", "8h 00m", "fNxaBST855w", None),
            ("Complete NLP Playlist", "Krish Naik", "YouTube / Krish Naik", "6h 00m", "fOvTtapxa9c", "https://www.youtube.com/playlist?list=PLZoTAELRMXVMdJ5SQbCEKDn48qtGgI6Xe"),
        ]
    },
    # 12. Full Stack Web Development
    {
        "skill": {"name": "Web Development", "category": "Web Development", "description": "Creation of responsive web architectures spanning frontend browsers to backend server systems."},
        "path": {"title": "Full Stack Web Development", "category": "Web Development", "level": "Beginner to Intermediate", "duration": "10 Weeks", "description": "Build end-to-end applications uniting client interfaces, REST/GraphQL APIs, databases, and deployment."},
        "courses": [
            ("Full Stack Web Development for Beginners", "Beau Carnes", "YouTube / freeCodeCamp", "11h 00m", "nu_pCVPKzTk", None),
            ("Web Development in 2026: A Practical Guide", "Brad Traversy", "YouTube / Traversy Media", "2h 00m", "0pThnRneDjw", None),
            ("Full Stack Web Developer", "freeCodeCamp Team", "YouTube / freeCodeCamp", "8h 00m", "zJSY8tbf_ys", None),
            ("Full Stack Web Development Roadmap", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 15m", "UB1O30fR-EE", None),
            ("Fullstack in 100 Seconds & Beyond", "Jeff Delaney", "YouTube / Fireship", "1h 00m", "4deVCNJq3qc", None),
        ]
    },
    # 13. Frontend Development
    {
        "skill": {"name": "Frontend Development", "category": "Web Development", "description": "Client-facing architecture delivering responsive visual designs, accessibility, and high performance."},
        "path": {"title": "Frontend Development", "category": "Web Development", "level": "Beginner", "duration": "6 Weeks", "description": "Master HTML5 semantics, modern CSS (Flexbox, Grid, Custom Properties), JavaScript DOM, and UI toolchains."},
        "courses": [
            ("Responsive Web Design Essentials", "freeCodeCamp Team", "YouTube / freeCodeCamp", "4h 00m", "mU6anWqZJcc", None),
            ("HTML & CSS Crash Course", "Brad Traversy", "YouTube / Traversy Media", "2h 00m", "DPnqb74Smug", None),
            ("CSS Demystified", "Kevin Powell", "YouTube / Kevin Powell", "3h 30m", "1PnVor36_40", None),
            ("Modern Frontend Workflow", "Shaun Pelling", "YouTube / The Net Ninja", "3h 00m", "2n1y5VbK6mE", None),
            ("Frontend Development Full Course", "Bro Code", "YouTube / Bro Code", "7h 00m", "H3XIJYEPdus", None),
        ]
    },
    # 14. Backend Development
    {
        "skill": {"name": "Backend Development", "category": "Web Development", "description": "Server-side logic, API endpoints, data persistence, and secure transaction processing."},
        "path": {"title": "Backend Development", "category": "Web Development", "level": "Intermediate", "duration": "6 Weeks", "description": "Construct robust web APIs, manage relational/document databases, integrate authentication, and handle async jobs."},
        "courses": [
            ("Backend Web Development Course", "freeCodeCamp Team", "YouTube / freeCodeCamp", "10h 00m", "tN6oJu2DqCM", None),
            ("Node.js & Express From Scratch", "Brad Traversy", "YouTube / Traversy Media", "2h 00m", "fBNz5xF-Kx4", None),
            ("Backend Engineering Fundamentals", "Hussein Nasser", "YouTube / Hussein Nasser", "5h 00m", "4q7c-8wH_4g", "https://www.youtube.com/playlist?list=PLQnljOFTspQXjD3Wpn2SCPOnhvdL23Sso"),
            ("Node.js Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 15m", "TlB_eWDSMt4", None),
            ("Backend System Design in 100 Seconds", "Jeff Delaney", "YouTube / Fireship", "45 mins", "x0A_iIeZk9w", None),
        ]
    },
    # 15. React Development
    {
        "skill": {"name": "React", "category": "Web Development", "description": "Component-driven declarative frontend library for constructing modern user interfaces."},
        "path": {"title": "React Development", "category": "Web Development", "level": "Beginner to Intermediate", "duration": "5 Weeks", "description": "Master JSX, functional components, hooks (useState, useEffect, useMemo), state managers, and routing."},
        "courses": [
            ("React Course 2024 - Beginner to Advanced", "Bob Ziroll", "YouTube / freeCodeCamp", "12h 00m", "bMknfKXIFA8", None),
            ("React Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "2h 00m", "SqcY0GlETPk", None),
            ("React Crash Course", "Brad Traversy", "YouTube / Traversy Media", "1h 45m", "w7ejDZ8SWv8", None),
            ("Full Modern React Tutorial", "Shaun Pelling", "YouTube / The Net Ninja", "4h 00m", "j942wKiXFu8", "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d"),
            ("React Full Course", "Bro Code", "YouTube / Bro Code", "4h 30m", "CgkZ7MvWUAA", None),
        ]
    },
    # 16. FastAPI Development
    {
        "skill": {"name": "FastAPI", "category": "Web Development", "description": "High-performance Python asynchronous web framework based on OpenAPI standards and type hints."},
        "path": {"title": "FastAPI Development", "category": "Web Development", "level": "Intermediate", "duration": "4 Weeks", "description": "Build high-throughput REST APIs, define Pydantic validation schemas, and integrate async SQLAlchemy."},
        "courses": [
            ("FastAPI - Full Course for Beginners", "Sanjeev Thiyagarajan", "YouTube / freeCodeCamp", "19h 00m", "0sOvCWFmrtA", None),
            ("FastAPI Crash Course", "Nelson Djalo", "YouTube / Amigoscode", "2h 30m", "tLKKmouUams", None),
            ("FastAPI Tutorial for Beginners", "Tim Ruscica", "YouTube / Tech With Tim", "1h 30m", "-ykeT6kk44g", None),
            ("Building Production APIs with FastAPI", "ArjanCodes", "YouTube / ArjanCodes", "1h 15m", "7t2alSnE2-I", None),
            ("FastAPI Python Web Framework", "Sarthak Sharma", "YouTube / Bitfumes", "3h 00m", "gQTRsZpqjAw", "https://www.youtube.com/playlist?list=PLB5jA48t353CVTqFp4pX8X9c8hS18r3d0"),
        ]
    },
    # 17. Data Science
    {
        "skill": {"name": "Data Science", "category": "Data", "description": "Interdisciplinary extraction of actionable knowledge through statistics, programming, and algorithms."},
        "path": {"title": "Data Science", "category": "Data", "level": "Beginner to Intermediate", "duration": "8 Weeks", "description": "Wrangle complex datasets, conduct statistical hypotheses, create informative visualizations, and build models."},
        "courses": [
            ("Data Science for Beginners", "freeCodeCamp Team", "YouTube / freeCodeCamp", "6h 00m", "ua-CiDNNj30", None),
            ("Data Science Project from Scratch", "Ken Jee", "YouTube / Ken Jee", "3h 00m", "MpF9HENQjDo", "https://www.youtube.com/playlist?list=PLeo1K3hjS3uu7clOTtw8zs74PMrYZlKeL"),
            ("Pandas & Data Science in Python", "Keith Galli", "YouTube / Keith Galli", "1h 00m", "vmEHCJofslg", None),
            ("Data Science Fundamentals", "Josh Starmer", "YouTube / StatQuest", "4h 00m", "qBigTkBLU6g", None),
            ("Python for Data Science", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 00m", "LHBE6Q9XlzI", None),
        ]
    },
    # 18. Data Analytics
    {
        "skill": {"name": "Data Analytics", "category": "Data", "description": "Examination of data collections to deduce operational insights and inform executive decisions."},
        "path": {"title": "Data Analytics", "category": "Data", "level": "Beginner", "duration": "6 Weeks", "description": "Master SQL querying, business intelligence dashboards (Tableau/PowerBI), spreadsheet modeling, and storytelling."},
        "courses": [
            ("Data Analytics Full Course", "Alex Freberg", "YouTube / Alex The Analyst", "6h 00m", "PSNXoAs28ts", None),
            ("Data Analyst Portfolio Project", "Alex Freberg", "YouTube / Alex The Analyst", "3h 00m", "rGVbXU9B_eE", "https://www.youtube.com/playlist?list=PLUaB-1hjhk8FE_XZ87vPPSfHqb6OcM0cF"),
            ("Data Analytics with Python & SQL", "Luke Barousse", "YouTube / Luke Barousse", "2h 30m", "wUSDVGivd-8", None),
            ("Power BI Tutorial for Beginners", "Kevin Stratvert", "YouTube / Kevin Stratvert", "1h 30m", "AGrl-H87pRU", None),
            ("Excel for Data Analytics", "freeCodeCamp Team", "YouTube / freeCodeCamp", "4h 00m", "Vl0H-qTclOg", None),
        ]
    },
    # 19. SQL & Databases
    {
        "skill": {"name": "SQL & Databases", "category": "Data", "description": "Relational algebra and structured querying language managing tabular data storage."},
        "path": {"title": "SQL & Databases", "category": "Data", "level": "Beginner to Intermediate", "duration": "5 Weeks", "description": "Master relational schema normalization, indexing, joins, aggregate analytical functions, and ACID."},
        "courses": [
            ("SQL Tutorial - Full Database Course for Beginners", "Mike Dane", "YouTube / freeCodeCamp", "4h 20m", "HXV3zeRR3h4", None),
            ("SQL Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 00m", "7S_tz1z_5bA", None),
            ("SQL Full Course", "Bro Code", "YouTube / Bro Code", "3h 00m", "5OdVJb3rgvg", None),
            ("SQL Beginner to Advanced", "Alex Freberg", "YouTube / Alex The Analyst", "2h 30m", "q_J0hKk9iC4", "https://www.youtube.com/playlist?list=PLUaB-1hjhk8H48Pj32z4GZgGWyylqv45f"),
            ("Database Engineering Fundamentals", "Hussein Nasser", "YouTube / Hussein Nasser", "4h 00m", "W2Z7gtrEv7A", None),
        ]
    },
    # 20. Statistics for Data Science
    {
        "skill": {"name": "Statistics", "category": "Data", "description": "Mathematical science of collecting, analyzing, presenting, and deducing properties from numeric data."},
        "path": {"title": "Statistics for Data Science", "category": "Data", "level": "Intermediate", "duration": "6 Weeks", "description": "Understand probability distributions, Central Limit Theorem, hypothesis testing, p-values, and Bayesian inference."},
        "courses": [
            ("Statistics - Full University Course on Data Science Basics", "freeCodeCamp Team", "YouTube / freeCodeCamp", "8h 00m", "Vfo5leTr5EI", None),
            ("Statistics Fundamentals", "Josh Starmer", "YouTube / StatQuest", "4h 00m", "xxpc-HPKN28", "https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9"),
            ("Statistics and Probability", "Sal Khan", "YouTube / Khan Academy", "6h 00m", "uhxtUt_-GyM", None),
            ("Essence of Calculus & Probabilistic Thinking", "Grant Sanderson", "YouTube / 3Blue1Brown", "3h 00m", "WUvTyaaNjfo", None),
            ("Statistics 101", "Brandon Foltz", "YouTube / Brandon Foltz", "5h 00m", "7armc4ZkJnI", "https://www.youtube.com/playlist?list=PLIeGtxpvyG-JA4nZ-tSfqp_c3qJ16327v"),
        ]
    },
    # 21. Cyber Security Basics
    {
        "skill": {"name": "Cyber Security", "category": "Security", "description": "Protection of networks, devices, software programs, and data from adversary unauthorized access."},
        "path": {"title": "Cyber Security Basics", "category": "Security", "level": "Beginner", "duration": "6 Weeks", "description": "Understand network security, penetration testing basics, cryptography, security hygiene, and defensive operations."},
        "courses": [
            ("Cyber Security Full Course for Beginners", "freeCodeCamp Team", "YouTube / freeCodeCamp", "5h 00m", "U_P23uqPHvd", None),
            ("You Need to Learn Cyber Security Right Now", "Chuck Keith", "YouTube / NetworkChuck", "1h 00m", "3Kq1MIfTWCE", None),
            ("Ethical Hacking Course", "David Bombal", "YouTube / David Bombal", "10h 00m", "WnN6dbosJJA", None),
            ("Cyber Security Fundamentals", "John Hammond", "YouTube / John Hammond", "2h 30m", "inWWhr5tnEA", None),
            ("Cybersecurity In 7 Minutes & Deep Dive", "Simplilearn Team", "YouTube / Simplilearn", "3h 00m", "nzZkKoREEGo", None),
        ]
    },
    # 22. Cloud Computing
    {
        "skill": {"name": "Cloud Computing", "category": "DevOps & Cloud", "description": "On-demand availability of computational resources, database engines, and storage over the Internet."},
        "path": {"title": "Cloud Computing", "category": "DevOps & Cloud", "level": "Beginner to Intermediate", "duration": "6 Weeks", "description": "Understand cloud service models (IaaS/PaaS/SaaS), AWS/GCP/Azure primitives, IAM, VPCs, and serverless architectures."},
        "courses": [
            ("AWS Certified Cloud Practitioner Training", "Andrew Brown", "YouTube / freeCodeCamp", "14h 00m", "SOTamWNgDKc", None),
            ("Cloud Computing Architecture in 100 Seconds", "Jeff Delaney", "YouTube / Fireship", "30 mins", "M988_VALKmE", None),
            ("Cloud Computing Explained", "Nana Janashia", "YouTube / TechWorld with Nana", "1h 00m", "rw4b1pL3wK4", None),
            ("Microsoft Azure Fundamentals AZ-900", "freeCodeCamp Team", "YouTube / freeCodeCamp", "8h 00m", "NKEFW2WJb5I", None),
            ("Google Cloud Essentials", "Google Cloud Tech Team", "YouTube / Google Developers", "2h 00m", "4D3X4644e54", None),
        ]
    },
    # 23. Git & GitHub
    {
        "skill": {"name": "Git & GitHub", "category": "Tools & DevOps", "description": "Distributed version control system tracking source code modifications during collaborative engineering."},
        "path": {"title": "Git & GitHub", "category": "Tools & DevOps", "level": "Beginner", "duration": "3 Weeks", "description": "Master branch workflows, merges, rebases, pull requests, resolving merge conflicts, and GitHub collaboration."},
        "courses": [
            ("Git and GitHub for Beginners - Crash Course", "Gwen Faraday", "YouTube / freeCodeCamp", "1h 10m", "RGOj5yH7evk", None),
            ("Git Tutorial for Beginners", "Mosh Hamedani", "YouTube / Programming with Mosh", "1h 10m", "8JJ111B7844", None),
            ("Git & GitHub Crash Course", "Brad Traversy", "YouTube / Traversy Media", "35 mins", "SWYqp7iY_Tc", None),
            ("Git Tutorial for Beginners", "Chuck Keith", "YouTube / NetworkChuck", "45 mins", "hwP7WQkmECE", None),
            ("Git in 100 Seconds", "Jeff Delaney", "YouTube / Fireship", "30 mins", "hw-SBL-Z9k8", None),
        ]
    },
    # 24. DevOps Basics
    {
        "skill": {"name": "DevOps", "category": "DevOps & Cloud", "description": "Methodology uniting software development and IT operations to shorten the systems development life cycle."},
        "path": {"title": "DevOps Basics", "category": "DevOps & Cloud", "level": "Intermediate", "duration": "6 Weeks", "description": "Learn containerization with Docker, orchestration with Kubernetes, CI/CD automated deployment, and IaC."},
        "courses": [
            ("DevOps Prerequisites Course", "Nana Janashia", "YouTube / TechWorld with Nana", "2h 30m", "Wvf0mBNGjVc", None),
            ("Docker Tutorial for Beginners", "Nana Janashia", "YouTube / freeCodeCamp", "2h 00m", "fqMOX6JJhGo", None),
            ("Kubernetes Course for Beginners", "Nana Janashia", "YouTube / freeCodeCamp", "3h 30m", "X48VuDVv0do", None),
            ("DevOps in 100 Seconds & CI/CD Pipelines", "Jeff Delaney", "YouTube / Fireship", "45 mins", "_I94-tJlovg", None),
            ("DevOps Networking & Infrastructure", "Hussein Nasser", "YouTube / Hussein Nasser", "3h 00m", "2r3v4bK3W5A", None),
        ]
    },
]

def generate_catalog():
    print(f"Catalog contains {len(DOMAINS)} domains.")
    total_courses = sum(len(d["courses"]) for d in DOMAINS)
    print(f"Total courses: {total_courses}")

if __name__ == "__main__":
    generate_catalog()

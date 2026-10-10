import {
  Code2,
  Sparkles,
  Database,
  Globe,
  Terminal,
} from 'lucide-react'

/**
 * Returns aesthetic styling tokens, syntax snippets, and code identity
 * for a learning path based on its title and category.
 */
export function getTrackTheme(path) {
  const title = (path?.title || '').toLowerCase()
  const category = (path?.category || '').toLowerCase()

  // 1. Python Fundamentals
  if (title.includes('python')) {
    return {
      type: 'python',
      domain: 'Python Engineering',
      badgeLabel: 'Python 3.12 Core Track',
      icon: Terminal,
      filename: 'calculate_average.py',
      accentHue: '#38bdf8',
      secondaryHue: '#fbbf24',
      accentColor: 'text-sky-400',
      pillBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
      rewardTitle: 'Certified Python Developer',
      xpReward: '2,500 XP',
      terminalPrompt: 'python3 calculate_average.py',
      terminalOutput: '84.33333333333333',
      executionOutput: '84.33333333333333',
      particles: ['def', 'return', 'sum()', 'len()', 'scores', 'print()', 'calculate_average'],
      codeSnippet: `def calculate_average(numbers):
    return sum(numbers) / len(numbers)

scores = [85, 90, 78]
print(calculate_average(scores))`,
      interactiveMeta: 'CPython 3.12 Runtime • Zero Dependencies',
    }
  }

  // 2. React Development / Frontend
  if (title.includes('react')) {
    return {
      type: 'react',
      domain: 'React & Frontend Architecture',
      badgeLabel: 'Modern React 19',
      icon: Globe,
      filename: 'Counter.jsx',
      accentHue: '#06b6d4',
      secondaryHue: '#3b82f6',
      accentColor: 'text-cyan-400',
      pillBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      rewardTitle: 'Certified React Engineer',
      xpReward: '2,400 XP',
      terminalPrompt: 'npm run dev',
      terminalOutput: 'Vite ready in 180ms • http://localhost:5173',
      executionOutput: `[Virtual DOM Rendered]\n<Counter count={0} />\nInteractive state initialized: count = 0`,
      particles: ['useState', '<button />', 'onClick', 'count', 'return', 'export default'],
      codeSnippet: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Completed: {count}
    </button>
  );
}`,
      interactiveMeta: 'Vite 8 • React 19 Virtual DOM',
    }
  }

  // 3. Machine Learning / AI / Deep Learning / LLMs
  if (
    category.includes('ai') ||
    category.includes('machine learning') ||
    title.includes('machine learning') ||
    title.includes('deep learning') ||
    title.includes('generative ai') ||
    title.includes('large language') ||
    title.includes('vision') ||
    title.includes('nlp')
  ) {
    return {
      type: 'ml',
      domain: 'Machine Intelligence',
      badgeLabel: 'Applied AI & Scikit-Learn',
      icon: Sparkles,
      filename: 'linear_model.py',
      accentHue: '#a855f7',
      secondaryHue: '#ec4899',
      accentColor: 'text-purple-400',
      pillBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      rewardTitle: 'Certified AI Practitioner',
      xpReward: '2,800 XP',
      terminalPrompt: 'python3 linear_model.py',
      terminalOutput: 'Model fitted • Prediction: $450k',
      executionOutput: `Training samples: 4 house features\nModel: LinearRegression().fit(X, y)\nPredicted price for 1,500 sq ft: $450k`,
      particles: ['LinearRegression', 'fit(X, y)', 'predict()', 'features', 'weights', 'loss'],
      codeSnippet: `from sklearn.linear_model import LinearRegression

# House sizes (sq ft) -> Prices ($k)
X = [[650], [1200], [1800], [2400]]
y = [195, 360, 540, 720]

model = LinearRegression().fit(X, y)
predicted = model.predict([[1500]])
print(f"Predicted price: \${predicted[0]:,.0f}k")`,
      interactiveMeta: 'Scikit-Learn 1.5 • Supervised Regression',
    }
  }

  // 4. Data Science / Analytics / Databases
  if (
    category.includes('data') ||
    title.includes('data science') ||
    title.includes('sql') ||
    title.includes('statistics')
  ) {
    return {
      type: 'data',
      domain: 'Data Architecture & Analytics',
      badgeLabel: 'Pandas & Data Manipulation',
      icon: Database,
      filename: 'students_analysis.py',
      accentHue: '#f59e0b',
      secondaryHue: '#14b8a6',
      accentColor: 'text-amber-400',
      pillBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      rewardTitle: 'Certified Data Specialist',
      xpReward: '2,300 XP',
      terminalPrompt: 'python3 students_analysis.py',
      terminalOutput: 'Filtered 2 students with scores >= 85',
      executionOutput: `  student  score\n0    Alex     88\n1     Sam     92`,
      particles: ['import pandas', 'DataFrame', 'df[df["score"] >= 85]', 'print(top)'],
      codeSnippet: `import pandas as pd

data = {'student': ['Alex', 'Sam', 'Taylor'], 'score': [88, 92, 79]}
df = pd.DataFrame(data)

# Filter top performers
top = df[df['score'] >= 85]
print(top)`,
      interactiveMeta: 'Pandas 2.2 • DataFrames Filter Engine',
    }
  }

  // 5. JavaScript / Web Development
  if (title.includes('javascript') || title.includes('web') || title.includes('full stack')) {
    return {
      type: 'javascript',
      domain: 'Modern Full-Stack Engineering',
      badgeLabel: 'Node & Express API',
      icon: Globe,
      filename: 'server.js',
      accentHue: '#eab308',
      secondaryHue: '#38bdf8',
      accentColor: 'text-yellow-400',
      pillBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      rewardTitle: 'Certified Full-Stack Engineer',
      xpReward: '2,500 XP',
      terminalPrompt: 'node server.js',
      terminalOutput: 'API Server listening on http://localhost:8000',
      executionOutput: `[API Server] Running on http://localhost:8000\nGET /api/courses 200 OK - 3 courses returned`,
      particles: ['const express', 'app.get()', 'res.json()', 'app.listen()', 'status: ok'],
      codeSnippet: `const express = require('express');
const app = express();

const courses = ['Python', 'Web Dev', 'Machine Learning'];

app.get('/api/courses', (req, res) => {
  res.json({ status: 'ok', data: courses });
});

app.listen(8000, () => console.log('Ready on :8000'));`,
      interactiveMeta: 'Node.js 22 LTS • Express.js Framework',
    }
  }

  // 6. Java Programming
  if (title.includes('java')) {
    return {
      type: 'java',
      domain: 'Java Engineering',
      badgeLabel: 'Java 21 Core Track',
      icon: Code2,
      filename: 'Main.java',
      accentHue: '#f97316',
      secondaryHue: '#0ea5e9',
      accentColor: 'text-orange-400',
      pillBg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      rewardTitle: 'Certified Java Developer',
      xpReward: '2,400 XP',
      terminalPrompt: 'javac Main.java && java Main',
      terminalOutput: 'Average: 84.33333333333333',
      executionOutput: `Technea Java Track:\nAverage score: 84.33333333333333`,
      particles: ['public class', 'static void main', 'int[] scores', 'System.out.println'],
      codeSnippet: `public class Main {
    public static void main(String[] args) {
        int[] scores = {85, 90, 78};
        double sum = 0;
        for (int s : scores) sum += s;
        System.out.println("Average: " + (sum / scores.length));
    }
}`,
      interactiveMeta: 'OpenJDK 21 • Modern Java Virtual Machine',
    }
  }

  // 7. C++ Programming
  if (title.includes('c++')) {
    return {
      type: 'cpp',
      domain: 'C++ Systems Architecture',
      badgeLabel: 'Modern C++20 Track',
      icon: Code2,
      filename: 'main.cpp',
      accentHue: '#0284c7',
      secondaryHue: '#a855f7',
      accentColor: 'text-sky-400',
      pillBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
      rewardTitle: 'Certified C++ Engineer',
      xpReward: '2,600 XP',
      terminalPrompt: 'g++ -std=c++20 main.cpp -o main && ./main',
      terminalOutput: 'Average: 84.3333',
      executionOutput: `Compiling main.cpp with -std=c++20...\nAverage: 84.3333\n[Process completed with status 0]`,
      particles: ['#include <iostream>', 'std::vector', 'std::accumulate', 'std::cout'],
      codeSnippet: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> scores = {85, 90, 78};
    double sum = std::accumulate(scores.begin(), scores.end(), 0.0);
    std::cout << "Average: " << sum / scores.size() << std::endl;
    return 0;
}`,
      interactiveMeta: 'GCC 14 • -std=c++20 Standard Library',
    }
  }

  // 8. Data Structures & Algorithms
  if (title.includes('algorithm') || title.includes('data structure')) {
    return {
      type: 'dsa',
      domain: 'Algorithms & Problem Solving',
      badgeLabel: 'Binary Search & Complexity',
      icon: Code2,
      filename: 'binary_search.py',
      accentHue: '#10b981',
      secondaryHue: '#f59e0b',
      accentColor: 'text-emerald-400',
      pillBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      rewardTitle: 'Algorithmic Problem Solver',
      xpReward: '2,800 XP',
      terminalPrompt: 'python3 binary_search.py',
      terminalOutput: 'Target 30 found at index: 2',
      executionOutput: `Array: [10, 20, 30, 40, 50]\nTarget element: 30\nTarget 30 found at index: 2 in O(log n) time`,
      particles: ['binary_search', 'low <= high', 'mid = (low + high) // 2', 'O(log n)'],
      codeSnippet: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        low, high = (mid + 1, high) if arr[mid] < target else (low, mid - 1)
    return -1

nums = [10, 20, 30, 40, 50]
print("Found index:", binary_search(nums, 30))`,
      interactiveMeta: 'Time Complexity: O(log n) • Space: O(1)',
    }
  }

  // 9. Systems / Security / Cloud / Default
  return {
    type: 'systems',
    domain: 'Software & Systems Architecture',
    badgeLabel: 'Algorithmic Systems Track',
    icon: Code2,
    filename: 'cli_runner.py',
    accentHue: '#10b981',
    secondaryHue: '#6366f1',
    accentColor: 'text-emerald-400',
    pillBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    rewardTitle: 'Certified Software Developer',
    xpReward: '2,200 XP',
    terminalPrompt: 'python3 cli_runner.py',
    terminalOutput: '[✓] Track initialized • Environment ready',
    executionOutput: `Technea Systems Environment initialized\nAll 8 milestones unlocked and ready`,
    particles: ['import sys', 'def main():', '__name__ == "__main__"', 'exit(0)'],
    codeSnippet: `def initialize_track(name):
    print(f"Track initialized: {name}")
    return True

if __name__ == "__main__":
    initialize_track("${path?.title || 'Fundamentals'}")`,
    interactiveMeta: 'Systems Runtime • Zero Overhead Abstraction',
  }
}

/**
 * Generates sharp, educational milestone metadata with hands-on mini-projects
 */
export function getMilestoneMeta(step, index, totalSteps, pathTitle) {
  const pTitle = (pathTitle || '').toLowerCase()

  // Estimated hours
  const hours = index === 0 ? '2.5 Hours' : index % 2 === 0 ? '4.0 Hours' : '3.0 Hours'

  // Difficulty badge
  const difficulty =
    index === 0
      ? 'Foundational'
      : index === totalSteps - 1
      ? 'Production Capstone'
      : index <= 2
      ? 'Core Mechanics'
      : 'Applied Architecture'

  // Generate realistic, fun mini-project per milestone
  let miniProject = `Hands-on Lab ${index + 1}: Interactive Challenge`
  let concepts = ['Core Syntax', 'Memory Layout', 'Error Handling', 'Best Practices']

  if (pTitle.includes('python')) {
    const pythonProjects = [
      'Build a CLI Currency & Tip Calculator with input validation',
      'Engineer a Password Strength Auditor with regex pattern analysis',
      'Create an Automated Text File & Log Analyzer with frequency stats',
      'Implement an Interactive Terminal Quiz Game with object-oriented classes',
      'Build a Recursive Directory Tree Visualizer with size calculations',
      'Architect a RESTful Weather & Stock Scraper using requests & JSON',
      'Construct a Key-Value Memory Cache with TTL and persistence',
      'Production-Ready CLI Task Engine with argparse and rich terminal output',
    ]
    const pythonConcepts = [
      ['Dynamic Typing', 'Variables', 'Primitive Types', 'String Formatting'],
      ['Boolean Logic', 'Conditionals', 'Truthy/Falsy', 'Branching Flows'],
      ['While/For Loops', 'List Comprehensions', 'Generators', 'Iterators'],
      ['Dictionaries', 'Sets', 'Hash Maps', 'Tuple Unpacking'],
      ['Functions', 'Arbitrary *args/**kwargs', 'Docstrings', 'Scope LEGB'],
      ['OOP Classes', 'Inheritance', '__init__ & Dunder Methods', 'Encapsulation'],
      ['Exception Handling', 'Custom Exceptions', 'Context Managers (with)'],
      ['Virtual Environments', 'Pip Packages', 'Pytest Testing', 'Production Packaging'],
    ]
    miniProject = pythonProjects[index % pythonProjects.length]
    concepts = pythonConcepts[index % pythonConcepts.length]
  } else if (pTitle.includes('react') || pTitle.includes('web')) {
    const webProjects = [
      'Create an Accessible Theme-Switching UI Component',
      'Build an Interactive State-Managed Accordion & FAQ System',
      'Engineer a Real-Time GitHub User Finder with API Debouncing',
      'Build a Drag-and-Drop Kanban Task Board with local persistence',
      'Develop an Optimistic Shopping Cart with Context & Reducers',
      'Build a Custom Hook Library for Network Status & Window Resize',
      'Create a Multi-Step Checkout Form with Schema Validation',
      'Deploy a Full-Stack Production Dashboard with Code Splitting',
    ]
    miniProject = webProjects[index % webProjects.length]
    concepts = ['Component Tree', 'State & Props', 'Lifecycle Hooks', 'CSS Architecture']
  } else if (pTitle.includes('machine learning') || pTitle.includes('ai')) {
    const mlProjects = [
      'Vectorized Matrix Math Engine using NumPy broadcasting',
      'Exploratory Data Analysis Report on California Housing Dataset',
      'Build a Linear Regression Model from scratch with Gradient Descent',
      'Train a Logistic Regression Classifier for Customer Churn',
      'Decision Tree & Random Forest Classifier for Credit Risk',
      'Feature Engineering Pipeline with Scikit-Learn Pipelines',
      'Hyperparameter Tuning Benchmark with Cross-Validation',
      'Deploy Model Weights to an interactive Streamlit inference web app',
    ]
    miniProject = mlProjects[index % mlProjects.length]
    concepts = ['NumPy Arrays', 'Loss Functions', 'Gradient Descent', 'Model Evaluation']
  }

  return {
    hours,
    difficulty,
    miniProject,
    concepts,
    isFirst: index === 0,
    isLast: index === totalSteps - 1,
  }
}

/**
 * Returns a sharp, insightful "Why this course was chosen" recommendation note
 */
export function getCourseRationale(course) {
  const cTitle = (course?.title || '').toLowerCase()
  const instructor = (course?.instructor || '').toLowerCase()
  const platform = (course?.platform || '').toLowerCase()

  if (instructor.includes('mike dane') || cTitle.includes('freecodecamp')) {
    return 'Definitive zero-to-one curriculum. Explains core abstractions with practical VS Code exercises and zero unnecessary filler.'
  }
  if (instructor.includes('andrew ng') || instructor.includes('deeplearning')) {
    return 'The industry benchmark. Taught by AI pioneer Andrew Ng, focusing on rigorous mathematical intuition and intuitive mental models.'
  }
  if (instructor.includes('mosh') || instructor.includes('traversy')) {
    return 'Fast-paced, crystal-clear mental models with visual diagrams and modern project structures.'
  }
  if (instructor.includes('bob ziroll') || cTitle.includes('scrimba')) {
    return 'Interactive code-along pedagogy. Focuses heavily on muscle memory and modern compositional patterns.'
  }
  if (cTitle.includes('cs50') || instructor.includes('david malan') || platform.includes('mit')) {
    return 'World-renowned Harvard/MIT computer science pedagogy. Breaks down low-level mechanics and computational complexity with exceptional clarity.'
  }

  return 'Curated for pedagogical depth, clean code demonstrations, and direct alignment with this learning track milestone.'
}

/**
 * Generates 3 rich, realistic capstone projects
 */
export function getTrackProjects(path) {
  const title = (path?.title || '').toLowerCase()

  if (title.includes('python')) {
    return [
      {
        id: 'proj-py-1',
        milestone: 'Project 01 • Core Logic',
        title: 'High-Performance CLI Task & System Monitor',
        description:
          'Construct an interactive terminal dashboard monitoring CPU cores, RAM allocations, and background thread execution with live text-based graphing.',
        difficulty: 'Beginner Friendly',
        buildTime: '3-4 Hours',
        skills: ['Python 3.12', 'argparse', 'psutil', 'Rich CLI', 'Subprocesses'],
        deliverables: [
          'Modular argument parser with custom subcommands (--live, --export-csv)',
          'Real-time CPU and memory usage daemon using non-blocking loops',
          'Rich tabular layout with visual bar indicators and ANSI styling',
          'Automated logging system saving snapshots into structured JSON/CSV',
        ],
      },
      {
        id: 'proj-py-2',
        milestone: 'Project 02 • Concurrency & APIs',
        title: 'Asynchronous Web Scraper & Intelligence Pipeline',
        description:
          'Architect an event-driven web scraper that fetches concurrent data across 100+ endpoints with retry backoffs and schema validation.',
        difficulty: 'Intermediate',
        buildTime: '5-6 Hours',
        skills: ['AsyncIO', 'aiohttp', 'BeautifulSoup4', 'Pydantic', 'SQLite'],
        deliverables: [
          'Async rate-limited connection pool preventing endpoint throttling',
          'Pydantic schema validation for strongly typed entity ingestion',
          'Automated error handling with exponential backoff on HTTP 429/500',
          'Indexed SQLite persistence layer with duplicate detection',
        ],
      },
      {
        id: 'proj-py-3',
        milestone: 'Project 03 • Capstone Architecture',
        title: 'FastAPI Microservice with Background Task Workers',
        description:
          'Build and deploy a production-grade REST microservice featuring JWT auth, database connection pooling, and background worker queues.',
        difficulty: 'Advanced Capstone',
        buildTime: '7-9 Hours',
        skills: ['FastAPI', 'SQLAlchemy 2.0', 'PostgreSQL', 'JWT', 'Pytest'],
        deliverables: [
          'Secure OAuth2 password bearer flow with encrypted password hashing',
          'Async SQLAlchemy session lifecycle management with Alembic migrations',
          'Comprehensive Pytest test suite with >85% branch coverage',
          'Production Dockerfile and healthcheck monitoring endpoint',
        ],
      },
    ]
  }

  if (title.includes('machine learning') || title.includes('deep learning')) {
    return [
      {
        id: 'proj-ml-1',
        milestone: 'Project 01 • Data Engineering',
        title: 'Automated EDA & Feature Transformation Engine',
        description:
          'Build a robust pipeline that cleans noisy raw tabular datasets, detects multivariate outliers, imputes missing values, and visualizes distributions.',
        difficulty: 'Beginner Friendly',
        buildTime: '4-5 Hours',
        skills: ['NumPy', 'Pandas', 'Seaborn', 'Scikit-Learn', 'Statistical Tests'],
        deliverables: [
          'Interactive correlation heatmap generation and multicollinearity checks',
          'Automated missing-value imputation pipeline with configurable strategies',
          'One-hot and ordinal feature encoding with scale transformations',
          'HTML executive report generation summarizing dataset insights',
        ],
      },
      {
        id: 'proj-ml-2',
        milestone: 'Project 02 • Predictive Modeling',
        title: 'Supervised Real-Estate Valuation & Stacking Regressor',
        description:
          'Train, cross-validate, and evaluate ensemble models predicting asset pricing with feature importance attribution and SHAP explanations.',
        difficulty: 'Intermediate',
        buildTime: '6-7 Hours',
        skills: ['XGBoost', 'LightGBM', 'Scikit-Learn', 'Cross-Validation', 'SHAP'],
        deliverables: [
          '5-fold stratified cross-validation with Bayesian hyperparameter tuning',
          'Ensemble stacking regressor combining Ridge, Random Forest & XGBoost',
          'Evaluation matrix: RMSE, MAE, R² score comparisons',
          'SHAP summary visualizations explaining individual prediction weights',
        ],
      },
      {
        id: 'proj-ml-3',
        milestone: 'Project 03 • Capstone Deployment',
        title: 'Real-Time Inference API & Streamlit Diagnostics Hub',
        description:
          'Package the trained machine learning pipeline into a low-latency REST endpoint with input data validation and an interactive model explorer GUI.',
        difficulty: 'Advanced Capstone',
        buildTime: '8-10 Hours',
        skills: ['FastAPI', 'Streamlit', 'Joblib', 'Docker', 'Latency Profiling'],
        deliverables: [
          'Sub-20ms inference REST endpoint with Pydantic request validation',
          'Streamlit interactive dashboard enabling non-technical model testing',
          'Data drift detection checking live input against baseline distributions',
          'Dockerized deployment artifact with pre-loaded serialized weights',
        ],
      },
    ]
  }

  // Default
  return [
    {
      id: 'proj-def-1',
      milestone: 'Project 01 • Core Foundation',
      title: `${path?.title || 'Track'} Core Architecture Engine`,
      description:
        'Implement the core architectural patterns, data abstractions, and algorithms covered in the foundational modules of this roadmap.',
      difficulty: 'Beginner Friendly',
      buildTime: '4-5 Hours',
      skills: ['Core Syntax', 'Data Structures', 'Modularity', 'Error Handling'],
      deliverables: [
        'Strongly structured codebase adhering to modern software engineering standards',
        'Comprehensive error handling and input validation routines',
        'Unit test coverage verifying all edge cases and boundary conditions',
        'Developer documentation with architecture diagram and setup guide',
      ],
    },
    {
      id: 'proj-def-2',
      milestone: 'Project 02 • Applied Engineering',
      title: 'Scalable Integration Service & Automation Tool',
      description:
        'Build a real-world integration tool that connects external data sources, automates processing workflows, and outputs structured analytical reports.',
      difficulty: 'Intermediate',
      buildTime: '6-7 Hours',
      skills: ['API Integration', 'Async Workflows', 'Persistence', 'Configuration'],
      deliverables: [
        'Modular external service client with resilience and rate limiting',
        'Structured caching mechanism preventing unnecessary compute',
        'Command-line or GUI configuration manager with schema validation',
        'Automated CI/CD workflow testing pipeline',
      ],
    },
    {
      id: 'proj-def-3',
      milestone: 'Project 03 • Capstone Production',
      title: 'End-to-End Production System & Deployment Artifact',
      description:
        'Deliver a complete, production-ready capstone project that showcases mastering the entire lifecycle of this technology track.',
      difficulty: 'Advanced Capstone',
      buildTime: '8-10 Hours',
      skills: ['System Design', 'Production Deployment', 'Optimization', 'Security'],
      deliverables: [
        'Complete end-to-end user workflow solving real-world business problems',
        'Telemetry, structured logging, and performance benchmark reporting',
        'Containerized production deployment manifest with automated startup',
        'Technical write-up explaining trade-offs, architecture, and scaling',
      ],
    },
  ]
}

/**
 * Calculates estimated completion hours and difficulty level metadata
 */
export function getTrackMetrics(path, stepsCount = 6, coursesCount = 3) {
  const level = (path?.level || 'Beginner').toLowerCase()

  let levelIndex = 1
  let levelDots = [true, false, false]

  if (level.includes('intermed') || level.includes('medium')) {
    levelIndex = 2
    levelDots = [true, true, false]
  } else if (level.includes('adv') || level.includes('expert') || level.includes('master')) {
    levelIndex = 3
    levelDots = [true, true, true]
  }

  const estimatedHours = Math.max(18, stepsCount * 4 + coursesCount * 3)

  return {
    levelIndex,
    levelDots,
    estimatedHours,
    stepsCount,
    coursesCount,
  }
}

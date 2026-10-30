import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  BookOpen,
  Layers,
  Code2,
  CheckCircle2,
  Briefcase,
  Cpu,
  Sparkles,
} from 'lucide-react'
import {
  getLearningPathById,
  getCourses,
  getSkills,
  getPathProgressApi,
  toggleStepProgressApi,
  slugifyTitle,
} from '../services/api'
import { useAuth } from '../context/useAuth'
import { getTrackTheme, getTrackProjects, getTrackMetrics } from '../utils/trackThemes'

import PathDetailHero from '../components/detail/PathDetailHero'
import InteractiveRoadmap from '../components/detail/InteractiveRoadmap'
import AILearningCompanionCard from '../components/detail/AILearningCompanionCard'
import FeaturedCoursesSection from '../components/detail/FeaturedCoursesSection'
import CapstoneProjectsSection from '../components/detail/CapstoneProjectsSection'
import CuratedResourcesSection from '../components/detail/CuratedResourcesSection'
import PathDetailSkeleton from '../components/detail/PathDetailSkeleton'
import AbstractBackgroundGraphic from '../components/detail/AbstractBackgroundGraphic'

/**
 * Safely check if an identifier is a valid positive numeric database ID
 * (e.g., 1, 42, "10", but NOT "query-path", "python-for-beginners", null, undefined)
 */
function isNumericId(val) {
  if (val === null || val === undefined || typeof val === 'boolean' || val === '') return false
  const num = Number(val)
  return Number.isInteger(num) && num > 0
}

function getRoadmapPrerequisites(path) {
  if (path?.prerequisites && Array.isArray(path.prerequisites) && path.prerequisites.length > 0) {
    return path.prerequisites
  }
  const level = (path?.level || path?.difficulty || 'Beginner').toLowerCase()
  if (level.includes('advanced')) {
    return [
      'Proficiency in core language syntax and object-oriented or functional patterns',
      'Understanding of data structures, algorithms, and time/space complexity',
      'Experience with relational databases, RESTful APIs, and basic containerization',
    ]
  }
  if (level.includes('intermediate')) {
    return [
      'Basic familiarity with programming logic (variables, loops, conditional branching)',
      'Basic command line & terminal navigation (cd, ls, mkdir, git)',
      'Comfort with basic code editors like VS Code',
    ]
  }
  return [
    'No prior programming experience required',
    'Basic computer literacy and comfort navigating web browsers',
    'Curiosity and motivation to build real-world software',
  ]
}

function getCareerOutcomes(path) {
  const title = (path?.title || '').toLowerCase()
  const cat = (path?.category || '').toLowerCase()

  if (title.includes('python') || cat.includes('programming')) {
    return {
      primaryRole: 'Software Engineer / Python Developer',
      roles: ['Backend Engineer', 'Python Automation Developer', 'API Engineer', 'Software Developer'],
      keyCompetencies: ['Algorithmic Thinking', 'Clean Modular Code', 'REST APIs', 'Unit Testing', 'Asynchronous Programming'],
    }
  }
  if (title.includes('react') || title.includes('frontend') || cat.includes('web')) {
    return {
      primaryRole: 'Frontend / Full-Stack Engineer',
      roles: ['React Frontend Architect', 'Full-Stack Developer', 'UI/UX Engineer', 'Web Applications Builder'],
      keyCompetencies: ['Modern React & Hooks', 'Component Architecture', 'State Management', 'Responsive Design', 'API Integration'],
    }
  }
  if (title.includes('ai') || title.includes('machine learning') || cat.includes('ai')) {
    return {
      primaryRole: 'AI & Machine Learning Practitioner',
      roles: ['AI Systems Engineer', 'Machine Learning Specialist', 'LLM Application Developer', 'Data Scientist'],
      keyCompetencies: ['Model Fine-Tuning', 'Prompt Architecture', 'Vector Search & RAG', 'PyTorch / Transformers', 'MLOps Pipelines'],
    }
  }
  if (title.includes('cloud') || title.includes('devops') || cat.includes('cloud')) {
    return {
      primaryRole: 'Cloud & DevOps Platform Engineer',
      roles: ['Site Reliability Engineer (SRE)', 'Cloud Solutions Architect', 'DevOps Specialist', 'Kubernetes Administrator'],
      keyCompetencies: ['Container Orchestration', 'Infrastructure as Code', 'CI/CD Pipelines', 'Linux Systems Internals', 'Cloud Security'],
    }
  }
  if (title.includes('data') || cat.includes('data')) {
    return {
      primaryRole: 'Data Engineer / Analytics Specialist',
      roles: ['Data Pipeline Architect', 'Analytics Engineer', 'BI Developer', 'Database Specialist'],
      keyCompetencies: ['SQL Mastery', 'ETL Pipelines', 'Data Warehousing', 'Data Modeling', 'Business Intelligence'],
    }
  }
  if (title.includes('security') || cat.includes('cyber')) {
    return {
      primaryRole: 'Cybersecurity Analyst / Security Engineer',
      roles: ['Security Operations Analyst', 'Application Security Engineer', 'Penetration Tester', 'DevSecOps Specialist'],
      keyCompetencies: ['Vulnerability Assessment', 'Network Protocols', 'Secure Coding', 'Threat Modeling', 'Incident Response'],
    }
  }
  return {
    primaryRole: `${path?.title || 'Engineering'} Specialist`,
    roles: ['Technical Lead', 'Software Engineer', 'Systems Architect', 'Solutions Consultant'],
    keyCompetencies: ['System Architecture', 'Production Problem Solving', 'End-to-End Implementation', 'Technical Best Practices'],
  }
}

function getTechStackForPath(path) {
  const title = (path?.title || '').toLowerCase()
  const cat = (path?.category || '').toLowerCase()
  const concepts = Array.isArray(path?.related_concepts) ? path.related_concepts : []

  const set = new Set()
  if (title.includes('python') || cat.includes('programming')) {
    set.add('Python 3.12')
    set.add('FastAPI')
    set.add('PyTest')
    set.add('AsyncIO')
    set.add('Pydantic')
    set.add('Git & GitHub')
  } else if (title.includes('react') || cat.includes('web')) {
    set.add('React 19')
    set.add('TypeScript')
    set.add('Next.js')
    set.add('Tailwind CSS')
    set.add('Vite')
    set.add('REST / GraphQL')
  } else if (title.includes('ai') || cat.includes('ai')) {
    set.add('Python')
    set.add('PyTorch')
    set.add('Hugging Face')
    set.add('LangChain')
    set.add('OpenAI / Gemini API')
    set.add('Vector Databases')
  } else if (title.includes('cloud') || cat.includes('devops')) {
    set.add('Docker')
    set.add('Kubernetes')
    set.add('Linux CLI')
    set.add('Terraform')
    set.add('AWS / GCP')
    set.add('GitHub Actions')
  } else if (title.includes('data') || cat.includes('data')) {
    set.add('PostgreSQL')
    set.add('SQL')
    set.add('Pandas')
    set.add('Apache Spark')
    set.add('dbt')
    set.add('Airflow')
  } else {
    set.add('Git')
    set.add('Terminal CLI')
    set.add('Modern IDE (VS Code)')
  }

  concepts.slice(0, 4).forEach((c) => {
    if (typeof c === 'string' && c.length < 24) set.add(c)
  })

  return Array.from(set)
}

function getCuratedResourcesForPath(path) {
  const title = (path?.title || '').toLowerCase()
  const category = (path?.category || '').toLowerCase()
  const concepts = Array.isArray(path?.related_concepts) ? path.related_concepts.map((c) => String(c).toLowerCase()) : []

  const resources = []

  if (title.includes('python') || concepts.includes('python')) {
    resources.push(
      {
        title: 'Official Python Documentation',
        url: 'https://docs.python.org/3/',
        type: 'Official Docs',
        description: 'Complete Python language specification, standard library tutorial, and built-in functions reference.',
        tags: ['Python 3', 'Standard Library', 'Core Syntax'],
      },
      {
        title: 'Real Python Tutorials & Guides',
        url: 'https://realpython.com/',
        type: 'Verified Guide',
        description: 'Practical, step-by-step programming walkthroughs from fundamentals to advanced asynchronous patterns.',
        tags: ['Idiomatic Code', 'Tutorials'],
      },
      {
        title: 'Python Developer Cheat Sheet',
        url: 'https://perso.limsi.fr/pointal/_media/python:cours:mementopython3-english.pdf',
        type: 'Cheat Sheet',
        description: 'Quick reference sheet covering data structures, control flow, file I/O, and built-in functions.',
        tags: ['Cheat Sheet', 'Quick Reference'],
      }
    )
  }

  if (title.includes('react') || concepts.includes('react') || category.includes('web')) {
    resources.push(
      {
        title: 'React Official Documentation',
        url: 'https://react.dev/',
        type: 'Official Docs',
        description: 'The official interactive React documentation with live sandboxes, component lifecycle, and hooks.',
        tags: ['React', 'Hooks', 'Components'],
      },
      {
        title: 'MDN Web Docs (Mozilla Developer Network)',
        url: 'https://developer.mozilla.org/en-US/',
        type: 'Official Docs',
        description: 'The definitive web standard reference for JavaScript, HTML5, CSS3, Web APIs, and DOM manipulation.',
        tags: ['JavaScript', 'Web APIs', 'Standards'],
      },
      {
        title: 'Modern Frontend Architecture & Patterns',
        url: 'https://www.patterns.dev/',
        type: 'Architecture Guide',
        description: 'Guide to design, performance, and component architecture patterns in modern web applications.',
        tags: ['Architecture', 'Performance', 'Patterns'],
      }
    )
  }

  if (title.includes('ai') || title.includes('machine learning') || category.includes('ai') || concepts.includes('pytorch') || concepts.includes('llm')) {
    resources.push(
      {
        title: 'PyTorch Official Documentation & Tutorials',
        url: 'https://pytorch.org/tutorials/',
        type: 'Official Docs',
        description: 'Comprehensive deep learning guides covering tensors, neural networks, autograd, and CUDA execution.',
        tags: ['PyTorch', 'Deep Learning', 'Tensors'],
      },
      {
        title: 'Hugging Face Transformers Guide',
        url: 'https://huggingface.co/docs/transformers/',
        type: 'Official Docs',
        description: 'State-of-the-art pretrained models, fine-tuning pipelines, and inference pipelines for LLMs and vision models.',
        tags: ['LLMs', 'Transformers', 'Fine-tuning'],
      },
      {
        title: 'Machine Learning Foundations',
        url: 'https://www.deeplearning.ai/',
        type: 'Curated Resource',
        description: 'Industry-standard guidelines on structuring machine learning projects and optimizing error analysis.',
        tags: ['MLOps', 'Model Evaluation'],
      }
    )
  }

  if (title.includes('cloud') || title.includes('devops') || title.includes('docker') || title.includes('kubernetes') || category.includes('cloud')) {
    resources.push(
      {
        title: 'Docker Documentation & Getting Started',
        url: 'https://docs.docker.com/',
        type: 'Official Docs',
        description: 'Containerization handbook, Dockerfile syntax reference, multi-stage builds, and Compose specs.',
        tags: ['Containers', 'Docker', 'DevOps'],
      },
      {
        title: 'Kubernetes Official Documentation',
        url: 'https://kubernetes.io/docs/',
        type: 'Official Docs',
        description: 'Cluster orchestration reference, Pods, Deployments, Services, and production cloud architecture.',
        tags: ['Kubernetes', 'Cloud Native', 'Orchestration'],
      },
      {
        title: 'AWS Well-Architected Framework',
        url: 'https://aws.amazon.com/architecture/well-architected/',
        type: 'Architecture Guide',
        description: 'Key principles for creating secure, high-performing, resilient, and efficient infrastructure.',
        tags: ['Cloud Architecture', 'Security', 'Resilience'],
      }
    )
  }

  if (resources.length === 0) {
    resources.push(
      {
        title: 'Developer Roadmap & Knowledge Base',
        url: 'https://roadmap.sh',
        type: 'Community Blueprint',
        description: 'Community-driven visual blueprints, role guides, and skill trees for software engineers.',
        tags: ['Roadmaps', 'Career Path'],
      },
      {
        title: 'DevDocs API Documentation Aggregator',
        url: 'https://devdocs.io/',
        type: 'Documentation Hub',
        description: 'Fast, offline-capable documentation browser combining 100+ programming language specifications.',
        tags: ['API Reference', 'Cheat Sheets'],
      },
      {
        title: 'GitHub Awesome Engineering Curations',
        url: 'https://github.com/sindresorhus/awesome',
        type: 'Open Source',
        description: 'Curated collection of production libraries, battle-tested tools, and engineering frameworks.',
        tags: ['Open Source', 'Libraries'],
      }
    )
  }

  return resources
}

export default function LearningPathDetailPage({
  path = null,
  onBack = () => {},
  onStartLearning = () => {},
}) {
  const { user } = useAuth()
  const [fetchedPath, setFetchedPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Active section tab for navigation
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'roadmap' | 'courses' | 'projects' | 'resources'

  // Courses state
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(null)
  const [coursesRetryKey, setCoursesRetryKey] = useState(0)
  const [enrolledCourseId, setEnrolledCourseId] = useState(null)

  // Resolve identifier from prop or URL slug
  const pathIdentifier = useMemo(() => {
    if (path?.id) return path.id
    if (path?.slug) return path.slug
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean)
      if (
        window.location.pathname.startsWith('/path/') ||
        window.location.pathname.startsWith('/paths/') ||
        window.location.pathname.startsWith('/learning-path/') ||
        window.location.pathname.startsWith('/learning-paths/') ||
        window.location.pathname.startsWith('/roadmap/') ||
        window.location.pathname.startsWith('/roadmaps/')
      ) {
        return parts[1] || null
      }
    }
    return null
  }, [path])

  // Use fetched details if available, otherwise passed path prop
  const currentPath = fetchedPath || path
  const hasSteps = Boolean(path?.roadmap_steps && path.roadmap_steps.length > 0)

  // Fetch full learning path with steps if path was provided without steps or as slug
  useEffect(() => {
    if (!pathIdentifier || hasSteps) return

    let isMounted = true
    Promise.resolve().then(() => {
      if (isMounted) setLoading(true)
    })

    getLearningPathById(pathIdentifier)
      .then((data) => {
        if (isMounted && data) {
          setFetchedPath(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch learning path detail:', err)
          setError(err.message || 'Unable to load learning path details.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [pathIdentifier, hasSteps, retryKey])

  // Synchronize URL with clean slug
  useEffect(() => {
    if (currentPath?.title && typeof window !== 'undefined') {
      const slug = slugifyTitle(currentPath.title)
      const currentHref = window.location.pathname
      if (slug && !currentHref.includes(slug)) {
        window.history.replaceState({}, '', `/paths/${slug}`)
      }
    }
  }, [currentPath?.title])

  // Fetch courses related to the current learning path
  useEffect(() => {
    let isMounted = true

    const fetchPathCourses = async () => {
      try {
        let relevant = []
        if (isNumericId(currentPath?.id)) {
          relevant = await getCourses({ learning_path_id: currentPath.id })
        }

        if ((!relevant || relevant.length === 0) && isNumericId(currentPath?.skill_id)) {
          relevant = await getCourses({ skill_id: currentPath.skill_id })
        }

        if (!relevant || relevant.length === 0) {
          const [allCourses, allSkills] = await Promise.all([getCourses(), getSkills()])
          const pathTitle = (currentPath?.title || '').toLowerCase()
          const pathCategory = (currentPath?.category || '').toLowerCase()

          const matchedSkill = (allSkills || []).find((s) => {
            const sName = (s.name || '').toLowerCase()
            const sCat = (s.category || '').toLowerCase()
            return (
              pathTitle.includes(sName) ||
              sName.includes(pathTitle) ||
              pathCategory.includes(sCat) ||
              sCat.includes(pathCategory)
            )
          })

          if (matchedSkill) {
            relevant = (allCourses || []).filter((c) => c.skill_id === matchedSkill.id)
          }

          if ((!relevant || relevant.length === 0) && pathTitle) {
            const keywords = pathTitle
              .split(/\s+/)
              .map((k) => k.trim().toLowerCase())
              .filter((k) => k.length > 3)

            relevant = (allCourses || []).filter((c) => {
              const cTitle = (c.title || '').toLowerCase()
              const cDesc = (c.description || '').toLowerCase()
              return keywords.some((kw) => cTitle.includes(kw) || cDesc.includes(kw))
            })
          }
        }

        if (isMounted) {
          setCourses(relevant || [])
          setCoursesError(null)
          setCoursesLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load courses:', err)
          setCoursesError(err.message || 'Unable to load courses for this learning path.')
          setCoursesLoading(false)
        }
      }
    }

    fetchPathCourses()

    return () => {
      isMounted = false
    }
  }, [currentPath?.id, currentPath?.skill_id, currentPath?.title, currentPath?.category, coursesRetryKey])

  // Map API roadmap_steps to timeline journeySteps
  const journeySteps = useMemo(() => {
    const roadmapSteps = currentPath?.roadmap_steps
    if (roadmapSteps && roadmapSteps.length > 0) {
      return roadmapSteps
        .slice()
        .sort((a, b) => (a.step_number || 0) - (b.step_number || 0))
        .map((step, idx) => ({
          id: step.id,
          num: String(step.step_number || idx + 1).padStart(2, '0'),
          title: step.title,
          topics: step.description || step.title,
        }))
    }

    // Default fallback steps
    return [
      {
        id: 'step-1',
        num: '01',
        title: 'Core Fundamentals & Syntax',
        topics: 'Variables, expressions, control flow, functions, and typing rules.',
      },
      {
        id: 'step-2',
        num: '02',
        title: 'Data Structures & Abstractions',
        topics: 'Key collections, algorithms, modular patterns, and memory layout.',
      },
      {
        id: 'step-3',
        num: '03',
        title: 'Applied Engineering & APIs',
        topics: 'Async workflows, integration clients, testing paradigms, and validation.',
      },
      {
        id: 'step-4',
        num: '04',
        title: 'Production Capstone & Deployment',
        topics: 'Containerization, telemetry, performance profiling, and shipping.',
      },
    ]
  }, [currentPath?.roadmap_steps])

  // Completed steps tracker persisted in localStorage
  const stepStorageKey = useMemo(
    () => `technea_completed_steps_${currentPath?.id || 'default'}`,
    [currentPath?.id]
  )

  const [completedStepIds, setCompletedStepIds] = useState(() => {
    try {
      if (!currentPath?.id) return []
      const saved = localStorage.getItem(`technea_completed_steps_${currentPath.id}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Synchronize progress with server when user is authenticated
  useEffect(() => {
    if (!user || !currentPath?.id || !isNumericId(currentPath.id)) return
    let isMounted = true

    getPathProgressApi(currentPath.id)
      .then((data) => {
        if (isMounted && data?.completed_step_ids) {
          setCompletedStepIds(data.completed_step_ids)
          try {
            localStorage.setItem(stepStorageKey, JSON.stringify(data.completed_step_ids))
          } catch (e) {
            console.warn('Failed to cache progress locally:', e)
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load path progress from server:', err)
      })

    return () => {
      isMounted = false
    }
  }, [user, currentPath?.id, stepStorageKey])

  // Synchronize localStorage and server when step progress changes
  const handleToggleStep = useCallback(
    (stepKey) => {
      setCompletedStepIds((prev) => {
        const isCompleted = !prev.includes(stepKey)
        const next = isCompleted
          ? [...prev, stepKey]
          : prev.filter((id) => id !== stepKey)

        try {
          localStorage.setItem(stepStorageKey, JSON.stringify(next))
        } catch (e) {
          console.warn('Could not save step progress:', e)
        }

        // Save to backend if logged in
        if (user && isNumericId(currentPath?.id) && isNumericId(stepKey)) {
          toggleStepProgressApi({
            path_id: currentPath.id,
            step_id: stepKey,
            is_completed: isCompleted,
          }).catch((err) => {
            console.warn('Failed to save milestone progress to server:', err)
          })
        }

        return next
      })
    },
    [stepStorageKey, user, currentPath]
  )

  const handleResetProgress = useCallback(() => {
    setCompletedStepIds([])
    try {
      localStorage.removeItem(stepStorageKey)
    } catch {
      // ignore
    }
  }, [stepStorageKey])

  // Theming & generative project models
  const theme = useMemo(() => getTrackTheme(currentPath), [currentPath])
  const projects = useMemo(() => {
    if (currentPath?.projects && Array.isArray(currentPath.projects) && currentPath.projects.length > 0) {
      return currentPath.projects
    }
    return getTrackProjects(currentPath)
  }, [currentPath])
  const metrics = useMemo(
    () => getTrackMetrics(currentPath, journeySteps.length, courses.length),
    [currentPath, journeySteps.length, courses.length]
  )

  const skillsCovered = useMemo(() => {
    const list = []
    if (Array.isArray(currentPath?.skills)) {
      currentPath.skills.forEach((s) => {
        if (typeof s === 'string') list.push(s)
        else if (s?.name) list.push(s.name)
      })
    }
    if (Array.isArray(currentPath?.related_concepts)) {
      currentPath.related_concepts.forEach((c) => {
        if (typeof c === 'string' && !list.includes(c)) list.push(c)
      })
    }
    if (list.length === 0) {
      const title = (currentPath?.title || '').toLowerCase()
      if (title.includes('python')) {
        return ['Python Syntax', 'Object-Oriented Programming', 'Data Structures', 'AsyncIO', 'REST APIs', 'Unit Testing']
      }
      if (title.includes('react') || title.includes('frontend')) {
        return ['React 19', 'Hooks & State', 'TypeScript', 'Component Architecture', 'Tailwind CSS', 'Vite']
      }
      if (title.includes('cloud') || title.includes('devops')) {
        return ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux Administration', 'Cloud Security']
      }
      return ['Core Syntax', 'Modular Design', 'Production Testing', 'System Architecture', 'Clean Code']
    }
    return list
  }, [currentPath])

  const prerequisites = useMemo(
    () => getRoadmapPrerequisites(currentPath),
    [currentPath]
  )

  const careerOutcomes = useMemo(
    () => getCareerOutcomes(currentPath),
    [currentPath]
  )

  const techStack = useMemo(
    () => getTechStackForPath(currentPath),
    [currentPath]
  )

  const curatedResources = useMemo(
    () => getCuratedResourcesForPath(currentPath),
    [currentPath]
  )

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError(null)
    setRetryKey((k) => k + 1)
  }, [])

  const handleRetryCourses = useCallback(() => {
    setCoursesLoading(true)
    setCoursesError(null)
    setCoursesRetryKey((k) => k + 1)
  }, [])

  const handleStartCourse = useCallback(
    (course) => {
      if (!course) return
      setEnrolledCourseId(course.id)
      onStartLearning(course)
      setTimeout(() => {
        setEnrolledCourseId(null)
      }, 2500)
    },
    [onStartLearning]
  )

  // Start learning from path: opens the first course of this active learning path
  const handleStartPathLearning = useCallback(async () => {
    // 1. If courses already loaded, open the first course belonging to this path
    if (courses && courses.length > 0) {
      handleStartCourse(courses[0])
      return
    }

    // 2. Fetch courses associated with this learning_path_id from the backend
    const activePathId = currentPath?.id
    if (isNumericId(activePathId)) {
      try {
        const pathCourses = await getCourses({ learning_path_id: activePathId })
        if (pathCourses && pathCourses.length > 0) {
          handleStartCourse(pathCourses[0])
          return
        }
      } catch (err) {
        console.warn('Could not fetch first course for path:', err)
      }
    }

    // 3. Fallback: notify parent with active path info so CoursePlayerPage resolves it
    onStartLearning({
      learning_path_id: currentPath?.id,
      title: currentPath?.title,
      category: currentPath?.category,
    })
  }, [courses, currentPath, handleStartCourse, onStartLearning])

  const handleScrollToTimeline = useCallback(() => {
    const el = document.getElementById('roadmap-timeline')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // ── SKELETON LOADING STATE ──────────────────────────────────────────────
  if (loading && !currentPath) {
    return <PathDetailSkeleton />
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────
  if (error && !currentPath) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center space-y-4 backdrop-blur-xl">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-white">Error Loading Learning Path</h2>
          <p className="text-xs text-neutral-400">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── EMPTY STATE ─────────────────────────────────────────────────────────
  if (!currentPath && !loading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-4 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">No Learning Path Found</h2>
          <p className="text-xs text-neutral-400">
            The requested learning path is unavailable or could not be located.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Results</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black pb-24 overflow-x-clip">
      {/* ── ABSTRACT 2D GEOMETRIC BACKGROUND ELEMENT ──────────────────────── */}
      <AbstractBackgroundGraphic />

      {/* ── 1. WORLD-CLASS HERO SECTION ───────────────────────────────────── */}
      <PathDetailHero
        path={currentPath}
        theme={theme}
        metrics={metrics}
        coursesCount={courses.length}
        projectsCount={projects.length}
        completedStepCount={completedStepIds.length}
        totalSteps={journeySteps.length}
        onBack={onBack}
        onStartLearning={handleStartPathLearning}
        onExploreTimeline={handleScrollToTimeline}
        onResetProgress={handleResetProgress}
      />

      {/* ── 2. SEGMENTED NAVIGATION TABS (Linear / Raycast Style) ─────────── */}
      <div className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#08090d]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
          <div data-lenis-prevent className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`inline-flex min-h-[44px] items-center rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              All Sections
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'roadmap'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Roadmap ({journeySteps.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Courses ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Capstones ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Resources ({curatedResources.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-400 shrink-0">
            <span className="h-2 w-2 rounded-full bg-white/80" />
            <span>Progress: {completedStepIds.length}/{journeySteps.length} milestones</span>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER & STICKY SIDEBAR ─────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: Blueprint Specs, Roadmap, Courses, Capstones & Resources (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Blueprint Intelligence: Skills, Tech Stack, Prerequisites & Career Outcomes */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/80" />
                  <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-semibold">
                    Curriculum Blueprint & Career Architecture
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/[0.04] px-2.5 py-1 rounded-full">
                  {currentPath?.level || 'All Levels'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills Covered */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Sparkles className="h-4 w-4 text-neutral-300" />
                    <span>Skills Covered</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsCovered.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300 font-mono hover:border-white/20 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Cpu className="h-4 w-4 text-neutral-300" />
                    <span>Core Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-200 font-mono font-medium hover:border-white/25 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4 text-neutral-300" />
                    <span>Prerequisites</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-400">
                    {prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Outcomes */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Briefcase className="h-4 w-4 text-neutral-300" />
                    <span>Career Outcomes & Target Roles</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-2.5">
                    <div className="text-xs font-semibold text-white">
                      {careerOutcomes.primaryRole}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {careerOutcomes.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-neutral-300 font-mono"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                    {careerOutcomes.keyCompetencies && careerOutcomes.keyCompetencies.length > 0 && (
                      <div className="pt-1 border-t border-white/[0.06] text-[10px] text-neutral-400">
                        <span className="text-neutral-500">Core Competencies: </span>
                        {careerOutcomes.keyCompetencies.join(' • ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Timeline Roadmap */}
            {(activeTab === 'all' || activeTab === 'roadmap') && (
              <InteractiveRoadmap
                steps={journeySteps}
                completedStepIds={completedStepIds}
                onToggleStep={handleToggleStep}
                theme={theme}
                trackTitle={currentPath?.title}
              />
            )}

            {/* Curated Masterclasses & Courses */}
            {(activeTab === 'all' || activeTab === 'courses') && (
              <FeaturedCoursesSection
                courses={courses}
                loading={coursesLoading}
                error={coursesError}
                onRetry={handleRetryCourses}
                onStartCourse={handleStartCourse}
                enrolledCourseId={enrolledCourseId}
                theme={theme}
              />
            )}

            {/* Real-World Capstone Projects */}
            {(activeTab === 'all' || activeTab === 'projects') && (
              <CapstoneProjectsSection
                projects={projects}
                theme={theme}
              />
            )}

            {/* Curated Resources & Documentation */}
            {(activeTab === 'all' || activeTab === 'resources') && (
              <CuratedResourcesSection
                resources={curatedResources}
                trackTitle={currentPath?.title}
              />
            )}
          </div>

          {/* RIGHT COLUMN: AI Learning Companion Card & Quick Specs (4 Cols Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20 self-start space-y-4">
            <AILearningCompanionCard
              userName={user?.full_name?.split(' ')[0] || user?.username || 'Learner'}
              pathTitle={currentPath?.title || 'Engineering Blueprint'}
              onAskMentor={() => {
                // Placeholder for Phase 2 Gemini API integration
              }}
            />

            {/* Blueprint Fast Spec Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                  Track Specification
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Total Milestones</span>
                  <span className="font-mono text-white font-medium">{journeySteps.length} Steps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Skill Level</span>
                  <span className="font-mono text-white font-medium">{currentPath?.level || 'All Levels'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Estimated Duration</span>
                  <span className="font-mono text-white font-medium">{currentPath?.duration || `${journeySteps.length * 4} Hours`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Primary Role</span>
                  <span className="font-mono text-white font-medium text-right truncate max-w-[170px]" title={careerOutcomes.primaryRole}>
                    {careerOutcomes.primaryRole}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Capstone Projects</span>
                  <span className="font-mono text-white font-medium">{projects.length} Real-world Challenges</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

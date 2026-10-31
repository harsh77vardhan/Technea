/**
 * Development Mock Data & Bypass Configuration
 * 
 * Used strictly for localhost frontend development when VITE_DEV_BYPASS_AUTH=true.
 * In production builds (npm run build), import.meta.env.DEV is statically false,
 * which enables bundler tree-shaking and dead-code elimination.
 */

export const isDevAuthBypass =
  Boolean(import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true')

export const DEV_BYPASS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3OGM1YS1mZmM1LTQwOWMtYjE1Mi02ZWViMzE0OWJmNDgiLCJpYXQiOjE3OTM0NDg5MTksImV4cCI6MTgyNDk4NDkxOX0.RWC4Sw2kdQkignyo8H8j3Fm-c8ddViO2SsbQ5wa37G0'

export const DEV_MOCK_USER = {
  id: '13378c5a-ffc5-409c-b152-6eeb3149bf48',
  email: 'harshvsvardhan22@gmail.com',
  full_name: 'Harsh Singh',
  username: 'harsh',
  total_xp: 50,
  is_verified: true,
  profile_completed: true,
  role: 'user',
  avatar_url: null,
  created_at: new Date().toISOString(),
}

export const DEV_MOCK_ROADMAP = {
  id: 101,
  title: 'Full Stack Developer Roadmap',
  target_role: 'Full Stack Engineer',
  progress_percent: 68,
  completed_steps_count: 3,
  total_steps_count: 6,
  is_active: true,
  completed_milestone_ids: ['ms-1', 'ms-2', 'ms-3'],
  current_milestone: {
    id: 'ms-4',
    title: 'Object-Oriented Architecture & Design Patterns',
    estimated_time: '45 min',
    course_id: 1,
    lesson_id: 4,
  },
  roadmap_data: {
    phases: [
      {
        title: 'Phase 1: Architecture & Foundations',
        milestones: [
          {
            id: 'ms-1',
            title: 'Frontend Systems & Modern DOM',
            estimated_time: '30 min',
            course_id: 1,
            lesson_id: 1,
          },
          {
            id: 'ms-2',
            title: 'Backend APIs & Express Routing',
            estimated_time: '45 min',
            course_id: 1,
            lesson_id: 2,
          },
          {
            id: 'ms-3',
            title: 'Database Modeling & PostgreSQL',
            estimated_time: '40 min',
            course_id: 1,
            lesson_id: 3,
          },
          {
            id: 'ms-4',
            title: 'Object-Oriented Architecture & Design Patterns',
            estimated_time: '45 min',
            course_id: 1,
            lesson_id: 4,
          },
          {
            id: 'ms-5',
            title: 'Distributed Microservices & Cloud Architecture',
            estimated_time: '50 min',
            course_id: 1,
            lesson_id: 5,
          },
          {
            id: 'ms-6',
            title: 'DevOps, Containerization & CI/CD Pipelines',
            estimated_time: '60 min',
            course_id: 1,
            lesson_id: 6,
          },
        ],
      },
    ],
  },
  milestones: [
    { id: 'ms-1', title: 'Frontend Systems & Modern DOM', completed: true },
    { id: 'ms-2', title: 'Backend APIs & Express Routing', completed: true },
    { id: 'ms-3', title: 'Database Modeling & PostgreSQL', completed: true },
    { id: 'ms-4', title: 'Object-Oriented Architecture & Design Patterns', current: true },
    { id: 'ms-5', title: 'Distributed Microservices & Cloud Architecture', locked: true },
    { id: 'ms-6', title: 'DevOps, Containerization & CI/CD Pipelines', locked: true },
  ],
}

export const DEV_MOCK_SUMMARY = {
  gamification: {
    xp_points: 50,
    developer_level: 'Code Initiate',
    level_progress: 12,
  },
  enrolled_paths: [
    {
      id: 101,
      title: 'Full Stack Developer Roadmap',
      progress_percent: 68,
      completed_steps_count: 3,
      total_steps_count: 6,
      next_step_title: 'Object-Oriented Architecture & Design Patterns',
    },
  ],
}

export const DEV_MOCK_DAILY_ACTIVITY = {
  streak_count: 12,
  completed_tasks: ['lesson'],
  freeze_available: true,
  daily_goal_xp: 100,
  earned_today_xp: 50,
}

export const DEV_MOCK_CATALOG = [
  {
    id: 101,
    title: 'Full Stack Developer Roadmap',
    description: 'Master frontend, backend, database systems, and modern architecture.',
    category: 'Full Stack',
    difficulty: 'Intermediate',
    total_steps: 6,
  },
  {
    id: 102,
    title: 'Python & AI Engineering',
    description: 'From syntax to neural networks and LLM agentic systems.',
    category: 'AI & Data',
    difficulty: 'All Levels',
    total_steps: 8,
  },
  {
    id: 103,
    title: 'Cloud & Distributed Systems',
    description: 'Docker, Kubernetes, cloud native deployments, and reliability.',
    category: 'DevOps',
    difficulty: 'Advanced',
    total_steps: 5,
  },
]

export const DEV_MOCK_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Task API',
    technologies: ['Node.js', 'Express', 'PostgreSQL'],
    status: 'in_progress',
    progress: 60,
  },
  {
    id: 'proj-2',
    title: 'Chat Client',
    technologies: ['React', 'WebSockets', 'Tailwind'],
    status: 'in_progress',
    progress: 33,
  },
]

export const SKILL_CATEGORIES = [
  'All Tracks',
  'AI & Machine Learning',
  'Web Development',
  'Data & Automation',
];

export const SKILLS = [
  {
    id: 'ai-prompt-engineering',
    title: 'Prompt Engineering & AI Foundations',
    category: 'AI & Machine Learning',
    level: 'Absolute Beginner',
    duration: '2-3 weeks',
    description:
      'Learn how modern LLMs actually parse instructions. Move from erratic typing to structured system prompts, few-shot conditioning, and dependable automated workflows.',
    topics: ['LLM Reasoning', 'System Prompts', 'Few-Shot Conditioning', 'Tool Calling'],
    icon: 'Sparkles',
    popular: true,
  },
  {
    id: 'python-for-beginners',
    title: 'Python for Smart Beginners',
    category: 'Core Programming',
    level: 'Beginner',
    duration: '4 weeks',
    description:
      'Write clean, readable code with immediate mental clarity. Master algorithmic thinking, data structures, and external API integrations without terminal roadblocks.',
    topics: ['Variables & Logic', 'Data Structures', 'REST APIs', 'Automation Scripts'],
    icon: 'Terminal',
    popular: true,
  },
  {
    id: 'modern-web-development',
    title: 'Modern Web & React Essentials',
    category: 'Web Development',
    level: 'Beginner to Intermediate',
    duration: '5 weeks',
    description:
      'Turn static ideas into living, reactive interfaces. Build modular component hierarchies, manage dynamic state with hooks, and craft responsive user experiences.',
    topics: ['Component Design', 'State & Hooks', 'Modern CSS', 'Interactive UI'],
    icon: 'Layout',
    popular: false,
  },
  {
    id: 'data-analytics-automation',
    title: 'Data Insights & Automated Workflows',
    category: 'Data & Automation',
    level: 'Beginner',
    duration: '3 weeks',
    description:
      'Turn messy spreadsheets into automated intelligence pipelines. Clean real datasets, visualize trend lines, and trigger hands-off automated workflows.',
    topics: ['Data Pipelines', 'Visual Analytics', 'Webhook Triggers', 'Automated Reports'],
    icon: 'BarChart3',
    popular: false,
  },
];

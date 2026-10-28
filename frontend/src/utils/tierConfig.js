/**
 * Developer Tier Configurations and Gamification Progression for Technea
 */

export const TIER_CONFIGS = {
  'Staff Platform Engineer': {
    name: 'Staff Platform Engineer',
    gradient: 'from-white via-neutral-200 to-neutral-400',
    ring: 'shadow-[0_0_20px_rgba(255,255,255,0.22)] ring-1 ring-white/60',
    pill: 'border-white/20 bg-white/[0.08] text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]',
    accentText: 'text-white font-bold',
    badgeBg: 'bg-white/[0.08] text-white border-white/20',
  },
  'Full Stack Architect': {
    name: 'Full Stack Architect',
    gradient: 'from-neutral-100 via-neutral-300 to-neutral-500',
    ring: 'shadow-[0_0_16px_rgba(255,255,255,0.16)] ring-1 ring-neutral-300/50',
    pill: 'border-white/15 bg-white/[0.06] text-neutral-200 shadow-[0_0_10px_rgba(255,255,255,0.06)]',
    accentText: 'text-neutral-200 font-semibold',
    badgeBg: 'bg-white/[0.06] text-neutral-200 border-white/15',
  },
  'Senior Systems Engineer': {
    name: 'Senior Systems Engineer',
    gradient: 'from-neutral-200 via-neutral-400 to-neutral-600',
    ring: 'shadow-[0_0_14px_rgba(255,255,255,0.12)] ring-1 ring-neutral-400/40',
    pill: 'border-white/10 bg-white/[0.05] text-neutral-300',
    accentText: 'text-neutral-300 font-medium',
    badgeBg: 'bg-white/[0.05] text-neutral-300 border-white/10',
  },
  'Full Stack Engineer': {
    name: 'Full Stack Engineer',
    gradient: 'from-neutral-300 via-neutral-400 to-neutral-600',
    ring: 'shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-neutral-500/40',
    pill: 'border-white/10 bg-white/[0.04] text-neutral-300',
    accentText: 'text-neutral-300',
    badgeBg: 'bg-white/[0.04] text-neutral-300 border-white/10',
  },
  'Full Stack Craftsman': {
    name: 'Full Stack Craftsman',
    gradient: 'from-neutral-400 via-neutral-500 to-neutral-700',
    ring: 'ring-1 ring-neutral-600/40',
    pill: 'border-white/10 bg-white/[0.04] text-neutral-300',
    accentText: 'text-neutral-300',
    badgeBg: 'bg-white/[0.04] text-neutral-300 border-white/10',
  },
  'Junior Developer': {
    name: 'Junior Developer',
    gradient: 'from-neutral-400 via-neutral-600 to-neutral-800',
    ring: 'ring-1 ring-neutral-700/40',
    pill: 'border-white/10 bg-white/[0.03] text-neutral-400',
    accentText: 'text-neutral-400',
    badgeBg: 'bg-white/[0.03] text-neutral-400 border-white/10',
  },
  'Code Initiate': {
    name: 'Code Initiate',
    gradient: 'from-neutral-500 via-neutral-700 to-neutral-900',
    ring: 'ring-1 ring-neutral-800/40',
    pill: 'border-white/10 bg-white/[0.03] text-neutral-400',
    accentText: 'text-neutral-400',
    badgeBg: 'bg-white/[0.03] text-neutral-400 border-white/10',
  },
}

export function getTierConfig(tierName) {
  if (!tierName) return TIER_CONFIGS['Junior Developer']
  return TIER_CONFIGS[tierName] || TIER_CONFIGS['Junior Developer']
}

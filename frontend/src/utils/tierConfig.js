/**
 * Developer Tier Configurations and Gamification Progression for Technea
 */

export const TIER_CONFIGS = {
  'Staff Platform Engineer': {
    name: 'Staff Platform Engineer',
    gradient: 'from-slate-100 via-slate-300 to-indigo-300',
    ring: 'shadow-[0_0_24px_rgba(203,213,225,0.4)] ring-2 ring-slate-300/60',
    pill: 'border-slate-300/30 bg-slate-900/60 text-slate-200 shadow-[0_0_12px_rgba(203,213,225,0.15)]',
    accentText: 'text-slate-200',
    badgeBg: 'bg-slate-800/40 text-slate-200 border-slate-400/30',
  },
  'Full Stack Architect': {
    name: 'Full Stack Architect',
    gradient: 'from-amber-400 via-orange-500 to-yellow-400',
    ring: 'shadow-[0_0_30px_rgba(245,158,11,0.45)] ring-2 ring-amber-500/60',
    pill: 'border-amber-500/30 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-900/30 text-amber-300 border-amber-500/30',
  },
  'Senior Systems Engineer': {
    name: 'Senior Systems Engineer',
    gradient: 'from-cyan-400 via-teal-400 to-blue-500',
    ring: 'shadow-[0_0_26px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/60',
    pill: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    accentText: 'text-cyan-400',
    badgeBg: 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30',
  },
  'Full Stack Engineer': {
    name: 'Full Stack Engineer',
    gradient: 'from-blue-400 via-indigo-500 to-sky-400',
    ring: 'shadow-[0_0_22px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/50',
    pill: 'border-blue-500/30 bg-blue-950/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
  },
  'Full Stack Craftsman': {
    name: 'Full Stack Craftsman',
    gradient: 'from-emerald-400 via-teal-400 to-green-500',
    ring: 'shadow-[0_0_22px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/50',
    pill: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30',
  },
  'Junior Developer': {
    name: 'Junior Developer',
    gradient: 'from-sky-400 via-slate-300 to-blue-500',
    ring: 'shadow-[0_0_18px_rgba(56,189,248,0.3)] ring-2 ring-sky-500/40',
    pill: 'border-sky-500/30 bg-sky-950/30 text-sky-300',
    accentText: 'text-sky-400',
    badgeBg: 'bg-sky-900/30 text-sky-300 border-sky-500/30',
  },
  'Code Initiate': {
    name: 'Code Initiate',
    gradient: 'from-neutral-400 via-zinc-300 to-neutral-500',
    ring: 'shadow-[0_0_14px_rgba(163,163,163,0.25)] ring-2 ring-neutral-500/40',
    pill: 'border-neutral-600/40 bg-neutral-900/60 text-neutral-300',
    accentText: 'text-neutral-300',
    badgeBg: 'bg-neutral-800/40 text-neutral-300 border-neutral-700/40',
  },
}

export function getTierConfig(tierName) {
  if (!tierName) return TIER_CONFIGS['Junior Developer']
  return TIER_CONFIGS[tierName] || TIER_CONFIGS['Junior Developer']
}

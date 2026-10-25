import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { TechneaIcon } from '../layout/TechneaLogo';

export default function PWAInstallBanner() {
  const { isInstallable, promptToInstall, dismissPrompt } = useInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto animate-fade-in"
    >
      <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#0B0D14]/95 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,235,255,0.15)] ring-1 ring-white/5">
        <div className="shrink-0 relative">
          <TechneaIcon size={38} />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white tracking-tight">Install Technea</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              App
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">
            Fast, offline-ready AI learning
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={promptToInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>

          <button
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss install prompt"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

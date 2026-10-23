import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function ReactUseGsapExample() {
  const container = useRef(null)
  const [counter, setCounter] = useState(0)

  // Scoped entrance timeline
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.header-title', { y: -30, opacity: 0, duration: 0.8 })
      .from('.badge', { scale: 0, opacity: 0, ease: 'back.out(2)' }, '-=0.4')
      .from('.stat-box', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
      }, '-=0.2')
  }, { scope: container })

  // Safe interactive event handler
  const { contextSafe } = useGSAP({ scope: container })

  const handlePulse = contextSafe(() => {
    setCounter((prev) => prev + 1)
    gsap.fromTo(
      '.counter-display',
      { scale: 0.8, color: '#38bdf8' },
      { scale: 1, color: '#ffffff', duration: 0.4, ease: 'back.out(3)' }
    )
  })

  return (
    <div ref={container} className="p-8 bg-neutral-950 text-white rounded-2xl max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="header-title text-xl font-bold">Metrics Overview</h2>
        <span className="badge px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="stat-box p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-400">Total Clicks</p>
          <p className="counter-display text-2xl font-black mt-1">{counter}</p>
        </div>
        <div className="stat-box p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-400">Status</p>
          <p className="text-2xl font-black mt-1 text-emerald-400">Active</p>
        </div>
      </div>

      <button
        onClick={handlePulse}
        className="mt-6 w-full py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
      >
        Trigger Pulse
      </button>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import Snap from 'lenis/snap'
import 'lenis/dist/lenis.css'

export default function SnapSectionsPage() {
  const lenisRef = useRef(null)
  const snapRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    // Initialize Snap on the Lenis instance
    const snap = new Snap(lenis, {
      type: 'mandatory', // 'proximity' | 'mandatory' | 'lock'
      debounce: 300,
    })
    snapRef.current = snap

    // Add all section elements to snap
    const sections = containerRef.current?.querySelectorAll('.snap-panel')
    if (sections) {
      snap.addElements(Array.from(sections), {
        align: 'start',
      })
    }

    return () => {
      snap.stop()
    }
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, autoRaf: true }}>
      <div ref={containerRef} className="bg-black text-white">
        <section className="snap-panel h-screen flex flex-col items-center justify-center border-b border-neutral-800">
          <h1 className="text-5xl font-black mb-2">Section 01</h1>
          <p className="text-neutral-400 font-mono">Scroll down to trigger snap</p>
        </section>

        <section className="snap-panel h-screen flex flex-col items-center justify-center border-b border-neutral-800 bg-neutral-950">
          <h1 className="text-5xl font-black mb-2">Section 02</h1>
          <p className="text-neutral-400 font-mono">Snaps directly to section top</p>
        </section>

        <section className="snap-panel h-screen flex flex-col items-center justify-center bg-black">
          <h1 className="text-5xl font-black mb-2">Section 03</h1>
          <p className="text-neutral-400 font-mono">CSS scroll snap aligned with Lenis</p>
        </section>
      </div>
    </ReactLenis>
  )
}

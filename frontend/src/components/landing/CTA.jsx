import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// ─────────────────────────────────────────────────────────────────────────────
// Page 4: Cinematic Immersive Technea Section
// Inspired by CRED and Apple.
// Deep matte black. Volumetric lighting. Realistic glass spheres containing
// distinct 3D technology objects floating with physics and mouse parallax.
// ─────────────────────────────────────────────────────────────────────────────

// ── 3D Procedural Tech Objects ───────────────────────────────────────────────

function createAIChip() {
  const group = new THREE.Group()
  const subMat = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.6, metalness: 0.4 })
  const substrate = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.06, 0.88), subMat)
  group.add(substrate)

  const dieMat = new THREE.MeshStandardMaterial({ color: 0xe2e6ec, roughness: 0.12, metalness: 0.96 })
  const die = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), dieMat)
  die.position.y = 0.04
  group.add(die)

  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.95 })
  const pinGeo = new THREE.BoxGeometry(0.04, 0.025, 0.09)
  for (let i = -3; i <= 3; i++) {
    const offset = i * 0.11
    const p1 = new THREE.Mesh(pinGeo, pinMat)
    p1.position.set(offset, 0, 0.46)
    group.add(p1)
    const p2 = new THREE.Mesh(pinGeo, pinMat)
    p2.position.set(offset, 0, -0.46)
    group.add(p2)
    const p3 = new THREE.Mesh(pinGeo, pinMat)
    p3.rotation.y = Math.PI / 2
    p3.position.set(0.46, 0, offset)
    group.add(p3)
    const p4 = new THREE.Mesh(pinGeo, pinMat)
    p4.rotation.y = Math.PI / 2
    p4.position.set(-0.46, 0, offset)
    group.add(p4)
  }
  return group
}

function createLaptop() {
  const group = new THREE.Group()
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc4c8d0, roughness: 0.2, metalness: 0.92 })
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.1, metalness: 0.4 })

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.035, 0.62), metalMat)
  group.add(base)

  const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e2025, roughness: 0.8, metalness: 0.1 })
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.01, 0.28), kbMat)
  kb.position.set(0, 0.02, -0.07)
  group.add(kb)

  const lidGroup = new THREE.Group()
  lidGroup.position.set(0, 0.02, -0.31)
  lidGroup.rotation.x = -Math.PI * 0.36
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.6, 0.025), metalMat)
  lid.position.set(0, 0.3, 0)
  lidGroup.add(lid)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.01), screenMat)
  screen.position.set(0, 0.3, 0.012)
  lidGroup.add(screen)

  group.add(lidGroup)
  return group
}

function createReactAtom() {
  const group = new THREE.Group()
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.98 })
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), coreMat)
  group.add(core)

  const ringMat = new THREE.MeshStandardMaterial({ color: 0xd0d7e2, roughness: 0.15, metalness: 0.88 })
  const ringGeo = new THREE.TorusGeometry(0.52, 0.02, 16, 64)

  const r1 = new THREE.Mesh(ringGeo, ringMat)
  r1.rotation.x = Math.PI / 3
  group.add(r1)

  const r2 = new THREE.Mesh(ringGeo, ringMat)
  r2.rotation.x = -Math.PI / 3
  r2.rotation.y = Math.PI / 4
  group.add(r2)

  const r3 = new THREE.Mesh(ringGeo, ringMat)
  r3.rotation.y = Math.PI / 2
  r3.rotation.x = Math.PI / 6
  group.add(r3)

  const beadMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 1.0 })
  const beadGeo = new THREE.SphereGeometry(0.045, 16, 16)
  const b1 = new THREE.Mesh(beadGeo, beadMat); b1.position.set(0.52, 0, 0); r1.add(b1)
  const b2 = new THREE.Mesh(beadGeo, beadMat); b2.position.set(-0.52, 0, 0); r2.add(b2)
  const b3 = new THREE.Mesh(beadGeo, beadMat); b3.position.set(0, 0.52, 0); r3.add(b3)

  return group
}

function createNeuralNet() {
  const group = new THREE.Group()
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.95 })
  const nodeGeo = new THREE.SphereGeometry(0.07, 16, 16)

  const layers = [
    [{ x: -0.42, y: 0.24 }, { x: -0.42, y: -0.24 }],
    [{ x: 0, y: 0.38 }, { x: 0, y: 0 }, { x: 0, y: -0.38 }],
    [{ x: 0.42, y: 0.24 }, { x: 0.42, y: -0.24 }],
  ]

  const lineMat = new THREE.LineBasicMaterial({ color: 0xa0abbc, transparent: true, opacity: 0.45 })
  const points = []

  layers.forEach((layer, lIdx) => {
    layer.forEach((n) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.set(n.x, n.y, 0)
      group.add(node)
      if (lIdx < layers.length - 1) {
        layers[lIdx + 1].forEach((nextN) => {
          points.push(new THREE.Vector3(n.x, n.y, 0), new THREE.Vector3(nextN.x, nextN.y, 0))
        })
      }
    })
  })

  const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
  const lines = new THREE.LineSegments(lineGeo, lineMat)
  group.add(lines)

  return group
}

function createCloud() {
  const group = new THREE.Group()
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xeff2f7, roughness: 0.35, metalness: 0.18 })

  const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), cloudMat)
  s1.position.set(0, 0.04, 0)
  group.add(s1)

  const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), cloudMat)
  s2.position.set(-0.25, -0.04, 0)
  group.add(s2)

  const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), cloudMat)
  s3.position.set(0.25, -0.05, 0)
  group.add(s3)

  const s4 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), cloudMat)
  s4.position.set(-0.1, 0.15, 0.04)
  group.add(s4)

  const s5 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), cloudMat)
  s5.position.set(0.12, 0.13, 0.04)
  group.add(s5)

  return group
}

function createTerminal() {
  const group = new THREE.Group()
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.45, metalness: 0.4 })
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.54, 0.035), frameMat)
  group.add(frame)

  const dotMat = new THREE.MeshStandardMaterial({ color: 0x9aa2af, roughness: 0.2, metalness: 0.7 })
  for (let i = 0; i < 3; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), dotMat)
    dot.position.set(-0.32 + i * 0.065, 0.2, 0.022)
    group.add(dot)
  }

  const cursorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 })
  const cursor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.015), cursorMat)
  cursor.position.set(-0.24, 0.07, 0.022)
  group.add(cursor)

  const barMat = new THREE.MeshStandardMaterial({ color: 0x565c66, roughness: 0.5, metalness: 0.2 })
  const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.025, 0.01), barMat)
  bar1.position.set(-0.06, -0.03, 0.022)
  group.add(bar1)

  const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.01), barMat)
  bar2.position.set(0.0, -0.12, 0.022)
  group.add(bar2)

  return group
}

function createGradCap() {
  const group = new THREE.Group()
  const capMat = new THREE.MeshStandardMaterial({ color: 0x161719, roughness: 0.55, metalness: 0.3 })
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.95 })

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.025, 0.76), capMat)
  top.rotation.y = Math.PI / 4
  top.position.y = 0.1
  group.add(top)

  const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.2, 24), capMat)
  skull.position.y = -0.02
  group.add(skull)

  const btn = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), goldMat)
  btn.position.y = 0.12
  group.add(btn)

  const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.025), goldMat)
  tassel.position.set(0.36, 0.01, 0)
  group.add(tassel)

  return group
}

function createChatBubble() {
  const group = new THREE.Group()
  const bubbleMat = new THREE.MeshStandardMaterial({ color: 0x1f2127, roughness: 0.35, metalness: 0.4 })
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.92 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.46, 0.1), bubbleMat)
  group.add(body)

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), bubbleMat)
  tail.rotation.z = Math.PI * 0.75
  tail.position.set(-0.28, -0.24, 0)
  group.add(tail)

  for (let i = -1; i <= 1; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), dotMat)
    dot.position.set(i * 0.15, 0, 0.055)
    group.add(dot)
  }

  return group
}

// ── Cinematic Three.js Glass Spheres Scene ───────────────────────────────────

function CinematicScene({ containerRef }) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = null

    const W = container.clientWidth
    const H = container.clientHeight

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200)
    camera.position.set(0, 0, 18)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // ── Studio IBL Environment for Optical Glass Reflections ─────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const envScene = new RoomEnvironment()
    const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture
    scene.environment = envTexture
    pmremGenerator.dispose()

    // ── Volumetric Key & Rim Lighting ───────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.45))

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6)
    keyLight.position.set(9, 13, 11)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xcfd8ff, 1.6)
    rimLight.position.set(-11, -7, -9)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight(0xffffff, 1.2, 70)
    fillLight.position.set(0, 6, 14)
    scene.add(fillLight)

    // ── Sphere Configurations (Leaving Central Text Zone Unobstructed) ──────
    const SPHERE_CONFIGS = [
      { pos: [-7.0, 3.4, -2.0], radius: 1.35, speed: 0.28, phase: 0.0, factory: createAIChip },
      { pos: [7.0, 3.2, -2.2], radius: 1.25, speed: 0.24, phase: 1.2, factory: createReactAtom },
      { pos: [-7.2, -3.4, -1.8], radius: 1.3, speed: 0.21, phase: 2.4, factory: createLaptop },
      { pos: [6.6, -3.5, -2.0], radius: 1.25, speed: 0.25, phase: 0.8, factory: createNeuralNet },
      { pos: [-3.8, 5.8, -3.5], radius: 1.05, speed: 0.3, phase: 1.9, factory: createCloud },
      { pos: [4.0, 5.4, -3.2], radius: 1.0, speed: 0.27, phase: 3.2, factory: createTerminal },
      { pos: [-8.4, 0.2, -4.0], radius: 1.0, speed: 0.32, phase: 0.5, factory: createGradCap },
      { pos: [8.2, 0.3, -3.8], radius: 0.95, speed: 0.29, phase: 2.1, factory: createChatBubble },
    ]

    // ── Build Glass Spheres with Inner 3D Objects ────────────────────────────
    const sphereObjects = SPHERE_CONFIGS.map(({ pos, radius, speed, phase, factory }) => {
      const group = new THREE.Group()
      group.position.set(...pos)
      scene.add(group)

      // Outer Realistic Glass Shell
      const geoOuter = new THREE.SphereGeometry(radius, 48, 48)
      const matGlass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.04,
        transmission: 0.94,
        thickness: radius * 1.6,
        ior: 1.48,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        transparent: true,
        opacity: 0.85,
        envMapIntensity: 1.8,
        attenuationColor: new THREE.Color(0xdce7f5),
        attenuationDistance: radius * 3.5,
      })
      const shellMesh = new THREE.Mesh(geoOuter, matGlass)
      group.add(shellMesh)

      // Internal 3D Technology Object
      const innerObj = factory()
      innerObj.scale.setScalar(radius * 0.72)
      group.add(innerObj)

      return { group, innerObj, speed, phase, basePos: [...pos] }
    })

    // ── Floating Subtle Dust Particles ───────────────────────────────────────
    const particleCount = 110
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 32
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 22
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: 0.28,
      sizeAttenuation: true,
    })
    scene.add(new THREE.Points(particleGeo, particleMat))

    // ── Subtle Mouse Parallax ────────────────────────────────────────────────
    let mouseNX = 0
    let mouseNY = 0
    let targetMX = 0
    let targetMY = 0
    let currentMX = 0
    let currentMY = 0

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseNX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseNY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetMX = mouseNX * 0.5
      targetMY = mouseNY * 0.35
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // ── Window Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Intersection Observer ────────────────────────────────────────────────
    let isVisible = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    // ── Render & Animation Loop ──────────────────────────────────────────────
    let rafId
    const clock = new THREE.Clock()

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return

      const t = clock.getElapsedTime()

      // Smooth parallax interpolation
      currentMX += (targetMX - currentMX) * 0.04
      currentMY += (targetMY - currentMY) * 0.04

      // Independent movement of spheres + rotation of inner 3D objects
      sphereObjects.forEach(({ group, innerObj, speed, phase, basePos }) => {
        const floatY = Math.sin(t * speed + phase) * 0.48
        const floatX = Math.cos(t * speed * 0.65 + phase) * 0.22

        group.position.x = basePos[0] + floatX + currentMX * 0.35
        group.position.y = basePos[1] + floatY + currentMY * 0.25
        group.position.z = basePos[2]

        // Continuous slow 3D rotation of inner object
        innerObj.rotation.y = t * speed * 0.75 + phase
        innerObj.rotation.x = Math.sin(t * speed * 0.45 + phase) * 0.25
      })

      renderer.render(scene, camera)
    }

    animate()

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
      envTexture.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      sphereObjects.forEach(({ group }) => {
        group.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (obj.material.map) obj.material.map.dispose()
            obj.material.dispose()
          }
        })
      })
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [containerRef])

  return null
}

// ── Floating Premium White Product Card ──────────────────────────────────────

function FloatingCard() {
  return (
    <a
      href="#hero-search"
      className="
        group block
        bg-white text-neutral-950
        px-8 py-7
        border border-neutral-200/90
        shadow-[0_20px_50px_rgba(0,0,0,0.55)]
        hover:shadow-[0_28px_65px_rgba(0,0,0,0.7)]
        hover:-translate-y-1.5
        transition-all duration-300 ease-out
        cursor-pointer select-none
        min-w-[180px]
      "
      style={{ borderRadius: 0 }}
      aria-label="Start Learning"
    >
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-2.5">
          Free forever
        </span>
        <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 leading-tight">
          Start Learning
        </span>
        <span
          className="mt-4 text-xl text-neutral-400 group-hover:text-neutral-950 group-hover:translate-y-1 transition-all duration-200 font-light"
          aria-hidden="true"
        >
          &darr;
        </span>
      </div>
    </a>
  )
}

// ── Main Page 4 Section ──────────────────────────────────────────────────────

export default function CTA() {
  const canvasRef = useRef(null)

  return (
    <section
      id="cta"
      className="relative w-full overflow-hidden bg-[#080808]"
      style={{ minHeight: '100svh' }}
    >
      {/* Three.js 3D Cinematic Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 z-0 select-none"
        aria-hidden="true"
      >
        <CinematicScene containerRef={canvasRef} />
      </div>

      {/* Subtle Cinematic Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10 select-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, rgba(8,8,8,0.75) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Visually Centered Content */}
      <div className="relative z-20 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center select-none">
        {/* Eyebrow Label */}
        <p className="mb-7 font-mono text-[11px] uppercase tracking-[0.35em] text-white/35">
          Begin your journey
        </p>

        {/* Headline: Elegant Serif, Bold, White, Exactly 2 lines */}
        <h2
          className="font-serif font-bold text-white leading-[1.08] tracking-[-0.025em]"
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', 'Canela', 'Georgia', serif",
            fontSize: 'clamp(2.8rem, 7.2vw, 5.8rem)',
          }}
        >
          Learn smarter.
          <br />
          Build faster.
        </h2>

        {/* Minimal Divider */}
        <div className="mx-auto mt-9 h-px w-10 bg-white/20" />

        {/* Subtitle: Modern Sans, Muted White, Centered, Max 650px */}
        <p
          className="mx-auto mt-7 font-sans text-base leading-relaxed text-white/55"
          style={{
            maxWidth: '650px',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
          }}
        >
          Personalized AI roadmaps that help beginners learn technology one clear step at a time.
        </p>
      </div>

      {/* Floating Premium White Product Card: Bottom-Right Corner */}
      <div className="absolute bottom-10 right-10 lg:bottom-14 lg:right-14 z-30 hidden sm:block">
        <FloatingCard />
      </div>

      {/* Responsive Mobile Card Fallback: Bottom-Center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 sm:hidden w-[90%] max-w-xs">
        <a
          href="#hero-search"
          className="block w-full border border-white/25 bg-white/10 px-6 py-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Start Learning &darr;
        </a>
      </div>
    </section>
  )
}

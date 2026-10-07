import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeCubeBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── 1. Scene, Camera, Renderer ──────────────────────────────────────────
    const scene = new THREE.Scene()

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)
    camera.position.set(0, 0, 8.5)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    container.appendChild(renderer.domElement)

    // ── 2. Geometric Cube & Precision Materials (Apple-Style Titanium) ───
    const cubeGroup = new THREE.Group()

    // Moved closer to center (subtle 0.35 offset on desktop, centered on mobile)
    let isDesktop = width > 1024
    let targetPosX = isDesktop ? 0.35 : 0
    let targetPosY = isDesktop ? 0.1 : 0
    cubeGroup.position.set(targetPosX, targetPosY, 0)
    scene.add(cubeGroup)

    // Outer Solid Metallic Cube: Reduced size (~2.6), increased contrast and highlights
    const boxGeometry = new THREE.BoxGeometry(2.6, 2.6, 2.6)
    const boxMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb0b8c4, // crisp titanium/silver tone
      metalness: 0.94, // high metallic sheen
      roughness: 0.14, // crisp specular reflections
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.44, // refined visibility without overpowering text
      reflectivity: 0.95,
    })
    const mainCube = new THREE.Mesh(boxGeometry, boxMaterial)
    cubeGroup.add(mainCube)

    // Precision Edges (Milled aluminum hairline highlight)
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry)
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6, // clear, crisp edge highlights
    })
    const edgeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    cubeGroup.add(edgeLines)

    // Inner Floating Geometric Core: Proportionately reduced (1.25)
    const innerGeometry = new THREE.BoxGeometry(1.25, 1.25, 1.25)
    const innerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.08,
      transparent: true,
      opacity: 0.28,
    })
    const innerCube = new THREE.Mesh(innerGeometry, innerMaterial)
    cubeGroup.add(innerCube)

    // ── 3. High-Contrast Studio Lighting (Crisp Metallic Reflections) ────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    // Strong Key Light for specular facets
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.9)
    keyLight.position.set(5.5, 7.5, 6.5)
    scene.add(keyLight)

    // Sharp Rim Light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8)
    rimLight.position.set(-6, -5, -4)
    scene.add(rimLight)

    // Top Specular Light
    const topLight = new THREE.PointLight(0xffffff, 1.8, 25)
    topLight.position.set(0, 8, 4)
    scene.add(topLight)

    // ── 4. Mouse Tracking & Smooth Parallax ────────────────────────────────
    let mouseX = 0
    let mouseY = 0
    let targetTiltX = 0
    let targetTiltY = 0
    let currentTiltX = 0
    let currentTiltY = 0

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

      // Natural, restrained tilt targets
      targetTiltX = -mouseY * 0.28
      targetTiltY = mouseX * 0.38
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // ── 5. Resize Handling ────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight

      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      isDesktop = w > 1024
      targetPosX = isDesktop ? 0.35 : 0
      targetPosY = isDesktop ? 0.1 : 0
      cubeGroup.position.x = targetPosX
    }

    window.addEventListener('resize', handleResize)

    // ── 6. Intersection Observer (Pause rendering when off-screen) ────────
    let isVisible = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    // ── 7. Animation Loop ─────────────────────────────────────────────────
    let animationFrameId
    let baseRotationX = 0.4
    let baseRotationY = 0.6
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisible) return

      const elapsedTime = clock.getElapsedTime()

      // Slow, cinematic continuous rotation
      baseRotationX += 0.0016
      baseRotationY += 0.0026

      // Smooth parallax damping (lerp)
      currentTiltX += (targetTiltX - currentTiltX) * 0.04
      currentTiltY += (targetTiltY - currentTiltY) * 0.04

      // Apply combined rotation
      cubeGroup.rotation.x = baseRotationX + currentTiltX
      cubeGroup.rotation.y = baseRotationY + currentTiltY

      // Counter-rotation on inner core
      innerCube.rotation.x = -baseRotationX * 1.5
      innerCube.rotation.y = -baseRotationY * 1.5

      // Gentle floating breathing translation around center position
      cubeGroup.position.x = targetPosX
      cubeGroup.position.y = targetPosY + Math.sin(elapsedTime * 0.6) * 0.1

      renderer.render(scene, camera)
    }

    animate()

    // ── 8. Complete Cleanup ───────────────────────────────────────────────
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      cancelAnimationFrame(animationFrameId)

      boxGeometry.dispose()
      boxMaterial.dispose()
      edgesGeometry.dispose()
      edgesMaterial.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      renderer.dispose()

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    />
  )
}

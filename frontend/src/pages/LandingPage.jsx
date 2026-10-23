import { motion } from 'framer-motion'
import Hero from '../components/landing/Hero'
import CareerShowcase from '../components/landing/CareerShowcase'
import LearningCompanion from '../components/landing/LearningCompanion'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import CTA from '../components/landing/CTA'

const sectionScrollAnim = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
}

export default function LandingPage() {
  return (
    <main className="flex-1">
      <Hero />
      <motion.div {...sectionScrollAnim}>
        <CareerShowcase />
      </motion.div>
      <motion.div {...sectionScrollAnim}>
        <LearningCompanion />
      </motion.div>
      <motion.div {...sectionScrollAnim}>
        <Features />
      </motion.div>
      <motion.div {...sectionScrollAnim}>
        <HowItWorks />
      </motion.div>
      <motion.div {...sectionScrollAnim}>
        <CTA />
      </motion.div>
    </main>
  )
}

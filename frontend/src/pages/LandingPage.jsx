import Hero from '../components/landing/Hero'
import CareerShowcase from '../components/landing/CareerShowcase'
import LearningCompanion from '../components/landing/LearningCompanion'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import CTA from '../components/landing/CTA'

export default function LandingPage() {
  return (
    <main className="flex-1">
      <Hero />
      <CareerShowcase />
      <LearningCompanion />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  )
}

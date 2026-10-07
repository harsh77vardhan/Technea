import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import Footer from './components/layout/Footer'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
      <Navbar />
      <LandingPage />
      <Footer />
    </div>
  )
}

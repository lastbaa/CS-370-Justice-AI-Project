import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ValueProps from './components/ValueProps'
import HowItWorks from './components/HowItWorks'
import Download from './components/Download'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Hero />
      <ValueProps />
      <HowItWorks />
      <Download />
      <Footer />
    </main>
  )
}

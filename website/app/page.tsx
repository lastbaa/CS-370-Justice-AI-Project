import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { Marquee } from './components/Marquee'
import ValueProps from './components/ValueProps'
import HowItWorks from './components/HowItWorks'
import Download from './components/Download'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#080808' }}>
      <Navbar />
      <Hero />
      <Marquee />
      <ValueProps />
      <HowItWorks />
      <Download />
      <Footer />
    </main>
  )
}

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { Marquee } from './components/Marquee'
import ProductDemo from './components/ProductDemo'
import ValueProps from './components/ValueProps'
import Compare from './components/Compare'
import UseCases from './components/UseCases'
import HowItWorks from './components/HowItWorks'
import Download from './components/Download'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#080808' }}>
      <Navbar />
      <Hero />
      <Marquee />
      <ProductDemo />
      <ValueProps />
      <Compare />
      <UseCases />
      <HowItWorks />
      <Download />
      <Footer />
    </main>
  )
}

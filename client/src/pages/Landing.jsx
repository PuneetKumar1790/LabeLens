import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { LiveCta } from '../components/LiveCta'
import { FeatureGrid } from '../components/FeatureGrid'
import { SampleCards } from '../components/SampleCards'
import { Footer } from '../components/Footer'

export const Landing = () => (
  <div className="min-h-screen bg-bg text-text-1">
    <Navbar />
    <main>
      <Hero />
      <HowItWorks />
      <LiveCta />
      <FeatureGrid />
      <SampleCards />
    </main>
    <Footer />
  </div>
)

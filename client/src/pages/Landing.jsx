import { SEO } from '../components/SEO'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { LiveCta } from '../components/LiveCta'
import { FeatureGrid } from '../components/FeatureGrid'
import { SampleCards } from '../components/SampleCards'
import { FAQ } from '../components/FAQ'
import { Footer } from '../components/Footer'

export const Landing = () => (
  <div className="min-h-screen bg-bg text-text-1">
    <SEO
      title="LabelLens — AI Food Label Scanner & Nutrition Health Score"
      description="Scan any packaged food label with AI. Instantly decode hidden sugars, harmful additives, and E-numbers with a clear 1-10 health rating. 100% free."
      canonicalPath="/"
    />
    <Navbar />
    <main>
      <Hero />
      <HowItWorks />
      <LiveCta />
      <FeatureGrid />
      <SampleCards />
      <FAQ />
    </main>
    <Footer />
  </div>
)


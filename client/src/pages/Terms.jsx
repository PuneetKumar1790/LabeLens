import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export const Terms = () => {
  return (
    <div className="min-h-screen bg-bg text-text-1 flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="font-serif text-4xl mb-8">Terms of Service</h1>
        <div className="space-y-6 font-syne text-text-2 leading-relaxed">
          <p>Effective Date: June 2026</p>
          <h2 className="text-xl font-bold text-text-1 mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or using LabelLens, you agree to be bound by these Terms of Service. 
            If you do not agree, please do not use the service.
          </p>
          <h2 className="text-xl font-bold text-text-1 mt-8">2. Not Medical Advice</h2>
          <p>
            LabelLens relies on artificial intelligence to analyze food labels and ingredients. 
            The information provided is for educational and informational purposes only and 
            does not constitute medical advice. Always consult a healthcare professional 
            regarding dietary changes or severe allergies.
          </p>
          <h2 className="text-xl font-bold text-text-1 mt-8">3. Accuracy of Information</h2>
          <p>
            While we strive for accuracy, AI analysis can sometimes misinterpret labels or 
            miss hidden ingredients. You should always manually verify ingredients if you 
            have severe or life-threatening allergies. LabelLens is not liable for health 
            consequences resulting from reliance on the app's analysis.
          </p>
          <h2 className="text-xl font-bold text-text-1 mt-8">4. User Conduct</h2>
          <p>
            You agree to use the service only for lawful purposes and not to attempt to 
            compromise the security of the application or exploit it.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

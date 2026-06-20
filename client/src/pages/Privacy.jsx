import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-bg text-text-1 flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="font-serif text-4xl mb-8">Privacy Policy</h1>
        <div className="space-y-6 font-syne text-text-2 leading-relaxed">
          <p>Effective Date: June 2026</p>
          <h2 className="text-xl font-bold text-text-1 mt-8">1. Information We Collect</h2>
          <p>
            When you use LabelLens, we may collect information about the products you scan, 
            your dietary preferences, and basic account details if you choose to sign in with Google.
          </p>
          <h2 className="text-xl font-bold text-text-1 mt-8">2. How We Use Your Information</h2>
          <p>
            We use your data to provide personalized health scores, detect allergens, and 
            maintain a history of your scans. We do not sell your personal data to third parties.
          </p>
          <h2 className="text-xl font-bold text-text-1 mt-8">3. Data Storage and Security</h2>
          <p>
            If you enable cloud storage, images of product labels you scan are securely stored 
            in the cloud. You can opt out of this feature in your Settings. 
            All communication with our servers is encrypted.
          </p>
          <h2 className="text-xl font-bold text-text-1 mt-8">4. Account Deletion</h2>
          <p>
            You have the right to delete your account and all associated data at any time 
            via the Settings page. This action is permanent and cannot be undone.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

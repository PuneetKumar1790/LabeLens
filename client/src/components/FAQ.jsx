import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reveal } from './motion'

const faqs = [
  {
    question: 'How does LabelLens analyze packaged food labels?',
    answer:
      'LabelLens uses advanced vision AI to scan the ingredients list, nutrition facts table, and allergen warnings from any photo. It checks each ingredient against dietary standards to calculate an objective health score from 1 to 10.',
  },
  {
    question: 'What does the 1 to 10 nutrition score mean?',
    answer:
      'The score summarizes overall nutritional quality. Scores from 8 to 10 indicate clean, nutrient-dense whole foods. Scores from 5 to 7 indicate moderate processed foods with reasonable macros. Scores below 5 highlight excessive added sugars, harmful additives, or ultra-processed ingredients.',
  },
  {
    question: 'Can LabelLens detect hidden sugars, harmful additives, and E-numbers?',
    answer:
      'Yes. LabelLens flags all 60+ names for hidden sugars (such as maltodextrin, high-fructose corn syrup, dextrose), artificial sweeteners (such as sucralose, aspartame), and potentially harmful food additives or chemical preservatives.',
  },
  {
    question: 'How does the side-by-side food comparison feature work?',
    answer:
      'LabelLens allows you to upload photos of two competing products (for example, two cereals or protein bars) and immediately compares them on sugar, protein, fiber, sodium, additive levels, and overall health score to tell you which is better.',
  },
  {
    question: 'Is LabelLens free to use, and is my data private?',
    answer:
      'LabelLens is 100% free to use with no account required for instant scans. We do not store your food label photos or sell your personal data.',
  },
]

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Knowledge Base</p>
        <h2 className="section-title mt-3 font-serif text-text-1">Frequently Asked Questions</h2>
        <p className="mt-4 max-w-xl font-syne text-sm text-text-2">
          Everything you need to know about scanning nutrition labels, health scoring, and food ingredient analysis.
        </p>
      </motion.div>

      <div className="mt-14 space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={faq.question}
              className="rounded-lg border border-border bg-surface/50 transition-colors hover:border-border/80"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
              >
                <span className="font-syne text-base font-semibold text-text-1 sm:text-lg">
                  {faq.question}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-sm transition-transform duration-200 ${
                    isOpen ? 'rotate-45 text-accent border-accent/40 bg-accent/10' : 'text-text-2'
                  }`}
                >
                  +
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/60 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                      <p className="font-syne text-sm leading-relaxed text-text-2 sm:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

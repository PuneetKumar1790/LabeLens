import { useEffect } from 'react'

const DEFAULT_TITLE = 'LabelLens — AI Food Label Scanner & Nutrition Health Score'
const DEFAULT_DESCRIPTION =
  'Scan any packaged food label with AI. Instantly decode hidden sugars, harmful additives, and E-numbers with a clear 1-10 health rating. 100% free.'
const BASE_URL = 'https://www.labellens.app'

function setOrCreateMeta(selector, attributeName, attributeValue, content) {
  let element = document.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setOrCreateCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '',
  ogImage = `${BASE_URL}/assets/readme.jpeg`,
  noindex = false,
}) => {
  useEffect(() => {
    // Document Title
    const fullTitle = title ? `${title} | LabelLens` : DEFAULT_TITLE
    document.title = fullTitle

    // Meta Description
    setOrCreateMeta('meta[name="description"]', 'name', 'description', description)

    // Robots
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    setOrCreateMeta('meta[name="robots"]', 'name', 'robots', robotsContent)

    // Canonical
    const fullCanonical = `${BASE_URL}${canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : ''}`
    setOrCreateCanonical(fullCanonical)

    // Open Graph
    setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', fullCanonical)
    if (ogImage) {
      setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', ogImage)
    }

    // Twitter
    setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    if (ogImage) {
      setOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
    }
  }, [title, description, canonicalPath, ogImage, noindex])

  return null
}

/**
 * allergyDetector.js
 * Detects allergens and avoided ingredients in a product's ingredient list.
 * Uses lowercase normalisation and substring matching.
 */

// Map of known allergen keys to their keyword synonyms
const ALLERGEN_KEYWORDS = {
  peanuts: ['peanut', 'groundnut', 'arachis'],
  milk: ['milk', 'lactose', 'whey', 'casein', 'cream', 'butter'],
  dairy: ['milk', 'lactose', 'whey', 'casein', 'cream', 'butter', 'cheese', 'yogurt', 'ghee'],
  eggs: ['egg', 'albumin', 'mayonnaise', 'ovomucin', 'ovalbumin'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'tempeh', 'miso'],
  gluten: ['wheat', 'barley', 'rye', 'oat', 'spelt', 'gluten', 'triticum', 'semolina', 'farro'],
  shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'crawfish', 'crayfish', 'scallop', 'clam', 'oyster'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'anchovy', 'sardine', 'mackerel', 'halibut', 'bass'],
  sesame: ['sesame', 'tahini', 'gingelly', 'til'],
  tree_nuts: ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut', 'chestnut'],
  mustard: ['mustard', 'mustard seed', 'mustard oil'],
  celery: ['celery', 'celeriac'],
  lupin: ['lupin', 'lupine'],
  sulphites: ['sulphite', 'sulfite', 'sulphur dioxide', 'sulfur dioxide', 'so2'],
  molluscs: ['squid', 'octopus', 'mussel', 'abalone', 'snail'],
}

/**
 * Normalise a string to lowercase, trimmed.
 */
const norm = (str) => String(str || '').toLowerCase().trim()

/**
 * Check if any ingredient in the list contains the keyword as a substring.
 * Returns matching ingredients.
 */
const matchKeyword = (ingredientList, keyword) => {
  const kw = norm(keyword)
  return ingredientList.filter((ing) => norm(ing).includes(kw))
}

/**
 * detectAllergens
 * @param {string[]} ingredientList - list of ingredient strings from the product
 * @param {object} allergyProfile - { commonAllergens: string[], customAllergens: string[] }
 * @returns {{ alerts: Array<{level: string, type: string, ingredient: string, message: string}> }}
 */
export const detectAllergens = (ingredientList, allergyProfile) => {
  if (!ingredientList || ingredientList.length === 0) return { alerts: [] }

  const alerts = []
  const allAllergens = [
    ...(allergyProfile?.commonAllergens || []),
    ...(allergyProfile?.customAllergens || []),
  ]

  for (const allergen of allAllergens) {
    const key = norm(allergen)

    // Get keywords to scan for this allergen
    // Use predefined map if available, else fall back to the allergen name itself
    const keywords = ALLERGEN_KEYWORDS[key] || [key]

    const matchedIngredients = []
    for (const kw of keywords) {
      const matches = matchKeyword(ingredientList, kw)
      for (const m of matches) {
        if (!matchedIngredients.includes(m)) matchedIngredients.push(m)
      }
    }

    if (matchedIngredients.length > 0) {
      for (const ingredient of matchedIngredients) {
        alerts.push({
          level: 'red',
          type: allergen,
          ingredient,
          message: `Contains ${allergen}: "${ingredient}" detected in ingredients.`,
        })
      }
    }
  }

  return { alerts }
}

/**
 * detectAvoidedIngredients
 * @param {string[]} ingredientList - list of ingredient strings from the product
 * @param {string[]} avoidedList - list of ingredients the user wants to avoid
 * @returns {{ warnings: Array<{ingredient: string, matched: string, message: string}> }}
 */
export const detectAvoidedIngredients = (ingredientList, avoidedList) => {
  if (!ingredientList || ingredientList.length === 0) return { warnings: [] }
  if (!avoidedList || avoidedList.length === 0) return { warnings: [] }

  const warnings = []

  for (const avoided of avoidedList) {
    const matches = matchKeyword(ingredientList, avoided)
    for (const matched of matches) {
      warnings.push({
        ingredient: avoided,
        matched,
        message: `You avoid "${avoided}" — found as "${matched}" in this product.`,
      })
    }
  }

  return { warnings }
}

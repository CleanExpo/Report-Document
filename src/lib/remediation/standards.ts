// IICRC Standards Library and Citation Functions

export const IICRC_STANDARDS = {
  S500: {
    title: 'Standard for Professional Water Damage Restoration',
    version: '2021',
    sections: {
      '9.1': 'Documentation requirements',
      '10.5.1': 'Water damage causation',
      '10.5.3': 'Water contamination categories',
      '10.5.3.1': 'Category 1 - Clean water',
      '10.5.3.2': 'Category 2 - Significantly contaminated',
      '10.5.3.3': 'Category 3 - Grossly contaminated',
      '10.5.4': 'Classes of water damage',
      '10.6.6': 'Moisture content measurement',
      '12.2': 'Structural drying',
      '12.2.1': 'Initial water extraction',
      '12.2.2': 'Material restoration guidelines',
      '12.2.10': 'HVAC system procedures',
      '12.2.12': 'Antimicrobial application'
    }
  },
  S520: {
    title: 'Standard for Professional Mold Remediation',
    version: '2015',
    sections: {
      '3.3': 'Conditions for fungal growth',
      '12.1': 'Condition determination',
      '12.2.1': 'Containment requirements',
      '12.2.2': 'HVAC remediation',
      '12.2.2.1': 'HVAC shutdown procedures',
      '12.2.3': 'Material removal',
      '14.2': 'Post-remediation verification'
    }
  },
  S700: {
    title: 'Standard for Fire and Smoke Damage Restoration',
    version: '2019',
    sections: {
      '10.6.2': 'HVAC filter replacement',
      '12.3': 'Ductwork cleaning'
    }
  }
}

export const AUSTRALIAN_STANDARDS = {
  'AS/NZS 4849.1:2003': 'Indoor air quality sampling',
  'AS/NZS 3666.1:2011': 'Air-handling systems - Microbial control',
  'AS/NZS 1715:2009': 'Respiratory protective equipment'
}

export const QUEENSLAND_REGULATIONS = {
  'WHS Act 2011': 'Work Health and Safety Act 2011 (Qld)',
  'Building Code': 'Queensland Development Code'
}

// Citation mapping for automatic application
const citationMap: Record<string, string> = {
  'water category': 'IICRC S500 10.5.3',
  'water class': 'IICRC S500 10.5.4',
  'category 1': 'IICRC S500 10.5.3.1',
  'category 2': 'IICRC S500 10.5.3.2',
  'category 3': 'IICRC S500 10.5.3.3',
  'mould condition': 'IICRC S520 12.1',
  'condition 1': 'IICRC S520 12.1',
  'condition 2': 'IICRC S520 12.1',
  'condition 3': 'IICRC S520 12.1',
  'structural drying': 'IICRC S500 12.2',
  'hvac': 'AS/NZS 3666.1:2011',
  'hvac shutdown': 'IICRC S520 12.2.2',
  'indoor air quality': 'AS/NZS 4849.1:2003',
  'antimicrobial': 'IICRC S500 12.2.12',
  'containment': 'IICRC S520 12.2.1',
  'ppe': 'AS/NZS 1715:2009',
  'moisture content': 'IICRC S500 10.6.6',
  'water extraction': 'IICRC S500 12.2.1',
  'post-remediation verification': 'IICRC S520 14.2',
  'work health and safety': 'Work Health and Safety Act 2011 (Qld)'
}

/**
 * Apply citations to text content
 * @param text - The text to apply citations to
 * @returns Text with citations added
 */
export function applyCitations(text: string): string {
  let citedText = text
  
  // Apply citations based on keywords
  for (const [keyword, citation] of Object.entries(citationMap)) {
    const regex = new RegExp(`\\b${keyword}\\b(?![^\\(]*\\))`, 'gi')
    if (regex.test(citedText)) {
      citedText = citedText.replace(regex, `$& (${citation})`)
    }
  }
  
  return citedText
}

/**
 * Get full citation text for a standard
 * @param standard - The standard code (e.g., 'S500')
 * @param section - The section number (e.g., '10.5.3')
 * @returns Full citation text
 */
export function getCitation(standard: string, section: string): string {
  if (standard.startsWith('S')) {
    // IICRC standard
    const std = IICRC_STANDARDS[standard as keyof typeof IICRC_STANDARDS]
    if (std && std.sections[section as keyof typeof std.sections]) {
      return `IICRC ${standard} ${section}: ${std.sections[section as keyof typeof std.sections]}`
    }
  }
  
  return `${standard} ${section}`
}

/**
 * Get all relevant citations for a damage type
 * @param damageType - Type of damage (water, mould, fire)
 * @returns Array of relevant citations
 */
export function getRelevantCitations(damageType: 'water' | 'mould' | 'fire'): string[] {
  const citations: string[] = []
  
  switch (damageType) {
    case 'water':
      citations.push(
        'IICRC S500 10.5.3 - Water Categories',
        'IICRC S500 10.5.4 - Water Classes',
        'IICRC S500 12.2 - Structural Drying'
      )
      break
    case 'mould':
      citations.push(
        'IICRC S520 12.1 - Condition Determination',
        'IICRC S520 12.2.1 - Containment',
        'AS/NZS 4849.1:2003 - Indoor Air Quality'
      )
      break
    case 'fire':
      citations.push(
        'IICRC S700 10.6.2 - HVAC Systems',
        'IICRC S700 12.3 - Ductwork Cleaning'
      )
      break
  }
  
  return citations
}

/**
 * Validate that all technical claims have citations
 * @param text - The text to validate
 * @returns Object with validation result and missing citations
 */
export function validateCitations(text: string): {
  isValid: boolean
  missingCitations: string[]
} {
  const technicalTerms = [
    'category 1', 'category 2', 'category 3',
    'class 1', 'class 2', 'class 3', 'class 4',
    'condition 1', 'condition 2', 'condition 3',
    'structural drying', 'antimicrobial', 'containment'
  ]
  
  const missingCitations: string[] = []
  
  for (const term of technicalTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi')
    if (regex.test(text)) {
      // Check if the term has a citation following it
      const citationRegex = new RegExp(`\\b${term}\\b[^\\n]*\\([^)]+\\)`, 'gi')
      if (!citationRegex.test(text)) {
        missingCitations.push(term)
      }
    }
  }
  
  return {
    isValid: missingCitations.length === 0,
    missingCitations
  }
}
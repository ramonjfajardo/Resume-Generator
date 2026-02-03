// Job validation keywords and logic - centralized for reusability
const VALIDATION_KEYWORDS = {
  hybrid: ['hybrid', 'hybrid work', 'hybrid model', 'hybrid schedule', 'days in office', 'days per week in office', 'in-office days', 'office presence', 'some days in office'],
  onsite: ['on-site', 'onsite', 'on site', 'in-office', 'in office', 'office based', 'office-based', 'must be located in', 'must be based in', 'must relocate', 'relocation required', 'physical presence required', 'in person', 'local candidates', 'candidates must be in', 'candidates must reside'],
  remote: ['remote', 'work from home', 'fully remote', '100% remote', 'remote-first', 'distributed team'],
  junior: ['junior role', 'entry level', 'entry-level'],
  intern: [' intern ', 'internship'],
};

/**
 * Check if text contains any keyword from a list
 * @param {string} text - Text to search in
 * @param {string[]} keywords - Array of keywords to check
 * @returns {boolean}
 */
export const hasAnyKeyword = (text, keywords) => {
  for (const keyword of keywords) {
    if (text.includes(keyword)) return true;
  }
  return false;
};

/**
 * Validate job description and return location type
 * @param {string} jd - Job description text
 * @returns {object} { isValid: boolean, locationType: string, error?: string }
 */
export const validateJobDescription = (jd) => {
  const jdLower = jd.toLowerCase();
  
  const checks = {
    isHybrid: hasAnyKeyword(jdLower, VALIDATION_KEYWORDS.hybrid),
    hasOnsite: hasAnyKeyword(jdLower, VALIDATION_KEYWORDS.onsite),
    hasRemote: hasAnyKeyword(jdLower, VALIDATION_KEYWORDS.remote),
    hasJunior: hasAnyKeyword(jdLower, VALIDATION_KEYWORDS.junior),
    hasIntern: hasAnyKeyword(jdLower, VALIDATION_KEYWORDS.intern),
  };

  // if (checks.isHybrid) {
  //   return { isValid: false, locationType: 'hybrid', error: 'This position is HYBRID (requires some office days). This tool is designed for REMOTE-ONLY positions. Please provide a fully remote job description.' };
  // }

  const isOnsite = checks.hasOnsite && !checks.hasRemote;
  if (isOnsite) {
    return { isValid: false, locationType: 'onsite', error: 'This position is ONSITE/IN-PERSON. This tool is designed for REMOTE-ONLY positions. Please provide a fully remote job description.' };
  }

  const isJunior = checks.hasJunior && !checks.hasIntern;
  const isIntern = checks.hasIntern && !checks.hasJunior;
  const isEntryLevel = isJunior || isIntern;
  // if (isEntryLevel) {
  //   return { isValid: false, locationType: 'entry-level', error: 'This position is ENTRY LEVEL. This tool is designed for MID-LEVEL and SENIOR positions. Please provide a more senior job description.' };
  // }

  return { isValid: true, locationType: 'remote' };
};

export default { VALIDATION_KEYWORDS, hasAnyKeyword, validateJobDescription };

/**
 * Extract content from AI response (handle various formats)
 */
export const extractAIContent = (response) => {
  if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
    throw new Error("AI response has no content");
  }
  
  const extracted = (response.content || [])
    .map(part => {
      if (typeof part === 'string') return part;
      if (part?.text) return part.text;
      if (part?.type === 'text' && part?.text) return part.text;
      if (typeof part === 'object') return JSON.stringify(part);
      return String(part || '');
    })
    .join('')
    .trim();
  
  console.log("Raw AI response (first 500 chars):", extracted.substring(0, 500));
  return extracted;
};

/**
 * Validate if response is complete JSON despite max_tokens
 */
export const isCompleteJSON = (content) => {
  const pattern = /```(?:json\s*)?/gi;
  const cleaned = content.replace(pattern, "").replace(/```\s*/g, "").trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    return !!(parsed.title && parsed.summary && parsed.skills && parsed.experience);
  } catch {
    return false;
  }
};

/**
 * Extract JSON object from mixed content
 */
export const extractJSON = (content) => {
  // Pre-compiled patterns
  const codeBlockPattern = /```(?:json|javascript|js)?\s*/gi;
  const prefixPattern = /^(here is|here's|this is|the json is|json:|response:):?\s*/gim;
  
  let cleaned = content.replace(codeBlockPattern, "").replace(/```\s*/g, "");
  cleaned = cleaned.replace(prefixPattern, "");
  
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace);
  }

  // Find matching closing brace
  let braceCount = 0;
  let lastBrace = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++;
    if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        lastBrace = i;
        break;
      }
    }
  }

  if (lastBrace !== -1) {
    return cleaned.substring(0, lastBrace + 1).trim();
  }
  
  const fallbackLastBrace = cleaned.lastIndexOf('}');
  if (fallbackLastBrace !== -1) {
    return cleaned.substring(0, fallbackLastBrace + 1).trim();
  }
  
  throw new Error("No JSON object found in response");
};

/**
 * Parse JSON with automatic fixing of common issues
 */
export const parseJSONWithFixes = (content) => {
  try {
    return JSON.parse(content);
  } catch (firstError) {
    console.error("Parse error:", firstError.message);
    
    try {
      let fixed = content;
      const patterns = [
        [/,(\s*[}\]])/g, '$1'], // Remove trailing commas
        [/("(?:[^"\\]|\\.)*")\s*\n\s*/g, '$1 '], // Fix unescaped newlines
        [/\/\/.*$/gm, ''], // Remove line comments
        [/\/\*[\s\S]*?\*\//g, ''], // Remove block comments
      ];
      
      for (const [pattern, replacement] of patterns) {
        fixed = fixed.replace(pattern, replacement);
      }
      
      return JSON.parse(fixed);
    } catch (secondError) {
      // Try aggressive fixing
      let aggressive = content;
      aggressive = aggressive.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
      aggressive = aggressive.replace(/([^\\])"([^",:}\]]*)"\s*:/g, '$1"$2":');
      
      try {
        return JSON.parse(aggressive);
      } catch (thirdError) {
        throw new Error(`Invalid JSON: ${firstError.message}. Response may be malformed.`);
      }
    }
  }
};

export default { extractAIContent, isCompleteJSON, extractJSON, parseJSONWithFixes };

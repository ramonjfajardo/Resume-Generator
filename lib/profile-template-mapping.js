// Profile to Template mapping
export const profileTemplateMapping = {
  RaMi: {
    resume: "Lafael_Miranda",
    template: "ResumeExecutiveNavy",
    prompt: "default",
  },
  LuMo: {
    resume: "Lucas_Moura",
    template: "ResumeCreativeBurgundy",
    prompt: "default",
  },
  LuPe: {
    resume: "Lucas_Peralta",
    template: "ResumeConsultantSteel",
    prompt: "default",
  },
  BrCa: {
    resume: "Bruno_Camara",
    template: "ResumeExecutiveNavy",
    prompt: "default",
  },
};

/**
 * Get profile configuration by slug
 */
export const getProfileBySlug = (slug) => profileTemplateMapping[slug] || null;

/**
 * Generic getter for profile properties
 */
const getProfileProperty = (slug, property, defaultValue = null) => {
  const config = getProfileBySlug(slug);
  return config?.[property] || defaultValue;
};

export const slugToProfileName = (slug) => getProfileProperty(slug, "resume");
export const getTemplateForProfile = (slug) =>
  getProfileProperty(slug, "template", "Resume");
export const getPromptForProfile = (slug) =>
  getProfileProperty(slug, "prompt", "default");
export const getAvailableSlugs = () => Object.keys(profileTemplateMapping);
export const getProfileById = (profileId) => getProfileBySlug(profileId);

export default profileTemplateMapping;

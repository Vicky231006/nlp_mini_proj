import {
  ASSESSMENT_PROFILE_STORAGE_KEY,
  validateAssessmentProfile
} from '../../shared/assessment';

export function loadAssessmentProfile() {
  try {
    const stored = localStorage.getItem(ASSESSMENT_PROFILE_STORAGE_KEY);
    if (!stored) return { profile: null, warning: null };
    return { profile: validateAssessmentProfile(JSON.parse(stored)), warning: null };
  } catch {
    return {
      profile: null,
      warning: 'Your puzzle results could not be read from this browser. The tutor will still help, but without those results.'
    };
  }
}

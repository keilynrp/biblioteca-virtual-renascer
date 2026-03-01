export type StrengthLevel = "empty" | "weak" | "medium" | "strong"

export interface StrengthResult {
  level: StrengthLevel
  score: number
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumbers: boolean
    hasSpecial: boolean
  }
}

// Defaults aligned with backend PasswordPolicy model defaults
const DEFAULT_MIN_LENGTH = 8
const DEFAULT_REQUIRE_UPPERCASE = true
const DEFAULT_REQUIRE_LOWERCASE = true
const DEFAULT_REQUIRE_NUMBERS = true
const DEFAULT_REQUIRE_SPECIAL = false

export function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return {
      level: "empty",
      score: 0,
      checks: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSpecial: false,
      },
    }
  }

  const checks = {
    minLength: password.length >= DEFAULT_MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  }

  // Count how many active policy rules pass
  let totalRules = 1 // minLength always counts
  let passedRules = checks.minLength ? 1 : 0

  if (DEFAULT_REQUIRE_UPPERCASE) {
    totalRules++
    if (checks.hasUppercase) passedRules++
  }
  if (DEFAULT_REQUIRE_LOWERCASE) {
    totalRules++
    if (checks.hasLowercase) passedRules++
  }
  if (DEFAULT_REQUIRE_NUMBERS) {
    totalRules++
    if (checks.hasNumbers) passedRules++
  }
  if (DEFAULT_REQUIRE_SPECIAL) {
    totalRules++
    if (checks.hasSpecial) passedRules++
  }

  // Bonus for length beyond minimum
  const lengthBonus = Math.min(password.length - DEFAULT_MIN_LENGTH, 4)
  const bonusScore = lengthBonus > 0 ? (lengthBonus / 4) * 20 : 0

  const ruleScore = (passedRules / totalRules) * 80
  const score = Math.round(ruleScore + bonusScore)

  let level: StrengthLevel
  if (score < 40) level = "weak"
  else if (score < 70) level = "medium"
  else level = "strong"

  return { level, score, checks }
}

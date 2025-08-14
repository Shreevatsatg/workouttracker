export enum ActivityLevel {
  Sedentary = 'Sedentary', // Little or no exercise
  LightlyActive = 'Lightly Active', // Light exercise/sports 1-3 days/week
  ModeratelyActive = 'Moderately Active', // Moderate exercise/sports 3-5 days/week
  VeryActive = 'Very Active', // Hard exercise/sports 6-7 days a week
  ExtraActive = 'Extra Active', // Very hard exercise/sports & physical job or 2x training
}

export function calculateTDEE(
  gender: 'Male' | 'Female' | 'Other',
  age: number,
  height: number, // in cm
  weight: number, // in kg
  activityLevel: ActivityLevel
): number {
  // Mifflin-St Jeor Equation for BMR
  let bmr: number;
  if (gender === 'Male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else { // Female or Other
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // Activity Multipliers
  let activityMultiplier: number;
  switch (activityLevel) {
    case ActivityLevel.Sedentary:
      activityMultiplier = 1.2;
      break;
    case ActivityLevel.LightlyActive:
      activityMultiplier = 1.375;
      break;
    case ActivityLevel.ModeratelyActive:
      activityMultiplier = 1.55;
      break;
    case ActivityLevel.VeryActive:
      activityMultiplier = 1.725;
      break;
    case ActivityLevel.ExtraActive:
      activityMultiplier = 1.9;
      break;
    default:
      activityMultiplier = 1.2; // Default to sedentary
  }

  return bmr * activityMultiplier;
}

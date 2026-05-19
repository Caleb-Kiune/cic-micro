import { CohortInput } from "../schemas/coop-care.schema";
import { CIC_RATES, STATUTORY_LEVIES } from "../constants/coop-care.constants";

export interface PremiumBreakdown {
  basePremium: number;
  trainingLevy: number;
  phcf: number;
  stampDuty: number;
  totalPremium: number;
}

type CoverageKey = keyof typeof CIC_RATES;
type OptionKey = keyof (typeof CIC_RATES)[CoverageKey];

export function calculateCohortBasePremium(cohort: CohortInput): number {
  const coverageType = cohort.coverageType as CoverageKey;
  const benefitOption = cohort.benefitOption as OptionKey;
  const tier = CIC_RATES[coverageType][benefitOption];

  let perFamilyBase = 0;
  if (cohort.dependentCount <= 6) {
    perFamilyBase = tier.base[cohort.dependentCount];
  } else {
    const maxBaseRate = tier.base[6];
    const extraDependents = cohort.dependentCount - 6;
    perFamilyBase = maxBaseRate + extraDependents * tier.additional;
  }

  return perFamilyBase * cohort.multiplier;
}

export function calculateGroupPremium(
  cohorts: CohortInput[],
): PremiumBreakdown {
  if (cohorts.length === 0) {
    return {
      basePremium: 0,
      trainingLevy: 0,
      phcf: 0,
      stampDuty: 0,
      totalPremium: 0,
    };
  }

  const totalBasePremium = cohorts.reduce(
    (sum, cohort) => sum + calculateCohortBasePremium(cohort),
    0,
  );

  const trainingLevy = Math.round(
    totalBasePremium * STATUTORY_LEVIES.TRAINING_LEVY_RATE,
  );
  const phcf = Math.round(totalBasePremium * STATUTORY_LEVIES.PHCF_RATE);
  const stampDuty = STATUTORY_LEVIES.STAMP_DUTY;
  const totalPremium = totalBasePremium + trainingLevy + phcf + stampDuty;

  return {
    basePremium: totalBasePremium,
    trainingLevy,
    phcf,
    stampDuty,
    totalPremium,
  };
}

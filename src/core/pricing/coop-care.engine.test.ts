// 1. Explicitly import the testing functions to satisfy TypeScript
import { describe, it, expect } from 'vitest';

// 2. Adjusted relative paths (since this file is right next to the engine)
import { calculateCohortBasePremium, calculateGroupPremium } from "./coop-care.engine";
import { CohortInput } from "../schemas/coop-care.schema";

describe("Coop Care Pricing Engine", () => {
  
  describe("calculateCohortBasePremium", () => {
    it("should calculate correct premium for Inpatient Only, Option 1, Member Only (M)", () => {
      const cohort: CohortInput = {
        coverageType: "INPATIENT_ONLY",
        benefitOption: "OPTION_1",
        dependentCount: 0, 
        multiplier: 1,     
      };
      
      // Brochure says Inpatient Only Option 1 for 'M' is 2,597
      expect(calculateCohortBasePremium(cohort)).toBe(2597);
    });

    it("should apply the multiplier correctly for 10 families", () => {
      const cohort: CohortInput = {
        coverageType: "ALL_BENEFITS",
        benefitOption: "OPTION_3",
        dependentCount: 1, // M + 1 is 14,260
        multiplier: 10,    // 10 families
      };
      expect(calculateCohortBasePremium(cohort)).toBe(14260 * 10);
    });

    it("should calculate extra dependents correctly (M+8)", () => {
      const cohort: CohortInput = {
        coverageType: "ALL_BENEFITS",
        benefitOption: "OPTION_1",
        dependentCount: 8, // M + 6 (26989) + 2 extra (3889 * 2) = 34767
        multiplier: 1,
      };
      expect(calculateCohortBasePremium(cohort)).toBe(34767); // Fixed the assertion!
    });
  });

  describe("calculateGroupPremium (Taxes & Aggregation)", () => {
    it("should aggregate cohorts and apply statutory levies correctly", () => {
      const cohorts: CohortInput[] = [
        { coverageType: "INPATIENT_ONLY", benefitOption: "OPTION_1", dependentCount: 0, multiplier: 1 }
      ];

      const result = calculateGroupPremium(cohorts);

      // Base: 2597
      // Training Levy (0.2%): Math.round(2597 * 0.002) = 5
      // PHCF (0.25%): Math.round(2597 * 0.0025) = 6
      // Stamp Duty: 40
      // Total: 2597 + 5 + 6 + 40 = 2648

      expect(result.basePremium).toBe(2597);
      expect(result.trainingLevy).toBe(5);
      expect(result.phcf).toBe(6);
      expect(result.stampDuty).toBe(40);
      expect(result.totalPremium).toBe(2648);
    });
  });
});
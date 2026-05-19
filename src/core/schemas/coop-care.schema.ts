import { z } from "zod";

export const cohortSchema = z.object({
  coverageType: z.enum(["ALL_BENEFITS", "INPATIENT_ONLY"]),
  benefitOption: z.enum(["OPTION_1", "OPTION_2", "OPTION_3"]),
  dependentCount: z.number().int().min(0, "Dependents cannot be negative"),
  multiplier: z
    .number()
    .int()
    .min(1, "Must have at least 1 family in this cohort"),
});

export type CohortInput = z.infer<typeof cohortSchema>;

export const groupQuoteSchema = z.object({
  groupName: z.string().min(2, "Group name is required"),
  cohorts: z.array(cohortSchema),
});

export type GroupQuoteInput = z.infer<typeof groupQuoteSchema>;

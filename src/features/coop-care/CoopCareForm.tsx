"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "vaul";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";

import {
  groupQuoteSchema,
  GroupQuoteInput,
  CohortInput,
} from "../../core/schemas/coop-care.schema";
import {
  calculateCohortBasePremium,
  calculateGroupPremium,
} from "../../core/pricing/coop-care.engine";
import { CoopCareQuotePDF } from "./CoopCareQuotePDF";

export function CoopCareForm() {
  const {
    control,
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm<GroupQuoteInput>({
    resolver: zodResolver(groupQuoteSchema),
    defaultValues: { groupName: "", cohorts: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cohorts",
  });
  const watchedCohorts = useWatch({
    control,
    name: "cohorts",
  }) as CohortInput[];

  const [draftCohort, setDraftCohort] = useState<Partial<CohortInput>>({
    dependentCount: 0,
    multiplier: 1,
  });
  const [draftPremium, setDraftPremium] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isDraftComplete =
    !!draftCohort.coverageType && !!draftCohort.benefitOption;

  useEffect(() => {
    if (isDraftComplete) {
      const base = calculateCohortBasePremium(draftCohort as CohortInput);
      setDraftPremium(base);
    } else {
      setDraftPremium(0);
    }
  }, [draftCohort, isDraftComplete]);

  useEffect(() => {
    if (isDrawerOpen && watchedCohorts.length === 0) {
      setIsDrawerOpen(false);
    }
  }, [watchedCohorts.length, isDrawerOpen]);

  const handleAddCohort = () => {
    if (!isDraftComplete) return;
    append(draftCohort as CohortInput);
    setDraftCohort({ dependentCount: 0, multiplier: 1 });
  };

  const onPreviewSubmit = () => {
    setIsDrawerOpen(true);
  };

  const handleDownloadPDF = async () => {
    const data = getValues();
    const finalQuote = calculateGroupPremium(data.cohorts);

    try {
      const blob = await pdf(
        <CoopCareQuotePDF data={data} quote={finalQuote} />,
      ).toBlob();
      const fileName = `CoopCare_Quote_${data.groupName.replace(/\s+/g, "_")}.pdf`;
      saveAs(blob, fileName);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Error generating the official quote.");
    }
  };

  const liveGroupTotal = calculateGroupPremium(watchedCohorts || []);

  return (
    <div
      className={`max-w-md mx-auto relative ${fields.length > 0 ? "pb-36" : "pb-6"}`}
    >
      <form
        onSubmit={handleSubmit(onPreviewSubmit)}
        className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            {...register("groupName")}
            className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg border focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="e.g. Mwalimu Sacco"
          />
          {errors.groupName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.groupName.message}
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Build Cohort</h3>
            {errors.cohorts?.root && (
              <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                {errors.cohorts.root.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["ALL_BENEFITS", "INPATIENT_ONLY"] as const).map((type) => (
                <div
                  key={type}
                  onClick={() =>
                    setDraftCohort({ ...draftCohort, coverageType: type })
                  }
                  className={`p-4 border rounded-xl cursor-pointer text-center font-semibold transition-all ${
                    draftCohort.coverageType === type
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {type === "ALL_BENEFITS" ? "All Benefits" : "Inpatient Only"}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefit Option
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["OPTION_1", "OPTION_2", "OPTION_3"] as const).map((option) => (
                <div
                  key={option}
                  onClick={() =>
                    setDraftCohort({ ...draftCohort, benefitOption: option })
                  }
                  className={`p-3 border rounded-xl cursor-pointer text-center text-sm font-semibold transition-all ${
                    draftCohort.benefitOption === option
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {option.replace("_", " ")}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 text-center">
                Dependents (M+)
              </label>
              <div className="flex items-center justify-between border border-gray-300 rounded-lg p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() =>
                    setDraftCohort((p) => ({
                      ...p,
                      dependentCount: Math.max(0, (p.dependentCount || 0) - 1),
                    }))
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white shadow-sm text-gray-700 font-bold text-xl rounded-md"
                >
                  -
                </button>
                <span className="text-xl font-bold text-gray-900 w-10 text-center">
                  {draftCohort.dependentCount}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraftCohort((p) => ({
                      ...p,
                      dependentCount: (p.dependentCount || 0) + 1,
                    }))
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white shadow-sm text-gray-700 font-bold text-xl rounded-md"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 text-center">
                Families (Multiplier)
              </label>
              <div className="flex items-center justify-between border border-gray-300 rounded-lg p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() =>
                    setDraftCohort((p) => ({
                      ...p,
                      multiplier: Math.max(1, (p.multiplier || 1) - 1),
                    }))
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white shadow-sm text-gray-700 font-bold text-xl rounded-md"
                >
                  -
                </button>
                <span className="text-xl font-bold text-gray-900 w-10 text-center">
                  {draftCohort.multiplier}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraftCohort((p) => ({
                      ...p,
                      multiplier: (p.multiplier || 1) + 1,
                    }))
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white shadow-sm text-gray-700 font-bold text-xl rounded-md"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCohort}
            disabled={!isDraftComplete}
            className={`w-full p-4 rounded-xl font-bold flex justify-between items-center transition ${
              isDraftComplete
                ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>+ Add to Quote Roster</span>
            <span>
              {isDraftComplete ? `Ksh ${draftPremium.toLocaleString()}` : "---"}
            </span>
          </button>
        </div>
      </form>

      {fields.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-30">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSubmit(onPreviewSubmit)}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold text-lg transition shadow-md flex justify-between items-center"
            >
              <span>Review Quote</span>
              <span className="bg-red-800 text-white text-sm px-3 py-1 rounded-full">
                {fields.length} Added
              </span>
            </button>
          </div>
        </div>
      )}

      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-gray-50 flex flex-col rounded-t-[20px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 rounded-t-[20px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />

              <Drawer.Title className="font-bold text-2xl mb-1 text-center text-gray-900">
                Quote Preview
              </Drawer.Title>
              <Drawer.Description className="text-center text-gray-500 mb-6">
                Prepared for:{" "}
                <span className="font-bold text-gray-800">
                  {getValues("groupName")}
                </span>
              </Drawer.Description>

              <div className="max-w-md mx-auto space-y-6 pb-24">
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                    Roster Details
                  </h4>
                  {watchedCohorts?.map((cohort, index) => {
                    const cohortPremium = calculateCohortBasePremium(cohort);
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {cohort.multiplier}x Families (M+
                            {cohort.dependentCount})
                          </p>
                          <p className="text-xs text-gray-500">
                            {cohort.coverageType === "ALL_BENEFITS"
                              ? "All Benefits"
                              : "Inpatient"}{" "}
                            • {cohort.benefitOption.replace("_", " ")}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-bold text-sm text-blue-700 mb-1">
                            Ksh {cohortPremium.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                    Premium Breakdown
                  </h4>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Base Premium:</span>
                    <span className="font-medium text-gray-900">
                      Ksh {liveGroupTotal.basePremium.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Training Levy (0.2%):</span>
                    <span className="font-medium text-gray-900">
                      Ksh {liveGroupTotal.trainingLevy.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>PHCF (0.25%):</span>
                    <span className="font-medium text-gray-900">
                      Ksh {liveGroupTotal.phcf.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Stamp Duty:</span>
                    <span className="font-medium text-gray-900">
                      Ksh {liveGroupTotal.stampDuty.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">
                      Total Payable:
                    </span>
                    <span className="font-bold text-2xl text-blue-700">
                      Ksh {liveGroupTotal.totalPremium.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-gray-900 hover:bg-black text-white p-4 rounded-xl font-bold text-lg transition shadow-md"
                >
                  Generate Official PDF
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "vaul";
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

import { groupQuoteSchema, GroupQuoteInput, CohortInput } from "../../core/schemas/coop-care.schema";
import { calculateGroupPremium, PremiumBreakdown } from "../../core/pricing/coop-care.engine";
import { CoopCareQuotePDF } from './CoopCareQuotePDF';

export function CoopCareForm() {
  const [liveQuote, setLiveQuote] = useState<PremiumBreakdown | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [formData, setFormData] = useState<GroupQuoteInput | null>(null); 

  const { control, handleSubmit, register, formState: { errors } } = useForm<GroupQuoteInput>({
    resolver: zodResolver(groupQuoteSchema),
    defaultValues: {
      groupName: "",
      cohorts: [
        { coverageType: "ALL_BENEFITS", benefitOption: "OPTION_1", dependentCount: 0, multiplier: 1 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cohorts",
  });

  const watchedCohorts = useWatch({ control, name: "cohorts" });

  useEffect(() => {
    if (watchedCohorts && watchedCohorts.length > 0) {
      const safeCohorts = watchedCohorts.map((c: any) => ({
        ...c,
        dependentCount: Number(c?.dependentCount) || 0,
        multiplier: Number(c?.multiplier) || 1,
      })) as CohortInput[];

      const result = calculateGroupPremium(safeCohorts);
      setLiveQuote(result);
    }
  }, [watchedCohorts]);

  const onPreviewSubmit = (data: GroupQuoteInput) => {
    setFormData(data); 
    setIsDrawerOpen(true); 
  };
  const handleDownloadPDF = async () => {
    if (!formData || !liveQuote) return;

    try {
      const blob = await pdf(
        <CoopCareQuotePDF data={formData} quote={liveQuote} />
      ).toBlob();

      const fileName = `CoopCare_Quote_${formData.groupName.replace(/\s+/g, '_')}.pdf`;
      saveAs(blob, fileName);
      setIsDrawerOpen(false); 
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("There was an error generating the official quote.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Coop Care Quote Generator</h2>
      
      <form onSubmit={handleSubmit(onPreviewSubmit)} className="space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Group Name</label>
          <input 
            {...register("groupName")} 
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            placeholder="e.g., Mwalimu Sacco"
          />
          {errors.groupName && <p className="text-red-500 text-sm mt-1">{errors.groupName.message}</p>}
        </div>

        {/* Cohorts Array */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-semibold text-gray-800">Roster Cohorts</h3>
            <span className="text-xs text-gray-500">Min. 4 total principal members</span>
          </div>
          
          {errors.cohorts?.root && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {errors.cohorts.root.message}
            </div>
          )}
          
          {fields.map((field: any, index: number) => (
            <div key={field.id} className="p-4 border border-gray-200 rounded-md relative bg-gray-50 shadow-sm">
              {fields.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-red-500 text-sm font-medium hover:underline"
                >
                  Remove
                </button>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Coverage</label>
                  <select {...register(`cohorts.${index}.coverageType`)} className="w-full p-2 border border-gray-300 rounded text-sm">
                    <option value="ALL_BENEFITS">All Benefits</option>
                    <option value="INPATIENT_ONLY">Inpatient Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Option</label>
                  <select {...register(`cohorts.${index}.benefitOption`)} className="w-full p-2 border border-gray-300 rounded text-sm">
                    <option value="OPTION_1">Option 1</option>
                    <option value="OPTION_2">Option 2</option>
                    <option value="OPTION_3">Option 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dependents</label>
                  <input 
                    type="number"
                    min="0"
                    {...register(`cohorts.${index}.dependentCount`, { valueAsNumber: true })} 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Families</label>
                  <input 
                    type="number" 
                    min="1"
                    {...register(`cohorts.${index}.multiplier`, { valueAsNumber: true })} 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            onClick={() => append({ coverageType: "ALL_BENEFITS", benefitOption: "OPTION_1", dependentCount: 0, multiplier: 1 })}
            className="text-blue-600 text-sm font-bold hover:underline"
          >
            + Add Another Cohort
          </button>
        </div>

        <div className="flex items-start mt-4">
          <div className="flex items-center h-5">
            <input id="age-confirm" type="checkbox" required className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="age-confirm" className="font-medium text-gray-700">I confirm all principal members are 70 years old or younger.</label>
          </div>
        </div>

        {/* Triggers onPreviewSubmit, which opens the drawer */}
        <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-md font-bold transition-colors">
          Review Quote
        </button>
      </form>

      {/* THE VAUL DRAWER */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[75%] mt-24 fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />
              
              <Drawer.Title className="font-bold text-2xl mb-2 text-center text-gray-900">
                Quote Breakdown
              </Drawer.Title>
              <Drawer.Description className="text-center text-gray-500 mb-6">
                Prepared for: <span className="font-semibold text-gray-800">{formData?.groupName}</span>
              </Drawer.Description>

              {liveQuote && (
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 mx-auto max-w-md">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Premium:</span>
                    <span className="font-medium">Ksh {liveQuote.basePremium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Training Levy (0.2%):</span>
                    <span className="font-medium">Ksh {liveQuote.trainingLevy.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>PHCF (0.25%):</span>
                    <span className="font-medium">Ksh {liveQuote.phcf.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Stamp Duty:</span>
                    <span className="font-medium">Ksh {liveQuote.stampDuty.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4 mt-4 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Total Payable:</span>
                    <span className="font-bold text-2xl text-blue-700">Ksh {liveQuote.totalPremium.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="mt-8 max-w-md mx-auto">
                <button 
                  onClick={handleDownloadPDF}
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-md font-bold text-lg transition-colors shadow-md"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
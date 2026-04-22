'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pill, Activity, ArrowLeft, Loader2 } from 'lucide-react';

interface Disease {
  id: string;
  diseaseType: string;
  diseaseName: string;
  diagnosedDate: string | null;
}

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  diseaseId: string;
}

export default function AddMedicationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<MedicationFormData>({
    medicationName: '',
    dosage: '',
    diseaseId: '',
  });

  // Fetch diseases
  const { data: diseases = [], isLoading: isLoadingDiseases } = useQuery<Disease[]>({
    queryKey: ['diseases'],
    queryFn: async () => {
      const response = await fetch('/api/diseases');
      if (!response.ok) throw new Error('Failed to fetch diseases');
      return response.json();
    },
  });

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: async (data: MedicationFormData) => {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add medication');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      router.push('/dashboard');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicationMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/40 to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50 flex items-center justify-center">
              <Pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Add Medication</h1>
              <p className="text-muted-foreground mt-1">Track your medications and dosages</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-background rounded-2xl shadow-xl border border-border/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Medication Name */}
            <div>
              <label htmlFor="medicationName" className="block text-sm font-medium text-foreground mb-2">
                Medication Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Pill className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="medicationName"
                  name="medicationName"
                  value={formData.medicationName}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-secondary/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Metformin, Aspirin"
                />
              </div>
            </div>

            {/* Dosage */}
            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-foreground mb-2">
                Dosage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-secondary/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., 500mg twice daily, 1 tablet before bed"
                />
              </div>
            </div>

            {/* Disease Selection */}
            <div>
              <label htmlFor="diseaseId" className="block text-sm font-medium text-foreground mb-2">
                Related Disease (Optional)
              </label>
              {isLoadingDiseases ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : diseases.length === 0 ? (
                <div className="rounded-xl bg-secondary/20 border border-border p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No diseases found. You can add a medication without selecting a disease.
                  </p>
                </div>
              ) : (
                <select
                  id="diseaseId"
                  name="diseaseId"
                  value={formData.diseaseId}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-border rounded-xl bg-secondary/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a disease (optional)</option>
                  {diseases.map((disease) => (
                    <option key={disease.id} value={disease.id}>
                      {disease.diseaseName} ({disease.diseaseType})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Information Box */}
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Important Information</p>
                  <p className="text-sm text-muted-foreground">
                    Make sure to enter the correct dosage as prescribed by your healthcare provider. 
                    You can link this medication to a specific disease for better tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {addMedicationMutation.isError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {addMedicationMutation.error instanceof Error 
                    ? addMedicationMutation.error.message 
                    : 'Failed to add medication. Please try again.'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-border rounded-xl text-foreground hover:bg-secondary/40 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMedicationMutation.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addMedicationMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Medication'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Don't see your disease? Add a new disease first
          </button>
        </div>
      </div>
    </div>
  );
}
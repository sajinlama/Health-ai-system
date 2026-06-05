'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Pill, Activity, ArrowLeft, Loader2, Plus, Calendar, 
  Clock, CheckCircle, XCircle, AlertCircle, History, 
  TrendingUp, Shield, Moon, Bell 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Disease {
  id: string;
  diseaseType: string;
  diseaseName: string;
  diagnosedDate: string | null;
}

interface Medication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  isActive: boolean;
  createdAt: string;
  diseaseId: string | null;
}

interface MedicationLog {
  id: string;
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED';
  scheduledAt: string;
  takenAt: string | null;
  medication: {
    medicationName: string;
    dosage: string;
  };
}

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  diseaseId: string;
}

export default function MedicationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'medications' | 'logs'>('medications');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [formData, setFormData] = useState<MedicationFormData>({
    medicationName: '',
    dosage: '',
    frequency: 'Once daily',
    scheduledTimes: ['09:00'],
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

  // Fetch medications
  const { data: medications = [], isLoading: isLoadingMedications, refetch: refetchMedications } = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to fetch medications');
      return response.json();
    },
  });

  // Fetch medication logs
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const { data: logs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery<MedicationLog[]>({
    queryKey: ['medication-logs', formatDate(selectedDate)],
    queryFn: async () => {
      const response = await fetch(`/api/medication-logs?date=${formatDate(selectedDate)}`);
      if (!response.ok) throw new Error('Failed to fetch medication logs');
      return response.json();
    },
    enabled: activeTab === 'logs',
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
      setShowAddForm(false);
      setFormData({
        medicationName: '',
        dosage: '',
        frequency: 'Once daily',
        scheduledTimes: ['09:00'],
        diseaseId: '',
      });
      refetchMedications();
    },
  });

  // Update medication log status mutation
  const updateLogStatusMutation = useMutation({
    mutationFn: async ({ logId, status }: { logId: string; status: string }) => {
      const response = await fetch('/api/medication-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      refetchLogs();
      queryClient.invalidateQueries({ queryKey: ['health-analysis'] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduledTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.scheduledTimes];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, scheduledTimes: newTimes }));
  };

  const addScheduledTime = () => {
    setFormData(prev => ({
      ...prev,
      scheduledTimes: [...prev.scheduledTimes, '12:00'],
    }));
  };

  const removeScheduledTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scheduledTimes: prev.scheduledTimes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicationMutation.mutate(formData);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return { bg: 'bg-green-500/10 border-green-500/30 text-green-400', icon: CheckCircle, label: 'Taken' };
      case 'PENDING':
        return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: Clock, label: 'Pending' };
      case 'SKIPPED':
        return { bg: 'bg-secondary/60 border-border/40 text-muted-foreground', icon: XCircle, label: 'Skipped' };
      case 'MISSED':
        return { bg: 'bg-red-500/10 border-red-500/30 text-red-400', icon: AlertCircle, label: 'Missed' };
      default:
        return { bg: 'bg-secondary/60 border-border/40 text-muted-foreground', icon: Clock, label: status };
    }
  };

  // Get disease name by ID
  const getDiseaseName = (diseaseId: string | null) => {
    if (!diseaseId) return null;
    const disease = diseases.find(d => d.id === diseaseId);
    return disease?.diseaseName;
  };

  // Summary stats for logs
  const logsSummary = logs.reduce((acc, log) => {
    acc.total++;
    if (log.status === 'TAKEN') acc.taken++;
    if (log.status === 'PENDING') acc.pending++;
    if (log.status === 'MISSED') acc.missed++;
    if (log.status === 'SKIPPED') acc.skipped++;
    return acc;
  }, { total: 0, taken: 0, pending: 0, missed: 0, skipped: 0 });

  return (
    <div className="min-h-screen py-8 px-6 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Medications</h1>
                  <p className="text-muted-foreground mt-1">Track your medications and daily adherence</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-4">
          <button
            onClick={() => setActiveTab('medications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'medications'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span className="text-sm font-medium">My Medications</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">Daily Logs</span>
          </button>
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Add New Medication
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Metformin, Lisinopril"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Related Disease (Optional)
                  </label>
                  <select
                    name="diseaseId"
                    value={formData.diseaseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a disease</option>
                    {diseases.map((disease) => (
                      <option key={disease.id} value={disease.id}>
                        {disease.diseaseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scheduled Times */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scheduled Times
                </label>
                <div className="space-y-2">
                  {formData.scheduledTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleScheduledTimeChange(index, e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {formData.scheduledTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduledTime(index)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addScheduledTime}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add time
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-secondary/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMedicationMutation.isPending}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {addMedicationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Medication'
                  )}
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Medications List */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            {isLoadingMedications ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : medications.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
                <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No medications added yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm"
                >
                  Add Your First Medication
                </button>
              </Card>
            ) : (
              medications.map((med) => {
                const diseaseName = getDiseaseName(med.diseaseId);
                return (
                  <Card key={med.id} className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{med.medicationName}</h3>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          {diseaseName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              For: {diseaseName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{med.frequency}</p>
                          <div className="flex gap-1 mt-1">
                            {med.scheduledTimes.map((time, i) => (
                              <span key={i} className="text-xs bg-secondary/40 px-2 py-0.5 rounded-full text-muted-foreground">
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          med.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {med.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Logs Section */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

            {/* Summary Cards */}
            {logs.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard icon={Pill} label="Total Doses" value={logsSummary.total} color="from-pink-500 to-rose-500" />
                <SummaryCard icon={CheckCircle} label="Taken" value={logsSummary.taken} color="from-green-500 to-emerald-500" />
                <SummaryCard icon={Clock} label="Pending" value={logsSummary.pending} color="from-amber-500 to-orange-500" />
                <SummaryCard icon={AlertCircle} label="Missed" value={logsSummary.missed} color="from-red-500 to-rose-500" />
              </div>
            )}

            {/* Logs List */}
            {isLoadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No medication logs for this day</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const cfg = getStatusConfig(log.status);
                  const StatusIcon = cfg.icon;
                  return (
                    <Card key={log.id} className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg border ${cfg.bg}`}>
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{log.medication.medicationName}</h3>
                            <p className="text-xs text-muted-foreground">{log.medication.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {log.takenAt && (
                              <p className="text-xs text-green-400">
                                Taken at {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          {log.status === 'PENDING' && (
                            <button
                              onClick={() => updateLogStatusMutation.mutate({ logId: log.id, status: 'TAKEN' })}
                              className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
                            >
                              Mark Taken
                            </button>
                          )}
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Exclusion {
  id?: string;
  exclusionType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ExclusionManagerProps {
  merchantId: string;
  merchantName: string;
}

interface ExclusionResponse {
  exclusions: Exclusion[];
}

const EXCLUSION_TYPES = [
  { value: 'featured', label: 'Featured List', description: 'Exclude from featured merchants section' },
  { value: 'top_rated', label: 'Top Rated', description: 'Exclude from top rated merchants' },
  { value: 'recommended', label: 'Recommended', description: 'Exclude from recommended merchants' },
  { value: 'trending', label: 'Trending', description: 'Exclude from trending merchants' },
  { value: 'new_arrivals', label: 'New Arrivals', description: 'Exclude from new arrivals section' }
];

export default function ExclusionManager({ merchantId, merchantName }: ExclusionManagerProps) {
  const [exclusions, setExclusions] = useState<Record<string, Exclusion>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchExclusions = useCallback(async () => {
    try {
      const response = await api.get<ExclusionResponse>(`/admin/merchants/${merchantId}/exclusions`);
      if (response.data?.exclusions) {
        const exclusionMap: Record<string, Exclusion> = {};
        response.data.exclusions.forEach((exc: Exclusion) => {
          exclusionMap[exc.exclusionType] = {
            ...exc,
            startDate: exc.startDate.split('T')[0],
            endDate: exc.endDate.split('T')[0]
          };
        });
        setExclusions(exclusionMap);
      }
    } catch (error) {
      console.error('Error fetching exclusions:', error);
      toast.error('Failed to load exclusions');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchExclusions();
  }, [fetchExclusions]);

  const handleToggle = (type: string, checked: boolean) => {
    const today = new Date().toISOString().split('T')[0];

    if (checked) {
      // Add new exclusion with today as default dates
      setExclusions(prev => ({
        ...prev,
        [type]: {
          exclusionType: type,
          startDate: today,
          endDate: today,
          isActive: true
        }
      }));
    } else {
      // Remove exclusion
      setExclusions(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
    }
  };

  const handleDateChange = (type: string, field: 'startDate' | 'endDate', value: string) => {
    setExclusions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const validateDates = (): boolean => {
    for (const [type, exclusion] of Object.entries(exclusions)) {
      if (new Date(exclusion.endDate) < new Date(exclusion.startDate)) {
        toast.error(`${EXCLUSION_TYPES.find(t => t.value === type)?.label}: End date must be after start date`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateDates()) return;

    setSaving(true);
    try {
      // Get current exclusions from server
      const currentResponse = await api.get<ExclusionResponse>(`/admin/merchants/${merchantId}/exclusions`);
      const currentExclusions = currentResponse.data?.exclusions || [];

      // Process each exclusion type
      for (const type of EXCLUSION_TYPES.map(t => t.value)) {
        const newExclusion = exclusions[type];
        const currentExclusion = currentExclusions.find((e: Exclusion) => e.exclusionType === type);

        if (newExclusion && !currentExclusion) {
          // Create new exclusion
          await api.post(`/admin/merchants/${merchantId}/exclusions`, {
            exclusionType: type,
            startDate: new Date(newExclusion.startDate).toISOString(),
            endDate: new Date(newExclusion.endDate).toISOString(),
            isActive: true
          });
        } else if (newExclusion && currentExclusion) {
          // Update existing exclusion
          await api.post(`/admin/merchants/${merchantId}/exclusions`, {
            exclusionType: type,
            startDate: new Date(newExclusion.startDate).toISOString(),
            endDate: new Date(newExclusion.endDate).toISOString(),
            isActive: true
          });
        } else if (!newExclusion && currentExclusion) {
          // Delete exclusion
          await api.delete(`/admin/merchants/${merchantId}/exclusions/${currentExclusion.id}`);
        }
      }

      toast.success('Exclusions updated successfully');
      fetchExclusions(); // Refresh data
    } catch (error) {
      console.error('Error saving exclusions:', error);
      toast.error('Failed to save exclusions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Display Exclusions</h3>
        <p className="text-sm text-gray-600 mb-6">
          Temporarily exclude <span className="font-medium">{merchantName}</span> from special display lists
        </p>

        <div className="space-y-4">
          {EXCLUSION_TYPES.map(type => {
            const isChecked = !!exclusions[type.value];
            const exclusion = exclusions[type.value];

            return (
              <div key={type.value} className="border rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id={`exclude-${type.value}`}
                    checked={isChecked}
                    onChange={(e) => handleToggle(type.value, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <label htmlFor={`exclude-${type.value}`} className="font-medium cursor-pointer">
                      {type.label}
                    </label>
                    <p className="text-sm text-gray-500">{type.description}</p>

                    {isChecked && exclusion && (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={exclusion.startDate}
                            onChange={(e) => handleDateChange(type.value, 'startDate', e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">End Date</label>
                          <input
                            type="date"
                            value={exclusion.endDate}
                            min={exclusion.startDate}
                            onChange={(e) => handleDateChange(type.value, 'endDate', e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            new Date(exclusion.endDate) >= new Date()
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {new Date(exclusion.endDate) >= new Date() ? 'Active' : 'Expired'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={fetchExclusions}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#A96B11] text-white rounded-md hover:bg-[#8B560E] transition-colors disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Exclusions'}
          </button>
        </div>
      </div>
    </div>
  );
}
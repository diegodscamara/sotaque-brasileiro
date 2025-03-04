import { useState, useEffect, useCallback } from "react";
import { getTeachers } from "@/app/actions/teachers";
import { OnboardingFormData } from "../types";

/**
 * Custom hook for managing teacher selection
 * @param {OnboardingFormData} formData - The form data
 * @param {Function} handleSelectChange - Function to update form data
 * @returns {Object} Teacher selection state and handlers
 */
export function useTeacherSelection(
  formData: OnboardingFormData,
  handleSelectChange: (name: string, value: string) => void
) {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(formData.selectedTeacherId || null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teachers on hook initialization
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const teachersData = await getTeachers();

        if (teachersData && teachersData.length > 0) {
          setTeachers(teachersData);
        } else {
          setError("No teachers available at the moment. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError("Failed to load teachers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Handle teacher selection
  const handleTeacherSelect = useCallback((teacherId: string) => {
    if (teacherId !== selectedTeacher) {
      setSelectedTeacher(teacherId);
      // Update form data
      handleSelectChange("selectedTeacherId", teacherId);
    }
  }, [selectedTeacher, handleSelectChange]);

  return {
    teachers,
    selectedTeacher,
    loading,
    error,
    handleTeacherSelect
  };
} 
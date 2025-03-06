import { useState, useEffect, useCallback } from "react";
import { getTeachers } from "@/app/actions/teachers";
import { fetchClasses } from "@/app/actions/classes";
import { createClient } from "@/libs/supabase/client";
import { OnboardingFormData } from "../types";

/**
 * Custom hook for managing teacher selection
 * @param {OnboardingFormData} formData - The form data
 * @param {Function} handleSelectChange - Function to update form data
 * @returns {Object} Teacher selection state and handlers
 */
export function useTeacherSelection(
  formData: OnboardingFormData,
  handleSelectChange: (name: string, value: string) => void,
  handleDateTimeChange: (name: string, value: Date) => void
): {
  teachers: any[];
  selectedTeacher: string | null;
  loading: boolean;
  error: string | null;
  handleTeacherSelect: (teacherId: string) => void;
  pendingClass: any | null;
  pendingClassLoading: boolean;
} {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(formData.selectedTeacherId || null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingClass, setPendingClass] = useState<any | null>(null);
  const [pendingClassLoading, setPendingClassLoading] = useState(false);

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

  // Fetch existing pending class for the student
  useEffect(() => {
    const fetchPendingClass = async () => {
      try {
        setPendingClassLoading(true);
        
        // Get the current user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          return;
        }
        
        // Get the student's pending classes
        const pendingClasses = await fetchClasses({
          status: "PENDING"
        });
        
        if (pendingClasses && pendingClasses.data && pendingClasses.data.length > 0) {
          const existingPendingClass = pendingClasses.data[0];
          console.log("Found existing pending class:", existingPendingClass);
          
          // Update the form data with the pending class details
          setPendingClass(existingPendingClass);
          
          // Update form data with the existing pending class details
          if (existingPendingClass.teacherId) {
            setSelectedTeacher(existingPendingClass.teacherId);
            handleSelectChange("selectedTeacherId", existingPendingClass.teacherId);
          }
          
          if (existingPendingClass.startDateTime) {
            handleDateTimeChange("classStartDateTime", new Date(existingPendingClass.startDateTime));
          }
          
          if (existingPendingClass.endDateTime) {
            handleDateTimeChange("classEndDateTime", new Date(existingPendingClass.endDateTime));
          }
        }
      } catch (err) {
        console.error("Error fetching pending class:", err);
      } finally {
        setPendingClassLoading(false);
      }
    };

    fetchPendingClass();
  }, [handleSelectChange, handleDateTimeChange]);

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
    handleTeacherSelect,
    pendingClass,
    pendingClassLoading
  };
} 
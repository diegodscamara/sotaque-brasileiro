import { useState, useEffect, useCallback, useRef } from "react";
import { getTeachers } from "@/app/actions/teachers";
import { fetchClasses } from "@/app/actions/classes";
import { createClient } from "@/libs/supabase/client";
import { getStudent } from "@/app/actions/students";
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
  
  // Add a ref to track if we've already fetched pending classes
  const hasFetchedPendingClass = useRef(false);

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
    // Only fetch pending classes once to prevent infinite loops
    if (hasFetchedPendingClass.current) {
      return;
    }
    
    const fetchPendingClass = async () => {
      try {
        setPendingClassLoading(true);
        hasFetchedPendingClass.current = true;
        
        // Get the current user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          return;
        }
        
        // Get the student data for the current user
        const studentData = await getStudent(user.id);
        
        if (!studentData) {
          console.log("No student record found for current user - this is likely a new user in onboarding");
          setPendingClassLoading(false);
          return;
        }
        
        // Get the student's pending classes with proper filtering by student ID
        const pendingClasses = await fetchClasses({
          status: "PENDING",
          studentId: studentData.id // Explicitly filter by the current student's ID
        });
        
        console.log(`Fetched pending classes for student ${studentData.id}:`, 
          pendingClasses?.data?.length ? pendingClasses.data.length : 0);
        
        if (pendingClasses && pendingClasses.data && pendingClasses.data.length > 0) {
          const existingPendingClass = pendingClasses.data[0];
          
          // Double-check that this class belongs to the current student
          if (existingPendingClass.studentId === studentData.id) {
            console.log(`Found existing pending class ID ${existingPendingClass.id} for current student ID ${studentData.id}`);
            
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
          } else {
            console.log(`Found pending class ID ${existingPendingClass.id} but it belongs to student ID ${existingPendingClass.studentId}, not current student ID ${studentData.id}`);
          }
        } else {
          console.log(`No pending classes found for current student ID ${studentData.id}`);
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
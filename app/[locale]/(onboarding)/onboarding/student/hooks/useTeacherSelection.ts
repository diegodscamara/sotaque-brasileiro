import { useState, useCallback } from "react";
import { TeacherComplete } from "@/types/teacher";
import { Step2FormData } from "../types";

/**
 * Hook return type for teacher selection
 */
interface UseTeacherSelectionReturn {
  teachers: TeacherComplete[];
  selectedTeacher: TeacherComplete | null;
  isLoadingTeachers: boolean;
  teacherError: string | null;
  handleTeacherSelect: (teacher: TeacherComplete) => void;
  refreshTeacherList: () => Promise<void>;
}

/**
 * Custom hook for managing teacher selection
 * @param formData - The form data for step 2
 * @returns {UseTeacherSelectionReturn} The teacher selection state and handlers
 */
export function useTeacherSelection(
  formData: Step2FormData
): UseTeacherSelectionReturn {
  const [teachers, setTeachers] = useState<TeacherComplete[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherComplete | null>(formData.selectedTeacher);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setIsLoadingTeachers(true);
    setTeacherError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/teachers");
      const data = await response.json();
      
      setTeachers(data.teachers);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeacherError("Failed to load teachers");
      setTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, []);

  // Handle teacher selection
  const handleTeacherSelect = useCallback((teacher: TeacherComplete) => {
    setSelectedTeacher(teacher);
    setTeacherError(null);
  }, []);

  // Refresh teacher list
  const refreshTeacherList = useCallback(async () => {
    await fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    selectedTeacher,
    isLoadingTeachers,
    teacherError,
    handleTeacherSelect,
    refreshTeacherList
  };
} 
import { useState, useCallback, useEffect } from "react";
import { TeacherComplete, TeacherSpecialty, TeacherLanguage, RecurringRule } from "@/types/teacher";
import { Step2FormData } from "../types";
import { getTeachers } from "@/app/actions/teachers";
import { getTeacherAvailabilityRange } from "@/app/actions/availability";

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

  // Fetch teachers with availability
  const fetchTeachers = useCallback(async () => {
    setIsLoadingTeachers(true);
    setTeacherError(null);

    try {
      // Get all teachers
      const allTeachers = await getTeachers();
      
      // Get the date range for the next 30 days
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Filter teachers with availability
      const teachersWithAvailability = await Promise.all(
        allTeachers.map(async (teacher) => {
          try {
            const availability = await getTeacherAvailabilityRange(
              teacher.id,
              startDate,
              endDate
            );
            
            // Only include teachers with available slots
            if (availability && availability.length > 0) {
              return {
                ...teacher,
                specialties: teacher.specialties as TeacherSpecialty[],
                languages: teacher.languages as TeacherLanguage[],
                availability: availability.map(slot => ({
                  ...slot,
                  recurringRules: Array.isArray(slot.recurringRules) 
                    ? (slot.recurringRules as unknown[]).map(rule => {
                        if (typeof rule !== 'object' || rule === null) return null;
                        const typedRule = rule as { 
                          frequency?: string;
                          interval?: number;
                          byWeekDay?: number[];
                          until?: Date;
                          count?: number;
                        };
                        if (!typedRule.frequency || !typedRule.interval) return null;
                        return {
                          frequency: typedRule.frequency as "daily" | "weekly" | "monthly",
                          interval: typedRule.interval,
                          byWeekDay: typedRule.byWeekDay,
                          until: typedRule.until,
                          count: typedRule.count
                        };
                      }).filter((rule): rule is NonNullable<typeof rule> => rule !== null)
                    : undefined
                })),
                classes: []
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching availability for teacher ${teacher.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and set teachers
      const filteredTeachers = teachersWithAvailability.filter((t): t is NonNullable<typeof t> => t !== null);
      setTeachers(filteredTeachers);
      
      // If the selected teacher no longer has availability, clear the selection
      if (selectedTeacher && !filteredTeachers.find(t => t.id === selectedTeacher.id)) {
        setSelectedTeacher(null);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeacherError("Failed to load teachers");
      setTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [selectedTeacher]);

  // Handle teacher selection
  const handleTeacherSelect = useCallback((teacher: TeacherComplete) => {
    setSelectedTeacher(teacher);
    setTeacherError(null);
  }, []);

  // Refresh teacher list
  const refreshTeacherList = useCallback(async () => {
    await fetchTeachers();
  }, [fetchTeachers]);

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
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
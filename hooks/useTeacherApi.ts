import { useCallback, useState } from 'react';

const useTeacherApi = () => {
  const [teachers, setTeachers] = useState<{ [key: string]: string }>({});
  const [teacher, setTeacher] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTeacher = useCallback(async (teacherId: string) => {
    if (teacher && teacher.id === teacherId) {
      return teacher; // Avoid fetching if the teacher is already loaded
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teachers/get?id=${teacherId}`);
      const data = await response.json();
      if (data && data.length > 0) { // Check if data is an array and has elements
        setTeacher(data[0]); // Set the first teacher from the array
      }
      return data[0]; // Return the first teacher from the array
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [teacher]);

  const getTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/teachers/get'); // Adjust this endpoint as needed
      const data = await response.json();
      setTeachers(data);
      return data; // Return the list of teachers
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const editTeacher = async (teacherId: string, teacherData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teachers/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId, teacherData }),
      });
      return response.json();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teachers/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId }),
      });
      return response.json();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { teachers, teacher, getTeacher, getTeachers, editTeacher, deleteTeacher, loading, error };
};

export default useTeacherApi; 
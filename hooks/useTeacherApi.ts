import { useState } from 'react';

const useTeacherApi = () => {
  const [teachers, setTeachers] = useState<{ [key: string]: string }>({}); // Store teacher names

  const getTeacher = async (teacherId: string) => {
    const response = await fetch(`/api/teachers/get?id=${teacherId}`);
    const data = await response.json();
    return data;
  };

  const getTeachers = async () => {
    const response = await fetch('/api/teachers/get'); // Adjust this endpoint as needed
    const data = await response.json();
    return data; // Return the list of teachers
  };

  const editTeacher = async (teacherId: string, teacherData: any) => {
    const response = await fetch(`/api/teachers/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teacherId, teacherData }),
    });
    return response.json();
  };

  const deleteTeacher = async (teacherId: string) => {
    const response = await fetch(`/api/teachers/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teacherId }),
    });
    return response.json();
  };

  return { getTeacher, getTeachers, editTeacher, deleteTeacher };
};

export default useTeacherApi; 
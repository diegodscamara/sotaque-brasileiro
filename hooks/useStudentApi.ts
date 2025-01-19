import { useCallback, useState } from 'react';

const useStudentApi = () => {
    const [students, setStudents] = useState<{ [key: string]: string }>({});
    const [student, setStudent] = useState<{ [key: string]: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getStudent = useCallback(async (studentId: string) => {
        if (student && student.id === studentId) {
            return student; // Avoid fetching if the student is already loaded
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/students/get?id=${studentId}`);
            const data = await response.json();
            if (data && data.length > 0) { // Check if data is an array and has elements
                setStudent(data[0]); // Set the first student from the array
            }
            return data[0]; // Return the first student from the array
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [student]);

    const getStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/students/get'); // Adjust this endpoint as needed
            const data = await response.json();
            setStudents(data);
            return data; // Return the list of students
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const editStudent = async (studentId: string, studentData: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/students/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId, studentData }),
            });
            return response.json();
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteStudent = async (studentId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/students/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId }),
            });
            return response.json();
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { students, student, getStudent, getStudents, editStudent, deleteStudent, loading, error };
};

export default useStudentApi; 
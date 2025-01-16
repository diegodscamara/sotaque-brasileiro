import { useCallback, useState } from 'react';

import axios from 'axios';

const useStudentApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStudent = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/students/getStudent?userId=${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = useCallback(async (userId: string, studentData: any) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`/api/students/updateStudent`, { userId, studentData });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getStudent, updateStudent };
};

export default useStudentApi; 
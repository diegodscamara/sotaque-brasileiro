import { useCallback, useState } from 'react';

import { toast } from 'react-hot-toast';
import { useSupabase } from '@/hooks/useSupabase';

const useClassApi = () => {
    const { supabase } = useSupabase();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchClasses = useCallback(async (filters = {}, pagination = { page: 1, limit: 10 }) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User not authenticated:', userError);
                throw new Error('User not authenticated');
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error('Session not found:', sessionError);
                throw new Error('Session not found');
            }
            const accessToken = session.access_token;

            const queryString = new URLSearchParams({
                ...filters,
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            }).toString();

            const response = await fetch(`/api/classes/get?${queryString}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching classes: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setClasses(data);
        } catch (err) {
            console.error('Error in fetchClasses:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const editClass = useCallback(async (classId: string, classData: any) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User not authenticated:', userError);
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/classes/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ classId, classData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error editing class: ${response.status} ${response.statusText}`, errorData);
                throw new Error(errorData.message || `Error editing class: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Error in editClass:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const cancelClass = useCallback(async (classId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User not authenticated:', userError);
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/classes/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ classId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error canceling class: ${response.status} ${response.statusText}`, errorData);
                throw new Error(errorData.message || `Error canceling class: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Error in cancelClass:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const scheduleClass = useCallback(async (classData: any) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('User not authenticated:', userError);
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/classes/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id, classData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error scheduling class: ${response.status} ${response.statusText}`, errorData);
                throw new Error(errorData.message || `Error scheduling class: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Error in scheduleClass:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    return { classes, loading, error, fetchClasses, editClass, cancelClass, scheduleClass };
};

export default useClassApi; 
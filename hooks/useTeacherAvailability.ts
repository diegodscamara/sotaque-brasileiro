import { useState } from 'react';

const useTeacherAvailability = () => {
    const [availability, setAvailability] = useState([]);

    const addAvailability = async (teacherId: string, date: string, start_time: string, end_time: string) => {
        const response = await fetch('/api/teacher_availability/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teacherId, date, start_time, end_time }),
        });
        return response.json();
    };

    const getAvailability = async (teacherId: string, date: string) => {
        const response = await fetch(`/api/teacher_availability/get?teacherId=${teacherId}&date=${date}`);
        const data = await response.json();
        setAvailability(data);
        return data;
    };

    return { addAvailability, getAvailability, availability };
};

export default useTeacherAvailability; 
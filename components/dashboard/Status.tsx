"use client";

import { CheckCircle, ClockUser, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const Status = () => {
  const [stats, setStats] = useState({
    creditsAvailable: 0,
    lessonsCompleted: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    // Mock data
    const mockData = {
      creditsAvailable: 10,
      lessonsCompleted: 12,
      attendanceRate: 85,
    };

    // Simulate an API call
    setTimeout(() => {
      setStats(mockData);
    }, 1000);
  }, []);

  return (
    <div className="w-full bg-white rounded-md shadow-sm stats ring-1 ring-gray-900/5">
      {/* Credits Available */}
      <div className="stat">
        <div className="stat-figure text-secondary">
          <ClockUser size={32} color="#98A1AE" />
        </div>
        <div className="text-base text-gray-500">Credits Available</div>
        <div className="text-4xl font-extrabold text-gray-900">{stats.creditsAvailable}</div>
      </div>

      {/* Lessons Completed */}
      <div className="stat">
        <div className="stat-figure text-secondary">
          <CheckCircle size={32} color="#98A1AE" />
        </div>
        <div className="text-base text-gray-500">Lessons Completed</div>
        <div className="text-4xl font-extrabold text-gray-900">{stats.lessonsCompleted}</div>
      </div>

      {/* Attendance Rate */}
      <div className="stat">
        <div className="stat-figure text-secondary">
          <Info size={32} color="#98A1AE" />
        </div>
        <div className="text-base text-gray-500">Attendance Rate</div>
        <div className="text-4xl font-extrabold text-gray-900">{stats.attendanceRate}%</div>
      </div>
    </div>
  );
};

export default Status;
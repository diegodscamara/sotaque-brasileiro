"use client";

import { CheckCircle, ClockUser, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

interface UserProfileData {
  name: string;
  image: string;
  has_access: boolean;
  created_at: string;
  credits: number;
  lessonsCompleted: number;
  attendanceRate: number;
}

const Stats = () => {

  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profile);
      }
    };

    fetchUser();
  }, [supabase]);

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full bg-white rounded-md shadow-sm stats ring-1 ring-gray-900/5">
      {/* Credits Available */}
      <div className="stat">
        <div className="stat-figure text-secondary">
          <ClockUser size={32} color="#98A1AE" />
        </div>
        <div className="text-base text-gray-500">Credits Available</div>
        <div className="text-4xl font-extrabold text-gray-900">{profile.credits || 0}</div>
      </div>

      {/* Lessons Completed */}
      <div className="stat">
        <div className="stat-figure text-secondary">
          <CheckCircle size={32} color="#98A1AE" />
        </div>
        <div className="text-base text-gray-500">Lessons Completed</div>
        <div className="text-4xl font-extrabold text-gray-900">{profile.lessonsCompleted || 0}</div>
      </div>

      {/* Attendance Rate */}
      <div className="stat">
        <div className="stat-figure text-secondary">
          <Info size={32} color="#98A1AE" />
        </div>
        <div className="text-base text-gray-500">Attendance Rate</div>
        <div className="text-4xl font-extrabold text-gray-900">{profile.attendanceRate || 0}%</div>
      </div>
    </div>
  );
};

export default Stats;
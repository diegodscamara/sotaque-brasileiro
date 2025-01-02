"use client";

import { useEffect, useState } from "react";

import Profile from "@/components/student/Profile";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

interface StudentProfileData {
  name: string;
  email: string;
  image: string;
  has_access: boolean;
  created_at: string;
  updated_at: string;
  credits: number;
}

const StudentProfile = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);

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
      <Profile />
  );
};

export default StudentProfile;

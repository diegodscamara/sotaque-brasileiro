"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";

interface UserProfileData {
  name: string;
  email: string;
  image: string;
  has_access: boolean;
  created_at: string;
  updated_at: string;
  credits: number;
}

const UserProfile = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
    <main className="p-8 md:p-24 bg-base-200 min-h-screen" data-theme={config.colors.theme}>
    <Link href="/" className="btn btn-ghost mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path
          fillRule="evenodd"
          d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
          clipRule="evenodd"
        />
      </svg>{" "}
      Back
    </Link>
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-2xl">User Profile</h1>
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="avatar mb-4 md:mb-0 md:mr-4">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <Image src={profile.image} alt={profile.name} width={100} height={100} />
            </div>
          </div>
          <div>
            <p className="text-lg"><strong>Name:</strong> {profile.name}</p>
            <p className="text-lg"><strong>Enrollment:</strong> {profile.has_access ? "Active" : "Inactive"}</p>
            <p className="text-lg"><strong>Created At:</strong> {new Date(profile.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-lg"><strong>Updated At:</strong> {new Date(profile.updated_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-lg"><strong>Credits:</strong> {profile.credits}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
  );
};

export default UserProfile;
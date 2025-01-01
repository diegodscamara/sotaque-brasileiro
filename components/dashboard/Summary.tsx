"use client";

import { Calendar, Clock } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import Avatar from "@/components/Avatar";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

interface UserProfileData {
  name: string;
  image: string;
  has_access: boolean;
  created_at: string;
  credits: number;
}

const Summary = () => {
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
    <div className="lg:col-start-3 lg:row-end-1">
      <h2 className="sr-only">Summary</h2>
      <div className="w-full px-4 py-5 bg-white rounded-md shadow-sm gap-x-4 max-h-[227px] sm:px-6 ring-1 ring-gray-900/5">
        <dl className="flex flex-wrap items-center">
          <div className="flex flex-row items-center flex-auto gap-4">
            <dt>
              <Avatar
                src={profile.image}
                alt={profile.name}
                width={24}
                height={24}
              />
            </dt>
            <dd className="text-base font-semibold text-gray-900">
              {profile.name}
            </dd>
          </div>
          <div className="self-end flex-none mb-3">
            <dt className="sr-only">Status</dt>
            <dd
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                profile.has_access
                  ? "bg-green-50 text-green-700 ring-green-600/20"
                  : "bg-red-50 text-red-700 ring-red-600/20"
              }`}
            >
              {profile.has_access ? "Active" : "Inactive"}
            </dd>
          </div>

          <div className="flex flex-none w-full mt-2 gap-x-4">
            <dt className="flex-none">
              <span className="text-gray-500 text-sm/6">Enrolled:</span>
            </dt>
            <dd className="text-gray-500 text-sm/6">
              <time dateTime={new Date(profile.created_at).toISOString()}>
                {new Date(profile.created_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </dd>
          </div>
          <div className="flex flex-none w-full mt-2 gap-x-4">
            <dt className="flex-none">
              <span className="text-gray-500 text-sm/6">Level:</span>
            </dt>
            <dd className="text-gray-500 text-sm/6">A1 Beginner</dd>
          </div>
        </dl>
        <div className="py-5 mt-3 border-t border-gray-900/5">
          <Link href="#" className="font-semibold text-gray-900 text-sm/6">
            View profile <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Summary;

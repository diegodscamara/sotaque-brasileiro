"use client";

import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import Avatar from "@/components/Avatar";
import Link from "next/link";
import { useSupabase } from "@/hooks/useSupabase";

interface UserProfileData {
  id: string;
  portuguese_level: string;
  name: string;
  image: string;
  has_access: boolean;
  created_at: string;
  credits: number;
  scheduled_lessons: number;
}

type ProfilePayload = RealtimePostgresChangesPayload<{
  new: UserProfileData;
  old: UserProfileData;
}>;

type ClassPayload = RealtimePostgresChangesPayload<{
  new: { student_id: string };
  old: { student_id: string };
}>;

const Summary = () => {
  const { supabase, session } = useSupabase();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchProfile = async () => {
    if (!session) return;
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.id)
        .single();

      if (error) throw error;
      setProfile(profile);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;

    fetchProfile();

    // Set up realtime subscription for both profiles and classes
    const channel = supabase
      .channel("summary_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.id}`,
        },
        (payload: ProfilePayload) => {
          console.log("Profile change received:", payload);
          if ('new' in payload && payload.new) {
            setProfile(payload.new as UserProfileData);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "classes",
          filter: `student_id=eq.${session.id}`,
        },
        (payload: ClassPayload) => {
          console.log("Class change received:", payload);
          fetchProfile();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    setChannel(channel);

    return () => {
      if (channel) {
        console.log("Removing channel subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [session?.id, supabase]);

  if (isLoading) {
    return (
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Summary</h2>
        <div className="gap-x-4 bg-white shadow-sm px-4 sm:px-6 py-5 rounded-md ring-1 ring-gray-900/5 w-full max-h-[227px]">
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-full w-6 h-6"></div>
              <div className="bg-gray-200 rounded w-1/4 h-4"></div>
            </div>
            <div className="bg-gray-200 rounded w-1/2 h-4"></div>
            <div className="bg-gray-200 rounded w-3/4 h-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Summary</h2>
        <div className="gap-x-4 bg-white shadow-sm px-4 sm:px-6 py-5 rounded-md ring-1 ring-gray-900/5 w-full max-h-[227px]">
          <p className="text-gray-500">No profile information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-start-3 lg:row-end-1">
      <h2 className="sr-only">Summary</h2>
      <div className="gap-x-4 bg-white shadow-sm px-4 sm:px-6 py-5 rounded-md ring-1 ring-gray-900/5 w-full max-h-[227px]">
        <dl className="flex flex-wrap items-center">
          <div className="flex flex-row flex-auto items-center gap-4">
            <dt>
              <Avatar
                src={profile.image}
                alt={profile.name}
                width={24}
                height={24}
              />
            </dt>
            <dd className="font-semibold text-base text-gray-900">
              {profile.name}
            </dd>
          </div>
          <div className="flex-none mb-3 self-end">
            <dt className="sr-only">Status</dt>
            <dd
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${profile.has_access
                ? "bg-green-50 text-green-700 ring-green-600/20"
                : "bg-red-50 text-red-700 ring-red-600/20"
              }`}
            >
              {profile.has_access ? "Active" : "Inactive"}
            </dd>
          </div>

          <div className="flex flex-none gap-x-4 mt-2 w-full">
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
          <div className="flex flex-none gap-x-4 mt-2 w-full">
            <dt className="flex-none">
              <span className="text-gray-500 text-sm/6">Level:</span>
            </dt>
            <dd className="text-gray-500 text-sm/6">
              {profile.portuguese_level
                ? profile.portuguese_level.charAt(0).toUpperCase() + profile.portuguese_level.slice(1)
                : "Unknown"}
            </dd>
          </div>
          <div className="flex flex-none gap-x-4 mt-2 w-full">
            <dt className="flex-none">
              <span className="text-gray-500 text-sm/6">Scheduled Lessons:</span>
            </dt>
            <dd className="text-gray-500 text-sm/6">
              {profile.scheduled_lessons || 0}
            </dd>
          </div>
        </dl>
        <div className="border-gray-900/5 mt-3 py-5 border-t">
          <Link href="/profile" className="font-semibold text-gray-900 text-sm/6">
            View profile <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Summary;

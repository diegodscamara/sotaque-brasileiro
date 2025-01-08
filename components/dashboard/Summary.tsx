"use client";

import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import Avatar from "@/components/Avatar";
import { Button } from "../ui/button";
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
          fetchProfile();
        }
      )

    setChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session?.id, supabase]);

  if (isLoading) {
    return (
      <div className="lg:col-start-3 lg:row-end-1 rounded-md w-full skeleton">
        <div className="gap-x-4 w-full h-full">
          <div className="flex flex-col">
            <div className="flex flex-wrap justify-between items-center px-6 py-4">
              <div className="flex flex-row flex-auto items-center gap-4">
                <div className="rounded-full w-16 h-16 skeleton"></div>
                <div className="flex flex-col gap-2">
                  <div className="rounded w-32 h-4 skeleton"></div>
                  <div className="rounded w-16 h-4 skeleton"></div>
                </div>

              </div>

              <div className="rounded w-16 h-8 skeleton"></div>
            </div>

            <div className="flex lg:flex-row flex-col justify-between items-center skeleton">
              <div className="flex gap-2 px-6 py-4 w-full">
                <div className="w-1/4 h-4 skeleton"></div>
                <div className="w-1/2 h-4 skeleton"></div>
              </div>

              <div className="flex gap-2 px-6 py-4 w-full">
                <div className="w-1/4 h-4 skeleton"></div>
                <div className="w-1/2 h-4 skeleton"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-start-3 lg:row-end-1 rounded-md w-full">
      <div className="gap-x-4 bg-white shadow-md rounded-md w-full h-full">
        <div className="flex flex-col rounded-md">
          <div className="flex flex-wrap justify-between items-center px-6 py-4">
            <div className="flex flex-row flex-auto items-center gap-4">
              <Avatar
                src={profile.image}
                alt={profile.name}
                width={64}
                height={64}
              />
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-base text-gray-900">
                  {profile.name}
                </span>
                <span
                  className={`w-fit rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${profile.has_access
                    ? "bg-green-50 text-green-700 ring-green-600/20"
                    : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}
                >
                  {profile.has_access ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

            <Button
              variant="outline" asChild
            >
              <Link href="/profile">
                View profile
              </Link>
            </Button>
          </div>

          <div className="flex lg:flex-row flex-col justify-between items-center border-gray-200 bg-gray-50 border-t rounded-b-md divide-x divide-gray-200">
            <div className="flex gap-2 px-6 py-4 w-full">
              <span className="font-semibold text-gray-500 text-sm/6">Enrolled:</span>
              <span className="text-gray-500 text-sm/6">
                <time dateTime={new Date(profile.created_at).toISOString()}>
                  {new Date(profile.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </span>
            </div>

            <div className="flex gap-2 px-6 py-4 w-full">
              <span className="font-semibold text-gray-500 text-sm/6">Level:</span>
              <span className="text-gray-500 text-sm/6">
                {profile.portuguese_level
                  ? profile.portuguese_level.charAt(0).toUpperCase() + profile.portuguese_level.slice(1)
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;

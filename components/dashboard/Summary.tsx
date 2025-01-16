"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSupabase } from "@/hooks/useSupabase";

interface UserProfileData {
  id: string;
  portuguese_level: string;
  name: string;
  avatar_url: string;
  has_access: boolean;
  created_at: string;
  credits: number;
  scheduled_lessons: number;
}

type ProfilePayload = RealtimePostgresChangesPayload<{
  new: UserProfileData;
  old: UserProfileData;
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
        .from("students")
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

    // Set up realtime subscription for both students and classes
    const channel = supabase
      .channel("summary_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
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
        () => {
          fetchProfile();
        }
      );

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

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between gap-2 w-full">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={profile.avatar_url}
              alt={profile.name}
              width={64}
              height={64}
            />
            <AvatarFallback>
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span
            className={`w-fit flex items-center justify-center h-fit rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${profile.has_access
              ? "bg-green-50 text-green-700 ring-green-600/20"
              : "bg-red-50 text-red-700 ring-red-600/20"
              }`}
          >
            {profile.has_access ? "Active" : "Inactive"}
          </span>
        </div>
        <CardTitle className="font-semibold text-base text-gray-900">
          {profile.name}
        </CardTitle>

      </CardHeader>
      <CardContent>
        <div className="flex gap-2 w-full">
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
        {profile.portuguese_level && <div className="flex gap-2 w-full">
          <span className="font-semibold text-gray-500 text-sm/6">Level:</span>
          <span className="text-gray-500 text-sm/6">
            {profile.portuguese_level.charAt(0).toUpperCase() + profile.portuguese_level.slice(1)}
          </span>
        </div>
        }
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <Link href="/profile">View profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Summary;

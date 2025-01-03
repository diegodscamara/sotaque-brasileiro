"use client";

import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ReactConfetti from "react-confetti";
import { enUS } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { useSupabase } from "@/hooks/useSupabase";

interface Profile {
  id: string;
  credits: number;
  scheduled_lessons: number;
  package_expiration: string | null;
  package_name: string | null;
  language: string | null;
}

type ProfilePayload = RealtimePostgresChangesPayload<{
  new: Profile;
  old: Profile;
}>;

type ClassPayload = RealtimePostgresChangesPayload<{
  new: { student_id: string };
  old: { student_id: string };
}>;

export default function Package() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchProfile = async () => {
    if (!session) return;
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.id)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);
      console.log("Profile fetched:", profileData);
    }
  };

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!session) return;

    fetchProfile();

    // Set up realtime subscription for both profiles and classes
    const channel = supabase
      .channel("package_changes")
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
            setProfile(payload.new as Profile);
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
        channel.unsubscribe();
      }
    };
  }, [session?.id, supabase]);

  const handleUpgrade = () => {
    router.push("/#pricing");
  };

  if (!profile) return null;

  const scheduledLessons = profile.scheduled_lessons || 0;
  const totalLessons = profile.credits || 0;
  const expiresIn = profile.package_expiration
    ? formatDistanceToNow(new Date(profile.package_expiration), {
        addSuffix: true,
        locale: enUS,
      })
    : "Not available";

  const progress = totalLessons > 0 ? (scheduledLessons / totalLessons) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">
            {profile.package_name || "Lesson Package"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {profile.language || "Portuguese"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/checkout")}
            className="btn btn-primary"
          >
            Buy More
          </button>
          <button
            onClick={handleUpgrade}
            className="btn btn-accent"
          >
            Upgrade
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">Scheduled Lessons</p>
            <p className="font-semibold">
              {scheduledLessons}/{totalLessons}
            </p>
          </div>
          <div className="bg-secondary rounded-full w-full h-2.5">
            <div
              className="bg-primary rounded-full h-2.5 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground text-sm">Expires</p>
          <p className="font-semibold">{expiresIn}</p>
        </div>
      </div>
    </div>
  );
}

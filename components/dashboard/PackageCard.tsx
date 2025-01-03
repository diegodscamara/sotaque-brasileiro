"use client";

import { Coins, Package } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

interface UserProfile {
  id: string;
  credits: number;
  has_access: boolean;
}

const PackageCard = () => {
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, credits, has_access")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to changes
      const channel = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Profile change received!', payload);
            fetchProfile(); // Refresh the profile when a change occurs
          }
        )
        .subscribe();

      setChannel(channel);
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 w-full">
        <div className="space-y-4 animate-pulse">
          <div className="bg-base-300 rounded w-1/4 h-4"></div>
          <div className="bg-base-300 rounded h-32"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto w-12 h-12 text-base-content/70" />
        <h3 className="mt-2 font-semibold text-sm">No package information</h3>
        <p className="mt-1 text-base-content/70 text-sm">
          Please contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-base">Available Credits</h3>
            <p className="text-base-content/70 text-sm">
              You have {profile.credits} credit{profile.credits !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>
        <div>
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              profile.has_access
                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
            }`}
          >
            {profile.has_access ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PackageCard; 
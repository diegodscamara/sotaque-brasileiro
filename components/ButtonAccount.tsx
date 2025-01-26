"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, SignOut, UserCircle } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";
import apiClient from "@/libs/api";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";

// A button to show user some account actions
//  1. Billing: open a Stripe Customer Portal to manage their billing (cancel subscription, update payment method, etc.).
//     You have to manually activate the Customer Portal in your Stripe Dashboard (https://dashboard.stripe.com/test/settings/billing/portal)
//     This is only available if the customer has a customerId (they made a purchase previously)
//  2. Logout: sign out and go back to homepage
// See more at https://shipfa.st/docs/components/buttonAccount
const ButtonAccount = () => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("has_access")
          .eq("id", user.id)
          .single();
        setUserData(profile);
      }
    };

    fetchUserData();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    window.location.reload();
  };

  const handleBilling = async () => {
    setIsLoading(true);

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-portal",
        {
          returnUrl: window.location.href,
        }
      );

      router.push(url);
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar>
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={"Profile picture"} />
          <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
        </Avatar>

        {isLoading ?? (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer"
            onClick={() => {
              window.location.href = "/profile";
            }}
          >
            <UserCircle className="w-5 h-5" />
            Profile
          </DropdownMenuItem>
          {userData?.has_access &&
            <DropdownMenuItem className="cursor-pointer"
              onClick={handleBilling}
            >
              <CreditCard className="w-5 h-5" />
              Billing
            </DropdownMenuItem>
          }
          <DropdownMenuItem className="cursor-pointer"
            onClick={handleSignOut}
          >
            <SignOut className="w-5 h-5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu >
  );
};

export default ButtonAccount;

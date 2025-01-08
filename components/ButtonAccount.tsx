/* eslint-disable @next/next/no-img-element */
"use client";

import { CreditCard, SignOut, UserCircle } from "@phosphor-icons/react";
import { Popover, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";

import Avatar from "@/components/Avatar";
import { User } from "@supabase/supabase-js";
import apiClient from "@/libs/api";
import { createClient } from "@/libs/supabase/client";

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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
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

      const router = (await import('next/router')).default;
      router.push(url);
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <Popover className="relative z-10">
      {() => (
        <>
          <Popover.Button className="rounded-full">
            {user?.user_metadata?.avatar_url ? (
              <Avatar
                src={user?.user_metadata?.avatar_url}
                alt={"Profile picture"}
              />
            ) : (
              <span className="flex justify-center items-center bg-base-100 rounded-full w-8 h-8 capitalize shrink-0">
                {user?.email?.charAt(0)}
              </span>
            )}

            {/* {user?.user_metadata?.name ||
              user?.email?.split("@")[0] ||
              "Account"} */}

            {isLoading ?? (
              <span className="loading loading-spinner loading-xs"></span>
            )}
          </Popover.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="right-0 z-10 absolute mt-3 w-screen max-w-[16rem] transform">
              <div className="bg-base-100 ring-opacity-5 shadow-xl p-1 rounded-md ring-1 ring-base-content overflow-hidden">
                <div className="flex flex-col items-start space-y-0.5 text-sm">
                  <button
                    className="flex justify-start items-center gap-2 w-full btn btn-ghost btn-sm"
                    onClick={() => {
                      window.location.href = "/profile";
                    }}
                  >
                    <UserCircle className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    className="flex justify-start items-center gap-2 w-full btn btn-ghost btn-sm"
                    onClick={handleBilling}
                  >
                    <CreditCard className="w-5 h-5" />
                    Billing
                  </button>

                  <div className="bg-base-200 w-full h-px"></div>
                  <button
                    className="flex justify-start items-center gap-2 w-full btn btn-ghost btn-sm"
                    onClick={handleSignOut}
                  >
                    <SignOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default ButtonAccount;

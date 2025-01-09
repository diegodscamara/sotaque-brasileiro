"use client";

import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import ButtonAccount from "./ButtonAccount";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = () => {
  const supabase = createClient();
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

  if (user) {
    return <ButtonAccount />;
  }

  return (
    <Button variant="outline" asChild>
      <Link
        href={config.auth.loginUrl}
      >
        Sign in
      </Link>
    </Button>
  );
};

export default ButtonSignin;

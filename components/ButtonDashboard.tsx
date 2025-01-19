"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";

const ButtonDashboard = () => {
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
  return (
    <Link href={config.auth.callbackUrl} className="btn">
      <Image
        src={user?.user_metadata?.avatar_url}
        alt={user?.user_metadata?.first_name || "Account"}
        className="rounded-full w-6 h-6 shrink-0"
        referrerPolicy="no-referrer"
        width={24}
        height={24}
      />
      <span className="flex justify-center items-center bg-base-300 rounded-full w-6 h-6 shrink-0">
        {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0)}
      </span>
      {user?.user_metadata?.first_name || user?.email || "Account"}
    </Link>
  );
};

export default ButtonDashboard;

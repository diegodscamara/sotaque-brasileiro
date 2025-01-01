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
        alt={user?.user_metadata?.name || "Account"}
        className="w-6 h-6 rounded-full shrink-0"
        referrerPolicy="no-referrer"
        width={24}
        height={24}
      />
      <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
        {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
      </span>
      {user?.user_metadata?.name || user?.email || "Account"}
    </Link>
  );
};

export default ButtonDashboard;

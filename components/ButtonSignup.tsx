"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

const ButtonSignup = () => {
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
        return null;
    }

    return (
        <Button
            variant="default"
            asChild
        >
            <Link href="/signup">
                Get started
            </Link>
        </Button>
    );
};

export default ButtonSignup; 
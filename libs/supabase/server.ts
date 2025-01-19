import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        setAll(cookiesToSet) {
          (async () => {
            const store = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options)
            );
          })();
        },
      },
    }
  );
}

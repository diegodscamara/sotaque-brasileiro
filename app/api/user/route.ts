import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

interface RequestBody {
    email: string;
}

interface SupabaseUser {
    id: string;
    email: string;
    // Add other user properties if needed
}

interface SupabaseResponse {
    data: SupabaseUser[];
    error?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser() as { data: { user: SupabaseUser } };

    if (user) {
        const body: RequestBody = await req.json();

        if (!body.email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        try {
            // This call will fail if you haven't created a table named "profiles" in your database
            const { data } = await supabase
                .from("profiles")
                .insert({ email: body.email })
                .select() as SupabaseResponse;

            return NextResponse.json({ data }, { status: 200 });
        } catch (e) {
            console.error(e);
            return NextResponse.json(
                { error: "Something went wrong" },
                { status: 500 }
            );
        }
    } else {
        // Not Signed in
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
}

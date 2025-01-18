import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/libs/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  // Function to handle redirection
 const handleRedirect = (url: string) => {
  if (typeof window !== "undefined") {
    window.location.href = url; // Use window.location for redirection
  }
};

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if a user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 }); // Return 401 status
      }

      const { data } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .single();

      if (data || !data.has_access) {
        // Redirect to pricing page if no active plan
        handleRedirect(`${origin}/pricing`);
      }

      // Redirect to dashboard if the user has an active plan
      handleRedirect(`${origin}${next}`);
    }
  }

  // If no code or authentication fails, redirect to error page
  handleRedirect(`${origin}/auth/auth-code-error`);
}

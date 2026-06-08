import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isEntitled } from "@/lib/lab/access";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lenbcecnvjaylhigtlfl.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbmJjZWNudmpheWxoaWd0bGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTY2OTUsImV4cCI6MjA5NTkzMjY5NX0.ShfgNYlLAXicgIkJSTw0m6ZJXRbCLEdyIlPBBtl1yBg";

// Refreshes the Supabase session cookie on every matched request and HARD-GATES
// the Lab game bundle: requests to /lab-assets/* are 401'd unless the user has a
// valid Lab entitlement. The static files are never served to the unentitled.
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: getUser() refreshes the session and must run for cookie rotation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Hard gate: protect the game bundle.
  if (req.nextUrl.pathname.startsWith("/lab-assets")) {
    let ok = false;
    if (user) {
      const { data } = await supabase
        .from("lab_members")
        .select("status,current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();
      ok = isEntitled(data);
    }
    if (!ok) {
      return new NextResponse("Lab access required.", {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/lab/:path*",
    "/lab-assets/:path*",
    "/inbox/:path*",
    "/auth/:path*",
    "/portal/:path*",
    "/admin/:path*",
  ],
};

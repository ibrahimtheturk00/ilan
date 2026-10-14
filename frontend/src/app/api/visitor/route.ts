import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Server-side Supabase client with service role (bypass RLS for counter increment)
const serverSupabase = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey)
  : (supabaseUrl && anonKey)
  ? createClient(supabaseUrl, anonKey)
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    if (!serverSupabase) {
      return NextResponse.json({ count: 1420 }, { headers: corsHeaders });
    }

    const { data, error } = await serverSupabase
      .from("sources")
      .select("scrape_interval_minutes")
      .eq("slug", "visitor-counter")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ count: 1420 }, { headers: corsHeaders });
    }

    const count = Number(data.scrape_interval_minutes) || 1420;
    return NextResponse.json({ count }, { headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/visitor error:", err);
    return NextResponse.json({ count: 1420 }, { headers: corsHeaders });
  }
}

export async function POST() {
  try {
    if (!serverSupabase) {
      return NextResponse.json({ count: 1421 }, { headers: corsHeaders });
    }

    // 1. Fetch current counter
    const { data, error } = await serverSupabase
      .from("sources")
      .select("scrape_interval_minutes")
      .eq("slug", "visitor-counter")
      .maybeSingle();

    const currentCount = (data && !error && data.scrape_interval_minutes) 
      ? Number(data.scrape_interval_minutes) 
      : 1420;

    const newCount = currentCount + 1;

    // 2. Increment in Supabase
    const { error: updateError } = await serverSupabase
      .from("sources")
      .update({
        scrape_interval_minutes: newCount,
        last_scraped_at: new Date().toISOString(),
      })
      .eq("slug", "visitor-counter");

    if (updateError) {
      console.warn("Failed to update visitor counter:", updateError);
    }

    return NextResponse.json({ count: newCount }, { headers: corsHeaders });
  } catch (err) {
    console.error("POST /api/visitor error:", err);
    return NextResponse.json({ count: 1421 }, { headers: corsHeaders });
  }
}

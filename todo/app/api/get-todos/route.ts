import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("todos").select("task");

  if (error) {
    return NextResponse.json({
      msg: error,
    });
  }

  return NextResponse.json({
    data: data || [],
  });
}

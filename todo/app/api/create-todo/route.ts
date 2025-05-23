import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Get the current user's session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { todo } = await request.json();

  // Validate todo length
  if (todo.length <= 3) {
    return NextResponse.json(
      { error: "Todo must be longer than 3 characters" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("todos")
    .insert({
      task: todo,
      user_id: session.user.id,
      is_complete: false
    })
    .select();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

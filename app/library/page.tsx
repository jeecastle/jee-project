export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LibraryClient from "./LibraryClient";
import type { SavedAnalysis } from "@/lib/types";

export default async function LibraryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("analyses")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <LibraryClient
      initialItems={(data as Pick<SavedAnalysis, "id" | "title" | "created_at">[]) ?? []}
    />
  );
}

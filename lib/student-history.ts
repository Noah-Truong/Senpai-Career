import { createClient } from "@/lib/supabase/server";

/**
 * Record a page view in browsing history (for students only)
 */
export async function recordBrowsingHistory(
  userId: string,
  itemType: "company" | "recruitment",
  itemId: string
): Promise<void> {
  const supabase = await createClient();

  // Check if user is a student
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (!user || user.role !== "student") {
    return; // Silently skip if not a student
  }

  try {
    // Use the database function if available
    const { error: functionError } = await supabase.rpc("record_browsing_history", {
      p_student_id: userId,
      p_item_type: itemType,
      p_item_id: itemId,
    });

    if (functionError) {
      // Fallback: direct insert
      await supabase.from("browsing_history").insert({
        student_id: userId,
        item_type: itemType,
        item_id: itemId,
      });
    }
  } catch (error) {
    console.error("Error recording browsing history:", error);
    // Don't throw - browsing history is non-critical
  }
}

/**
 * Check if an item is saved by a student
 */
export async function isItemSaved(
  userId: string,
  itemType: "company" | "recruitment",
  itemId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_items")
    .select("id")
    .eq("student_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking saved status:", error);
    return false;
  }

  return !!data;
}

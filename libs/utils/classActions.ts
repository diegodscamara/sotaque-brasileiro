import { Class } from "@/types/class";
import { createClient } from "@/libs/supabase/client";
import { isDateBookable } from "@/libs/utils/date";
import { toast } from "react-hot-toast";

export const cancelClass = async (cancelType: 'single' | 'all', selectedClass: Class, forceCancel: boolean = false): Promise<boolean> => {
  const supabase = createClient();
  const startTime = new Date(selectedClass.start_time);
  const isBookable = isDateBookable(startTime);
  const shouldRefundCredit = isBookable || !forceCancel;

  if (cancelType === 'single') {
    if (!isBookable && !forceCancel) {
      // Class is less than 24 hours away, return true to indicate AlertDialog should be shown
      return true;
    }

    // Cancel single class
    const { error } = await supabase
      .from("classes")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        refund_credit: shouldRefundCredit
      })
      .eq("id", selectedClass.id);

    if (error) throw error;
  } else {
    // Cancel all future classes in the recurring group
    const { error: updateError } = await supabase
      .from("classes")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        refund_credit: shouldRefundCredit
      })
      .eq("recurring_group_id", selectedClass.recurring_group_id)
      .gte("start_time", new Date().toISOString());

    if (updateError) throw updateError;
  }

  // Wait for the trigger function to update the user's credit balance
  const { data: profile, error: profileError } = await supabase
    .from("students")
    .select("credits")
    .eq("id", selectedClass.user_id)
    .single();

  if (profileError) {
    console.error("Error fetching updated credit balance after cancellation:", profileError);
  }

  return false;
}; 
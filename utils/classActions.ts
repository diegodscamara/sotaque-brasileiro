import { Class } from "@/types/class";
import { createClient } from "@/libs/supabase/client";
import { isDateBookable } from "@/utils/date";
import { toast } from "react-hot-toast";

export const cancelClass = async (cancelType: 'single' | 'all', selectedClass: Class) => {
  const supabase = createClient();

  return new Promise(async (resolve, reject) => {
    try {
      if (cancelType === 'single') {
        // Check if the class is at least 24 hours away
        const startTime = new Date(selectedClass.start_time);
        const isBookable = isDateBookable(startTime);

        if (!isBookable) {
          // Inform the student that they will lose the credit
          const confirmed = window.confirm(
            "This class is less than 24 hours away. Cancelling now will result in losing the credit. Do you still want to cancel?"
          );

          if (!confirmed) {
            return;
          }
        }

        // Cancel single class and remove it from the recurring group
        const { error } = await supabase
          .from("classes")
          .update({
            status: "cancelled",
            recurring_group_id: null, // Remove from recurring group
            updated_at: new Date().toISOString(),
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
          })
          .eq("recurring_group_id", selectedClass.recurring_group_id)
          .gte("start_time", new Date().toISOString()); // Only cancel future classes

        if (updateError) throw updateError;
      }

      // Wait for the trigger function to update the user's credit balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", selectedClass.student_id)
        .single();

      if (profileError) throw profileError;

      toast.success(cancelType === 'single'
        ? "Class cancelled successfully"
        : "All future recurring classes cancelled successfully"
      );

      resolve(profile?.credits || 0);
    } catch (error) {
      console.error("Error cancelling class:", error);
      toast.error("Failed to cancel class");
      reject(error);
    }
  });
}; 
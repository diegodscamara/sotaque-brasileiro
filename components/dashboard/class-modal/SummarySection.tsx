import { Button } from "@/components/ui/button";
import { Class } from "@/types/class";
import React from "react";

interface SummarySectionProps {
  selectedClass?: Class;
  getClassDates: () => Date[];
  availableCredits: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const SummarySection = ({
  selectedClass,
  getClassDates,
  availableCredits,
  isSubmitting,
  onCancel,
  onClose
}: SummarySectionProps) => {
  return (
    <div className={`bg-base-200/50 p-4 ${selectedClass?.status === 'completed' || selectedClass?.status === 'cancelled' ? 'hidden' : ''}`}>
      <div className="flex justify-between items-center text-sm">
        <div className="space-y-1">
          {!selectedClass && (
            <>
              <p>Classes to book: {getClassDates().length}</p>
              <p>Credits required: {getClassDates().length}</p>
              <p>Credits available: {availableCredits}</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {selectedClass && (selectedClass.status !== 'completed' && selectedClass.status !== 'cancelled') && (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Cancel Class
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Abandon Changes
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </>
          )}
          {!selectedClass && (
            <>
              <Button
                type="button"
                onClick={onClose}
                variant="destructive"
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                {isSubmitting ? "Saving..." : `Schedule ${getClassDates().length > 1 ? 'Classes' : 'Class'}`}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarySection; 
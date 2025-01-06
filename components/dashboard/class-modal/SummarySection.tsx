import { Class } from "@/types/class";
import React from "react";

interface SummarySectionProps {
  selectedClass?: Class;
  getClassDates: () => Date[];
  availableCredits: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SummarySection = ({
  selectedClass,
  getClassDates,
  availableCredits,
  isSubmitting,
  onCancel,
  onClose,
  onSubmit,
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
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-error btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Cancel Class
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-primary btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Abandon Changes
              </button>
              <button
                type="submit"
                className="text-base-200 btn btn-primary btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                {isSubmitting ? "Saving..." : "Update"}
              </button>
            </>
          )}
          {!selectedClass && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-error btn-sm"
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                Cancel
              </button>
              <button
                type="submit"
                className="text-base-200 btn btn-primary btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                {isSubmitting ? "Saving..." : `Schedule ${getClassDates().length > 1 ? 'Classes' : 'Class'}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarySection; 
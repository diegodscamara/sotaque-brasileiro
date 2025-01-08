import { Class } from "@/types/class";
import { NotePencil } from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  onChange: (notes: string) => void;
  selectedClass?: Class;
}

const NotesSection = ({ notes, onChange, selectedClass }: NotesSectionProps) => {
  const isImmutable = selectedClass?.status === 'completed' || selectedClass?.status === 'cancelled';

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <NotePencil className="mt-3 w-5 h-5 text-base-content/70" />
        <div className="flex-1">
          {isImmutable ? (
            notes ? (
              <p className="mt-2 text-base-content whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="mt-2 text-base-content/50 italic">No notes</p>
            )
          ) : (
            <Textarea
              value={notes}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Add notes"
              className="w-full h-24"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesSection; 
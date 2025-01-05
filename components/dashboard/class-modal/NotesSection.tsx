import { NotePencil } from "@phosphor-icons/react";

interface NotesSectionProps {
  notes: string;
  onChange: (notes: string) => void;
}

const NotesSection = ({ notes, onChange }: NotesSectionProps) => {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <NotePencil className="mt-2 w-5 h-5 text-base-content/70" />
        <textarea
          className="focus:bg-transparent px-2 border w-full min-h-[100px] textarea textarea-primary"
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add description or special requests..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default NotesSection; 
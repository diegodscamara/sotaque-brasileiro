import { NotePencil } from "@phosphor-icons/react";

interface TitleSectionProps {
  title: string;
  onChange: (title: string) => void;
}

const TitleSection = ({ title, onChange }: TitleSectionProps) => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <NotePencil className="w-5 h-5 text-base-content/70" />
        <input
          type="text"
          className="focus:bg-transparent px-2 w-full font-medium text-lg input input-primary input-sm"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add title"
          required
        />
      </div>
    </div>
  );
};

export default TitleSection; 
import { Class } from "@/types/class";
import { Input } from "@/components/ui/input";
import { TextAlignLeft } from "@phosphor-icons/react";

interface TitleSectionProps {
  title: string;
  onChange: (title: string) => void;
  selectedClass?: Class;
}

const TitleSection = ({ title, onChange, selectedClass }: TitleSectionProps) => {
  const isImmutable = selectedClass?.status === 'completed' || selectedClass?.status === 'cancelled';

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <TextAlignLeft className="mt-3 w-5 h-5 text-base-content/70" />
        <div className="flex-1">
          {isImmutable ? (
            <p className="mt-2 text-base-content text-lg">{title}</p>
          ) : (
            <Input
              type="text"
              value={title}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Class Title"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleSection; 
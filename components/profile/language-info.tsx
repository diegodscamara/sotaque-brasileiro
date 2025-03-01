import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MultiCombobox } from "@/components/ui/multi-combobox";
import { StudentProfileData } from '@/types/profile';
import { Textarea } from "@/components/ui/textarea";

interface LanguageLearningProps {
  profile: StudentProfileData;
  formData: Partial<StudentProfileData>;
  onFieldChange: (field: string, value: any) => void;
  languageOptions: Array<{ id: string; name: string }>;
}

/**
 * LanguageLearning component for displaying and editing language learning preferences
 * 
 * @param profile - The user's profile data
 * @param formData - The current form state
 * @param onFieldChange - Function to handle field changes
 * @param languageOptions - Available language options
 */
export const LanguageLearning = ({ 
  profile, 
  formData, 
  onFieldChange, 
  languageOptions 
}: LanguageLearningProps) => {
  return (
    <div>
      <h2 className="mt-4 font-semibold text-base">Language Learning</h2>
      <p className="mt-1 text-gray-500 text-sm">
        Configure your language learning preferences and goals.
      </p>

      <div className="space-y-6 mt-6 text-sm">
        {/* Portuguese Level */}
        <div className="pb-8 border-b border-border">
          <h3 className="pt-6 font-medium text-lg">Portuguese Level</h3>
          <div className="mt-4">
            <Select
              value={formData.portugueseLevel || ''}
              onValueChange={(value) => onFieldChange('portugueseLevel', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="native">Native</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Native Language */}
        <div className="pb-8 border-b border-border">
          <h3 className="font-medium text-lg">Native Language</h3>
          <div className="mt-4">
            <Select
              value={formData.nativeLanguage || ''}
              onValueChange={(value) => onFieldChange('nativeLanguage', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your native language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Other Languages */}
        <div className="pb-8 border-b border-border">
          <h3 className="font-medium text-lg">Other Languages</h3>
          <div className="mt-4">
            <MultiCombobox
              options={languageOptions}
              values={formData.otherLanguages || []}
              onChange={(values) => onFieldChange('otherLanguages', values)}
              placeholder="Select languages you speak"
              ariaLabel="Other languages you speak"
            />
          </div>
        </div>

        {/* Learning Goals */}
        <div className="pb-8 border-b border-border">
          <h3 className="font-medium text-lg">Learning Goals</h3>
          <div className="mt-4">
            <label htmlFor="learningGoals" className="sr-only">
              Learning Goals
            </label>
            <Textarea
              id="learningGoals"
              value={Array.isArray(formData.learningGoals) ? formData.learningGoals.join('\n') : ''}
              onChange={(e) => onFieldChange('learningGoals', e.target.value.split('\n').filter(Boolean))}
              placeholder="What are your goals for learning Portuguese? (One per line)"
              className="w-full h-32"
            />
            <p className="mt-1 text-muted-foreground text-xs">
              Enter each goal on a new line
            </p>
          </div>
        </div>

        {/* Motivation */}
        <div className="pb-8">
          <h3 className="font-medium text-lg">Motivation</h3>
          <div className="mt-4">
            <label htmlFor="motivationForLearning" className="sr-only">
              Motivation for Learning
            </label>
            <Textarea
              id="motivationForLearning"
              value={formData.motivationForLearning || ''}
              onChange={(e) => onFieldChange('motivationForLearning', e.target.value)}
              placeholder="What motivated you to learn Portuguese?"
              className="w-full h-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 
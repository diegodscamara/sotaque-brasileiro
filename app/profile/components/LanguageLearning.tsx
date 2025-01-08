import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { PencilLine } from "@phosphor-icons/react";
import { StudentProfileData } from '@/types/profile';
import { Textarea } from "@/components/ui/textarea";

interface LanguageLearningProps {
  profile: StudentProfileData;
  handleUpdate: (field: string, value: string | number | string[]) => void;
  handleMultiSelect: (field: string, values: string[]) => void;
  languageOptions: Array<{ id: string; name: string }>;
  learningStyles: Array<{ id: string; name: string }>;
  interestOptions: Array<{ id: string; name: string }>;
  isEditing: string | null;
  setIsEditing: (value: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
}

export const LanguageLearning = ({ profile, handleUpdate, handleMultiSelect, languageOptions, learningStyles, interestOptions, isEditing, setIsEditing, editValue, setEditValue }: LanguageLearningProps) => {
  return (
    <div>
      <h2 className="font-semibold text-base text-gray-900">Language Learning</h2>
      <p className="mt-1 text-gray-500 text-sm">
        Configure your language learning preferences and goals.
      </p>

      <dl className="space-y-6 border-gray-200 mt-6 border-t text-sm">
        {/* Portuguese Level */}
        <div className="pb-8 border-b">
          <h3 className="pt-6 font-medium text-gray-900 text-lg">Portuguese Level</h3>
          <Select
            value={profile.portuguese_level || ''}
            onValueChange={(value) => handleUpdate('portuguese_level', value)}
          >
            <SelectTrigger>
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

        {/* Native Language */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Native Language</h3>
          <Select
            value={profile.native_language || ''}
            onValueChange={(value) => handleUpdate('native_language', value)}
          >
            <SelectTrigger>
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

        {/* Other Languages */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Other Languages</h3>
          <div className="mt-4">
            <MultiCombobox
              options={languageOptions}
              values={profile.other_languages || []}
              onChange={(values) => handleMultiSelect('other_languages', values)}
              placeholder="Select languages you speak"
            />
          </div>
        </div>

        {/* Learning Goals */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Learning Goals</h3>
          {isEditing === 'learning_goals' ? (
            <div className="flex flex-col gap-4">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="What are your goals for learning Portuguese? (One per line)"
                className="mt-2 textarea-bordered w-full h-32 textarea textarea-primary textarea-sm"
              />
              <div className="flex gap-x-4">
                <Button
                  variant="default"
                  onClick={() => handleUpdate('learning_goals', editValue.split('\n').filter(Boolean))}
                >
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsEditing(null);
                    setEditValue("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="my-6 text-gray-900 whitespace-pre-line">
                {profile.learning_goals?.join('\n') || 'Not specified'}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing('learning_goals');
                  setEditValue(profile.learning_goals?.join('\n') || '');
                }}
              >
                <PencilLine className="w-5 h-5" />
                Update
              </Button>
            </>
          )}
        </div>

        {/* Learning Style */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Learning Style</h3>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-4">
            {learningStyles.map((style) => (
              <label key={style.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={profile.learning_style?.includes(style.id as any)}
                  onCheckedChange={(checked) => {
                    const newStyles = checked
                      ? [...(profile.learning_style || []), style.id]
                      : (profile.learning_style || []).filter(s => s !== style.id);
                    handleMultiSelect('learning_style', newStyles);
                  }}
                />
                <span className="text-sm">{style.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Interests</h3>
          <p className="mt-1 text-gray-500 text-sm">Select topics you're interested in learning about</p>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-4">
            {interestOptions.map((interest) => (
              <label key={interest.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={profile.interests?.includes(interest.id)}
                  onCheckedChange={(checked) => {
                    const newInterests = checked
                      ? [...(profile.interests || []), interest.id]
                      : (profile.interests || []).filter(i => i !== interest.id);
                    handleMultiSelect('interests', newInterests);
                  }}
                />
                <span className="text-sm">{interest.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div className="pb-8">
          <h3 className="font-medium text-gray-900 text-lg">Motivation</h3>
          {isEditing === 'motivation_for_learning' ? (
            <div className="flex flex-col gap-4 w-full">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="What motivated you to learn Portuguese?"
                className="mt-2 textarea-bordered w-full h-32 textarea textarea-primary textarea-sm"
              />
              <div className="flex gap-4">
                <Button
                  variant="default"
                  onClick={() => handleUpdate('motivation_for_learning', editValue)}
                >
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsEditing(null);
                    setEditValue("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="my-6 text-gray-900 whitespace-pre-line">
                {profile.motivation_for_learning || 'Not specified'}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing('motivation_for_learning');
                  setEditValue(profile.motivation_for_learning || '');
                }}
              >
                <PencilLine className="w-5 h-5" />
                Update
              </Button>
            </>
          )}
        </div>
      </dl>
    </div>
  );
}; 
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { PencilLine } from "@phosphor-icons/react";
import { StudentProfileData } from '@/types/profile';

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
          <select
            value={profile.portuguese_level || ''}
            onChange={(e) => handleUpdate('portuguese_level', e.target.value)}
            className="mt-2 w-full select-bordered select-primary select-sm select"
          >
            <option value="">Select your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="native">Native</option>
          </select>
        </div>

        {/* Native Language */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Native Language</h3>
          <select
            value={profile.native_language || ''}
            onChange={(e) => handleUpdate('native_language', e.target.value)}
            className="mt-2 w-full select-bordered select-primary select-sm select"
          >
            <option value="">Select your native language</option>
            {languageOptions.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
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
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="What are your goals for learning Portuguese? (One per line)"
                className="mt-2 textarea-bordered w-full h-32 textarea textarea-primary textarea-sm"
              />
              <div className="flex gap-x-4">
                <button
                  onClick={() => handleUpdate('learning_goals', editValue.split('\n').filter(Boolean))}
                  className="text-base-200 btn btn-primary btn-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(null);
                    setEditValue("");
                  }}
                  className="bg-red-600 hover:bg-red-700 text-base-200 btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="my-6 text-gray-900 whitespace-pre-line">
                {profile.learning_goals?.join('\n') || 'Not specified'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing('learning_goals');
                  setEditValue(profile.learning_goals?.join('\n') || '');
                }}
                className="btn btn-outline btn-sm"
              >
                <PencilLine className="w-5 h-5" />
                Update
              </button>
            </>
          )}
        </div>

        {/* Learning Style */}
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Learning Style</h3>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-4">
            {learningStyles.map((style) => (
              <label key={style.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={profile.learning_style?.includes(style.id as any)}
                  onChange={(e) => {
                    const newStyles = e.target.checked
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
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={profile.interests?.includes(interest.id)}
                  onChange={(e) => {
                    const newInterests = e.target.checked
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
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="What motivated you to learn Portuguese?"
                className="mt-2 textarea-bordered w-full h-32 textarea textarea-primary textarea-sm"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => handleUpdate('motivation_for_learning', editValue)}
                  className="text-base-200 btn btn-primary btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(null);
                  setEditValue("");
                }}
                className="bg-red-600 hover:bg-red-700 text-base-200 btn btn-ghost btn-sm"
              >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="my-6 text-gray-900 whitespace-pre-line">
                {profile.motivation_for_learning || 'Not specified'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing('motivation_for_learning');
                  setEditValue(profile.motivation_for_learning || '');
                }}
                className="btn btn-outline btn-sm"
              >
                <PencilLine className="w-5 h-5" />
                Update
              </button>
            </>
          )}
        </div>
      </dl>
    </div>
  );
}; 
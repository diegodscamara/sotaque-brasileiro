import { MultiCombobox } from "@/components/ui/multi-combobox";
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
      <h2 className="text-base font-semibold text-gray-900">Language Learning</h2>
      <p className="mt-1 text-sm text-gray-500">
        Configure your language learning preferences and goals.
      </p>

      <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm">
        {/* Portuguese Level */}
        <div className="border-b pb-8">
          <h3 className="text-lg pt-6 font-medium text-gray-900">Portuguese Level</h3>
          <select
            value={profile.portuguese_level || ''}
            onChange={(e) => handleUpdate('portuguese_level', e.target.value)}
            className="mt-2 select select-bordered w-full"
          >
            <option value="">Select your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="native">Native</option>
          </select>
        </div>

        {/* Native Language */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-900">Native Language</h3>
          <select
            value={profile.native_language || ''}
            onChange={(e) => handleUpdate('native_language', e.target.value)}
            className="mt-2 select select-bordered w-full"
          >
            <option value="">Select your native language</option>
            {languageOptions.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Learning Goals */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-900">Learning Goals</h3>
          {isEditing === 'learning_goals' ? (
            <div className="flex gap-x-4 w-full">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="What are your goals for learning Portuguese? (One per line)"
                className="mt-2 textarea textarea-bordered w-full h-32"
              />
              <button
                onClick={() => handleUpdate('learning_goals', editValue.split('\n').filter(Boolean))}
                className="btn btn-success btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(null);
                  setEditValue("");
                }}
                className="btn btn-error btn-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="text-gray-900 whitespace-pre-line">
                {profile.learning_goals?.join('\n') || 'Not specified'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing('learning_goals');
                  setEditValue(profile.learning_goals?.join('\n') || '');
                }}
                className="btn btn-ghost btn-sm mt-2"
              >
                Update
              </button>
            </>
          )}
        </div>

        {/* Learning Style */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-900">Learning Style</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-900">Interests</h3>
          <p className="text-sm text-gray-500 mt-1">Select topics you're interested in learning about</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div>
          <h3 className="text-lg font-medium text-gray-900">Motivation</h3>
          {isEditing === 'motivation_for_learning' ? (
            <div className="flex gap-x-4 w-full">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="What motivated you to learn Portuguese?"
                className="mt-2 textarea textarea-bordered w-full h-32"
              />
              <button
                onClick={() => handleUpdate('motivation_for_learning', editValue)}
                className="btn btn-success btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(null);
                  setEditValue("");
                }}
                className="btn btn-error btn-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="text-gray-900">
                {profile.motivation_for_learning || 'Not specified'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing('motivation_for_learning');
                  setEditValue(profile.motivation_for_learning || '');
                }}
                className="btn btn-ghost btn-sm mt-2"
              >
                Update
              </button>
            </>
          )}
        </div>

        {/* Other Languages */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-900">Other Languages</h3>
          <div className="mt-4">
            <MultiCombobox
              options={languageOptions}
              values={profile.other_languages || []}
              onChange={(values) => handleMultiSelect('other_languages', values)}
              placeholder="Select languages you speak"
            />
          </div>
        </div>
      </dl>
    </div>
  );
}; 
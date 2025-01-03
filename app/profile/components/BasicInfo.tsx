import { Combobox } from "@/components/ui/combobox";
import { StudentProfileData } from '@/types/profile';
import { countries } from '@/data/countries';

interface BasicInfoProps {
  profile: StudentProfileData;
  isEditing: string | null;
  setIsEditing: (value: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  handleUpdate: (field: string, value: string) => void;
  genderOptions: Array<{ id: string; name: string }>;
}

export const BasicInfo = ({ profile, isEditing, setIsEditing, editValue, setEditValue, handleUpdate, genderOptions }: BasicInfoProps) => {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
      <p className="mt-1 text-sm text-gray-500">
        This information will be displayed publicly so be careful what you share.
      </p>

      <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm">
        {/* Name */}
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Name</dt>
          <dd className="flex justify-between mt-1 gap-x-6 sm:mt-0 sm:flex-auto">
            {isEditing === 'name' ? (
              <div className="flex gap-x-4 w-full">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input input-bordered w-full"
                />
                <button
                  onClick={() => handleUpdate('name', editValue)}
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
                <div className="text-gray-900">{profile.name}</div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing('name');
                    setEditValue(profile.name || '');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Update
                </button>
              </>
            )}
          </dd>
        </div>

        {/* Email */}
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Email</dt>
          <dd className="mt-1 sm:mt-0 sm:flex-auto">
            <div className="text-gray-900">{profile.email}</div>
          </dd>
        </div>

        {/* Gender */}
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Gender</dt>
          <dd className="flex justify-between mt-1 gap-x-6 sm:mt-0 sm:flex-auto">
            {isEditing === 'gender' ? (
              <div className="flex gap-x-4 w-full">
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleUpdate('gender', editValue)}
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
                  {genderOptions.find(g => g.id === profile.gender)?.name || 'Not specified'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing('gender');
                    setEditValue(profile.gender || '');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Update
                </button>
              </>
            )}
          </dd>
        </div>

        {/* Country */}
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Country</dt>
          <dd className="flex justify-between mt-1 gap-x-6 sm:mt-0 sm:flex-auto">
            {isEditing === 'country' ? (
              <div className="flex gap-x-4 w-full">
                <div className="flex-1">
                  <Combobox
                    options={countries}
                    value={editValue}
                    onChange={setEditValue}
                    placeholder="Select country"
                  />
                </div>
                <button
                  onClick={() => handleUpdate('country', editValue)}
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
                  {countries.find(c => c.code === profile.country)?.name || 'Not specified'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing('country');
                    setEditValue(profile.country || '');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Update
                </button>
              </>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}; 
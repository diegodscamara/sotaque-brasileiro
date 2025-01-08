import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { PencilLine } from "@phosphor-icons/react";
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
      <h2 className="font-semibold text-base text-gray-900">Basic Information</h2>
      <p className="mt-1 text-gray-500 text-sm">
        This information will be displayed publicly so be careful what you share.
      </p>

      <dl className="space-y-6 border-gray-200 mt-6 border-t divide-y divide-gray-100 text-sm">
        {/* Name */}
        <div className="sm:flex pt-6">
          <dt className="sm:flex-none sm:pr-6 sm:w-64 font-medium text-gray-900">Name</dt>
          <dd className="flex sm:flex-auto justify-between items-center gap-x-6 mt-1 sm:mt-0">
            {isEditing === 'name' ? (
              <div className="flex items-center gap-x-4 w-full">
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input-bordered w-full input input-primary input-sm"
                />
                <Button
                  variant="default"
                  onClick={() => handleUpdate('name', editValue)}
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
            ) : (
              <>
                <div className="text-gray-900">{profile.name}</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing('name');
                    setEditValue(profile.name || '');
                  }}
                >
                  <PencilLine className="w-5 h-5" />
                  Update
                </Button>
              </>
            )}
          </dd>
        </div>

        {/* Email */}
        <div className="sm:flex pt-6">
          <dt className="sm:flex-none sm:pr-6 sm:w-64 font-medium text-gray-900">Email</dt>
          <dd className="sm:flex-auto mt-1 sm:mt-0">
            <div className="text-gray-900">{profile.email}</div>
          </dd>
        </div>

        {/* Gender */}
        <div className="sm:flex pt-6">
          <dt className="sm:flex-none sm:pr-6 sm:w-64 font-medium text-gray-900">Gender</dt>
          <dd className="flex sm:flex-auto justify-between gap-x-6 mt-1 sm:mt-0">
            {isEditing === 'gender' ? (
              <div className="flex items-center gap-x-4 w-full">
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full select-bordered select-primary select-sm select"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="default"
                  onClick={() => handleUpdate('gender', editValue)}
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
            ) : (
              <>
                <div className="text-gray-900">
                  {genderOptions.find(g => g.id === profile.gender)?.name || 'Not specified'}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing('gender');
                    setEditValue(profile.gender || '');
                  }}
                >
                  <PencilLine className="w-5 h-5" />
                  Update
                </Button>
              </>
            )}
          </dd>
        </div>

        {/* Country */}
        <div className="sm:flex pt-6">
          <dt className="sm:flex-none sm:pr-6 sm:w-64 font-medium text-gray-900">Country</dt>
          <dd className="flex sm:flex-auto justify-between gap-x-6 mt-1 sm:mt-0">
            {isEditing === 'country' ? (
              <div className="flex items-center gap-x-4 w-full">
                <div className="flex-1">
                  <Combobox
                    options={countries}
                    value={editValue}
                    onChange={setEditValue}
                    placeholder="Select country"
                  />
                </div>
                <Button
                  variant="default"
                  onClick={() => handleUpdate('country', editValue)}
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
            ) : (
              <>
                <div className="text-gray-900">
                  {countries.find(c => c.code === profile.country)?.name || 'Not specified'}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing('country');
                    setEditValue(profile.country || '');
                  }}
                >
                  <PencilLine className="w-5 h-5" />
                  Update
                </Button>
              </>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}; 
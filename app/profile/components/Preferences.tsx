import { StudentProfileData } from '@/types/profile';
import { Switch } from '@headlessui/react';

interface PreferencesProps {
  profile: StudentProfileData;
  automaticTimezoneEnabled: boolean;
  setAutomaticTimezoneEnabled: (value: boolean) => void;
  handleUpdate: (field: string, value: string | number) => void;
  handleMultiSelect: (field: string, values: string[]) => void;
}

export const Preferences = ({ 
  profile, 
  automaticTimezoneEnabled, 
  setAutomaticTimezoneEnabled,
  handleUpdate,
  handleMultiSelect
}: PreferencesProps) => {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">Preferences</h2>
      <p className="mt-1 text-sm text-gray-500">
        Customize your learning experience and schedule preferences.
      </p>

      <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm">
        {/* Class Type Preferences */}
        <div className="border-b pb-8">
          <h3 className="text-lg pt-6 font-medium text-gray-900">Class Type Preferences</h3>
          <div className="mt-4 space-y-4">
            {['one-on-one', 'group', 'self-paced', 'intensive'].map((type) => (
              <label key={type} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={profile.preferred_class_type?.includes(type as any)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...(profile.preferred_class_type || []), type]
                      : (profile.preferred_class_type || []).filter(t => t !== type);
                    handleMultiSelect('preferred_class_type', newTypes);
                  }}
                />
                <span className="text-sm capitalize">{type.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule Preferences */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-900">Schedule Preferences</h3>
          <div className="mt-4 space-y-4">
            {['morning', 'afternoon', 'evening', 'night'].map((time) => (
              <label key={time} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={profile.preferred_schedule?.includes(time as any)}
                  onChange={(e) => {
                    const newSchedule = e.target.checked
                      ? [...(profile.preferred_schedule || []), time]
                      : (profile.preferred_schedule || []).filter(t => t !== time);
                    handleMultiSelect('preferred_schedule', newSchedule);
                  }}
                />
                <span className="text-sm capitalize">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timezone Settings */}
        <div className="border-b pb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Automatic Timezone</h3>
            <Switch
              checked={automaticTimezoneEnabled}
              onChange={setAutomaticTimezoneEnabled}
              className={`${
                automaticTimezoneEnabled ? 'bg-primary' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              <span
                className={`${
                  automaticTimezoneEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-md bg-white transition-transform`}
              />
            </Switch>
          </div>
          {!automaticTimezoneEnabled && (
            <select
              className="mt-4 select select-bordered w-full"
              value={profile.time_zone || ''}
              onChange={(e) => {
                // You'll need to add handleUpdate to the props and implementation
              }}
            >
              <option value="">Select timezone</option>
              {/* Add timezone options */}
            </select>
          )}
        </div>

        {/* Availability Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Weekly Availability</h3>
          <input
            type="number"
            className="mt-2 input input-bordered w-full"
            value={profile.availability_hours || ''}
            onChange={(e) => handleUpdate('availability_hours', parseInt(e.target.value, 10))}
            placeholder="Hours per week"
            min="1"
            max="40"
          />
        </div>
      </dl>
    </div>
  );
}; 
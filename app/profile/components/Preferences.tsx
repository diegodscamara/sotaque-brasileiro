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
      <h2 className="font-semibold text-base text-gray-900">Preferences</h2>
      <p className="mt-1 text-gray-500 text-sm">
        Customize your learning experience and schedule preferences.
      </p>

      <dl className="space-y-6 border-gray-200 mt-6 border-t divide-y divide-gray-100 text-sm">
        {/* Class Type Preferences */}
        <div className="pb-8 border-b">
          <h3 className="pt-6 font-medium text-gray-900 text-lg">Class Type Preferences</h3>
          <div className="space-y-4 mt-4">
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
        <div className="pb-8 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Schedule Preferences</h3>
          <div className="space-y-4 mt-4">
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
        <div className="pb-8 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 text-lg">Automatic Timezone</h3>
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
              className="mt-4 w-full select-bordered select"
              value={profile.time_zone || ''}
              onChange={(e) => handleUpdate('time_zone', e.target.value)}
            >
              <option value="">Select timezone</option>
              <option value="America/Puerto_Rico">Atlantic Standard Time (Puerto Rico)</option>
              <option value="America/Halifax">Atlantic Standard Time (Canada)</option>
              <option value="America/New_York">Eastern Standard Time</option>
              <option value="America/Chicago">Central Standard Time</option>
              <option value="America/Denver">Mountain Standard Time</option>
              <option value="America/Phoenix">Mountain Standard Time (Arizona)</option>
              <option value="America/Los_Angeles">Pacific Standard Time</option>
              <option value="America/Anchorage">Alaska Standard Time</option>
              <option value="Pacific/Honolulu">Hawaii-Aleutian Standard Time</option>
            </select>
          )}
        </div>

        {/* Availability Hours */}
        <div>
          <h3 className="font-medium text-gray-900 text-lg">Weekly Availability</h3>
          <input
            type="number"
            className="mt-2 input-bordered w-full input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { StudentProfileData } from '@/types/profile';
import { countries } from '@/data/countries';

interface BasicInfoProps {
  profile: StudentProfileData;
  formData: Partial<StudentProfileData>;
  onFieldChange: (field: string, value: any) => void;
  genderOptions: Array<{ id: string; name: string }>;
}

/**
 * BasicInfo component for displaying and editing user's personal information
 * 
 * @param profile - The user's profile data
 * @param formData - The current form state
 * @param onFieldChange - Function to handle field changes
 * @param genderOptions - Available gender options
 */
export const BasicInfo = ({ 
  profile, 
  formData, 
  onFieldChange, 
  genderOptions 
}: BasicInfoProps) => {
  return (
    <div>
      <h2 className="mt-4 font-semibold text-base">Basic Information</h2>
      <p className="mt-1 text-gray-500 text-sm">
        This information will be displayed publicly so be careful what you share.
      </p>

      <div className="space-y-6 mt-6 divide-y divide-border text-sm">
        {/* First Name */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="firstName" className="sm:pt-1.5 font-medium">First Name</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={(e) => onFieldChange('firstName', e.target.value)}
              placeholder={profile.firstName || 'Enter your first name'}
              className="w-full"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="lastName" className="sm:pt-1.5 font-medium">Last Name</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={(e) => onFieldChange('lastName', e.target.value)}
              placeholder={profile.lastName || 'Enter your last name'}
              className="w-full"
            />
          </div>
        </div>

        {/* Email */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="email" className="sm:pt-1.5 font-medium">Email</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              disabled
              className="bg-muted w-full"
            />
            <p className="mt-1 text-muted-foreground text-xs">
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Gender */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="gender" className="sm:pt-1.5 font-medium">Gender</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => onFieldChange('gender', value)}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Country */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="country" className="sm:pt-1.5 font-medium">Country</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Combobox
              options={countries}
              value={formData.country || ''}
              onChange={(value) => onFieldChange('country', value)}
              placeholder="Select country"
              ariaLabel="Country"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 
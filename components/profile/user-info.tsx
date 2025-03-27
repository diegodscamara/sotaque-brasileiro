import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { StudentProfileData } from '@/types/profile';
import { countries } from '@/data/countries';
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Gender } from '@/data/genders';

interface BasicInfoProps {
  profile: StudentProfileData;
  formData: Partial<StudentProfileData>;
  onFieldChange: (field: string, value: any) => void;
  genderOptions: Gender[];
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
  const t = useTranslations("profile");
  const locale = useLocale() as 'en' | 'es' | 'fr' | 'pt';

  return (
    <div>
      <h2 className="mt-4 font-semibold text-base">{t("personalInfo.title")}</h2>
      <p className="mt-1 text-gray-500 text-sm">
        {t("personalInfo.subtitle")}
      </p>

      <div className="space-y-6 mt-6 divide-y divide-border text-sm">
        {/* First Name */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="firstName" className="sm:pt-1.5 font-medium">{t("personalInfo.firstName")}</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={(e) => onFieldChange('firstName', e.target.value)}
              placeholder={profile.firstName || t("personalInfo.firstNamePlaceholder")}
              className="w-full"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="lastName" className="sm:pt-1.5 font-medium">{t("personalInfo.lastName")}</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={(e) => onFieldChange('lastName', e.target.value)}
              placeholder={profile.lastName || t("personalInfo.lastNamePlaceholder")}
              className="w-full"
            />
          </div>
        </div>

        {/* Email */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="email" className="sm:pt-1.5 font-medium">{t("personalInfo.email")}</label>
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
              {t("personalInfo.emailCannotBeChanged")}
            </p>
          </div>
        </div>

        {/* Gender */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="gender" className="sm:pt-1.5 font-medium">{t("personalInfo.gender")}</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => onFieldChange('gender', value)}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder={t("personalInfo.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Country */}
        <div className="sm:items-start sm:gap-4 sm:grid sm:grid-cols-3 pt-6">
          <label htmlFor="country" className="sm:pt-1.5 font-medium">{t("personalInfo.country")}</label>
          <div className="sm:col-span-2 mt-2 sm:mt-0">
            <div className="relative">
              <Combobox
                options={countries}
                value={formData.country || ''}
                onChange={(value) => onFieldChange('country', value)}
                placeholder={t("personalInfo.countryPlaceholder")}
                ariaLabel={t("personalInfo.country")}
                useNameAsValue={true}
                showFlags={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
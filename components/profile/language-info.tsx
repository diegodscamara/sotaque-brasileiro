import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MultiCombobox } from "@/components/ui/multi-combobox";
import { StudentProfileData } from '@/types/profile';
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { PortugueseLevel, portugueseLevels } from '@/data/portuguese-levels';
import { LearningGoal, learningGoals } from '@/data/learning-goals';

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
  const t = useTranslations("profile");
  const locale = useLocale() as 'en' | 'es' | 'fr' | 'pt';
  
  return (
    <div>
      <h2 className="mt-4 font-semibold text-base">{t("languageLearning.title")}</h2>
      <p className="mt-1 text-gray-500 text-sm">
        {t("languageLearning.subtitle")}
      </p>

      <div className="space-y-6 mt-6 text-sm">
        {/* Portuguese Level */}
        <div className="pb-8 border-b border-border">
          <h3 className="pt-6 font-medium text-lg">{t("languageLearning.portugueseLevel")}</h3>
          <div className="mt-4">
            <Select
              value={formData.portugueseLevel || ''}
              onValueChange={(value) => onFieldChange('portugueseLevel', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("languageLearning.portugueseLevelPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {portugueseLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Native Language */}
        <div className="pb-8 border-b border-border">
          <h3 className="font-medium text-lg">{t("languageLearning.nativeLanguage")}</h3>
          <div className="mt-4">
            <Select
              value={formData.nativeLanguage || ''}
              onValueChange={(value) => onFieldChange('nativeLanguage', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("languageLearning.nativeLanguagePlaceholder")} />
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
          <h3 className="font-medium text-lg">{t("languageLearning.otherLanguages")}</h3>
          <div className="mt-4">
            <MultiCombobox
              options={languageOptions}
              values={formData.otherLanguages || []}
              onChange={(values) => onFieldChange('otherLanguages', values)}
              placeholder={t("languageLearning.otherLanguagesPlaceholder")}
              ariaLabel={t("languageLearning.otherLanguages")}
            />
          </div>
        </div>

        {/* Learning Goals */}
        <div className="pb-8 border-b border-border">
          <h3 className="font-medium text-lg">{t("languageLearning.learningGoals")}</h3>
          <div className="mt-4">
            <label htmlFor="learningGoals" className="sr-only">
              {t("languageLearning.learningGoals")}
            </label>
            <Textarea
              id="learningGoals"
              value={Array.isArray(formData.learningGoals) ? formData.learningGoals.join('\n') : ''}
              onChange={(e) => onFieldChange('learningGoals', e.target.value.split('\n').filter(Boolean))}
              placeholder={t("languageLearning.learningGoalsPlaceholder")}
              className="w-full h-32"
            />
            <p className="mt-1 text-muted-foreground text-xs">
              {t("languageLearning.learningGoalsHelp")}
            </p>
          </div>
        </div>

        {/* Motivation */}
        <div className="pb-8">
          <h3 className="font-medium text-lg">{t("languageLearning.motivation")}</h3>
          <div className="mt-4">
            <label htmlFor="motivationForLearning" className="sr-only">
              {t("languageLearning.motivation")}
            </label>
            <Textarea
              id="motivationForLearning"
              value={formData.motivationForLearning || ''}
              onChange={(e) => onFieldChange('motivationForLearning', e.target.value)}
              placeholder={t("languageLearning.motivationPlaceholder")}
              className="w-full h-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 
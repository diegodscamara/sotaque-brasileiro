import React from 'react';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Step1PersonalInfo from "../Step1PersonalInfo";
import { UserGender } from "@/types/User";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'forms.personalDetails.firstNameLabel': 'First Name',
      'forms.personalDetails.lastNameLabel': 'Last Name',
      'forms.personalDetails.emailLabel': 'Email',
      'forms.personalDetails.timezoneLabel': 'Timezone',
      'forms.personalDetails.countryLabel': 'Country',
      'forms.personalDetails.genderLabel': 'Gender',
      'forms.learningPreferences.portugueseLevelLabel': 'Portuguese Level',
      'forms.learningPreferences.nativeLanguageLabel': 'Native Language',
      'forms.learningPreferences.learningGoalsLabel': 'Learning Goals',
      'forms.learningPreferences.otherLanguagesLabel': 'Other Languages',
      'forms.personalDetails.firstNamePlaceholder': 'Enter your first name',
      'forms.personalDetails.lastNamePlaceholder': 'Enter your last name',
      'forms.personalDetails.emailPlaceholder': 'Enter your email',
      'forms.personalDetails.timezonePlaceholder': 'Select your timezone',
      'forms.personalDetails.countryPlaceholder': 'Select your country',
      'forms.personalDetails.genderPlaceholder': 'Select your gender',
      'forms.learningPreferences.portugueseLevelPlaceholder': 'Select your Portuguese level',
      'forms.learningPreferences.nativeLanguagePlaceholder': 'Select your native language',
      'forms.learningPreferences.learningGoalsPlaceholder': 'Select your learning goals',
      'forms.learningPreferences.otherLanguagesPlaceholder': 'Select other languages',
      'forms.personalDetails.timezoneHelp': 'Your timezone will help us match you with teachers in your area',
      'forms.personalDetails.genderHelp': 'This information helps us provide a better experience',
      'forms.learningPreferences.portugueseLevelHelp': 'Your current level of Portuguese',
      'forms.learningPreferences.nativeLanguageHelp': 'The language you speak most fluently',
      'forms.learningPreferences.learningGoalsHelp': 'What you want to achieve by learning Portuguese',
      'forms.learningPreferences.otherLanguagesHelp': 'Other languages you speak or are learning',
      'forms.personalDetails.title': 'Personal Details',
      'forms.personalDetails.subtitle': 'Tell us about yourself',
      'forms.learningPreferences.title': 'Learning Preferences',
      'forms.learningPreferences.subtitle': 'Help us understand your learning needs',
      'forms.learningPreferences.nativeLanguageNonFoundMessage': 'No language found.',
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

// Mock components
jest.mock("@/components/forms/TimeZoneSelectWithSearch", () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="America/New_York">America/New_York</option>
    </select>
  ),
}));

jest.mock("@/components/forms/CountryOptionsWithFlagAndSearch", () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <button
      role="combobox"
      aria-label="Country"
      onClick={() => onChange("US")}
    >
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/forms/SelectWithRightIndicator", () => ({
  __esModule: true,
  default: ({ id, value, onChange, placeholder, options }: any) => (
    <button
      id={id}
      role="combobox"
      aria-label={id === "portugueseLevel" ? "Portuguese Level" : "Gender"}
      onClick={() => onChange(id === "portugueseLevel" ? "beginner" : "prefer_not_to_say")}
    >
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/forms/SelectWithSearch", () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <button
      role="combobox"
      aria-label="Native Language"
      onClick={() => onChange("en")}
    >
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/forms/MultiSelectWithPlaceholderAndClear", () => ({
  __esModule: true,
  default: ({ values, onChange, ariaLabel }: any) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValues = Array.from(e.target.selectedOptions).map(
        (option: HTMLOptionElement) => option.value
      );
      onChange(selectedValues);
    };

    return (
      <select
        role="listbox"
        multiple
        name="learningGoals"
        aria-label={ariaLabel}
        value={values}
        onChange={handleChange}
      >
        <option value="academic">Academic Purposes</option>
        <option value="business">Business Communication</option>
      </select>
    );
  },
}));

// Mock data
const mockFormData = {
  firstName: "",
  lastName: "",
  email: "",
  timeZone: "America/Toronto", // Set a default timezone to prevent initialization
  country: "",
  gender: "prefer_not_to_say" as UserGender,
  portugueseLevel: "",
  nativeLanguage: "",
  learningGoals: [],
  otherLanguages: [],
  customerId: "",
  priceId: "",
  packageName: "",
  selectedTeacher: null,
  selectedTimeSlot: null,
  notes: "",
};

const mockErrors = {};
const mockHandleInputChange = jest.fn();
const mockHandleSelectChange = jest.fn();
const mockHandleMultiSelectChange = jest.fn();

describe("Step1PersonalInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <Step1PersonalInfo
        formData={mockFormData}
        errors={mockErrors}
        handleInputChange={mockHandleInputChange}
        handleSelectChange={mockHandleSelectChange}
        handleMultiSelectChange={mockHandleMultiSelectChange}
      />
    );
  };

  describe("Form Interactions", () => {
    it("handles input changes", async () => {
      const user = userEvent.setup();
      renderComponent();
      const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
      await user.type(firstNameInput, "John");
      expect(mockHandleInputChange).toHaveBeenCalled();
    });

    it("handles country selection", async () => {
      const user = userEvent.setup();
      renderComponent();
      const countrySelect = screen.getByRole("combobox", { name: /country/i });
      await user.click(countrySelect);
      expect(mockHandleSelectChange).toHaveBeenCalledWith("country", "US");
    });

    it("handles Portuguese level selection", async () => {
      const user = userEvent.setup();
      renderComponent();
      const levelSelect = screen.getByRole("combobox", { name: /portuguese level/i });
      await user.click(levelSelect);
      expect(mockHandleSelectChange).toHaveBeenCalledWith("portugueseLevel", "beginner");
    });

    it("handles native language selection", async () => {
      const user = userEvent.setup();
      renderComponent();
      const languageSelect = screen.getByRole("combobox", { name: /native language/i });
      await user.click(languageSelect);
      expect(mockHandleSelectChange).toHaveBeenCalledWith("nativeLanguage", "en");
    });

    it("handles learning goals selection", async () => {
      const user = userEvent.setup();
      renderComponent();
      const goalsSelect = screen.getByRole("listbox", { name: /learning goals/i });
      await user.selectOptions(goalsSelect, ["academic", "business"]);
      expect(mockHandleMultiSelectChange).toHaveBeenNthCalledWith(1, "learningGoals", ["academic"]);
      expect(mockHandleMultiSelectChange).toHaveBeenNthCalledWith(2, "learningGoals", ["business"]);
    });
  });
});
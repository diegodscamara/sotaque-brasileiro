"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Gear,
  GraduationCap,
  User as UserIcon
} from "@phosphor-icons/react";

import { BasicInfo } from "./components/BasicInfo";
import Breadcrumb from '@/components/Breadcrumb';
import { LanguageLearning } from "./components/LanguageLearning";
import { Preferences } from "./components/Preferences";
import { StudentProfileData } from '@/types/profile';
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";

const learningStyles = [
  { id: 'visual', name: 'Visual Learning' },
  { id: 'auditory', name: 'Auditory Learning' },
  { id: 'reading', name: 'Reading/Writing' },
  { id: 'kinesthetic', name: 'Practice-Based Learning' },
]

const genderOptions = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' },
  { id: 'prefer_not_to_say', name: 'Prefer not to say' },
];

const languageOptions = [
  { id: 'portuguese', name: 'Portuguese' },
  { id: 'english', name: 'English' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'french', name: 'French' },
  { id: 'german', name: 'German' },
  { id: 'italian', name: 'Italian' },
  // Add more languages as needed
];

const interestOptions = [
  { id: 'business', name: 'Business' },
  { id: 'culture', name: 'Culture' },
  { id: 'travel', name: 'Travel' },
  { id: 'music', name: 'Music' },
  { id: 'literature', name: 'Literature' },
  { id: 'movies', name: 'Movies & TV Shows' },
  { id: 'cooking', name: 'Cooking' },
  { id: 'sports', name: 'Sports' },
];

const StudentProfile = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [automaticTimezoneEnabled, setAutomaticTimezoneEnabled] = useState(true)

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [activeTab, setActiveTab] = useState('basic');

  const handleUpdate = async (field: string, value: string | number | string[]) => {
    try {
      if (field === 'time_zone' && automaticTimezoneEnabled) {
        // Automatically detect user's time zone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        value = timeZone;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile((prevProfile) => ({
        ...prevProfile,
        [field]: value,
      }));

      const fieldNameMap: Record<string, string> = {
        name: 'Name',
        gender: 'Gender',
        country: 'Country',
        portuguese_level: 'Portuguese Level',
        native_language: 'Native Language',
        learning_goals: 'Learning Goals',
        motivation_for_learning: 'Motivation for Learning',
        time_zone: 'Time Zone',
        availability_hours: 'Weekly Availability',
      };

      const fieldName = fieldNameMap[field] || field.replace(/_/g, ' ');
      toast.success(`${fieldName} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleMultiSelect = async (field: string, values: string[]) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: values })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, [field]: values } : null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAutomaticTimezoneChange = async (enabled: boolean) => {
    setAutomaticTimezoneEnabled(enabled);

    if (enabled) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await handleUpdate('time_zone', timeZone);
      toast.success('Automatic time zone enabled');
    } else {
      toast.success('Automatic time zone disabled');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.log("Error fetching user:", userError);
          return;
        }

        setUser(user);

        if (user) {
          // Try to get existing profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.log("Error fetching profile:", profileError);
          }

          if (!profile) {
            // Create new profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ])
              .select()
              .single();

            if (createError) {
              console.log("Error creating profile:", createError);
              return;
            }

            setProfile(newProfile);
          } else {
            setProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error in fetchUser:", error);
      }
    };

    fetchUser();
  }, [supabase]);

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <Breadcrumb />
      
      <div className="flex gap-x-8 mt-8">
        {/* Sidebar Tabs */}
        <div className="flex-none w-64">
          <div className="tabs tabs-vertical">
            <a 
              className={`tab tab-bordered w-full justify-start ${activeTab === 'basic' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <div className="flex items-center gap-x-3">
                <UserIcon className="w-5 h-5" />
                Basic Information
              </div>
            </a>
            <a 
              className={`tab tab-bordered w-full justify-start ${activeTab === 'learning' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('learning')}
            >
              <div className="flex items-center gap-x-3">
                <GraduationCap className="w-5 h-5" />
                Language Learning
              </div>
            </a>
            <a 
              className={`tab tab-bordered w-full justify-start ${activeTab === 'preferences' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <div className="flex items-center gap-x-3">
                <Gear className="w-5 h-5" />
                Preferences
              </div>
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-base-100 p-6 border border-base-300 rounded-md">
            {activeTab === 'basic' && (
              <BasicInfo
                profile={profile}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editValue={editValue}
                setEditValue={setEditValue}
                handleUpdate={handleUpdate}
                genderOptions={genderOptions}
              />
            )}
            {activeTab === 'learning' && (
              <LanguageLearning
                profile={profile}
                handleUpdate={handleUpdate}
                handleMultiSelect={handleMultiSelect}
                languageOptions={languageOptions}
                learningStyles={learningStyles}
                interestOptions={interestOptions}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editValue={editValue}
                setEditValue={setEditValue}
              />
            )}
            {activeTab === 'preferences' && (
              <Preferences
                profile={profile}
                automaticTimezoneEnabled={automaticTimezoneEnabled}
                setAutomaticTimezoneEnabled={handleAutomaticTimezoneChange}
                handleUpdate={handleUpdate}
                handleMultiSelect={handleMultiSelect}
              />
            )}
          </div>

          {/* Save Changes Button */}
          <div className="flex justify-end items-center gap-x-6 my-8">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setIsEditing(null);
                setEditValue("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-accent"
              onClick={async () => {
                try {
                  await Promise.all([
                    handleMultiSelect('preferred_schedule', profile.preferred_schedule || []),
                    handleMultiSelect('preferred_class_type', profile.preferred_class_type || []),
                    handleMultiSelect('learning_style', profile.learning_style || []),
                    handleMultiSelect('interests', profile.interests || []),
                    handleMultiSelect('other_languages', profile.other_languages || [])
                  ]);

                  const { error } = await supabase
                    .from('profiles')
                    .update({
                      ...profile,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', user?.id);

                  if (error) throw error;
                  toast.success('All changes saved successfully');
                } catch (error) {
                  console.error('Error updating profile:', error);
                  toast.error('Failed to save changes');
                }
              }}
            >
              Save all changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

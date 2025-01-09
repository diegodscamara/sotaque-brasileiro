"use client";

import {
  GraduationCap,
  User as UserIcon
} from "@phosphor-icons/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useEffect, useState } from "react";

import { BasicInfo } from "./components/BasicInfo";
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from "@/components/ui/button";
import { FloppyDisk } from "@phosphor-icons/react";
import { LanguageLearning } from "./components/LanguageLearning";
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

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleUpdate = async (field: string, value: string | number | string[]) => {
    try {
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
            .from("students")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.log("Error fetching profile:", profileError);
          }

          if (!profile) {
            // Create new profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from("students")
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
    <div className="flex flex-col gap-6 w-full">
      <Breadcrumb />
      <div className="flex lg:flex-row flex-col gap-6 w-full">
        {/* Sidebar Tabs */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">
              <div className="flex items-center gap-x-3">
                <UserIcon className="w-5 h-5" />
                Basic Information
              </div>
            </TabsTrigger>
            <TabsTrigger value="learning">
              <div className="flex items-center gap-x-3">
                <GraduationCap className="w-5 h-5" />
                Language Learning
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Content Area */}
          <div className="w-full">
            <div className="bg-white shadow-sm p-6 border rounded-md">
              <TabsContent value="basic">
                <BasicInfo
                  profile={profile}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  handleUpdate={handleUpdate}
                  genderOptions={genderOptions}
                />
              </TabsContent>
              <TabsContent value="learning">
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
              </TabsContent>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end items-center gap-x-4 my-8">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(null);
                  setEditValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    await Promise.all([
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
                <FloppyDisk className="w-5 h-5" />
                Save all changes
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;

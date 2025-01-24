"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { useCallback, useEffect, useState } from "react";

import { BasicInfo } from "./components/BasicInfo";
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { FloppyDisk } from "@phosphor-icons/react";
import { LanguageLearning } from "./components/LanguageLearning";
import { StudentProfileData } from '@/types/profile';
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import useStudentApi from "@/hooks/useStudentApi";
import { useToast } from "@/hooks/use-toast"
import { z } from "zod";

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

const StudentProfile = () => {
  const supabase = createClient();
  const { getStudent, editStudent } = useStudentApi();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const fetchedProfile = await getStudent(user.id);
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [getStudent, user]);

  const handleUpdate = useCallback(async (field: string, value: string | number | string[]) => {
    try {
      const sanitizedValue = DOMPurify.sanitize(value.toString());
      const updatedProfile = await editStudent(user?.id, { [field]: sanitizedValue, updated_at: new Date().toISOString() });
      setProfile(updatedProfile);

      const fieldNameMap: Record<string, string> = {
        first_name: 'First Name',
        last_name: 'Last Name',
        gender: 'Gender',
        country: 'Country',
        portuguese_level: 'Portuguese Level',
        native_language: 'Native Language',
        learning_goals: 'Learning Goals',
        motivation_for_learning: 'Motivation for Learning',
      };

      const fieldName = fieldNameMap[field] || field.replace(/_/g, ' ');
      toast({
        title: `${fieldName} updated successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: `Failed to update ${field}`,
        variant: "destructive",
      });
    }
  }, [editStudent, profile, user]);

  const handleMultiSelect = useCallback(async (field: string, values: string[]) => {
    try {
      const sanitizedValues = values.map(value => DOMPurify.sanitize(value));
      const updatedProfile = await editStudent(user?.id, { [field]: sanitizedValues });
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }, [editStudent, user]);

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-lg">
      <Breadcrumb />
      <div className="flex lg:flex-row flex-col gap-6 w-full">
        {/* Sidebar Tabs */}
        <Tabs defaultValue="basic" className="flex flex-col gap-6 w-full">
          <TabsList className="w-fit">
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
            <Card>
              <CardContent>
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
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    editValue={editValue}
                    setEditValue={setEditValue}
                  />
                </TabsContent>
              </CardContent>

              <CardFooter className="flex justify-end items-center gap-x-4">
                {/* Save Changes Button */}
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
                      await handleMultiSelect('other_languages', profile.other_languages || []);
                      const updatedProfile = await editStudent(user?.id, {
                        ...profile,
                        updated_at: new Date().toISOString()
                      });
                      setProfile(updatedProfile);
                      toast({
                        title: 'All changes saved successfully',
                        variant: "default",
                      });
                    } catch (error) {
                      console.error('Error updating profile:', error);
                      toast({
                        title: 'Failed to save changes',
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <FloppyDisk className="w-5 h-5" />
                  Save all changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;

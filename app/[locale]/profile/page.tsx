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
import { useCallback, useEffect, useState, FormEvent } from "react";

import { BasicInfo } from "../../../components/profile/user-info";
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { LanguageLearning } from "../../../components/profile/language-info";
import { StudentProfileData } from '@/types/profile';
import { Student, User } from "@/types";
import { createClient } from "@/libs/supabase/client";
import { getStudent, editStudent } from "@/app/actions/students";
import { updateUser } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast"

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

/**
 * Converts a Student object to StudentProfileData
 * @param student - The student object from the database
 * @param user - The user object from Supabase auth
 * @returns StudentProfileData object with all required properties
 */
const mapStudentToProfileData = (student: Student, user: User): StudentProfileData => {
  // Validate gender to ensure it matches the expected union type
  const validateGender = (gender: string | undefined): 'male' | 'female' | 'other' | 'prefer_not_to_say' => {
    const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
    return (gender && validGenders.includes(gender.toLowerCase())) 
      ? gender.toLowerCase() as 'male' | 'female' | 'other' | 'prefer_not_to_say'
      : 'prefer_not_to_say'; // Default value
  };

  // Validate Portuguese level
  const validatePortugueseLevel = (level: string | undefined): 'beginner' | 'intermediate' | 'advanced' | 'native' | 'unknown' => {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'native'];
    return (level && validLevels.includes(level.toLowerCase()))
      ? level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'native'
      : 'unknown'; // Default value
  };

  return {
    id: student.id,
    gender: validateGender(user.gender),
    country: user.country || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    avatarUrl: user.avatarUrl || '',
    role: user.role === 'STUDENT' ? 'student' : 'teacher', // Convert to expected format
    hasAccess: student.hasAccess,
    createdAt: student.createdAt.toISOString(), // Convert Date to string
    packageName: student.packageName || '',
    updatedAt: student.updatedAt.toISOString(), // Convert Date to string
    credits: student.credits,
    portugueseLevel: validatePortugueseLevel(student.portugueseLevel),
    learningGoals: student.learningGoals || [],
    preferredSchedule: [],
    nativeLanguage: student.nativeLanguage || '',
    otherLanguages: student.otherLanguages || [],
    professionalBackground: '',
    motivationForLearning: '',
    hasCompletedOnboarding: student.hasCompletedOnboarding,
    timeZone: student.timeZone || ''
  };
};

const StudentProfile = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<Partial<StudentProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal-info");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        // Convert Supabase User to our User type
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          createdAt: new Date(authUser.created_at),
          updatedAt: new Date(),
          role: 'STUDENT',
          firstName: authUser.user_metadata?.first_name,
          lastName: authUser.user_metadata?.last_name,
          avatarUrl: authUser.user_metadata?.avatar_url,
          country: authUser.user_metadata?.country,
          gender: authUser.user_metadata?.gender
        });
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
        const studentData = await getStudent(user.id);
        if (studentData) {
          // Create a Student object with the required user property
          const studentWithUser: Student = {
            ...studentData,
            user: user
          };
          const profileData = mapStudentToProfileData(studentWithUser, user);
          setProfile(profileData);
          setFormData(profileData);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user]);

  /**
   * Handles form field changes
   * @param field - The field name to update
   * @param value - The new value
   */
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!user?.id || !profile || !formData) return;
    
    try {
      setIsSubmitting(true);
      
      // Sanitize string values
      const sanitizedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = DOMPurify.sanitize(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      // Separate user and student data
      const userData = {
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        gender: sanitizedData.gender,
        country: sanitizedData.country,
      };
      
      // Update user data
      await updateUser(user.id, userData);
      
      // Create student update data
      const studentUpdate = {
        userId: user.id,
        credits: profile.credits,
        hasAccess: profile.hasAccess,
        portugueseLevel: sanitizedData.portugueseLevel,
        learningGoals: sanitizedData.learningGoals || [],
        nativeLanguage: sanitizedData.nativeLanguage,
        otherLanguages: sanitizedData.otherLanguages || [],
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
        timeZone: sanitizedData.timeZone,
      };
      
      // Update student data
      await editStudent(user.id, studentUpdate as any);
      
      // Update the profile state with the new data
      if (profile) {
        setProfile({
          ...profile,
          ...sanitizedData,
          updatedAt: new Date().toISOString()
        });
      }
      
      toast({
        title: "Profile updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, profile, formData, toast]);

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto py-6 container">
      <Breadcrumb />

      <div className="mt-6">
        <Tabs defaultValue="personal-info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="personal-info" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="language-learning" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Language Learning
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="personal-info" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <BasicInfo
                    profile={profile}
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    genderOptions={genderOptions}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 p-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(profile)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="language-learning" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <LanguageLearning
                    profile={profile}
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    languageOptions={languageOptions}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 p-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(profile)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;

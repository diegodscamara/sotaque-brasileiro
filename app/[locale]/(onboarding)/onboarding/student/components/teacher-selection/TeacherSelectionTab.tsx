import React from "react";
import Image from "next/image";
import { Star, GraduationCap, Globe } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";
import { TeacherComplete } from "@/types/teacher";
import { useTranslations } from "next-intl";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherSelectionTabProps {
  teachers: TeacherComplete[];
  selectedTeacher: TeacherComplete | null;
  loading: boolean;
  handleTeacherSelect: (teacher: TeacherComplete) => void;
  errors: Record<string, string>;
  t: ReturnType<typeof useTranslations>;
}

/**
 * Tab component for selecting a teacher
 * @param {TeacherSelectionTabProps} props - Component props
 * @returns {React.JSX.Element} The teacher selection tab component
 */
export default function TeacherSelectionTab({
  teachers,
  selectedTeacher,
  loading,
  handleTeacherSelect,
  errors,
  t
}: TeacherSelectionTabProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader className="pb-2">
              <Skeleton className="w-1/2 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-24" />
            </CardContent>
            <CardFooter>
              <Skeleton className="w-full h-10" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const getTeacherDisplayName = (teacher: TeacherComplete) => {
    const { firstName, lastName } = teacher.user;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return "Teacher";
  };

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {teachers.map((teacher) => (
        <Card
          key={teacher.id}
          className={cn(
            "cursor-pointer transition-all hover:border-green-500 flex flex-col justify-between",
            selectedTeacher === teacher ? "border-2 border-green-500" : ""
          )}
          onClick={() => handleTeacherSelect(teacher)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <Image
                  src={teacher.user.avatarUrl || "/images/default-avatar.png"}
                  alt={getTeacherDisplayName(teacher)}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <CardTitle className="text-lg">{getTeacherDisplayName(teacher)}</CardTitle>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Star className="w-4 h-4" />
                  <span>5.0</span>
                  <span>•</span>
                  <span>0 {t("step2.reviews")}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <GraduationCap className="mt-0.5 w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{t("step2.specialties")}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {t(`specialties.${specialty}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{t("step2.languages")}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.languages.map((language) => (
                      <Badge key={language} variant="secondary">
                        {t(`languages.${language}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant={selectedTeacher === teacher ? "default" : "outline"}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleTeacherSelect(teacher);
              }}
            >
              {selectedTeacher === teacher ? t("step2.teacherSelected") : t("step2.selectTeacher")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 
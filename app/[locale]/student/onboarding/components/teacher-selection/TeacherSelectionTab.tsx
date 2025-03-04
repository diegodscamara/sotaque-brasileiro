import React from "react";
import Image from "next/image";
import { Star, GraduationCap, Globe } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherSelectionTabProps {
  teachers: any[];
  selectedTeacher: string | null;
  loading: boolean;
  handleTeacherSelect: (teacherId: string) => void;
  errors: Record<string, string | undefined>;
  t: any;
}

/**
 * Component for the teacher selection tab
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
  return (
    <div className="space-y-4">
      {loading ? (
        // Loading skeleton
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="rounded-full w-16 h-16" />
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="mb-2 w-full h-3" />
                <Skeleton className="mb-2 w-full h-3" />
                <Skeleton className="mb-4 w-3/4 h-3" />
                <div className="space-y-3">
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="w-full h-9" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card
              key={teacher.id}
              className={cn(
                "cursor-pointer transition-all hover:border-green-500 flex flex-col justify-between",
                selectedTeacher === teacher.id ? "border-2 border-green-500" : ""
              )}
              onClick={() => handleTeacherSelect(teacher.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <div className="relative rounded-full w-16 h-16 overflow-hidden">
                    <Image
                      src={teacher.user.avatarUrl || "https://i.pravatar.cc/150"}
                      alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {teacher.user.firstName} {teacher.user.lastName}
                    </CardTitle>
                    <div className="flex items-center mt-1">
                      <Star className="mr-1 w-4 h-4 text-yellow-500" weight="fill" />
                      <span className="font-medium text-sm">{teacher.rating}</span>
                      <span className="ml-1 text-gray-500 text-xs">({teacher.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="mb-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {teacher.biography}
                </p>

                <div className="flex items-center mb-2">
                  <GraduationCap className="mr-2 w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-1">
                    {teacher.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <Globe className="mr-2 w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-1">
                    {teacher.languages.map((language: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={selectedTeacher === teacher.id ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTeacherSelect(teacher.id);
                  }}
                >
                  {selectedTeacher === teacher.id ? t("step2.teacherSelected") : t("step2.selectTeacher")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {errors.selectedTeacherId && (
        <div className="mt-1 text-red-500 text-sm" role="alert">
          {errors.selectedTeacherId}
        </div>
      )}
    </div>
  );
} 
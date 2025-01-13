import * as React from "react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

interface TeacherDropdownProps {
    selectedTeacher: string | null;
    onChange: (teacherId: string | null) => void;
    availableTeachers: { id: string; name: string }[]; // Adjust based on your teacher data structure
}

const TeacherDropdown: React.FC<TeacherDropdownProps> = ({ selectedTeacher, onChange, availableTeachers }) => {
    return (
        <div className="flex items-center gap-2 p-4">
            <Label htmlFor="teacher-select" className="font-medium text-sm">
                Teacher:
            </Label>
            <Select
                value={selectedTeacher || 'none'}
                onValueChange={(value) => onChange(value === 'none' ? null : value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Available Teachers</SelectLabel>
                        <SelectItem value="none">Select a teacher</SelectItem>
                        {availableTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default TeacherDropdown; 
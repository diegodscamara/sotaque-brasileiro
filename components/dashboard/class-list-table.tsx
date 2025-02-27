"use client"

import { ArrowUpDown, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Class } from "@/types/class";
import { formatDateTime } from '@/libs/utils/dateUtils'
import { getTeacher } from '@/app/actions/teachers'
import { z } from 'zod';

/**
 * Validation schema for class data
 */
const classSchema = z.object({
    id: z.string(),
    start_time: z.string(),
    teacher_id: z.string(),
    created_at: z.string(),
    status: z.enum(['pending', 'scheduled', 'completed', 'cancelled']),
});

/**
 * ClassListTable component to display a list of classes
 * @param {Object} props - Component props
 * @param {Class[]} props.classes - List of classes
 * @param {Function} props.handleCancel - Function to handle class cancellation
 * @param {Function} props.handleEdit - Function to handle class editing
 */
export function ClassListTable({ classes, handleCancel, handleEdit }: {
    classes: Class[],
    handleCancel: (_arg0: Class) => Promise<void>,
    handleEdit: (_arg0: Class) => void
}) {
    const [sortColumn, setSortColumn] = useState<keyof Class>('start_time');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [teacherName, setTeacherName] = useState<string>('');

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                // This is a placeholder - in a real app, you'd fetch the specific teacher
                const teacher = await getTeacher("1");
                if (teacher) {
                    setTeacherName(`${teacher.user.firstName || ''} ${teacher.user.lastName || ''}`.trim() || 'Unknown Teacher');
                }
            } catch (error) {
                console.error("Error fetching teacher:", error);
                setTeacherName('Unknown Teacher');
            }
        };

        fetchTeacher();
    }, []);

    const handleSort = (column: keyof Class) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedClasses = useMemo(() => {
        // First filter by status if needed
        let filtered = [...classes];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        // Then sort
        return filtered.sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });
    }, [classes, statusFilter, sortColumn, sortDirection]);

    const handleCancelClass = (class_: Class) => {
        // Validate class data before proceeding
        try {
            classSchema.parse(class_);
            handleCancel(class_);
        } catch (error) {
            console.error(`Invalid class data: ${class_.id}`, error);
        }
    };

    const handleEditClass = (class_: Class) => {
        // Validate class data before proceeding
        try {
            classSchema.parse(class_);
            handleEdit(class_);
        } catch (error) {
            console.error(`Invalid class data: ${class_.id}`, error);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Upcoming Classes</CardTitle>
                <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort('start_time')} className="cursor-pointer">
                                Date & Time
                                <ArrowUpDown className="inline ml-2 w-4 h-4" />
                            </TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                                Status
                                <ArrowUpDown className="inline ml-2 w-4 h-4" />
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedClasses.map((class_) => (
                            <TableRow key={class_.id}>
                                <TableCell>
                                    {formatDateTime(class_.start_time)}
                                </TableCell>
                                <TableCell>{teacherName}</TableCell>
                                <TableCell>
                                    <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                                        class_.status === 'scheduled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        class_.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        class_.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                        {class_.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="p-0 w-8 h-8">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => handleEditClass(class_)}
                                                disabled={class_.status === 'cancelled' || class_.status === 'completed'}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleCancelClass(class_)}
                                                disabled={class_.status === 'cancelled' || class_.status === 'completed'}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                Cancel
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


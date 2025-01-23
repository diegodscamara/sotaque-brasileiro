"use client"

import { ArrowUpDown, MoreHorizontal, MoreVertical } from 'lucide-react'
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
import useTeacherApi from '@/hooks/useTeacherApi'

export function ClassListTable({ classes, handleCancel, handleEdit }: {
    classes: Class[],
    handleCancel: (class_: Class) => Promise<void>,
    handleEdit: (class_: Class) => void
}) {
    const [sortColumn, setSortColumn] = useState<keyof Class>("start_time")
    const [sortDirection, setSortDirection] = useState("asc")
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState("All")
    const [teacher, setTeacher] = useState<{ first_name: string, last_name: string } | null>(null);
    const itemsPerPage = 6
    const { loading, getTeacher } = useTeacherApi();

    useEffect(() => {
        const fetchTeacher = async () => {
            if (classes.length > 0) {
                const teacherData = await getTeacher(classes[0].teacher_id);
                if (teacherData && teacherData.first_name !== teacher?.first_name) {
                    setTeacher(teacherData);
                }
            } else {
                console.log("No classes available to fetch teacher.");
            }
        };
        fetchTeacher();
    }, [classes, getTeacher]);

    const handleSort = (column: keyof Class) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const filteredAndSortedClasses = useMemo(() => {
        return [...classes]
            .filter((classItem) => statusFilter === "All" || classItem.status === statusFilter)
            .sort((a, b) => {
                const aValue = String(a[sortColumn as keyof Class] || '');
                const bValue = String(b[sortColumn as keyof Class] || '');
                return sortDirection === "asc" ?
                    aValue.localeCompare(bValue) :
                    bValue.localeCompare(aValue);
            });
    }, [classes, sortColumn, sortDirection, statusFilter]);

    const totalPages = Math.ceil(filteredAndSortedClasses.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentClasses = filteredAndSortedClasses.slice(startIndex, endIndex)

    const handleCancelClass = (class_: Class) => {
        handleCancel(class_);
    };

    const handleEditClass = (class_: Class) => {
        handleEdit(class_);
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                <CardTitle className="text-2xl">Class List</CardTitle>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value)
                        setCurrentPage(1)
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">
                                    <Button variant="ghost" onClick={() => handleSort("start_time")}>
                                        Date
                                        <ArrowUpDown className="ml-2 w-4 h-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort("teacher_id")}>
                                        Teacher
                                        <ArrowUpDown className="ml-2 w-4 h-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    <Button variant="ghost" onClick={() => handleSort("created_at")}>
                                        Created At
                                        <ArrowUpDown className="ml-2 w-4 h-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort("status")}>
                                        Status
                                        <ArrowUpDown className="ml-2 w-4 h-4" />
                                    </Button>
                                </TableHead>
                                {classes.some(class_ => class_.status == 'pending' || class_.status == 'scheduled') && <TableHead className="w-[100px]">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentClasses.map((class_) => (
                                <TableRow key={class_.id}>
                                    <TableCell>{formatDateTime(class_.start_time)}</TableCell>
                                    <TableCell>{teacher ? teacher.first_name + " " + teacher.last_name : "Loading..."}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{formatDateTime(class_.created_at)}</TableCell>
                                    <TableCell>
                                        <span className={
                                            class_.status === 'pending' ? 'text-yellow-500' :
                                            class_.status === 'scheduled' ? 'text-blue-500' :
                                            class_.status === 'completed' ? 'text-green-500' :
                                            class_.status === 'cancelled' ? 'text-red-500' :
                                            'text-gray-500'
                                        }>
                                            {class_.status.charAt(0).toUpperCase() + class_.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    {(class_.status === 'pending' || class_.status === 'scheduled') && (
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="p-0 w-8 h-8">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditClass(class_)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCancelClass(class_)}>Cancel</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex sm:flex-row flex-col justify-between items-center space-y-2 sm:space-y-0 py-4">
                    <div className="text-muted-foreground text-sm">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedClasses.length)} of {filteredAndSortedClasses.length} lessons
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNumber = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                            return pageNumber <= totalPages ? (
                                <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            ) : null;
                        })}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


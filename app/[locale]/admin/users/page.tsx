"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  PencilSimple, 
  Trash, 
  Plus, 
  MagnifyingGlass, 
  X,
  UserCircle,
  CaretUp,
  CaretDown,
  CaretUpDown
} from "@phosphor-icons/react";
import Image from "next/image";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, Header, Cell, Row } from "@tanstack/react-table";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// API
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/users";
import { Role } from "@prisma/client";

// Types
interface User {
  hasAccess: boolean;
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: Role;
  country?: string;
  gender?: string;
  createdAt: Date;
}

interface UserFormData {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: Role;
  country: string;
  gender: string;
}

/**
 * Admin page for managing users
 * @returns {React.JSX.Element} The admin users management page
 */
export default function AdminUsersPage(): React.JSX.Element {
  const t = useTranslations("admin.users");
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    avatarUrl: "",
    role: Role.STUDENT,
    country: "",
    gender: ""
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  /**
   * Fetches users from the API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const response = await getUsers();
      
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      // Ensure dates are properly serialized
      const serializedUsers = response.data.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
      }));
      
      setUsers(serializedUsers as unknown as User[]);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err?.message || "Failed to load users. Please try again.");
      setUsers([]); // Reset users on error
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Filters users based on search query
   */
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      return (
        fullName.includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.country && user.country.toLowerCase().includes(query))
      );
    });
  }, [users, searchQuery]);
  
  /**
   * Handles input change for form fields
   */
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  }, []);
  
  /**
   * Handles select change for form fields
   */
  const handleSelectChange = React.useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  }, []);
  
  /**
   * Opens the create user dialog
   */
  const openCreateDialog = React.useCallback(() => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      avatarUrl: "",
      role: Role.STUDENT,
      country: "",
      gender: ""
    });
    setFormErrors({});
    setIsCreateDialogOpen(true);
  }, []);
  
  /**
   * Opens the edit user dialog
   */
  const openEditDialog = React.useCallback((user: User) => {
    setSelectedUserId(user.id);
    setFormData({
      id: user.id,
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      avatarUrl: user.avatarUrl || "",
      role: user.role,
      country: user.country || "",
      gender: user.gender || ""
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  }, []);
  
  /**
   * Opens the delete user dialog
   */
  const openDeleteDialog = React.useCallback((userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  }, []);
  
  /**
   * Validates the form data
   */
  const validateForm = React.useCallback((isUpdate = false): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    // Only require first and last name for new users or if they're provided
    if (!isUpdate) {
      if (!formData.firstName) {
        errors.firstName = "First name is required";
      }
      
      if (!formData.lastName) {
        errors.lastName = "Last name is required";
      }
    }
    
    // Validate URL only if provided
    if (formData.avatarUrl && formData.avatarUrl.length > 0 && !formData.avatarUrl.startsWith('http')) {
      errors.avatarUrl = "Avatar URL must be a valid URL";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  /**
   * Handles form submission for creating a user
   */
  const handleCreateUser = React.useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setFormErrors({});
      
      const result = await createUser(formData);
      
      if (!result) {
        throw new Error("Failed to create user");
      }
      
      setIsCreateDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error("Error creating user:", err);
      setFormErrors(prev => ({ 
        ...prev, 
        general: err?.message || "Failed to create user. Please try again." 
      }));
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm]);
  
  /**
   * Handles form submission for updating a user
   */
  const handleUpdateUser = React.useCallback(async () => {
    if (!validateForm(true) || !selectedUserId) return;
    
    try {
      setSubmitting(true);
      setFormErrors({});
      
      // Only include fields that have values
      const updateData: Partial<User> = {};
      if (formData.email) updateData.email = formData.email;
      if (formData.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName) updateData.lastName = formData.lastName;
      if (formData.role) updateData.role = formData.role;
      
      // These fields can be empty strings
      updateData.avatarUrl = formData.avatarUrl;
      updateData.country = formData.country;
      updateData.gender = formData.gender;
      
      const result = await updateUser(selectedUserId, updateData);
      
      if (!result) {
        throw new Error("Failed to update user");
      }
      
      setIsEditDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setFormErrors(prev => ({ 
        ...prev, 
        general: err?.message || "Failed to update user. Please try again." 
      }));
    } finally {
      setSubmitting(false);
    }
  }, [formData, selectedUserId, validateForm]);
  
  /**
   * Handles form submission for deleting a user
   */
  const handleDeleteUser = React.useCallback(async () => {
    if (!selectedUserId) return;
    
    try {
      setSubmitting(true);
      
      const result = await deleteUser(selectedUserId);
      
      if (!result) {
        throw new Error("Failed to delete user. The user may have related records that prevent deletion.");
      }
      
      setIsDeleteDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err?.message || "Failed to delete user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedUserId]);
  
  /**
   * Renders the role badge
   */
  const renderRoleBadge = React.useCallback((role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>;
      case Role.TEACHER:
        return <Badge className="bg-blue-500 hover:bg-blue-600">Teacher</Badge>;
      case Role.STUDENT:
        return <Badge className="bg-green-500 hover:bg-green-600">Student</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  }, []);

  /**
   * Column definitions for the users table
   */
  const columns = React.useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: "name",
      header: t("table.user"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <div className="relative rounded-full w-10 h-10 overflow-hidden">
                <Image
                  src={user.avatarUrl}
                  alt={`${user.firstName || ''} ${user.lastName || ''}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <UserCircle className="w-10 h-10 text-gray-400" />
            )}
            <div>
              <div className="font-medium">
                {user.firstName || ''} {user.lastName || ''}
              </div>
              <div className="text-gray-500 text-sm">
                {user.gender || "Not specified"}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            {t("table.email")}
            {{
              asc: <CaretUp className="ml-2 w-4 h-4" />,
              desc: <CaretDown className="ml-2 w-4 h-4" />,
            }[column.getIsSorted() as string] ?? <CaretUpDown className="ml-2 w-4 h-4" />}
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: "hasAccess",
      header: t("table.hasAccess"),
      cell: ({ row }) => <div>{row.original.hasAccess ? "Yes" : "No"}</div>,
    }, 
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            {t("table.role")}
            {{
              asc: <CaretUp className="ml-2 w-4 h-4" />,
              desc: <CaretDown className="ml-2 w-4 h-4" />,
            }[column.getIsSorted() as string] ?? <CaretUpDown className="ml-2 w-4 h-4" />}
          </Button>
        );
      },
      cell: ({ row }) => renderRoleBadge(row.original.role),
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            {t("table.country")}
            {{
              asc: <CaretUp className="ml-2 w-4 h-4" />,
              desc: <CaretDown className="ml-2 w-4 h-4" />,
            }[column.getIsSorted() as string] ?? <CaretUpDown className="ml-2 w-4 h-4" />}
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.original.country || "Not specified"}</div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            {t("table.createdAt")}
            {{
              asc: <CaretUp className="ml-2 w-4 h-4" />,
              desc: <CaretDown className="ml-2 w-4 h-4" />,
            }[column.getIsSorted() as string] ?? <CaretUpDown className="ml-2 w-4 h-4" />}
          </Button>
        );
      },
      cell: ({ row }) => {
        // Safely format the date
        const date = row.original.createdAt;
        return <div>{date instanceof Date ? date.toLocaleDateString() : "Unknown"}</div>;
      },
      sortingFn: "datetime",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditDialog(user)}
              aria-label={`Edit ${user.firstName || ''} ${user.lastName || ''}`}
            >
              <PencilSimple className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="text-gray-200 hover:text-gray-300"
              onClick={() => openDeleteDialog(user.id)}
              aria-label={`Delete ${user.firstName || ''} ${user.lastName || ''}`}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ], [t, renderRoleBadge, openEditDialog, openDeleteDialog]);

  // Initialize the table with memoization
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const tableConfig = React.useMemo(
    () => ({
      data: filteredUsers,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      state: {
        sorting,
        pagination,
      },
      onPaginationChange: (updater: any) => {
        const newPagination = updater(pagination);
        setPageIndex(newPagination.pageIndex);
        setPageSize(newPagination.pageSize);
      },
      manualPagination: false,
    }),
    [filteredUsers, columns, sorting, pagination]
  );
  
  // Use the table hook directly (not conditionally)
  const table = useReactTable(tableConfig);

  // Handle dialog state changes
  const handleCreateDialogChange = React.useCallback((open: boolean) => {
    if (!submitting) {
      setIsCreateDialogOpen(open);
    }
  }, [submitting]);

  const handleEditDialogChange = React.useCallback((open: boolean) => {
    if (!submitting) {
      setIsEditDialogOpen(open);
    }
  }, [submitting]);

  const handleDeleteDialogChange = React.useCallback((open: boolean) => {
    if (!submitting) {
      setIsDeleteDialogOpen(open);
    }
  }, [submitting]);
  
  return (
    <div className="mx-auto px-4 py-8 container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-2xl">{t("title")}</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 w-4 h-4" />
            {t("actions.create")}
          </Button>
        </div>
        
        {error && (
          <Alert className="bg-red-50 dark:bg-red-900/20 mb-4 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlass className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" />
            <Input
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search users"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="top-1/2 right-3 absolute text-gray-400 hover:text-gray-600 -translate-y-1/2 transform"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header: Header<User, unknown>) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="rounded-full w-10 h-10" />
                          <div>
                            <Skeleton className="mb-1 w-24 h-4" />
                            <Skeleton className="w-16 h-3" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="w-32 h-4" /></TableCell>
                      <TableCell><Skeleton className="rounded-full w-16 h-5" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-24 h-4" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="rounded-md w-8 h-8" />
                          <Skeleton className="rounded-md w-8 h-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row: Row<User>) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell: Cell<User, unknown>) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-8 text-gray-500 text-center">
                      {searchQuery
                        ? t("search.noResults")
                        : t("table.noUsers")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination controls */}
          <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-t">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredRowModel().rows.length > 0 ? (
                t("pagination.showing", {
                  start: pageIndex * pageSize + 1,
                  end: Math.min(
                    (pageIndex + 1) * pageSize,
                    table.getFilteredRowModel().rows.length
                  ),
                  total: table.getFilteredRowModel().rows.length
                })
              ) : (
                ""
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {t("pagination.previous")}
              </Button>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>{t("pagination.page", { page: pageIndex + 1 })}</span>
                <span>{t("pagination.of", { total: table.getPageCount() })}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t("pagination.next")}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("create.title")}</DialogTitle>
            <DialogDescription>
              {t("create.description")}
            </DialogDescription>
          </DialogHeader>
          
          {formErrors.general && (
            <Alert className="bg-red-50 dark:bg-red-900/20 mb-4 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}
          
          <div className="gap-4 grid py-4">
            <div className="gap-4 grid grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("form.firstName")}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm">{formErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("form.lastName")}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">{t("form.avatarUrl")}</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            <div className="gap-4 grid grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">{t("form.role")}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.STUDENT}>Student</SelectItem>
                    <SelectItem value={Role.TEACHER}>Teacher</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t("form.gender")}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">{t("form.country")}</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={submitting}
            >
              {t("actions.cancel")}
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {t("actions.creating")}
                </>
              ) : (
                t("actions.create")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("edit.title")}</DialogTitle>
            <DialogDescription>
              {t("edit.description")}
            </DialogDescription>
          </DialogHeader>
          
          {formErrors.general && (
            <Alert className="bg-red-50 dark:bg-red-900/20 mb-4 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}
          
          <div className="gap-4 grid py-4">
            <div className="gap-4 grid grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("form.firstName")}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm">{formErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("form.lastName")}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">{t("form.avatarUrl")}</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            <div className="gap-4 grid grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">{t("form.role")}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.STUDENT}>Student</SelectItem>
                    <SelectItem value={Role.TEACHER}>Teacher</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t("form.gender")}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">{t("form.country")}</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={submitting}
            >
              {t("actions.cancel")}
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {t("actions.saving")}
                </>
              ) : (
                t("actions.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("delete.title")}</DialogTitle>
            <DialogDescription>
              {t("delete.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {t("delete.confirmation")}
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submitting}
            >
              {t("actions.cancel")}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {t("actions.deleting")}
                </>
              ) : (
                t("actions.delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
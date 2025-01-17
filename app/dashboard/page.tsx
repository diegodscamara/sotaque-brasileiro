"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { addBusinessDays, setHours } from "date-fns"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { ClassModal } from "@/components/dashboard/ClassModal"
import LessonsList from "@/components/dashboard/LessonsList"
import { Separator } from "@/components/ui/separator"
import Stats from "@/components/dashboard/Stats"
import { useState } from "react"

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBookClass = () => {
    const now = new Date()
    const bookingDate = addBusinessDays(now, 1)
    const bookingTime = setHours(bookingDate, 9)
    setSelectedDate(bookingTime)
    setIsModalOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 flex items-center gap-2 h-16 transition-[width,height] ease-linear shrink-0">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex justify-between items-center gap-2 w-full">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="md:block hidden">
                    <BreadcrumbLink href="/">
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="md:block hidden" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Button onClick={handleBookClass} variant="default" className="ml-4">
                Book Class
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
          <div className="gap-4 grid md:grid-cols-3 auto-rows-min">
            <Stats />
          </div>
          <div className="gap-4 grid md:grid-cols-1 auto-rows-min">
            <LessonsList />
          </div>
        </div>
      </SidebarInset>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate || new Date()}
        onClassUpdated={() => { /* Logic to refresh classes */ }}
        mode="schedule"
      />
    </SidebarProvider>
  )
}

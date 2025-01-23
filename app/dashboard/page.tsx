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

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import ClassList from "@/components/dashboard/class-list"
import { ClassModal } from "@/components/dashboard/ClassModal"
import { Separator } from "@/components/ui/separator"
import Stats from "@/components/dashboard/Stats"
import { useState } from "react"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBookClass = () => {
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
              <Button onClick={handleBookClass} variant="default" effect="shine" className="ml-4">
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
            <ClassList />
          </div>
        </div>
      </SidebarInset>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="schedule"
        existingStartTime={new Date(Date.now() + 24 * 60 * 60 * 1000)}
      />
    </SidebarProvider>
  )
}

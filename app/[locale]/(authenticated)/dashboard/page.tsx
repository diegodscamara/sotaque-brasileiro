"use client";

import AuthenticatedClientLayout from "../AuthenticatedClientLayout";
import { Button } from "@/components/ui/button";
import ClassList from "@/components/dashboard/class-list";
import { ClassModal } from "@/components/dashboard/ClassModal";
import Stats from "@/components/dashboard/Stats";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("dashboard");

  const handleBookClass = () => {
    setIsModalOpen(true);
  };

  return (
    <AuthenticatedClientLayout
      pageTitle={t("title")}
      actions={
        <Button onClick={handleBookClass} variant="default" effect="shine">
          {t("bookClass")}
        </Button>
      }
    >
      <div className="gap-4 grid md:grid-cols-3 auto-rows-min">
        <Stats />
      </div>
      <div className="gap-4 grid md:grid-cols-1 auto-rows-min">
        <ClassList />
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="schedule"
        existingStartTime={new Date(Date.now() + 24 * 60 * 60 * 1000)}
      />
    </AuthenticatedClientLayout>
  );
} 
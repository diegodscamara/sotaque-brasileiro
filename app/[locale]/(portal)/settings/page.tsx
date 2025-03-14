"use client";

import PortalClientLayout from "../PortalClientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <PortalClientLayout pageTitle={t("title")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("comingSoon")}</p>
        </CardContent>
      </Card>
    </PortalClientLayout>
  );
} 
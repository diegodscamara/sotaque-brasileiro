"use client";

import AuthenticatedClientLayout from "../AuthenticatedClientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function ClassesPage() {
  const t = useTranslations("classes");

  return (
    <AuthenticatedClientLayout pageTitle={t("title")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("comingSoon")}</p>
        </CardContent>
      </Card>
    </AuthenticatedClientLayout>
  );
} 
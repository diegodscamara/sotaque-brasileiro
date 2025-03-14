"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, WarningCircle, ArrowRight, Database } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API
import { createMockData } from "@/app/actions/mock-data";

/**
 * Admin page for creating mock data
 * @returns {React.JSX.Element} The admin mock data page
 */
export default function AdminMockDataPage(): React.JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success: boolean; 
    message: string; 
    teacherIds?: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("create");
  
  /**
   * Handles creating mock data
   */
  const handleCreateMockData = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const result = await createMockData();
      
      if (result.success) {
        setResult({
          success: true,
          message: result.message,
          teacherIds: result.teacherIds
        });
        setActiveTab("verify");
      } else {
        setResult({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Navigates to the student onboarding page
   */
  const navigateToOnboarding = () => {
    router.push(`/${locale}/onboarding/student`);
  };
  
  /**
   * Renders an alert based on the result of the mock data creation
   */
  const renderResultAlert = () => {
    if (!result) return null;
    
    if (result.success) {
      return (
        <Alert variant="success" className="mt-4">
          <CheckCircle className="w-4 h-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {result.teacherIds?.length} teachers were created with availability for the next 30 days.
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert variant="destructive" className="mt-4">
          <WarningCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      );
    }
  };
  
  return (
    <div className="mx-auto px-4 py-12 container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="mb-8 font-bold text-3xl">Admin: Create Mock Data</h1>
        
        <Card>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6 w-full">
                <TabsTrigger value="create">Create Data</TabsTrigger>
                <TabsTrigger value="verify" disabled={!result?.success}>Verify & Test</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="mb-2 font-medium">What will be created:</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc list-inside">
                      <li>3 teacher profiles with detailed information</li>
                      <li>Availability for each teacher for the next 30 days</li>
                      <li>Different availability patterns:
                        <ul className="mt-1 ml-4 list-disc list-inside">
                          <li>Ana Silva: Primarily morning availability (9 AM - 12 PM)</li>
                          <li>Pedro Costa: Primarily afternoon availability (1 PM - 6 PM)</li>
                          <li>Camila Oliveira: Mixed availability (varies by day)</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleCreateMockData} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Creating mock data...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 w-4 h-4" />
                        Create Mock Data
                      </>
                    )}
                  </Button>
                  
                  {renderResultAlert()}
                </div>
              </TabsContent>
              
              <TabsContent value="verify">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test the Student Onboarding</CardTitle>
                      <CardDescription>
                        Now that you&apos;ve created mock teachers, you can test the student onboarding process.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="mb-2 font-medium">Testing steps:</h3>
                        <ol className="space-y-2 text-gray-600 dark:text-gray-400 text-sm list-decimal list-inside">
                          <li>Navigate to the student onboarding page</li>
                          <li>Complete Step 1 (Personal Information)</li>
                          <li>In Step 2, you should see the mock teachers you created</li>
                          <li>Select a teacher and check their availability</li>
                          <li>Complete the onboarding process</li>
                        </ol>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={navigateToOnboarding} className="w-full">
                        <ArrowRight className="mr-2 w-4 h-4" />
                        Go to Student Onboarding
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {result?.teacherIds && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Created Teacher IDs</CardTitle>
                        <CardDescription>
                          The following teacher IDs were created in the database:
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md font-mono text-sm">
                          {result.teacherIds.map((id, index) => (
                            <div key={id} className="mb-1">
                              {index + 1}. {id}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 
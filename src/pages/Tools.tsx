import { useState } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const toolsData = {
  emoji: "🛠️",
  title: "Tools",
  tagline: "AI-powered tools and utilities for enhanced productivity",
  description: `Access a comprehensive suite of AI-powered tools designed to enhance your productivity and streamline your workflows. From text processing utilities to data analysis tools, our platform provides everything you need to work smarter and faster.

Each tool is designed with AI capabilities to automate repetitive tasks, provide intelligent suggestions, and adapt to your specific needs. Whether you're processing documents, analyzing data, or managing projects, our tools learn from your usage patterns to deliver personalized experiences.`,
  keywords: [
    "AI-powered tools",
    "productivity utilities", 
    "workflow automation",
    "intelligent suggestions",
    "document processing",
    "data analysis tools",
    "project management",
    "personalized experiences"
  ],
  lastUpdated: "1 day ago",
  readTime: "3 min"
};

export default function Tools() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Coming Soon",
      description: "Tool creation will be available soon",
    });
  };

  return (
    <DocumentLayout currentPage="tools">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Tools</h1>
            <p className="text-muted-foreground">AI-powered tools and utilities</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <DocumentPage {...toolsData} />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tool Projects</CardTitle>
                    <CardDescription>
                      Manage your AI-powered tools and utility configurations
                    </CardDescription>
                  </div>
                  <Button onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Tool
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No tools configured yet. Click "New Tool" to create your first AI-powered utility.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DocumentLayout>
  );
} 
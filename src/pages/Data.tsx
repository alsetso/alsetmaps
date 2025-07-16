import { useState } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const dataData = {
  emoji: "📊",
  title: "Data",
  tagline: "Real-time data processing and analytics for actionable business insights", 
  description: `Our Data Processing engine transforms raw data into actionable insights through advanced analytics, machine learning, and real-time processing capabilities. Handle massive data volumes, complex transformations, and time-sensitive operations with enterprise-grade reliability.

From streaming data analysis to batch processing workflows, our platform ensures your data is processed efficiently, accurately, and securely. Built-in AI capabilities automatically detect patterns, anomalies, and opportunities in your data streams.`,
  keywords: [
    "real-time data processing",
    "analytics engine",
    "data transformation",
    "streaming analytics",
    "batch processing",
    "AI-powered insights", 
    "data pipeline automation",
    "enterprise data processing"
  ],
  lastUpdated: "2 days ago",
  readTime: "5 min"
};

export default function Data() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Coming Soon",
      description: "Data pipeline creation will be available soon",
    });
  };

  return (
    <DocumentLayout currentPage="data">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Cpu className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Data</h1>
            <p className="text-muted-foreground">Real-time data processing and analytics</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <DocumentPage {...dataData} />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data Projects</CardTitle>
                    <CardDescription>
                      Manage your data processing pipelines and analytics workflows
                    </CardDescription>
                  </div>
                  <Button onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Pipeline
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No data pipelines configured yet. Click "New Pipeline" to create your first data processing workflow.
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
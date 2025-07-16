import { useState } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const workflowsData = {
  emoji: "🔁",
  title: "Workflows",
  tagline: "Build Logic. Automate Response. Save Hours.",
  description: `Workflows are the automation engine behind every modern platform. With Alset's low-code logic builder, you can create intelligent sequences triggered by events, data, schedules, or user behavior. From sending a personalized email when a contract is signed, to escalating a failed transaction to a phone assistant — workflows put your operations on autopilot.

Design with drag-and-drop simplicity or advanced branching logic. Include conditions, delays, AI evaluations, human handoffs, and fallback mechanisms. Workflows give any business the ability to automate complex operations without writing a single line of code.`,
  keywords: [
    "workflow automation builder",
    "low-code sequence creator",
    "event-driven automation",
    "task automation flow",
    "drag-and-drop workflow engine",
    "real-time logic automation",
    "conditional logic workflow",
    "post-action triggers",
    "platform automation suite"
  ],
  lastUpdated: "1 day ago",
  readTime: "4 min"
};

export default function Workflows() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Coming Soon",
      description: "Workflow creation will be available soon",
    });
  };

  return (
    <DocumentLayout currentPage="workflows">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">Build logic and automate responses</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <DocumentPage {...workflowsData} />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Workflow Projects</CardTitle>
                    <CardDescription>
                      Manage your automation workflows and logic sequences
                    </CardDescription>
                  </div>
                  <Button onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No workflows created yet. Click "New Workflow" to build your first automation sequence.
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
import { useState } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const endpointsData = {
  emoji: "📥",
  title: "Endpoints",
  tagline: "Receive Any Result. From Any System. Instantly.",
  description: `Endpoints are your cloud platform's universal data intake layer — capable of receiving inputs from any system, format, or source. Whether you're collecting diagnostic reports, legal documents, signed forms, spreadsheet uploads, CRM webhooks, or API responses, this module transforms raw inputs into structured JSON. Every piece of data is automatically normalized, tagged, and made ready for downstream automation.

Perfect for industries ranging from law and logistics to finance and wellness, endpoints eliminate manual intake processes. They serve as the trigger mechanism for responsive automation — ensuring every upload, webhook, or submission gets processed immediately and intelligently.`,
  keywords: [
    "webhook listener",
    "data intake API", 
    "file upload handler",
    "webhook parser",
    "endpoint integration system",
    "real-time data capture",
    "intake automation tool",
    "JSON data transformation", 
    "AI data ingestion",
    "platform trigger engine"
  ],
  lastUpdated: "2 days ago",
  readTime: "3 min"
};

export default function Endpoints() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Coming Soon",
      description: "Endpoints project creation will be available soon",
    });
  };

  return (
    <DocumentLayout currentPage="endpoints">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Endpoints</h1>
            <p className="text-muted-foreground">Universal data intake layer</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <DocumentPage {...endpointsData} />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Endpoints Projects</CardTitle>
                    <CardDescription>
                      Manage your endpoints and data intake configurations
                    </CardDescription>
                  </div>
                  <Button onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Endpoint
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No endpoints configured yet. Click "New Endpoint" to create your first data intake endpoint.
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
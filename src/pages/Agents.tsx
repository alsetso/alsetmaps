import { useState } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const agentsData = {
  emoji: "🤖",
  title: "Agents", 
  tagline: "Intelligent AI agents for autonomous task execution and decision making",
  description: `AI Agents are intelligent, autonomous digital workers that can execute complex tasks, make decisions, and interact with systems without human intervention. These agents combine advanced AI capabilities with real-world automation to handle everything from customer service interactions to complex data processing workflows.

Each agent can be customized with specific skills, knowledge bases, and behavioral patterns. They learn from interactions, adapt to new situations, and can collaborate with other agents or human team members to achieve optimal outcomes.`,
  keywords: [
    "autonomous AI agents",
    "intelligent automation",
    "AI task execution",
    "decision-making AI",
    "collaborative AI workers",
    "adaptive AI systems",
    "AI agent deployment",
    "autonomous workflow management"
  ],
  lastUpdated: "1 day ago",
  readTime: "4 min"
};

export default function Agents() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Coming Soon",
      description: "Agent creation will be available soon",
    });
  };

  return (
    <DocumentLayout currentPage="agents">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Agents</h1>
            <p className="text-muted-foreground">Intelligent AI agents for autonomous tasks</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <DocumentPage {...agentsData} />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Agent Projects</CardTitle>
                    <CardDescription>
                      Manage your AI agents and their task configurations
                    </CardDescription>
                  </div>
                  <Button onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Agent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No agents deployed yet. Click "New Agent" to create your first AI agent.
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
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash2 } from "lucide-react";

const documents = {
  "endpoints": {
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
  },
  "workflows": {
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
  },
  "ai-assistants": {
    emoji: "🤖",
    title: "AI Assistants",
    tagline: "Talk. Text. Act. Your Team Just Got Smarter.",
    description: `AI Assistants are voice and text-based digital agents that can engage, respond, and execute actions in real-time. Whether it's following up on a contract, answering a support ticket, or converting a lead — these assistants combine the power of generative AI with operational automation.

Each assistant is customizable with a unique tone, appearance, script, and behavior. They integrate seamlessly with your workflows to perform autonomous communication, escalate issues, and maintain context over time. Think of it as your on-demand, 24/7 smart team — available by voice or message.`,
    keywords: [
      "voice AI assistant",
      "outbound call automation",
      "conversational AI bot",
      "AI follow-up agent",
      "generative AI customer service",
      "smart phone agent",
      "autonomous assistant software",
      "contextual AI support",
      "result explanation bot"
    ],
    lastUpdated: "3 days ago",
    readTime: "5 min"
  },
  "intelligence": {
    emoji: "📊",
    title: "Intelligence",
    tagline: "Know What's Working. And What's Not.",
    description: `The Intelligence module provides real-time analytics across your entire platform — from endpoints to assistants. Monitor success rates, drop-offs, open rates, bottlenecks, and timing delays. Track every action triggered and every message delivered. Use predictive suggestions powered by AI to fine-tune your automations and improve operational outcomes.

With advanced visualizations, historical trend analysis, and feedback loops, this dashboard turns your data into growth. Whether you're optimizing sales processes, case management, or result delivery, Intelligence keeps your platform sharp, responsive, and ever-evolving.`,
    keywords: [
      "automation analytics dashboard",
      "workflow performance metrics",
      "AI-powered insights",
      "user behavior analysis",
      "automation optimization",
      "task success tracking",
      "real-time data intelligence",
      "business process intelligence",
      "AI optimization tools"
    ],
    lastUpdated: "5 days ago",
    readTime: "4 min"
  },
  "memory": {
    emoji: "🧠",
    title: "Memory",
    tagline: "One Timeline. Every Action. For Life.",
    description: `Memory is your platform's persistent knowledge graph — tracking every file, action, message, and event tied to each client, user, or case. This unified timeline powers context-aware automation and ensures seamless continuity across sessions, agents, and departments.

Whether you're revisiting a contract, continuing a client conversation, or analyzing previous decisions, everything is stored and retrievable. Memory ensures that your AI assistants, workflows, and human teams operate with full awareness of history — leading to smarter, more personalized engagement.`,
    keywords: [
      "user memory graph",
      "persistent timeline tracking",
      "client history database",
      "continuity of automation",
      "evergreen digital record",
      "contextual AI assistant",
      "longitudinal interaction record",
      "intelligent case management",
      "historical context platform"
    ],
    lastUpdated: "1 week ago",
    readTime: "3 min"
  }
};

// Mock projects data for demonstration
const mockProjects = [
  {
    id: "proj-1",
    name: "Customer Support Bot",
    description: "AI chatbot for handling customer inquiries",
    status: "active",
    created: "2024-01-15",
    endpoints: 3
  },
  {
    id: "proj-2", 
    name: "Data Analytics Pipeline",
    description: "Real-time data processing and visualization",
    status: "development",
    created: "2024-01-20",
    endpoints: 5
  },
  {
    id: "proj-3",
    name: "E-commerce Integration",
    description: "Webhook endpoints for order processing",
    status: "active",
    created: "2024-01-10",
    endpoints: 2
  }
];

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("details");
  
  if (!id || !documents[id as keyof typeof documents]) {
    return (
      <DocumentLayout currentPage="docs">
        <div className="prose">
          <h1>Document Not Found</h1>
          <p>The requested document could not be found.</p>
        </div>
      </DocumentLayout>
    );
  }

  const document = documents[id as keyof typeof documents];

  return (
    <DocumentLayout currentPage="docs">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <DocumentPage {...document} />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Projects Manager</CardTitle>
                    <CardDescription>
                      Manage projects related to {document.title.toLowerCase()}
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Endpoints</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell className="text-muted-foreground">{project.description}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={project.status === "active" ? "default" : "secondary"}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(project.created).toLocaleDateString()}</TableCell>
                        <TableCell>{project.endpoints}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DocumentLayout>
  );
}
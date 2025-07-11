import { useParams } from "react-router-dom";
import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentPage } from "@/components/DocumentPage";

// Sample documents database
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
  "automation": {
    emoji: "⚡",
    title: "Automation Engine",
    tagline: "Transform Data Into Action. Automatically.",
    description: `The Automation Engine is the intelligent processing core that transforms your incoming data into meaningful business actions. Using advanced AI and customizable workflows, it analyzes every piece of information, extracts insights, and triggers appropriate responses across your connected systems.

From document classification and data extraction to complex business logic execution, this engine handles the heavy lifting of data processing. It learns from patterns, adapts to your specific use cases, and scales automatically to handle increasing data volumes while maintaining precision and speed.`,
    keywords: [
      "workflow automation",
      "AI data processing",
      "business logic engine",
      "intelligent automation",
      "data transformation",
      "workflow orchestration",
      "automated data analysis",
      "intelligent document processing",
      "business process automation",
      "AI workflow engine"
    ],
    lastUpdated: "1 week ago",
    readTime: "4 min"
  }
};

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  
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
      <DocumentPage {...document} />
    </DocumentLayout>
  );
}
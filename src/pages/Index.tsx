import { Link } from "react-router-dom";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";

const featuredDocuments = [
  {
    id: "endpoints",
    emoji: "📥",
    title: "Endpoints",
    tagline: "Receive Any Result. From Any System. Instantly.",
    description: "Universal data intake layer capable of receiving inputs from any system, format, or source.",
    tags: ["API", "Webhooks", "Data Intake"]
  },
  {
    id: "automation", 
    emoji: "⚡",
    title: "Automation Engine",
    tagline: "Transform Data Into Action. Automatically.",
    description: "Intelligent processing core that transforms incoming data into meaningful business actions.",
    tags: ["AI", "Workflows", "Processing"]
  }
];

const Index = () => {
  return (
    <DocumentLayout currentPage="home">
      <div className="prose">
        <header className="text-center mb-12">
          <h1 className="mb-4">Knowledge Base</h1>
          <p className="tagline">
            Explore our comprehensive documentation, guides, and resources.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="flex items-center gap-2 mb-6">
            <FileText className="h-6 w-6" />
            Featured Documentation
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 not-prose">
            {featuredDocuments.map((doc) => (
              <Link key={doc.id} to={`/${doc.id}`} className="block group">
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] group-hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl" role="img" aria-label="Document icon">
                        {doc.emoji}
                      </span>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      {doc.tagline}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground mb-4 leading-relaxed">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2>About This Platform</h2>
          <p>
            This knowledge base serves as a comprehensive resource for understanding our platform's 
            capabilities, features, and implementation details. Each document is carefully crafted 
            to provide both technical depth and practical guidance.
          </p>
          <p>
            Navigate using the sidebar icons or browse featured content above. All content is 
            optimized for search engines and designed for easy discovery of relevant information.
          </p>
        </section>
      </div>
    </DocumentLayout>
  );
};

export default Index;

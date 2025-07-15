import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Calendar, ArrowRight, Database, Bot, Brain, Cpu, Network, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  emoji: string | null;
  created_by: string | null;
}

// Primary services that alset offers
const primaryServices = [
  {
    id: "endpoints",
    title: "Endpoints",
    description: "Secure API endpoints for seamless data integration and real-time communication",
    icon: Database,
    slug: "endpoints",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "agents",
    title: "Agents",
    description: "Intelligent AI agents for autonomous task execution and decision making",
    icon: Bot,
    slug: "agents",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "intelligence",
    title: "Intelligence",
    description: "Advanced AI models and machine learning capabilities for industry transformation",
    icon: Brain,
    slug: "intelligence",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "data-processing",
    title: "Data Processing",
    description: "Real-time data processing and analytics for actionable business insights",
    icon: Cpu,
    slug: "processing",
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Seamless third-party integrations for enhanced workflow automation",
    icon: Network,
    slug: "integrations",
    gradient: "from-indigo-500 to-blue-500"
  }
];

// Featured documentation linking to actual documents
const featuredDocuments = [
  {
    id: "endpoints-documentation",
    title: "📡 Endpoints Documentation",
    description: "Complete guide to setting up and managing secure API endpoints",
    category: "Technical"
  },
  {
    id: "ai-agents-guide",
    title: "🤖 AI Agents Guide",
    description: "Learn how to deploy and configure intelligent AI agents",
    category: "AI Solutions"
  },
  {
    id: "intelligence-platform",
    title: "🧠 Intelligence Platform",
    description: "Harness the power of our advanced AI intelligence capabilities",
    category: "AI Solutions"
  },
  {
    id: "data-processing-engine",
    title: "⚡ Data Processing Engine",
    description: "Real-time data processing and analytics documentation",
    category: "Technical"
  },
  {
    id: "integration-hub",
    title: "🔗 Integration Hub",
    description: "Connect with third-party services and automate workflows",
    category: "Integrations"
  }
];

// News and articles
const newsArticles = [
  {
    id: "ai-transformation-2024",
    title: "📰 The Future of AI Transformation in 2024",
    description: "Industry insights and trends shaping the AI landscape",
    category: "Industry News",
    date: "2024-01-15"
  },
  {
    id: "case-study-manufacturing",
    title: "📊 Manufacturing Excellence with AI Agents",
    description: "How leading manufacturers increased efficiency by 40% using alset's platform",
    category: "Case Study",
    date: "2024-01-10"
  },
  {
    id: "endpoint-security-best-practices",
    title: "🔒 API Security Best Practices for 2024",
    description: "Essential security measures for protecting your endpoints and data",
    category: "Security",
    date: "2024-01-08"
  },
  {
    id: "integration-patterns",
    title: "🔗 Modern Integration Patterns with AI",
    description: "Architectural approaches for seamless AI-powered integrations",
    category: "Technical",
    date: "2024-01-05"
  }
];

export default function Docs() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPreview = (content: string | null) => {
    if (!content) return "No content available";
    return content.length > 150 ? content.substring(0, 150) + "..." : content;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DocumentLayout currentPage="docs">
      <div className="space-fluid-y">
        {/* Hero Section */}
        <header className="text-center space-fluid-y">
          <h1 className="text-fluid-5xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
            Platform Documentation
          </h1>
          <ResponsiveContainer size="content">
            <p className="text-fluid-xl text-muted-foreground leading-relaxed">
              Comprehensive documentation for alset's AI-powered platform. Get started with our core services 
              and explore advanced features to transform your industry operations.
            </p>
          </ResponsiveContainer>
        </header>

        {/* Primary Services Grid */}
        <section className="space-fluid-y">
          <div className="text-center space-fluid-y">
            <h2 className="text-fluid-3xl font-bold">Core Platform Services</h2>
            <ResponsiveContainer size="narrow">
              <p className="text-muted-foreground text-fluid-base">
                Explore our primary services designed to accelerate your AI transformation journey
              </p>
            </ResponsiveContainer>
          </div>
          
          <ResponsiveGrid size="lg" minWidth="300px">
            {primaryServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link key={service.id} to={`/${service.slug}`}>
                  <ResponsiveCard 
                    className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-subtle hover:scale-105"
                    shadow="md"
                  >
                    <div className="space-fluid-y">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-fluid-xl font-semibold group-hover:text-primary transition-colors mb-fluid-sm">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-fluid-base leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform pt-fluid-sm">
                        <span className="text-fluid-sm font-medium">Learn more</span>
                        <ArrowRight className="h-4 w-4 ml-fluid-xs" />
                      </div>
                    </div>
                  </ResponsiveCard>
                </Link>
              );
            })}
          </ResponsiveGrid>
        </section>

        {/* Featured Documentation */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Documentation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essential guides and documentation for our core platform features
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredDocuments.map((doc) => (
              <Link key={doc.id} to={`/${doc.id}`}>
                <Card className="h-full group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {doc.category}
                      </Badge>
                    </div>
                    <CardDescription className="leading-relaxed">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">Read documentation</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Secondary Documentation Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Documentation</h2>
              <p className="text-muted-foreground">
                Browse our complete documentation library
              </p>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No documents found" : "No documents available"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? "Try adjusting your search terms or browse featured documentation above."
                    : "Documentation is being prepared. Check back soon for comprehensive guides and resources."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <Link key={doc.id} to={`/${doc.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {doc.emoji && <span className="text-xl">{doc.emoji}</span>}
                          <span className="truncate">{doc.title}</span>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {getPreview(doc.content)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(doc.updated_at)}</span>
                          </div>
                          {doc.status && (
                            <Badge variant="secondary" className="text-xs">
                              {doc.status}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* News and Articles */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">News & Articles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest insights, case studies, and industry developments
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {newsArticles.map((article) => (
              <Link key={article.id} to={`/${article.id}`}>
                <Card className="h-full group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-accent/30 hover:border-l-accent">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex-1">
                        {article.title}
                      </CardTitle>
                      <div className="flex flex-col items-end gap-1 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="leading-relaxed">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-accent group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">Read article</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Get Started CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="text-center py-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
              <p className="text-lg text-muted-foreground">
                Explore our platform services and start building with alset's AI-powered solutions. 
                Join the next generation of industry transformation.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button asChild size="lg">
                  <Link to="/endpoints">
                    <Database className="h-5 w-5 mr-2" />
                    Start with Endpoints
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DocumentLayout>
  );
}
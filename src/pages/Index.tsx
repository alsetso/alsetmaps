
import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, Calendar, User, Star, Zap, Brain, Cpu, Database, Bot, Network, ArrowRight } from "lucide-react";
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

// Featured content showcasing alset's AI capabilities
const featuredSections = [
  {
    id: "ai-transformation",
    title: "🚀 AI Transformation Services",
    description: "Comprehensive AI solutions to revolutionize your industry operations",
    icon: Brain,
    items: [
      { title: "AI Strategy & Implementation", description: "End-to-end AI adoption roadmaps tailored to your industry" },
      { title: "Machine Learning Solutions", description: "Custom ML models for predictive analytics and automation" },
      { title: "Intelligent Process Automation", description: "Streamline operations with AI-powered workflows" },
      { title: "Data Intelligence Platforms", description: "Transform raw data into actionable business insights" }
    ]
  },
  {
    id: "hardware-software",
    title: "⚡ Next-Gen Hardware & Software",
    description: "Cutting-edge technology solutions designed for the AI era",
    icon: Cpu,
    items: [
      { title: "Edge AI Computing", description: "Deploy AI at the edge for real-time decision making" },
      { title: "Custom Software Development", description: "Scalable applications built with AI-first architecture" },
      { title: "IoT & Sensor Integration", description: "Connect physical and digital worlds with intelligent sensors" },
      { title: "Cloud Infrastructure", description: "Optimized cloud solutions for AI workloads" }
    ]
  },
  {
    id: "industry-solutions",
    title: "🏭 Industry-Specific Solutions",
    description: "Specialized AI applications across diverse sectors",
    icon: Zap,
    items: [
      { title: "Manufacturing Intelligence", description: "Optimize production with predictive maintenance and quality control" },
      { title: "Healthcare AI", description: "Enhance patient care with diagnostic and operational AI" },
      { title: "Financial Services", description: "Risk assessment, fraud detection, and algorithmic trading" },
      { title: "Supply Chain Optimization", description: "End-to-end visibility and intelligent logistics management" }
    ]
  }
];

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"featured" | "services" | "all">("featured");

  useEffect(() => {
    // Using mock data since documents table doesn't exist
    setLoading(false);
  }, []);

  // No database documents to filter, using empty array
  const filteredDocuments: Document[] = [];

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
    <DocumentLayout currentPage="home">
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Advanced Learning Systems and Encoding Technology
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Discover how alset leverages artificial intelligence to revolutionize industries. 
            From next-generation hardware solutions to intelligent software platforms, 
            we are your strategic partner in the AI-driven future.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "featured" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Featured Solutions
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "services" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Core Services
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Documentation
            </button>
          </div>

          {activeTab === "all" && (
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </header>

        {/* Featured Solutions */}
        {activeTab === "featured" && (
          <div className="space-y-12">
            {featuredSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <section key={section.id} className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                      <h2 className="text-3xl font-bold">{section.title}</h2>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {section.description}
                    </p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {section.items.map((item, index) => (
                      <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <Star className="h-5 w-5" />
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Industry?</h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Partner with alset to unlock the full potential of artificial intelligence in your organization. 
                  Let us build the future together.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Brain className="h-5 w-5" />
                    Start Your AI Journey
                  </Link>
                  <Link to="/case-studies" className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors">
                    <FileText className="h-5 w-5" />
                    View Case Studies
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Core Platform Services */}
        {activeTab === "services" && (
          <div className="space-y-8">
            {/* Primary Services Grid */}
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Core Platform Services</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore our primary services designed to accelerate your AI transformation journey
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {primaryServices.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <Link key={service.id} to={`/${service.slug}`}>
                      <Card className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-subtle hover:scale-105">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                                {service.title}
                              </h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform pt-2">
                              <span className="text-sm font-medium">Learn more</span>
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Featured Documentation */}
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Featured Documentation</h2>
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
          </div>
        )}

        {/* All Documentation */}
        {activeTab === "all" && (
          <>
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
                      ? "Try adjusting your search terms or browse all documents."
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
          </>
        )}
      </div>
    </DocumentLayout>
  );
};

export default Index;

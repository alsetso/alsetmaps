
import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Calendar, User, Star, Zap, Brain, Cpu, Database, Bot, Network, ArrowRight, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
  
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Using mock data since documents table doesn't exist
    setLoading(false);
    
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
        {/* Dashboard Banner for Logged-in Users */}
        {user && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Welcome back!</h3>
                    <p className="text-muted-foreground text-sm">
                      Access your dashboard to manage services and view your activity
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Open Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
          
        </header>

        {/* Featured Solutions */}
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
      </div>
    </DocumentLayout>
  );
};

export default Index;

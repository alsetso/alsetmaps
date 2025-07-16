import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Bot, 
  Brain, 
  Cpu, 
  Network, 
  FileText, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  BookOpen,
  Settings,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Core services available to users
const coreServices = [
  {
    id: "endpoints",
    title: "Endpoints",
    description: "Secure data endpoints for seamless integration",
    icon: Database,
    status: "active",
    href: "/endpoints",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "agents",
    title: "Agents",
    description: "Intelligent AI agents for autonomous tasks",
    icon: Bot,
    status: "active",
    href: "/agents",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "workflows",
    title: "Workflows",
    description: "Build logic and automate responses",
    icon: Network,
    status: "active",
    href: "/workflows",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "data",
    title: "Data",
    description: "Real-time data processing and analytics",
    icon: Cpu,
    status: "active",
    href: "/data",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "tools",
    title: "Tools",
    description: "AI-powered tools and utilities",
    icon: Settings,
    status: "active",
    href: "/tools",
    color: "from-indigo-500 to-blue-500"
  }
];

// Documentation categories
const documentationSections = [
  {
    title: "Getting Started",
    description: "Essential guides to begin your journey",
    icon: BookOpen,
    docs: [
      { title: "Quick Start Guide", href: "/docs/quickstart" },
      { title: "Platform Overview", href: "/docs/overview" },
      { title: "Account Setup", href: "/docs/setup" }
    ]
  },
  {
    title: "API Reference",
    description: "Complete API documentation and examples",
    icon: FileText,
    docs: [
      { title: "Authentication", href: "/docs/auth" },
      { title: "Endpoints API", href: "/docs/endpoints-api" },
      { title: "Webhooks", href: "/docs/webhooks" }
    ]
  },
  {
    title: "Guides & Tutorials",
    description: "Step-by-step implementation guides",
    icon: Users,
    docs: [
      { title: "Building Your First Agent", href: "/docs/first-agent" },
      { title: "Data Integration Patterns", href: "/docs/integration-patterns" },
      { title: "Best Practices", href: "/docs/best-practices" }
    ]
  }
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <DocumentLayout currentPage="dashboard">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </DocumentLayout>
    );
  }

  return (
    <DocumentLayout currentPage="services">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! Manage your services and explore our platform.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

        </div>

        {/* Core Services */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Core Services</h2>
            <p className="text-muted-foreground">
              Access our comprehensive suite of AI-powered tools and services
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <Link to={service.href} className="block space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Projects <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </DocumentLayout>
  );
}
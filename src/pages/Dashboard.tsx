import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Bot, 
  Brain, 
  Cpu, 
  Network, 
  FileText, 
  Users, 
  Activity, 
  Shield, 
  Zap,
  ArrowRight,
  BookOpen,
  Settings,
  Bell,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Core services available to users
const coreServices = [
  {
    id: "endpoints",
    title: "API Endpoints",
    description: "Secure data endpoints for seamless integration",
    icon: Database,
    status: "active",
    usage: 65,
    href: "/endpoints",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "agents",
    title: "AI Agents",
    description: "Intelligent automation and task execution",
    icon: Bot,
    status: "active", 
    usage: 45,
    href: "/agents",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "intelligence",
    title: "AI Intelligence",
    description: "Advanced machine learning capabilities",
    icon: Brain,
    status: "active",
    usage: 78,
    href: "/intelligence",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "processing",
    title: "Data Processing",
    description: "Real-time analytics and processing",
    icon: Cpu,
    status: "active",
    usage: 32,
    href: "/processing",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Third-party service connections",
    icon: Network,
    status: "beta",
    usage: 20,
    href: "/integrations",
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: "security",
    title: "Security Center",
    description: "Advanced security and compliance tools",
    icon: Shield,
    status: "active",
    usage: 90,
    href: "/security",
    color: "from-red-500 to-pink-500"
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
    <DocumentLayout currentPage="dashboard">
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
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Active Services</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">API Calls Today</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Processing Jobs</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Security Score</p>
                    <p className="text-2xl font-bold">98%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Services Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Core Services</h2>
            <p className="text-muted-foreground">
              Access and manage your alset platform services
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <Badge 
                          variant={service.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {service.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Usage</span>
                            <span className="font-medium">{service.usage}%</span>
                          </div>
                          <Progress value={service.usage} className="h-2" />
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                        <Link to={service.href}>
                          <span>Manage Service</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Documentation Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Documentation</h2>
            <p className="text-muted-foreground">
              Comprehensive guides and references to help you succeed
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {documentationSections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.docs.map((doc, docIndex) => (
                        <Link 
                          key={docIndex}
                          to={doc.href}
                          className="block p-2 rounded-md hover:bg-muted transition-colors group/doc"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium group-hover/doc:text-primary transition-colors">
                              {doc.title}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover/doc:text-primary group-hover/doc:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
                  <p className="text-muted-foreground">
                    Explore our platform capabilities or dive into the documentation
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link to="/docs/quickstart">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Quick Start
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/endpoints">
                      <Zap className="h-4 w-4 mr-2" />
                      Create Endpoint
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DocumentLayout>
  );
}
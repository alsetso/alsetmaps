
import { useState, useEffect } from "react";
import { Menu, X, Home, FileText, Search, Settings, Bookmark, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface DocumentLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const navigationItems = [
  { id: "home", icon: Home, label: "Home", href: "/" },
  { id: "search", icon: Search, label: "Search", href: "/search" },
  { id: "bookmarks", icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
];

export function DocumentLayout({ children, currentPage = "home" }: DocumentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const params = useParams();
  const pageId = params.id;

  useEffect(() => {
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

  // Breadcrumbs for document pages
  const renderBreadcrumbs = () => {
    if (!pageId) return null;
    
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="capitalize text-foreground">{pageId.replace(/-/g, ' ')}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ResponsiveContainer size="fluid" className="flex h-header items-center justify-between">
          <div className="flex items-center gap-fluid-sm ml-16">
            <Link 
              to="/" 
              className="font-heading font-semibold text-fluid-lg hover:text-primary transition-colors focus-ring rounded-sm"
            >
              alset
            </Link>
          </div>

          <div className="flex items-center gap-fluid-sm">
            {user ? (
              <UserProfile />
            ) : (
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="btn-responsive text-muted-foreground hover:text-foreground"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </ResponsiveContainer>
      </header>

      <div className="flex min-h-[calc(100vh-var(--header-height))]">
        {/* Fixed Icon-Only Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-16 border-r bg-sidebar-background z-40">
          <div className="flex flex-col h-full">
            {/* 80px spacer */}
            <div className="h-20"></div>
            
            <nav className="flex flex-col gap-fluid-xs p-fluid-sm">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === currentPage;
                
                return (
                  <Link key={item.id} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full h-12 justify-center px-0 focus-ring",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content with 800px max width */}
        <main className="flex-1 bg-gradient-subtle overflow-auto ml-16 pt-header">
          <div className="mx-auto max-w-[800px] px-fluid-lg py-fluid-2xl min-h-full">
            <div className="space-fluid-y">
              {renderBreadcrumbs()}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

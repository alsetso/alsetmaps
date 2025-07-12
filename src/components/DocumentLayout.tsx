import { useState, useEffect } from "react";
import { Menu, X, Home, FileText, Search, Settings, Bookmark, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface DocumentLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const navigationItems = [
  { id: "home", icon: Home, label: "Home", href: "/" },
  { id: "docs", icon: FileText, label: "Documentation", href: "/docs" },
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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 px-2 focus-ring"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Link to="/" className="font-heading font-semibold text-lg hover:text-primary transition-colors">
              alset
            </Link>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            {user ? (
              <UserProfile />
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-14 h-[calc(100vh-3.5rem)] border-r bg-card transition-all duration-300 ease-in-out overflow-hidden",
            sidebarOpen ? "w-16" : "w-0"
          )}
        >
          <nav className="flex flex-col gap-2 p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === currentPage;
              
              return (
                <Link key={item.id} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-12 h-12 p-0 focus-ring",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            {renderBreadcrumbs()}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
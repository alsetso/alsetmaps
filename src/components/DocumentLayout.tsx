import { useState } from "react";
import { Menu, X, Home, FileText, Search, Settings, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
            <h1 className="font-heading font-semibold text-lg">Knowledge Base</h1>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="focus-ring">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-14 h-[calc(100vh-3.5rem)] border-r bg-card transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-16" : "w-0"
          )}
        >
          <nav className="flex flex-col gap-2 p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === currentPage;
              
              return (
                <Button
                  key={item.id}
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
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Clock, ExternalLink, Database, Bot, Network, Cpu, Settings } from "lucide-react";
import { Link } from "react-router-dom";

// Search data structure for all core services
const searchData = [
  {
    id: "endpoints",
    emoji: "📥",
    icon: Database,
    title: "Endpoints",
    tagline: "Receive Any Result. From Any System. Instantly.",
    description: "Endpoints are your cloud platform's universal data intake layer — capable of receiving inputs from any system, format, or source. Whether you're collecting diagnostic reports, legal documents, signed forms, spreadsheet uploads, CRM webhooks, or API responses, this module transforms raw inputs into structured JSON. Every piece of data is automatically normalized, tagged, and made ready for downstream automation.",
    keywords: [
      "webhook listener", "data intake API", "file upload handler", "webhook parser",
      "endpoint integration system", "real-time data capture", "intake automation tool",
      "JSON data transformation", "AI data ingestion", "platform trigger engine"
    ],
    category: "Data Integration",
    path: "/endpoints",
    lastUpdated: "2 days ago",
    readTime: "3 min"
  },
  {
    id: "agents",
    emoji: "🤖",
    icon: Bot,
    title: "Agents",
    tagline: "Intelligent AI agents for autonomous task execution and decision making",
    description: "AI Agents are intelligent, autonomous digital workers that can execute complex tasks, make decisions, and interact with systems without human intervention. These agents combine advanced AI capabilities with real-world automation to handle everything from customer service interactions to complex data processing workflows.",
    keywords: [
      "autonomous AI agents", "intelligent automation", "AI task execution",
      "decision-making AI", "collaborative AI workers", "adaptive AI systems",
      "AI agent deployment", "autonomous workflow management"
    ],
    category: "AI Automation",
    path: "/agents",
    lastUpdated: "1 day ago",
    readTime: "4 min"
  },
  {
    id: "workflows",
    emoji: "🔁",
    icon: Network,
    title: "Workflows",
    tagline: "Build Logic. Automate Response. Save Hours.",
    description: "Workflows are the automation engine behind every modern platform. With Alset's low-code logic builder, you can create intelligent sequences triggered by events, data, schedules, or user behavior. From sending a personalized email when a contract is signed, to escalating a failed transaction to a phone assistant — workflows put your operations on autopilot.",
    keywords: [
      "workflow automation builder", "low-code sequence creator", "event-driven automation",
      "task automation flow", "drag-and-drop workflow engine", "real-time logic automation",
      "conditional logic workflow", "post-action triggers", "platform automation suite"
    ],
    category: "Process Automation",
    path: "/workflows",
    lastUpdated: "1 day ago",
    readTime: "4 min"
  },
  {
    id: "data",
    emoji: "📊",
    icon: Cpu,
    title: "Data",
    tagline: "Real-time data processing and analytics for actionable business insights",
    description: "Our Data Processing engine transforms raw data into actionable insights through advanced analytics, machine learning, and real-time processing capabilities. Handle massive data volumes, complex transformations, and time-sensitive operations with enterprise-grade reliability.",
    keywords: [
      "real-time data processing", "analytics engine", "data transformation",
      "streaming analytics", "batch processing", "AI-powered insights",
      "data pipeline automation", "enterprise data processing"
    ],
    category: "Analytics",
    path: "/data",
    lastUpdated: "2 days ago",
    readTime: "5 min"
  },
  {
    id: "tools",
    emoji: "🛠️",
    icon: Settings,
    title: "Tools",
    tagline: "AI-powered tools and utilities for enhanced productivity",
    description: "Access a comprehensive suite of AI-powered tools designed to enhance your productivity and streamline your workflows. From text processing utilities to data analysis tools, our platform provides everything you need to work smarter and faster.",
    keywords: [
      "AI-powered tools", "productivity utilities", "workflow automation",
      "intelligent suggestions", "document processing", "data analysis tools",
      "project management", "personalized experiences"
    ],
    category: "Productivity",
    path: "/tools",
    lastUpdated: "1 day ago",
    readTime: "3 min"
  }
];

interface SearchResult {
  item: typeof searchData[0];
  score: number;
  matchedFields: string[];
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("alset-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updatedSearches = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5); // Keep only last 5 searches
    
    setRecentSearches(updatedSearches);
    localStorage.setItem("alset-recent-searches", JSON.stringify(updatedSearches));
  };

  // Search function with scoring
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const results: SearchResult[] = [];

    searchData.forEach(item => {
      let score = 0;
      const matchedFields: string[] = [];

      // Search in title (highest weight)
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
        matchedFields.push('title');
      }

      // Search in tagline
      if (item.tagline.toLowerCase().includes(query.toLowerCase())) {
        score += 8;
        matchedFields.push('tagline');
      }

      // Search in description
      if (item.description.toLowerCase().includes(query.toLowerCase())) {
        score += 6;
        matchedFields.push('description');
      }

      // Search in keywords
      const matchedKeywords = item.keywords.filter(keyword => 
        keyword.toLowerCase().includes(query.toLowerCase())
      );
      if (matchedKeywords.length > 0) {
        score += matchedKeywords.length * 4;
        matchedFields.push('keywords');
      }

      // Search in category
      if (item.category.toLowerCase().includes(query.toLowerCase())) {
        score += 3;
        matchedFields.push('category');
      }

      // Bonus for exact matches
      searchTerms.forEach(term => {
        if (item.title.toLowerCase().includes(term)) score += 2;
        if (item.keywords.some(k => k.toLowerCase().includes(term))) score += 1;
      });

      if (score > 0) {
        results.push({ item, score, matchedFields });
      }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      saveRecentSearch(searchQuery.trim());
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("alset-recent-searches");
  };

  // Real-time search as user types
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <DocumentLayout currentPage="search">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">
            Find services, features, and documentation across Alset platform
          </p>
        </div>
        
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for services, features, or documentation..."
            className="pl-10 py-3 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2" 
            size="sm"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Search Results ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.map(({ item, score, matchedFields }) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <div>
                            <CardTitle className="text-lg">
                              <Link 
                                to={item.path}
                                className="hover:text-primary transition-colors flex items-center gap-2"
                              >
                                {item.emoji} {item.title}
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground font-medium">
                              {item.tagline}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <Badge variant="outline">Score: {score}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.keywords.slice(0, 6).map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Matched in: {matchedFields.join(', ')}</span>
                        <span>{item.readTime} • Updated {item.lastUpdated}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No results message */}
        {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No results found for "{searchQuery}". Try different keywords or check your spelling.
            </p>
          </div>
        )}

        {/* Recent Searches & Popular Services */}
        <div className="grid gap-4 mt-8">
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecentSearchClick(search)}
                      className="text-xs"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchData.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <div key={service.id} className="flex items-center justify-between">
                      <Link 
                        to={service.path}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">{service.title}</span>
                        <span className="text-sm text-muted-foreground">- {service.category}</span>
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {service.readTime}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DocumentLayout>
  );
}
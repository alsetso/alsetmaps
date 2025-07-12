import { DocumentLayout } from "@/components/DocumentLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <DocumentLayout currentPage="search">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">
            Find documents, pages, and content across alset
          </p>
        </div>
        
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for documents, terms, or topics..."
            className="pl-10 py-3 text-lg"
          />
          <Button className="absolute right-2 top-1/2 transform -translate-y-1/2" size="sm">
            Search
          </Button>
        </div>

        <div className="grid gap-4 mt-8">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Recent Searches</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>No recent searches</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Popular Documents</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Endpoints</span>
                <span className="text-muted-foreground">124 views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DocumentLayout>
  );
}
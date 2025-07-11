import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Bookmarks() {
  return (
    <DocumentLayout currentPage="bookmarks">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bookmarks</h1>
          <p className="text-muted-foreground">
            Save and organize your favorite documents and pages
          </p>
        </div>

        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You must be logged in to view and manage your bookmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Login to Continue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DocumentLayout>
  );
}
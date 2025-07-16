import { useState, useEffect } from "react";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Settings() {
  const { theme, setTheme } = useTheme();
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
      <DocumentLayout currentPage="settings">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Loading user information...</p>
          </div>
        </div>
      </DocumentLayout>
    );
  }

  return (
    <DocumentLayout currentPage="settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Profile from Supabase */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Your account information from Supabase Auth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={user.id} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email || ''} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Verified</Label>
                    <Input value={user.email_confirmed_at ? 'Yes' : 'No'} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Created At</Label>
                    <Input value={new Date(user.created_at).toLocaleString()} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Sign In</Label>
                    <Input value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'} readOnly className="bg-muted" />
                  </div>
                  {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                    <div className="space-y-2">
                      <Label>User Metadata</Label>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-sm">{JSON.stringify(user.user_metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => supabase.auth.signOut()}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No user logged in</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DocumentLayout>
  );
}
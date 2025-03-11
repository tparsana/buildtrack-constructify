
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";

const Settings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState("system");
  
  const handleSaveNotifications = () => {
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveTheme = () => {
    toast({
      title: "Theme Preference Saved",
      description: `Your theme has been set to ${theme}.`,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin Settings</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="preferences">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for task assignments and updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                  onClick={handleSaveNotifications}
                >
                  Save Notification Settings
                </button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme" className="w-full">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                  onClick={handleSaveTheme}
                >
                  Save Theme Settings
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Account settings are managed through the profile page. Please visit your profile to update your information.
              </p>
              
              <div className="mt-4">
                <a href="/profile" className="text-primary hover:underline">
                  Go to Profile Settings
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  System-wide configurations only available to administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">
                  These settings affect all users in the system. Use with caution.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow User Registration</Label>
                      <p className="text-sm text-gray-500">
                        Enable or disable new user registration
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-gray-500">
                        Require users to verify their email before accessing the system
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;

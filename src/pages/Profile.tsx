
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { currentUser, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setAvatarUrl(currentUser.avatar || "");
    }
    
    // Get user email
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
    };
    
    getEmail();
  }, [currentUser]);
  
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          avatar: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Refresh the session to get updated user data
      await refreshSession();
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  placeholder="your.email@example.com"
                />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
            <CardDescription>
              This is how others will see you
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-gray-500">{currentUser.role}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/data";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    // Fetch all team members
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setTeamMembers(data.map(profile => ({
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          role: profile.role
        })));
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);
  
  // Filter team members based on search query
  const filteredTeamMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading team...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-gray-500 mt-1">Manage your construction team members</p>
        </div>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search team members..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeamMembers.length > 0 ? (
          filteredTeamMembers.map(member => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No team members found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? "Try a different search term" : "Add team members to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;

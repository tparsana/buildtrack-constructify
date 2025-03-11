
import { supabase } from "@/integrations/supabase/client";
import { User } from "./data";

// Fetch all team members
export const fetchTeamMembers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      role: profile.role
    }));
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
};

// Add a team member to a project
export const addTeamMemberToProject = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_members')
      .insert({
        user_id: userId,
        project_id: projectId
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding team member to project:", error);
    return false;
  }
};

// Remove a team member from a project
export const removeTeamMemberFromProject = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing team member from project:", error);
    return false;
  }
};

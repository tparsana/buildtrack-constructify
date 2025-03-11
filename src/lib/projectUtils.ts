
import { supabase } from "@/integrations/supabase/client";
import { Project, User } from "./data";
import { fetchUserProfiles } from "./userUtils";

// Fetch all projects with optimized queries
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    // Fetch projects with a single query
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:lead_id(*),
        project_members(user_id)
      `);

    if (projectsError) throw projectsError;

    // Get all unique user IDs from project members
    const userIds = new Set<string>();
    projectsData.forEach(project => {
      if (project.project_members && project.project_members.length > 0) {
        project.project_members.forEach((member: any) => {
          if (member.user_id) userIds.add(member.user_id);
        });
      }
    });
    
    // Only fetch user profiles if there are team members
    let userMap = new Map<string, User>();
    if (userIds.size > 0) {
      userMap = await fetchUserProfiles(Array.from(userIds));
    }

    // Map projects with leads and team members
    return projectsData.map(project => {
      // Get team members for this project
      const teamMembers: User[] = [];
      if (project.project_members) {
        project.project_members.forEach((member: any) => {
          const user = userMap.get(member.user_id);
          if (user) teamMembers.push(user);
        });
      }

      // Create the project object
      return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        progress: project.progress,
        lead: project.profiles ? {
          id: project.profiles.id,
          name: project.profiles.name,
          avatar: project.profiles.avatar,
          role: project.profiles.role
        } : { id: project.lead_id, name: "Unknown", avatar: "", role: "" },
        team: teamMembers,
        tasks: [],
        client: project.client || 'N/A',
        budget: {
          total: parseFloat(project.budget_total) || 0,
          spent: parseFloat(project.budget_spent) || 0,
          currency: 'USD'
        },
        location: project.location || 'N/A'
      };
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

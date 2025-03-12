
import { supabase } from "@/integrations/supabase/client";
import { Project, User } from "./data";
import { fetchUserProfiles } from "./userUtils";

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    // Fetch projects with a single query, using proper foreign key relation
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:lead_id (id, name, avatar, role)
      `);

    if (projectsError) throw projectsError;

    // Get all project IDs to fetch team members
    const projectIds = projectsData.map(project => project.id);
    
    // Fetch all team members in a single query
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('project_members')
      .select('project_id, user_id')
      .in('project_id', projectIds);
      
    if (teamMembersError) throw teamMembersError;
    
    // Group team members by project
    const teamMembersByProject: Record<string, string[]> = {};
    teamMembersData.forEach(member => {
      if (!teamMembersByProject[member.project_id]) {
        teamMembersByProject[member.project_id] = [];
      }
      teamMembersByProject[member.project_id].push(member.user_id);
    });
    
    // Get all unique user IDs from team members
    const userIds = new Set<string>();
    Object.values(teamMembersByProject).forEach(members => {
      members.forEach(userId => userIds.add(userId));
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
      const projectTeamIds = teamMembersByProject[project.id] || [];
      projectTeamIds.forEach(userId => {
        const user = userMap.get(userId);
        if (user) teamMembers.push(user);
      });

      // Create a valid User object for lead (with fallback)
      let lead: User;
      if (project.profiles && typeof project.profiles === 'object' && project.profiles !== null) {
        // Use optional chaining and nullish coalescing for safety
        const profilesObj = project.profiles as any;
        lead = {
          id: profilesObj?.id || "",
          name: profilesObj?.name || "Unknown",
          avatar: profilesObj?.avatar || "",
          role: profilesObj?.role || ""
        };
      } else {
        // Default fallback if lead data is missing
        lead = {
          id: project.lead_id || "",
          name: "Unknown",
          avatar: "",
          role: ""
        };
      }

      // Ensure status is one of the allowed values
      const typeSafeStatus = (project.status as "planning" | "active" | "on-hold" | "completed") || "planning";

      return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: typeSafeStatus,
        startDate: project.start_date,
        endDate: project.end_date,
        progress: project.progress || 0,
        lead: lead,
        team: teamMembers,
        tasks: [],
        client: project.client || 'N/A',
        budget: {
          total: Number(project.budget_total) || 0,
          spent: Number(project.budget_spent) || 0,
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

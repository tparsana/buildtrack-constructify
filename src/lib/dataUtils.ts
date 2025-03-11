
import { Project, Task, User } from "./data";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

// Convert Supabase project to our app Project format
const mapProjectFromDb = (project: any, lead?: User, team: User[] = []): Project => {
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    status: project.status,
    startDate: project.start_date,
    endDate: project.end_date,
    progress: project.progress,
    lead: lead || { id: project.lead_id, name: "Unknown", avatar: "", role: "" },
    team: team,
    tasks: [],
    client: project.client || 'N/A',
    budget: {
      total: parseFloat(project.budget_total) || 0,
      spent: parseFloat(project.budget_spent) || 0,
      currency: 'USD'
    },
    location: project.location || 'N/A'
  };
};

// Convert Supabase task to our app Task format
const mapTaskFromDb = (task: any, assignee?: User, reporter?: User): Task => {
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assignee: assignee || null,
    reporter: reporter || { id: task.reporter_id, name: "Unknown", avatar: "", role: "" },
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    comments: task.comments || [],
    attachments: task.attachments || [],
    projectId: task.project_id
  };
};

// Fetch all projects
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) throw projectsError;

    // Get all unique user IDs from projects
    const userIds = new Set<string>();
    projectsData.forEach(project => {
      if (project.lead_id) userIds.add(project.lead_id);
    });

    // Fetch all profiles in one go
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(userIds));

    if (profilesError) throw profilesError;

    // Create a map of user IDs to user objects
    const userMap = new Map<string, User>();
    profilesData.forEach(profile => {
      userMap.set(profile.id, {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        role: profile.role
      });
    });

    // For each project, fetch team members
    const projectsWithTeam = await Promise.all(
      projectsData.map(async (project) => {
        const { data: memberData, error: memberError } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', project.id);

        if (memberError) {
          console.error("Error fetching team members:", memberError);
          return mapProjectFromDb(project, userMap.get(project.lead_id), []);
        }

        // Get all team member profiles
        const teamMemberIds = memberData.map(m => m.user_id);
        let teamMembers: User[] = [];

        if (teamMemberIds.length > 0) {
          const { data: teamProfilesData, error: teamProfilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', teamMemberIds);

          if (!teamProfilesError && teamProfilesData) {
            teamMembers = teamProfilesData.map(profile => ({
              id: profile.id,
              name: profile.name,
              avatar: profile.avatar,
              role: profile.role
            }));
          }
        }

        return mapProjectFromDb(project, userMap.get(project.lead_id), teamMembers);
      })
    );

    return projectsWithTeam;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// Add a new project
export const addProject = async (project: Project): Promise<boolean> => {
  try {
    const { currentUser } = useAuth.getState();
    if (!currentUser) return false;

    // Insert project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        client: project.client,
        location: project.location,
        status: project.status,
        progress: project.progress,
        budget_total: project.budget.total,
        budget_spent: project.budget.spent,
        start_date: project.startDate,
        end_date: project.endDate,
        lead_id: currentUser.id // Set current user as project lead
      })
      .select('*')
      .single();

    if (projectError) throw projectError;

    // Add project lead as team member
    if (projectData) {
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectData.id,
          user_id: currentUser.id
        });

      if (memberError) throw memberError;
    }

    return true;
  } catch (error) {
    console.error("Error adding project:", error);
    return false;
  }
};

// Update an existing project
export const updateProject = async (updatedProject: Project): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        name: updatedProject.name,
        description: updatedProject.description,
        client: updatedProject.client,
        location: updatedProject.location,
        status: updatedProject.status,
        progress: updatedProject.progress,
        budget_total: updatedProject.budget.total,
        budget_spent: updatedProject.budget.spent,
        start_date: updatedProject.startDate,
        end_date: updatedProject.endDate,
        lead_id: updatedProject.lead.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedProject.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
};

// Fetch tasks for a project
export const fetchTasks = async (projectId?: string): Promise<Task[]> => {
  try {
    let query = supabase.from('tasks').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data: tasksData, error: tasksError } = await query;
    
    if (tasksError) throw tasksError;
    
    // Get all unique user IDs from tasks
    const userIds = new Set<string>();
    tasksData.forEach(task => {
      if (task.assignee_id) userIds.add(task.assignee_id);
      if (task.reporter_id) userIds.add(task.reporter_id);
    });
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(userIds));
    
    if (profilesError) throw profilesError;
    
    // Create a map of user IDs to user objects
    const userMap = new Map<string, User>();
    profilesData.forEach(profile => {
      userMap.set(profile.id, {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        role: profile.role
      });
    });
    
    // Map tasks with assignee and reporter
    const mappedTasks = await Promise.all(
      tasksData.map(async (task) => {
        // Fetch comments for this task
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*, profiles!comments_user_id_fkey(*)')
          .eq('task_id', task.id);
        
        const comments = commentsError ? [] : commentsData.map(comment => ({
          id: comment.id,
          text: comment.content,
          author: {
            id: comment.profiles.id,
            name: comment.profiles.name,
            avatar: comment.profiles.avatar,
            role: comment.profiles.role,
          },
          createdAt: comment.created_at
        }));
        
        return {
          ...mapTaskFromDb(
            task, 
            task.assignee_id ? userMap.get(task.assignee_id) : null,
            task.reporter_id ? userMap.get(task.reporter_id) : null
          ),
          comments
        };
      })
    );
    
    return mappedTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// Add a new task
export const addTask = async (task: Task): Promise<boolean> => {
  try {
    const { currentUser } = useAuth.getState();
    if (!currentUser) return false;
    
    // Insert task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee?.id,
        reporter_id: currentUser.id, // Set current user as reporter
        due_date: task.dueDate,
        project_id: task.projectId
      });
    
    if (error) throw error;
    
    // If task has an assignee, trigger notification
    if (task.assignee) {
      // Send email notification
      await supabase.functions.invoke('send-notification', {
        body: {
          to: task.assignee.id, // In a real app, this would be the user's email
          subject: 'New Task Assigned',
          text: `You have been assigned a new task: ${task.title}`,
          type: 'task_assigned'
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error adding task:", error);
    return false;
  }
};

// Update an existing task
export const updateTask = async (updatedTask: Task): Promise<boolean> => {
  try {
    const previousTaskResult = await supabase
      .from('tasks')
      .select('assignee_id')
      .eq('id', updatedTask.id)
      .single();
    
    const previousAssigneeId = previousTaskResult.data?.assignee_id;
    const newAssigneeId = updatedTask.assignee?.id;
    
    // Update task
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignee_id: updatedTask.assignee?.id,
        due_date: updatedTask.dueDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedTask.id);
    
    if (error) throw error;
    
    // If assignee was changed, send notification
    if (newAssigneeId && newAssigneeId !== previousAssigneeId) {
      // Send email notification
      await supabase.functions.invoke('send-notification', {
        body: {
          to: newAssigneeId, // In a real app, this would be the user's email
          subject: 'Task Assignment',
          text: `You have been assigned to the task: ${updatedTask.title}`,
          type: 'task_assigned'
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
};

// Add a comment to a task
export const addComment = async (taskId: string, text: string): Promise<boolean> => {
  try {
    const { currentUser } = useAuth.getState();
    if (!currentUser) return false;
    
    const { error } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        user_id: currentUser.id,
        content: text
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding comment:", error);
    return false;
  }
};

// Function to raise a ticket (create a high priority task)
export const raiseTicket = async (
  title: string, 
  description: string, 
  projectId: string
): Promise<{ success: boolean; taskId?: string }> => {
  try {
    const { currentUser } = useAuth.getState();
    if (!currentUser) return { success: false };
    
    // Create new ticket (high priority task)
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: `TICKET: ${title}`,
        description,
        status: 'todo',
        priority: 'urgent',
        reporter_id: currentUser.id,
        project_id: projectId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, taskId: data.id };
  } catch (error) {
    console.error("Error raising ticket:", error);
    return { success: false };
  }
};

// Custom hook for managing data operations with toast notifications
export const useDataOperations = () => {
  const { toast } = useToast();
  
  return {
    addProject: async (project: Project) => {
      const success = await addProject(project);
      if (success) {
        toast({
          title: "Project Created",
          description: `${project.name} has been successfully created`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
      }
      return success;
    },
    
    updateProject: async (project: Project) => {
      const success = await updateProject(project);
      if (success) {
        toast({
          title: "Project Updated",
          description: `${project.name} has been successfully updated`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
      }
      return success;
    },
    
    addTask: async (task: Task) => {
      const success = await addTask(task);
      if (success) {
        toast({
          title: "Task Created",
          description: `${task.title} has been successfully created`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
      }
      return success;
    },
    
    updateTask: async (task: Task) => {
      const success = await updateTask(task);
      if (success) {
        toast({
          title: "Task Updated",
          description: `${task.title} has been successfully updated`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      }
      return success;
    },
    
    raiseTicket: async (title: string, description: string, projectId: string) => {
      const result = await raiseTicket(title, description, projectId);
      if (result.success) {
        toast({
          title: "Ticket Raised",
          description: "Your ticket has been successfully submitted",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to raise ticket",
          variant: "destructive",
        });
      }
      return result;
    },
    
    addComment: async (taskId: string, text: string) => {
      const success = await addComment(taskId, text);
      if (success) {
        toast({
          title: "Comment Added",
          description: "Your comment has been added",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
      }
      return success;
    }
  };
};

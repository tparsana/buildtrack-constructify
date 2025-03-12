
import { supabase } from "@/integrations/supabase/client";
import { Task, User } from "./data";
import { fetchUserProfiles } from "./userUtils";

// Fetch comments for tasks with proper error handling
const fetchTaskComments = async (taskId: string) => {
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id(id, name, avatar, role)
      `)
      .eq('task_id', taskId);
    
    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return [];
    }
    
    return commentsData.map(comment => {
      // Safely check if profiles exists and has expected properties
      const profile = comment.profiles && 
                     typeof comment.profiles === 'object' && 
                     !('error' in comment.profiles) ? 
                     comment.profiles : null;
      
      return {
        id: comment.id,
        text: comment.content,
        author: profile ? {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          role: profile.role,
        } : {
          id: comment.user_id,
          name: "Unknown User",
          avatar: "",
          role: "",
        },
        createdAt: comment.created_at
      };
    });
  } catch (error) {
    console.error("Error in fetchTaskComments:", error);
    return [];
  }
};

// Fetch tasks for a project with optimized queries
export const fetchTasks = async (projectId?: string): Promise<Task[]> => {
  try {
    // Build the query
    let query = supabase.from('tasks').select(`
      *,
      assignee:assignee_id(id, name, avatar, role),
      reporter:reporter_id(id, name, avatar, role)
    `);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data: tasksData, error: tasksError } = await query;
    
    if (tasksError) throw tasksError;
    
    // Map tasks with assignee and reporter
    const mappedTasks = await Promise.all(
      tasksData.map(async (task) => {
        const comments = await fetchTaskComments(task.id);
        
        // Safely handle assignee
        const assignee = task.assignee && 
                        typeof task.assignee === 'object' && 
                        !('error' in task.assignee) ? 
                        task.assignee : null;
        
        // Safely handle reporter
        const reporter = task.reporter && 
                        typeof task.reporter === 'object' && 
                        !('error' in task.reporter) ? 
                        task.reporter : { 
                          id: task.reporter_id, 
                          name: "Unknown", 
                          avatar: "", 
                          role: "" 
                        };
        
        // Ensure status is one of the allowed values
        let typeSafeStatus: "backlog" | "todo" | "in-progress" | "review" | "done" | "on-hold" = "todo";
        if (["backlog", "todo", "in-progress", "review", "done", "on-hold"].includes(task.status)) {
          typeSafeStatus = task.status as "backlog" | "todo" | "in-progress" | "review" | "done" | "on-hold";
        }
        
        // Ensure priority is one of the allowed values
        let typeSafePriority: "low" | "medium" | "high" | "urgent" = "medium";
        if (["low", "medium", "high", "urgent"].includes(task.priority)) {
          typeSafePriority = task.priority as "low" | "medium" | "high" | "urgent";
        }
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: typeSafeStatus,
          priority: typeSafePriority,
          assignee: assignee,
          reporter: reporter,
          dueDate: task.due_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          comments,
          attachments: [],
          projectId: task.project_id
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
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee?.id,
        reporter_id: task.reporter?.id || '00000000-0000-0000-0000-000000000000', // Fallback value
        due_date: task.dueDate,
        project_id: task.projectId
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error adding task:", error);
    return false;
  }
};

// Update an existing task
export const updateTask = async (updatedTask: Task): Promise<boolean> => {
  try {
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
    
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
};

// Add a comment to a task
export const addComment = async (taskId: string, text: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        user_id: userId,
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
  projectId: string,
  userId: string // Added reporter_id parameter
): Promise<{ success: boolean; taskId?: string }> => {
  try {
    // Create new ticket (high priority task)
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: `TICKET: ${title}`,
        description,
        status: 'todo',
        priority: 'urgent',
        project_id: projectId,
        reporter_id: userId // Added required reporter_id
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

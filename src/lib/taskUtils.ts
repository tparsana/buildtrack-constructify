
import { supabase } from "@/integrations/supabase/client";
import { Task, User } from "./data";
import { fetchUserProfiles } from "./userUtils";

const fetchTaskComments = async (taskId: string) => {
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id (id, name, avatar, role)
      `)
      .eq('task_id', taskId);
    
    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return [];
    }
    
    return commentsData.map(comment => {
      // Ensure we have a valid User object for author
      let author: User;
      if (comment.user && typeof comment.user === 'object' && comment.user !== null) {
        const userObj = comment.user as any;
        author = {
          id: userObj?.id || comment.user_id,
          name: userObj?.name || "Unknown User",
          avatar: userObj?.avatar || "",
          role: userObj?.role || ""
        };
      } else {
        // Fallback if user data is missing
        author = {
          id: comment.user_id,
          name: "Unknown User",
          avatar: "",
          role: ""
        };
      }
      
      return {
        id: comment.id,
        text: comment.content,
        author,
        createdAt: comment.created_at
      };
    });
  } catch (error) {
    console.error("Error in fetchTaskComments:", error);
    return [];
  }
};

export const fetchTasks = async (projectId?: string): Promise<Task[]> => {
  try {
    let query = supabase.from('tasks').select(`
      *,
      assignee:assignee_id (id, name, avatar, role),
      reporter:reporter_id (id, name, avatar, role)
    `);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data: tasksData, error: tasksError } = await query;
    
    if (tasksError) throw tasksError;
    
    const mappedTasks = await Promise.all(
      tasksData.map(async (task) => {
        const comments = await fetchTaskComments(task.id);
        
        // Create a valid User object for assignee (can be null)
        let assignee: User | null = null;
        if (task.assignee && typeof task.assignee === 'object' && task.assignee !== null) {
          const assigneeObj = task.assignee as any;
          assignee = {
            id: assigneeObj?.id || task.assignee_id || "",
            name: assigneeObj?.name || "Unknown",
            avatar: assigneeObj?.avatar || "",
            role: assigneeObj?.role || ""
          };
        } else if (task.assignee_id) {
          // Create minimal assignee if we only have the ID
          assignee = {
            id: task.assignee_id,
            name: "Unknown",
            avatar: "",
            role: ""
          };
        }
        
        // Create a valid User object for reporter
        let reporter: User;
        if (task.reporter && typeof task.reporter === 'object' && task.reporter !== null) {
          const reporterObj = task.reporter as any;
          reporter = {
            id: reporterObj?.id || task.reporter_id,
            name: reporterObj?.name || "Unknown",
            avatar: reporterObj?.avatar || "",
            role: reporterObj?.role || ""
          };
        } else {
          // Fallback for reporter
          reporter = {
            id: task.reporter_id,
            name: "Unknown",
            avatar: "",
            role: ""
          };
        }
        
        const typeSafeStatus = (task.status as "backlog" | "todo" | "in-progress" | "review" | "done" | "on-hold") || "todo";
        const typeSafePriority = (task.priority as "low" | "medium" | "high" | "urgent") || "medium";
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: typeSafeStatus,
          priority: typeSafePriority,
          assignee,
          reporter,
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

export const raiseTicket = async (
  title: string, 
  description: string, 
  projectId: string,
  userId: string
): Promise<{ success: boolean; taskId?: string }> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: `TICKET: ${title}`,
        description,
        status: 'todo',
        priority: 'urgent',
        project_id: projectId,
        reporter_id: userId,
        assignee_id: null
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


import { getProjects, getTasks, projects, users } from "./data";
import { Project, Task } from "./data";
import { useToast } from "@/components/ui/use-toast";

// Add a new project
export const addProject = (project: Project): boolean => {
  try {
    projects.push(project);
    return true;
  } catch (error) {
    console.error("Error adding project:", error);
    return false;
  }
};

// Update an existing project
export const updateProject = (updatedProject: Project): boolean => {
  try {
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
};

// Add a new task
export const addTask = (task: Task): boolean => {
  try {
    // Add task to the tasks array
    const allTasks = getTasks();
    allTasks.push(task);
    
    // Add task to the project
    const project = projects.find(p => p.id === task.projectId);
    if (project) {
      project.tasks.push(task);
    }
    
    return true;
  } catch (error) {
    console.error("Error adding task:", error);
    return false;
  }
};

// Update an existing task
export const updateTask = (updatedTask: Task): boolean => {
  try {
    // Find the task in all tasks
    const allTasks = getTasks();
    const taskIndex = allTasks.findIndex(t => t.id === updatedTask.id);
    
    if (taskIndex !== -1) {
      allTasks[taskIndex] = updatedTask;
      
      // Update the task in the project
      const project = projects.find(p => p.id === updatedTask.projectId);
      if (project) {
        const projectTaskIndex = project.tasks.findIndex(t => t.id === updatedTask.id);
        if (projectTaskIndex !== -1) {
          project.tasks[projectTaskIndex] = updatedTask;
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
};

// Function to raise a ticket (create a high priority task)
export const raiseTicket = (
  title: string, 
  description: string, 
  projectId: string, 
  reporterId: string
): { success: boolean; taskId?: string } => {
  try {
    const reporter = users.find(u => u.id === reporterId);
    if (!reporter) {
      return { success: false };
    }
    
    const taskId = `t${Math.floor(Math.random() * 10000)}`;
    
    // Create new ticket (high priority task)
    const newTicket: Task = {
      id: taskId,
      title: `TICKET: ${title}`,
      description,
      status: 'todo',
      priority: 'urgent',
      assignee: null, // Will be assigned by manager
      reporter,
      dueDate: null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      comments: [],
      attachments: [],
      projectId
    };
    
    // Add ticket to tasks
    const success = addTask(newTicket);
    
    return { success, taskId: success ? taskId : undefined };
  } catch (error) {
    console.error("Error raising ticket:", error);
    return { success: false };
  }
};

// Custom hook for managing data operations with toast notifications
export const useDataOperations = () => {
  const { toast } = useToast();
  
  return {
    addProject: (project: Project) => {
      const success = addProject(project);
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
    
    updateProject: (project: Project) => {
      const success = updateProject(project);
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
    
    addTask: (task: Task) => {
      const success = addTask(task);
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
    
    updateTask: (task: Task) => {
      const success = updateTask(task);
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
    
    raiseTicket: (title: string, description: string, projectId: string, reporterId: string) => {
      const result = raiseTicket(title, description, projectId, reporterId);
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
    }
  };
};
